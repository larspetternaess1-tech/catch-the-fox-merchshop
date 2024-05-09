import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

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
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end("Method Not Allowed");
    }

    const buf = await readRawBody(req);
    const sig = req.headers["stripe-signature"];

    try {
        const event = stripe.webhooks.constructEvent(
            buf,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        console.dir({ message: "Webhook event received:", event: event.type });

        if (event.type === "checkout.session.completed") {
            console.dir({
                message: "Handling checkout.session.completed event",
            });

            // Retrieve the session to get the metadata
            const session = await stripe.checkout.sessions.retrieve(
                event.data.object.id
            );

            const items = JSON.parse(session.metadata.cart);

            // Update inventory in Supabase for each unique item using stockId
            for (const item of items) {
                await updateInventory(item.stockId, item.quantity);
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.dir({ message: "Webhook Error:", error: err.message });
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
}

async function updateInventory(stockId, quantity) {
    try {
        console.dir({
            message: "Fetching current stock level",
            stockId: stockId,
        });

        let { data: stockData, error: stockError } = await supabase
            .from("sizesStock")
            .select("amount")
            .eq("id", stockId)
            .single();

        if (stockError) {
            console.dir({
                message: "Error fetching stock data",
                error: stockError.message,
            });
            throw stockError;
        }

        if (stockData) {
            const newAmount = stockData.amount - quantity;

            console.dir({
                message: "Calculating new stock amount",
                newAmount: newAmount,
            });

            if (newAmount < 0) {
                console.dir({
                    message: "Attempted to reduce inventory below zero",
                    stockId: stockId,
                });
                return;
            }

            const { error } = await supabase
                .from("sizesStock")
                .update({ amount: newAmount })
                .eq("id", stockId);

            if (error) {
                console.dir({
                    message: "Error updating inventory",
                    error: error.message,
                });
                throw error;
            }

            console.dir({
                message: "Inventory updated successfully",
                stockId: stockId,
                newAmount: newAmount,
            });
        } else {
            console.dir({ message: "No stock data found", stockId: stockId });
        }
    } catch (error) {
        console.dir({
            message: "Error handling inventory update",
            error: error.message,
        });
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
            console.dir({
                message: "Error reading request body",
                error: err.message,
            });
            reject(err);
        });
    });
}
