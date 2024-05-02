import { supabase } from "../supabaseClient";
export default async function handler(req, res) {
    if (req.method === "GET") {
        const { id } = req.query;

        try {
            // Fetch the product details
            const { data: productData, error: productError } = await supabase
                .from("products")
                .select("id, name, category_id, price, image_url")
                .eq("id", id)
                .single();

            if (productError) throw productError;

            // Fetch SizesStock entries for this product, including size details
            const { data: sizesStockData, error: sizesStockError } =
                await supabase
                    .from("sizesStock")
                    .select("id, amount, size: sizes!size_id (id, name)")
                    .eq("product_id", id);

            if (sizesStockError) throw sizesStockError;

            res.status(200).json({
                product: productData,
                sizes: sizesStockData,
            });
        } catch (error) {
            console.error("Error fetching product details:", error.message);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).end("Method Not Allowed");
    }
}
