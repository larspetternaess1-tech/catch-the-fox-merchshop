import { stripe } from "./checkout_sessions"; // Assuming stripe is exported from here

export default async function handler(req, res) {
    if (req.method === "POST") {
        let data = "";
        req.on("data", (chunk) => {
            data += chunk;
        });
        req.on("end", () => {
            try {
                const sig = req.headers["stripe-signature"];
                const event = stripe.webhooks.constructEvent(
                    data,
                    sig,
                    process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET
                );

                // Handle the checkout.session.completed event
                if (event.type === "checkout.session.completed") {
                    const session = event.data.object;
                    console.log(
                        `Payment was successful for session: ${session.id}`
                    );
                    // Here you can implement the logic to adjust stock in Supabase or perform other actions

                    res.status(200).json({ received: true });
                } else {
                    res.status(400).json({ error: "Unhandled event type" });
                }
            } catch (err) {
                console.error(`Webhook Error: ${err.message}`);
                res.status(400).json({
                    error: `Webhook Error: ${err.message}`,
                });
            }
        });
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
