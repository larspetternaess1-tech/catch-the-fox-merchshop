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

            // Retrieve the session including detailed line items
            const session = await stripe.checkout.sessions.retrieve(
                event.data.object.id,
                { expand: ["line_items"] }
            );

            // Iterate over each line item in the session
            const promises = session.line_items.data.map(async (lineItem) => {
                const variant = lineItem.description; // Assuming the description directly contains the variant code
                const quantity = lineItem.quantity;

                console.dir({
                    message: "Updating inventory",
                    variant,
                    quantity,
                });

                await updateInventory(variant, quantity);
            });

            // Wait for all inventory updates to complete
            await Promise.all(promises);

            console.dir({ message: "All inventory updates completed" });
        }

        res.json({ received: true });
    } catch (err) {
        console.dir({ message: "Webhook Error:", error: err.message });
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
}

async function updateInventory(variant, quantity) {
    try {
        let { data: stockData, error } = await supabase
            .from("sizesStock")
            .select("amount")
            .eq("variant", variant)
            .single();

        if (error) {
            console.dir({
                message: "Error fetching stock data",
                variant,
                error: error.message,
            });
            throw error;
        }

        if (stockData) {
            const newAmount = stockData.amount - quantity;

            if (newAmount < 0) {
                console.dir({
                    message: "Inventory cannot go negative",
                    variant,
                    newAmount,
                });
                return; // Optionally handle this scenario
            }

            const { error: updateError } = await supabase
                .from("sizesStock")
                .update({ amount: newAmount })
                .eq("variant", variant);

            if (updateError) {
                console.dir({
                    message: "Error updating inventory",
                    variant,
                    error: updateError.message,
                });
                throw updateError;
            }

            console.dir({
                message: "Inventory successfully updated",
                variant,
                newAmount,
            });
        }
    } catch (error) {
        console.dir({
            message: "Error handling inventory update",
            variant,
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
