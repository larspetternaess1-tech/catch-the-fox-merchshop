"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import MoreProducts from "./components/MoreProducts";
import Contact from "../../components/contact";
import { useCart } from "../../store/cartContext";
import { motion, AnimatePresence } from "framer-motion";

const Page = () => {
    const { id } = useParams(); // Using useParams to fetch the dynamic route parameter
    const [product, setProduct] = useState(null);
    const [sizes, setSizes] = useState([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [selectedSizeId, setSelectedSizeId] = useState(null);
    const { addToCart } = useCart();
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        if (id) {
            // Ensure id is not undefined
            fetchProductAndSizes(id);
        }
    }, [id]);

    const fetchProductAndSizes = async (productId) => {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();

        if (response.ok) {
            setProduct(data.product);
            setSizes(
                data.sizes.map((size) => ({
                    sizesStockId: size.id,
                    amount: size.amount,
                    name: size.size.name,
                    sizeId: size.size.id,
                }))
            );
        } else {
            console.error("Error fetching product and sizes:", data.error);
        }
    };

    const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);

    const handleAddToCartClick = async (sizeId) => {
        await addToCart(sizeId);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
    };

    if (!product) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <section className="mx-auto flex max-w-7xl flex-col gap-20 px-4 py-14">
                <div className="flex cursor-default gap-2 text-xs font-semibold italic text-clrtertiary ">
                    <Link href="/shop">
                        <span className="underline underline-offset-4">
                            Shop
                        </span>
                    </Link>
                    <span>/</span>
                    {product.name}
                </div>
                <div className="flex w-full flex-col md:flex-row">
                    <div className="grid flex-1 place-items-center pb-8">
                        <Image
                            className="object-contain"
                            src={product.image_url}
                            alt={product.name}
                            width={400}
                            height={450}
                            unoptimized={true}
                        />
                    </div>
                    <div className="flex flex-1 flex-col gap-12">
                        <div>
                            <span className="text-sm font-semibold">
                                T-shirt
                            </span>
                            <h1 className="text-3xl font-black lg:text-5xl">
                                {product.name}
                            </h1>
                        </div>
                        <p className="font-medium">
                            {`Discover your inner rockstar with our ${product.name} Limited Edition T-Shirt! Made with 100% premium cotton for ultimate comfort, this tee is a must-have for any true fan. Get yours now and keep the music alive!`}
                        </p>
                        <span className="relative z-10 text-4xl font-black italic text-clrprimary lg:text-5xl">
                            {Number(product.price / 100).toFixed(2)},-
                            <span className="absolute left-[-3px] top-[-3px] z-0 text-4xl font-black italic text-clrtertiary lg:text-5xl">
                                {Number(product.price / 100).toFixed(2)},-
                            </span>
                        </span>
                        <div className="flex max-w-96 flex-wrap bg-clrprimarydark">
                            <button
                                className="w-full py-4 bg-clrprimary font-bold"
                                type="button"
                                id="dropdownMenuButton"
                                aria-expanded={isDropdownVisible}
                                onClick={toggleDropdown}
                            >
                                Choose size
                            </button>
                            <ul
                                className={`${
                                    isDropdownVisible ? "flex" : "hidden"
                                } justify-center flex-wrap gap-2 py-4`}
                                aria-labelledby="dropdownMenuButton"
                            >
                                {sizes.map((size, index) => (
                                    <li key={index}>
                                        <button
                                            tabIndex="0"
                                            onClick={() => {
                                                if (size.amount > 0) {
                                                    setSelectedSizeId(
                                                        size.sizesStockId
                                                    );
                                                    console.log(
                                                        `Size selected: ${size.sizesStockId}`
                                                    );
                                                }
                                            }}
                                            className={`bg-opacity-80 w-44 py-3 bg-clrprimary flex justify-center items-center gap-2 
                                                        ${
                                                            size.amount === 0
                                                                ? "opacity-50 cursor-none"
                                                                : "active:bg-opacity-60 focus:outline focus:outline-2 focus:outline-clrwhite"
                                                        }
                                                        transition duration-150 ease-in-out`}
                                            disabled={size.amount === 0}
                                        >
                                            <span className="font-bold">
                                                {size.name}
                                            </span>
                                            <span className="text-xs">
                                                ( {size.amount} left )
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <span
                            id="plzPickSize"
                            className="font-extrabold text-clrwhite opacity-50"
                        >
                            Pick a size to add to cart
                        </span>
                        <button
                            onClick={() => {
                                if (!selectedSizeId) {
                                    alert("Please select a size.");
                                } else {
                                    handleAddToCartClick(selectedSizeId);
                                }
                            }}
                            className="mt-auto w-fit bg-clrprimary px-12 py-4 font-extrabold text-xl rounded-full hover:bg-clrwhite hover:text-clrdark"
                        >
                            Add to cart
                        </button>
                    </div>
                </div>
            </section>
            <MoreProducts />
            <Contact />
            <AnimatePresence>
                {showNotification && (
                    <motion.div
                        initial={{ opacity: 0, x: -100, skewX: 45 }}
                        animate={{ opacity: 1, x: 0, skewX: 0, skewY: 3 }}
                        exit={{
                            opacity: 0,
                            y: 100,
                            skewY: -10,
                            decelerate: 0.5,
                        }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-0 left-0 mb-4 ml-4 p-3 pr-6 text-3xl bg-[#00A36C] z-50 font-black italic text-white"
                    >
                        Added to cart!
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Page;
