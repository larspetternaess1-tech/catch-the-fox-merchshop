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

            // Serialize the cart items to store in metadata
            const cartMetadata = JSON.stringify(
                items.map((item) => ({
                    stripe_id: item.price, // Assuming `price` here actually refers to stripe_id in your model
                    quantity: item.quantity,
                    sizeStockId: item.sizeStockId, // Ensure sizeStockId is passed from the client
                }))
            );

            const session = await stripe.checkout.sessions.create({
                line_items: items,
                mode: "payment",
                success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.origin}/cancel`,
                metadata: { cart: cartMetadata }, // Attach serialized cart data
                automatic_tax: { enabled: true },
                shipping_address_collection: {
                    allowed_countries: ["NO"],
                },
                shipping_options: [
                    { shipping_rate: "shr_1P06OnGTrv1TY0preYT0wO14" },
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
