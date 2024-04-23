"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { supabase } from "/pages/api/supabaseClient"; // Adjust the import path as needed
import { useCart } from "../../store/cartContext"; // Adjust the import path as needed
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import ErrorMessage from "../../components/ErrorMessage";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const CartComponent = () => {
    const {
        cart,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        updateCartQuantity,
    } = useCart();
    const [errorMessage, setErrorMessage] = useState("");
    const [cartItems, setCartItems] = useState([]);
    const handleAddToCartClick = async (sizeId) => {
        await addToCart(sizeId);
        // Optional: Additional UI feedback/logic after adding to cart
    };

    // stripe logic
    React.useEffect(() => {
        // Check to see if this is a redirect back from Checkout
        const query = new URLSearchParams(window.location.search);
        if (query.get("success")) {
            console.log(
                "Order placed! You will receive an email confirmation."
            );
        }

        if (query.get("canceled")) {
            console.log(
                "Order canceled -- continue to shop around and checkout when you’re ready."
            );
        }
    }, []);

    useEffect(() => {
        const fetchCartItems = async () => {
            const items = await Promise.all(
                Object.entries(cart).map(async ([sizeStockId, quantity]) => {
                    try {
                        const { data, error } = await supabase
                            .from("sizesStock") // Adjusted to correct table name
                            .select(
                                `
                            id, 
                            amount,
                            stripe_id, 
                            product: products (id, name, price, image_url), 
                            size: sizes (id, name)
                        `
                            )
                            .eq("id", sizeStockId) // Using sizeStockId to fetch the record
                            .single(); // Assuming sizeStockId uniquely identifies the record

                        if (error) throw error;
                        console.log("data", data);

                        return {
                            name: data.product.name,
                            size: data.size.name,
                            price: data.product.price,
                            quantity,
                            image: data.product.image_url,
                            stripe_id: data.stripe_id,
                            stockId: data.id,
                        };
                    } catch (error) {
                        console.error(
                            "Error fetching cart item details:",
                            error
                        );
                        return null; // Skip this item on error
                    }
                })
            );

            // Filter out any items that failed to fetch
            setCartItems(items.filter((item) => item !== null));
        };

        fetchCartItems();
    }, [cart]);

    if (cartItems.length === 0) {
        return (
            <div className="grid place-items-center gap-4 py-24">
                <p className="text-3xl font-extrabold">Her var det lite...</p>
                <p className="italic">
                    Tips: Trykk på knappen under for å starte handelen
                </p>
                <Link
                    href="/shop"
                    className="rounded-full italic bg-clrdark px-8 py-3 font-black"
                >
                    MERCH SHOP
                </Link>
            </div>
        );
    }
    const calculateTotal = () => {
        let price = cartItems
            .map((item) => item.price * item.quantity)
            .reduce((a, b) => a + b, 0);
        return price.toFixed(2) / 100 + 79;
    };
    const handleCheckout = async () => {
        let adjustmentsNeeded = false;

        const validatedCartItems = await Promise.all(
            cartItems.map(async (item) => {
                const { data, error } = await supabase
                    .from("sizesStock")
                    .select("amount")
                    .eq("id", item.stockId)
                    .single();

                if (error) {
                    console.error("Error validating stock:", error);
                    return null; // Continue with other items, this item will be excluded
                }

                if (item.quantity > data.amount) {
                    // Adjust this item's quantity in the cart to the available stock
                    updateCartQuantity(item.stockId, data.amount); // Assumed function
                    adjustmentsNeeded = true;

                    return { ...item, quantity: data.amount }; // Update quantity for checkout
                }

                return item; // No adjustment needed
            })
        );

        if (adjustmentsNeeded) {
            setErrorMessage(
                "Some items in your cart are no longer available in the selected quantity. Please review your cart before proceeding. | Noen varer i handlekurven er ikke lenger tilgjengelige i valgt antall. Vennligst gjennomgå handlekurven din før du fortsetter."
            );
            return; // Halt the checkout process
        }

        // If no adjustments are needed, or once adjustments are acknowledged, proceed with checkout
        const stripe = await stripePromise;
        const items = validatedCartItems
            .filter((item) => item !== null)
            .map((item) => ({
                price: item.stripe_id,
                quantity: item.quantity,
            }));

        fetch("/api/checkout_sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ items }),
        })
            .then((response) => {
                if (!response.ok)
                    throw new Error("Network response was not ok");
                return response.json();
            })
            .then((data) => {
                // Redirect to Stripe Checkout
                return stripe.redirectToCheckout({ sessionId: data.sessionId });
            })
            .catch((error) => {
                console.error("Error:", error);
                // Here you could display an error message to the user, if needed
            });
    };
    return (
        <div className="flex w-full flex-col gap-2">
            {cartItems.map((item, index) => (
                <div
                    className="flex flex-col items-center justify-between bg-clrdark px-8 py-4 sm:flex-row"
                    key={index}
                >
                    <div className="flex w-full items-center justify-between gap-4 sm:w-auto">
                        <Image
                            className="h-24 w-24 object-contain"
                            src={item.image}
                            alt={`graphic Catch the fox t-shirt ${item.size}`}
                            width={96}
                            height={96}
                        />
                        <div className="flex flex-col items-end gap-2 sm:items-start">
                            <span className="text-xl font-black sm:text-2xl">
                                {item.name}
                            </span>
                            <div className="flex gap-2 text-sm font-bold italic">
                                <span>Size:</span>
                                <span>{item.size}</span>
                            </div>
                            <span className="text-sm font-bold italic">
                                {item.price.toFixed(2) / 100}kr
                            </span>
                        </div>
                    </div>
                    <div className="flex w-full items-center justify-between gap-4 pt-4 sm:w-auto">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-4 text-xl font-black">
                                <button
                                    onClick={() =>
                                        decreaseQuantity(item.stockId)
                                    }
                                >
                                    <svg
                                        width="32"
                                        height="32"
                                        viewBox="0 0 100 100"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="hover:bg-clrprimary target:bg-clrprimary rounded-full"
                                    >
                                        <g clipPath="url(#clip0_540_69)">
                                            <path
                                                d="M100 50C100 63.2608 94.7322 75.9785 85.3553 85.3553C75.9785 94.7322 63.2608 100 50 100C36.7392 100 24.0215 94.7322 14.6447 85.3553C5.26784 75.9785 0 63.2608 0 50C0 36.7392 5.26784 24.0215 14.6447 14.6447C24.0215 5.26784 36.7392 0 50 0C63.2608 0 75.9785 5.26784 85.3553 14.6447C94.7322 24.0215 100 36.7392 100 50ZM28.125 46.875C27.2962 46.875 26.5013 47.2042 25.9153 47.7903C25.3292 48.3763 25 49.1712 25 50C25 50.8288 25.3292 51.6237 25.9153 52.2097C26.5013 52.7958 27.2962 53.125 28.125 53.125H71.875C72.7038 53.125 73.4987 52.7958 74.0847 52.2097C74.6708 51.6237 75 50.8288 75 50C75 49.1712 74.6708 48.3763 74.0847 47.7903C73.4987 47.2042 72.7038 46.875 71.875 46.875H28.125Z"
                                                fill="white"
                                            />
                                        </g>
                                    </svg>
                                </button>
                                <span className="cursor-default">
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() =>
                                        handleAddToCartClick(item.stockId)
                                    }
                                >
                                    <svg
                                        width="32"
                                        height="32"
                                        viewBox="0 0 100 100"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="hover:bg-clrprimary target:bg-clrprimary rounded-full"
                                    >
                                        <g clipPath="url(#clip0_540_67)">
                                            <path
                                                d="M100 50C100 63.2608 94.7322 75.9785 85.3553 85.3553C75.9785 94.7322 63.2608 100 50 100C36.7392 100 24.0215 94.7322 14.6447 85.3553C5.26784 75.9785 0 63.2608 0 50C0 36.7392 5.26784 24.0215 14.6447 14.6447C24.0215 5.26784 36.7392 0 50 0C63.2608 0 75.9785 5.26784 85.3553 14.6447C94.7322 24.0215 100 36.7392 100 50ZM53.125 28.125C53.125 27.2962 52.7958 26.5013 52.2097 25.9153C51.6237 25.3292 50.8288 25 50 25C49.1712 25 48.3763 25.3292 47.7903 25.9153C47.2042 26.5013 46.875 27.2962 46.875 28.125V46.875H28.125C27.2962 46.875 26.5013 47.2042 25.9153 47.7903C25.3292 48.3763 25 49.1712 25 50C25 50.8288 25.3292 51.6237 25.9153 52.2097C26.5013 52.7958 27.2962 53.125 28.125 53.125H46.875V71.875C46.875 72.7038 47.2042 73.4987 47.7903 74.0847C48.3763 74.6708 49.1712 75 50 75C50.8288 75 51.6237 74.6708 52.2097 74.0847C52.7958 73.4987 53.125 72.7038 53.125 71.875V53.125H71.875C72.7038 53.125 73.4987 52.7958 74.0847 52.2097C74.6708 51.6237 75 50.8288 75 50C75 49.1712 74.6708 48.3763 74.0847 47.7903C73.4987 47.2042 72.7038 46.875 71.875 46.875H53.125V28.125Z"
                                                fill="white"
                                            />
                                        </g>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => removeFromCart(item.stockId)}
                            className=" text-xs font-black text-clrprimary italic hover:text-clrwhite"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ))}
            <div className="flex flex-col items-end gap-2">
                {errorMessage && <ErrorMessage message={errorMessage} />}
                <span className="flex flex-col gap-0">
                    79kr - Shipping for all of Norway
                </span>
                <span className="text-2xl font-black">Total Price:</span>
                <span className="text-3xl font-black italic">
                    {calculateTotal().toFixed(2)}kr
                </span>
                <button
                    onClick={handleCheckout}
                    className="rounded-full bg-clrdark px-8 py-3 font-black"
                >
                    Buy now
                </button>
            </div>
        </div>
    );
};

export default CartComponent;
