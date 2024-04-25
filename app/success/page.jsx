"use client";
import { useEffect } from "react";

export default function SuccessPage() {
    useEffect(() => {
        // Clear the cart from localStorage
        localStorage.removeItem("cart");
        console.log("Cart cleared");
        localStorage.removeItem("cart");
    }, []);
    return (
        <main className="min-h-screen ">
            <div className="flex w-full flex-col items-center gap-8 py-16">
                <div className="flex w-full flex-col items-center">
                    <h1 className="text-5xl font-black text-clrprimary">
                        MERCH SHOP
                    </h1>
                    <span className="text-2xl font-black">CATCH THE FOX</span>
                </div>
                <p className="font-light italic">
                    et lite utvalg av Fette Fete klær{" "}
                    <span className="text-xs">- LP</span>
                </p>
            </div>
            <section className="mx-auto grid w-full max-w-fit gap-4 p-4 ">
                <h1 className="text-2xl italic">Takk for at du støtter oss!</h1>
                <p className="italic font-light">
                    Du skal ha fått en kvittering i eposten din.
                </p>
                <p>Med vennlig hilsen,</p>
                <p>Tommy Jee, Lars Petter Næss, </p>
            </section>
        </main>
    );
}
