const stripe = require("stripe")(process.env.STRIPE_SECRET);

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { items } = req.body;

            // Validate the items array
            if (!items || !Array.isArray(items)) {
                console.error("Invalid request: items must be an array");
                return res.status(400).json({
                    error: "Invalid request format: items must be an array",
                });
            }

            // Log the items to check if they are correctly formatted
            console.dir("Received items:", items);

            const line_items = items.map((item) => ({
                price: item.price,
                quantity: item.quantity,
            }));

            // Log the line items to ensure they are correct before sending to Stripe
            console.dir("Prepared line_items for Stripe:", line_items);

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: line_items,
                mode: "payment",
                success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.origin}/cancel`,
                metadata: {
                    cart: JSON.stringify(
                        items.map((item) => ({
                            price_id: item.stripe_id, // Stripe price ID
                            quantity: item.quantity,
                            stockId: item.stockId, // Stock ID from your cart component
                        }))
                    ),
                },
                shipping_address_collection: {
                    allowed_countries: ["NO"],
                },
            });

            // Successfully created session
            console.log("Checkout session created successfully:", session.id);
            res.status(200).json({ sessionId: session.id });
        } catch (err) {
            console.error("Error creating Stripe checkout session:", err);
            res.status(err.statusCode || 500).json({ error: err.message });
        }
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
