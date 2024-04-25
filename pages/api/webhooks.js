export default async function handler(req, res) {
    if (req.method === "POST") {
        let event;

        // Your Stripe webhook secret
        const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        try {
            const signature = req.headers["stripe-signature"];

            // Ensure the request is signed by Stripe
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                stripeWebhookSecret
            );
        } catch (err) {
            console.log(`Webhook Error: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the checkout.session.completed event
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            // Handle the session completion
            console.log("Checkout session completed!", session);
        }

        // Return a response to acknowledge receipt of the event
        res.json({ received: true });
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end("Method Not Allowed");
    }
}
