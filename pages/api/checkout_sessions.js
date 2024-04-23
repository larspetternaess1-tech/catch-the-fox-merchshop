const stripe = require("stripe")(process.env.STRIPE_SECRET);

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
