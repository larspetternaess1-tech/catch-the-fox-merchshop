import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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
            console.log("Payment was successful! it really was!");

            // Retrieve the session to get line items
            const sessionId = event.data.object.id;
            const session = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ["line_items.data"],
            });

            // Accumulate quantities for each item
            const itemCounts = session.line_items.data.reduce((acc, item) => {
                acc[item.description] =
                    (acc[item.description] || 0) + item.quantity;
                return acc;
            }, {});

            // Update inventory in Supabase for each unique item
            for (const [sizeStockId, quantity] of Object.entries(itemCounts)) {
                const { data, error } = await supabase
                    .from("sizesStock")
                    .update({
                        amount: supabase.functions.raw("amount - ?", [
                            quantity,
                        ]),
                    })
                    .eq("id", sizeStockId);

                if (error) {
                    console.error(
                        "Error updating inventory for item:",
                        sizeStockId,
                        error.message
                    );
                } else {
                    console.log(
                        "Inventory updated for item:",
                        sizeStockId,
                        data
                    );
                }
            }
        }

        res.json({ received: true });
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end("Method Not Allowed");
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
