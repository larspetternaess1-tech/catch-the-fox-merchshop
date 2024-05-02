import { supabase } from "../supabaseClient";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { sizeStockId } = req.body;
        try {
            const { data, error } = await supabase
                .from("sizesStock")
                .select("id, amount, product_id, size_id")
                .eq("id", sizeStockId)
                .single();

            if (error) throw error;

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).end("Method Not Allowed");
    }
}
