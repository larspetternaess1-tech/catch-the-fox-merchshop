// pages/api/get-stripe-session.js
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    const { sessionId } = req.query;
    try {
        if (!sessionId) {
            return res.status(400).json({ error: "Session ID is required" });
        }
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.status(200).json({ session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
