// pages/api/cartItems.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { ids } = req.body; // Expect an array of sizeStockIds

        try {
            const { data, error } = await supabase
                .from("sizesStock")
                .select(
                    `
                    id, 
                    amount,
                    stripe_id,
                    product: products (id, name, price, image_url),
                    size: sizes (id, name)
                `
                )
                .in("id", ids);

            if (error) {
                throw error;
            }

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
