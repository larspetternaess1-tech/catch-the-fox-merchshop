import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "/utils/api/supabaseClient";
import Image from "next/image";
import Link from "next/link";

const MoreProducts = () => {
    const { id } = useParams();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchMoreProducts(id);
    }, [id]);

    const fetchMoreProducts = async (currentProductId) => {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .not("id", "eq", currentProductId)
            .limit(2);

        if (error) {
            console.error("Error fetching products:", error);
            return;
        }

        setProducts(data);
    };

    return (
        <section className="w-full bg-clrprimarydark">
            <div
                className="mx-auto flex max-w-7xl flex-col gap-8 p-8 py-16 md:p-16 md:py-32
        "
            >
                <h2 className="relative z-10 text-4xl font-black italic text-clrprimary lg:text-5xl">
                    MORE STUFF
                    <span className="absolute left-[-3px] top-[-3px] z-0 text-4xl font-black italic text-clrtertiary lg:text-5xl">
                        MORE STUFF
                    </span>
                </h2>
                <section className="mx-auto grid w-full max-w-7xl grid-cols-1 grid-rows-2 gap-4   md:grid-cols-2 md:grid-rows-1">
                    {products
                        ?.filter(
                            (otherProduct) => otherProduct.id !== BigInt(id)
                        )
                        .map((otherProduct) => (
                            <div
                                key={otherProduct.id}
                                className="flex flex-col items-center gap-8 bg-clrprimary px-4 py-8"
                            >
                                <div className="flex flex-col items-center">
                                    <Image
                                        className="max-h-80 object-contain"
                                        src={otherProduct?.image_url}
                                        alt="graphic Catch the fox t-shirt"
                                        width={400}
                                        height={450}
                                    />
                                    <p className="pt-2 text-xl italic md:text-2xl">
                                        {otherProduct?.name}
                                    </p>
                                    <p className="font-semibold italic">
                                        {Number(otherProduct?.price / 100)}kr
                                    </p>
                                </div>
                                <Link href={"/shop/" + otherProduct.id}>
                                    <button className="mt-auto w-fit bg-clrdark rounded-full px-8 py-4 font-extrabold hover:bg-clrwhite hover:text-clrdark">
                                        MORE
                                    </button>
                                </Link>
                            </div>
                        ))}
                </section>
            </div>
        </section>
    );
};

export default MoreProducts;
