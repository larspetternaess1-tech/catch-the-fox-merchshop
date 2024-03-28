"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "/pages/api/supabaseClient"; // Adjust the import path as needed
import { useCart } from "../../store/cartContext"; // Adjust the import path as needed

const CartComponent = () => {
    const { cart } = useCart();
    const [cartItems, setCartItems] = useState([]);

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
                            product: products (id, name, price, image_url), 
                            size: sizes (id, name)
                        `
                            )
                            .eq("id", sizeStockId) // Using sizeStockId to fetch the record
                            .single(); // Assuming sizeStockId uniquely identifies the record

                        if (error) throw error;

                        return {
                            name: data.product.name,
                            size: data.size.name,
                            price: data.product.price,
                            quantity,
                            image: data.product.image,
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
        return <div>Your cart is empty</div>;
    }
    const handleCheckout = async () => {
        try {
            const lineItems = cartItems.map((item) => ({
                price_data: {
                    currency: "nok",
                    product_data: {
                        name: item.name,
                        images: [item.image],
                    },
                    unit_amount: item.price * 100,
                },
                quantity: item.quantity,
            }));

            const response = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ items: lineItems }),
            });

            const data = await response.json();

            if (response.status === 200) {
                window.location = `https://checkout.stripe.com/pay/${data.sessionId}`;
            } else {
                console.error(
                    "Failed to initiate Stripe Checkout:",
                    data.message
                );
            }
        } catch (error) {
            console.error("Error during checkout:", error);
        }
    };

    return (
        <div>
            {cartItems.map((item, index) => (
                <div key={index}>
                    <div>Name: {item.name}</div>
                    <div>Size: {item.size}</div>
                    <div>Price: {(item.price / 100).toFixed(2)}</div>
                    <div>Quantity: {item.quantity}</div>
                    <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: "100px" }}
                    />
                </div>
            ))}
            <button
                className="px-6 py-2 bg-clrprimary text-clrwhite"
                onClick={handleCheckout}
            >
                Checkout
            </button>
        </div>
    );
};

export default CartComponent;
