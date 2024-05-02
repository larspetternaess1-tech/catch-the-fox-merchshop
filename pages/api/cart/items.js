import { supabase } from "../supabaseClient";

export default async function handler(req, res) {
    if (req.method === "GET") {
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
                .in("id", req.query.ids.split(","));

            if (error) throw error;

            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching cart item details:", error);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).end("Method Not Allowed");
    }
}
