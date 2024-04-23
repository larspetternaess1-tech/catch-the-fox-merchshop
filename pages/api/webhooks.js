// pages/api/webhooks.js

import { buffer } from "micro";
import { supabase } from "./supabaseClient"; // Adjust the import path as needed
import { stripe } from "./checkout_sessions"; // Adjust this if you have a separate file for your Stripe client

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method === "POST") {
        const buf = await buffer(req);
        const sig = req.headers["stripe-signature"];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                buf.toString(),
                sig,
                webhookSecret
            );
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            const lineItems = await stripe.checkout.sessions.listLineItems(
                session.id,
                {
                    limit: 1000, // Adjust based on expected number of items
                }
            );

            await updateSupabaseStock(lineItems.data);
        }

        res.status(200).json({ received: true });
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

async function updateSupabaseStock(items) {
    for (const item of items) {
        const {
            quantity,
            price: { product: productId },
        } = item;
        const { data: stockData, error: stockError } = await supabase
            .from("sizesStock")
            .select("id, amount")
            .eq("stripe_id", productId)
            .single();

        if (stockError) {
            console.error("Error fetching stock information:", stockError);
            continue; // Skip this item on error
        }

        const newAmount = stockData.amount - quantity;
        const { error: updateError } = await supabase
            .from("sizesStock")
            .update({ amount: newAmount })
            .eq("id", stockData.id);

        if (updateError) {
            console.error("Error updating stock:", updateError);
        }
    }
}
