"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "/utils/api/supabaseClient";
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
                            image_url: data.product.image_url,
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

    return (
        <div>
            {cartItems.map((item, index) => (
                <div key={index}>
                    <div>Name: {item.name}</div>
                    <div>Size: {item.size}</div>
                    <div>Price: {(item.price / 100).toFixed(2)}</div>
                    <div>Quantity: {item.quantity}</div>
                    <img
                        src={item.image_url}
                        alt={item.name}
                        style={{ width: "100px" }}
                    />
                </div>
            ))}
        </div>
    );
};

export default CartComponent;
