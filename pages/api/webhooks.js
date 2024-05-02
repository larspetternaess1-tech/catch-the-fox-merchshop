import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET);
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method === "POST") {
        const buf = await readRawBody(req);
        const sig = req.headers["stripe-signature"];

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                buf,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error(`Error verifying webhook signature: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === "checkout.session.completed") {
            console.log("Payment was successful!");

            // Retrieve the session to get the metadata
            const session = await stripe.checkout.sessions.retrieve(
                event.data.object.id
            );
            const items = JSON.parse(session.metadata.cart);

            // Aggregate quantities for each unique stripe_id
            const aggregatedItems = items.reduce((acc, item) => {
                acc[item.stripe_id] =
                    (acc[item.stripe_id] || 0) + item.quantity;
                return acc;
            }, {});

            // Update inventory in Supabase for each unique item
            for (const [stripeId, quantity] of Object.entries(
                aggregatedItems
            )) {
                await updateInventory(stripeId, quantity);
            }
        }

        res.json({ received: true });
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end("Method Not Allowed");
    }
}

async function updateInventory(stripeId, quantity) {
    try {
        // Retrieve the current stock level from the database
        let { data: stockData, error: stockError } = await supabase
            .from("sizesStock")
            .select("amount")
            .eq("stripe_id", stripeId)
            .single();

        if (stockError) {
            throw stockError;
        }

        if (stockData) {
            const newAmount = stockData.amount - quantity;

            // Check for negative inventory
            if (newAmount < 0) {
                console.error(
                    "Attempted to reduce inventory below zero for item ID:",
                    stripeId
                );
                return;
            }

            // Update the stock level in the database
            const { data, error } = await supabase
                .from("sizesStock")
                .update({ amount: newAmount })
                .eq("stripe_id", stripeId);

            if (error) {
                throw error;
            }

            console.log(
                "Inventory updated for item ID:",
                stripeId,
                "; New amount:",
                newAmount
            );
        } else {
            console.error("No stock data found for item ID:", stripeId);
        }
    } catch (error) {
        console.error("Error updating inventory:", error);
    }
}

async function readRawBody(request) {
    return new Promise((resolve, reject) => {
        let totalBuffer = Buffer.from([]);
        request.on("data", (chunk) => {
            totalBuffer = Buffer.concat([totalBuffer, chunk]);
        });
        request.on("end", () => {
            resolve(totalBuffer);
        });
        request.on("error", (err) => {
            reject(err);
        });
    });
}
