"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

// Create a cart context
const CartContext = createContext();

// Export useContext Hook for easy access to the cart context
export const useCart = () => useContext(CartContext);

// Component that provides cart context
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({});

    // Load cart from localStorage on initial render
    useEffect(() => {
        const cartFromStorage = localStorage.getItem("cart");
        if (cartFromStorage) {
            setCart(JSON.parse(cartFromStorage));
        }
    }, []);

    // Update localStorage when cart changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, sizeId) => {
        const newItem = { ...product, sizeId };
        const itemKey = newItem.sizeId;
        const updatedCart = {
            ...cart,
            [itemKey]: (cart[itemKey] || 0) + 1,
        };
        setCart(updatedCart);
        console.log(updatedCart);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart }}>
            {children}
        </CartContext.Provider>
    );
};
