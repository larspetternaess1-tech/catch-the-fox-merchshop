"use client";
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
        try {
            const response = await fetch("/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sizeStockId }),
            });

            const data = await response.json();

            if (response.ok) {
                setCart((prevCart) => {
                    const currentQuantityInCart = prevCart[sizeStockId] || 0;
                    if (currentQuantityInCart < data.amount) {
                        const updatedCart = {
                            ...prevCart,
                            [sizeStockId]: currentQuantityInCart + 1,
                        };
                        return updatedCart;
                    } else {
                        alert("No more of this product in stock");
                        return prevCart;
                    }
                });
            } else {
                alert(
                    "An error occurred while attempting to add the product to the cart."
                );
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
            if (newQuantity <= 0) {
                const updatedCart = { ...prevCart };
                delete updatedCart[sizeStockId];
                return updatedCart;
            } else {
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
