import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET);

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                currency: "nok",
                shipping_address_collection: {
                    allowed_countries: ["NO"], // Adjust as necessary
                },
                line_items: req.body.items,
                success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.origin}/cancel`,
            });
            res.status(200).json({ sessionId: session.id });
        } catch (error) {
            res.status(500).json({ statusCode: 500, message: error.message });
        }
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
