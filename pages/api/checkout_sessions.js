export const stripe = require("stripe")(process.env.NEXT_PUBLIC_STRIPE_SECRET);

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { items } = req.body; // Expecting items to be an array of { price, quantity }

            // Ensure items exist and is an array
            if (!items || !Array.isArray(items)) {
                return res
                    .status(400)
                    .json({ error: "Invalid request format" });
            }

            const session = await stripe.checkout.sessions.create({
                line_items: items,
                mode: "payment",
                success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.origin}/cancel`,
                automatic_tax: { enabled: true },
                shipping_address_collection: {
                    allowed_countries: ["NO"], // Specify allowed countries here
                },
                shipping_options: [
                    { shipping_rate: "shr_1P06OnGTrv1TY0preYT0wO14" }, // Example shipping rate ID
                ],
            });
            res.status(200).json({ sessionId: session.id });
        } catch (err) {
            res.status(err.statusCode || 500).json(err.message);
        }
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

// Webhooks
// Add this to your existing checkout_sessions.js or create a new file for webhooks

export default async function webhookHandler(req, res) {
    if (req.method === 'POST') {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            // Here you would communicate with your Supabase to adjust stock
            // For now, just log the session ID (or other relevant info)
            console.log(`Payment was successful for session: ${session.id}`);
            // Implement logic to handle a successful checkout

            res.json({ received: true });
        } else {
            return res.status(400).end();
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
