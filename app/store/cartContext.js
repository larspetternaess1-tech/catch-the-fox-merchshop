"use client";
import { supabase } from "../../pages/api/supabaseClient";
import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({});
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const cartFromStorage = localStorage.getItem("cart");
        if (cartFromStorage) {
            setCart(JSON.parse(cartFromStorage));
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart, isHydrated]);

    const addToCart = async (sizeStockId) => {
        console.log("Adding to cart:", sizeStockId);
        try {
            // Fetch stock information for the given sizeStockId
            const { data, error } = await supabase
                .from("sizesStock")
                .select("id, amount, product_id, size_id")
                .eq("id", sizeStockId)
                .single();

            if (error) throw error;

            // Proceed if stock information is found
            if (data) {
                setCart((prevCart) => {
                    const currentQuantityInCart = prevCart[sizeStockId] || 0;

                    // Check if adding another unit exceeds the available stock
                    if (currentQuantityInCart < data.amount) {
                        // If under stock limit, update the cart
                        const updatedCart = {
                            ...prevCart,
                            [sizeStockId]: currentQuantityInCart + 1,
                        };
                        return updatedCart;
                    } else {
                        // If stock limit is reached or exceeded
                        alert(
                            " No more of this product in stock | Ikke mer av dette produktet på lager."
                        );
                        return prevCart; // Return the existing cart without changes
                    }
                });
            } else {
                alert("Out of stock | Utsolgt");
            }
        } catch (error) {
            console.error("Error fetching stock information:", error);
            alert(
                "An error occurred while attempting to add the product to the cart."
            );
        }
    };

    const decreaseQuantity = (sizeId) => {
        setCart((prevCart) => {
            const itemKey = sizeId.toString();
            if (prevCart[itemKey] > 1) {
                const newQuantity = prevCart[itemKey] - 1;
                return { ...prevCart, [itemKey]: newQuantity };
            } else {
                return prevCart; // Do not decrease below 1 to avoid negative values
            }
        });
    };

    const removeFromCart = (sizeId) => {
        setCart((prevCart) => {
            const updatedCart = { ...prevCart };
            delete updatedCart[sizeId.toString()];
            return updatedCart;
        });
    };
    const updateCartQuantity = (sizeStockId, newQuantity) => {
        setCart((prevCart) => {
            // If newQuantity is 0, consider removing the item from the cart
            if (newQuantity <= 0) {
                const updatedCart = { ...prevCart };
                delete updatedCart[sizeStockId];
                return updatedCart;
            } else {
                // Update the quantity for the specified item
                return {
                    ...prevCart,
                    [sizeStockId]: newQuantity,
                };
            }
        });
    };

    if (!isHydrated) {
        return null;
    }

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                decreaseQuantity,
                removeFromCart,
                updateCartQuantity,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;
