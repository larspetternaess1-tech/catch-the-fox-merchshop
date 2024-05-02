"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const fetchProducts = async () => {
    const response = await fetch("/api/products");
    const data = await response.json();

    if (response.ok) {
        return data;
    } else {
        console.log("Error fetching products:", data.error);
        return [];
    }
};

const ShopGrid = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts().then((data) => {
            setProducts(data);
        });
    }, []);

    return (
        <section className="mx-auto grid w-full max-w-7xl grid-cols-1 grid-rows-3 gap-4 p-4 md:grid-cols-2 md:grid-rows-2 lg:grid-cols-3 lg:grid-rows-1">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="flex flex-col items-center gap-8 bg-clrprimary px-4 py-8"
                >
                    <div className="flex flex-col items-center">
                        <Image
                            className="max-h-80 object-contain"
                            src={product?.image_url}
                            alt={product?.name}
                            width={400}
                            height={450}
                            unoptimized={true} // Use this if your images are hosted outside of Vercel's optimization
                        />
                        <p className="pt-2 text-xl italic md:text-2xl">
                            {product?.name}
                        </p>
                        <p className="font-semibold italic">
                            {Number(product?.price / 100).toFixed(2)}kr
                        </p>
                    </div>
                    <Link href={"/shop/" + product.id}>
                        <button className="mt-auto rounded-full w-fit bg-clrdark px-8 py-4 font-extrabold hover:bg-clrwhite hover:text-clrdark">
                            MORE
                        </button>
                    </Link>
                </div>
            ))}
        </section>
    );
};

export default ShopGrid;
