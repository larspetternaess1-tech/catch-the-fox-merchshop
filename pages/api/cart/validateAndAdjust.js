import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
    if (req.method === "POST") {
        const items = req.body.items;
        const results = await Promise.all(
            items.map(async (item) => {
                console.dir(items);
                const { data, error } = await supabase
                    .from("sizesStock")
                    .select("amount")
                    .eq("id", item.id)
                    .single();

                if (error) {
                    console.error("Supabase error:", error);
                    return null;
                }

                const availableQuantity = data.amount;
                if (item.quantity > availableQuantity) {
                    return { ...item, quantity: availableQuantity };
                }
                return item;
            })
        );

        // Filter nulls and return
        const validatedItems = results.filter((item) => item !== null);
        res.status(200).json(validatedItems);
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end("Method Not Allowed");
    }
}
