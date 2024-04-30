"use client";

import Link from "next/link";
import React, { useEffect } from "react";

export default function SuccessPage() {
    useEffect(() => {
        // Clear the cart from local storage on page load
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
            <section className="mx-auto grid w-full max-w-xl gap-4 p-4 ">
                <h1 className="text-2xl italic">
                    Tusen takk for at du støtter oss!
                </h1>
                <p className="italic font-light mb-4">
                    Du skal ha fått en kvittering i eposten din.
                </p>
                <div>
                    <p className="font-light">Med vennlig hilsen,</p>
                    <p className="font-light text-xs">
                        Tommy, LP, Iver, Richard og Lars
                    </p>
                </div>

                <p className="font-black italic">CATCH THE FOX</p>
                <Link
                    className="italic font-semibold underline underline-offset-4"
                    href="/shop"
                >
                    Tilbake til shop
                </Link>
            </section>
        </main>
    );
}
