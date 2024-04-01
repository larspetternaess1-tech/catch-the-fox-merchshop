"use client";
import { useEffect } from "react";

export default function SuccessPage() {
    useEffect(() => {
        // Clear the cart from localStorage
        localStorage.removeItem("cart");
    }, []);

    return <h1>Payment Successful!</h1>;
}
