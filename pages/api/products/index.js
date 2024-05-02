import { supabase } from "../supabaseClient";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const { data, error } = await supabase.from("products").select("*");

            if (error) {
                throw error;
            }

            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching products:", error.message);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).end("Method Not Allowed");
    }
}
