import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
    const items = req.body.items;
    console.dir(items);
    const results = await Promise.all(
        items.map(async (item) => {
            const { data, error } = await supabase
                .from("sizesStock")
                .select("stripe_id, amount")
                .eq("id", item.id)
                .single();

            if (error) {
                console.error("Supabase error:", error);
                return null;
            }

            const availableQuantity = data.amount;
            if (item.quantity > availableQuantity) {
                return {
                    stripe_id: data.stripe_id,
                    quantity: availableQuantity,
                };
            }
            return { stripe_id: data.stripe_id, quantity: item.quantity };
        })
    );

    // Filter nulls and return
    const validatedItems = results.filter((item) => item !== null);
    res.status(200).json(validatedItems);
}
