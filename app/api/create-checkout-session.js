// Import Stripe
import Stripe from "stripe";

// Create a new Stripe instance with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            // Create a Checkout Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "usd",
                            product_data: {
                                name: "T-shirt",
                            },
                            unit_amount: 2000, // $20.00
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.origin}/cancel`,
            });

            // Return the session ID
            res.status(200).json({ id: session.id });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        // Handle any non-POST requests
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
