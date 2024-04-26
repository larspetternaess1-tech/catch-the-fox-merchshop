import React from "react";
import ShopGrid from "./components/ShopGrid";
import Contact from "../components/contact";

function page() {
    return (
        <main className="min-h-screen ">
            <div className="flex w-full flex-col items-center gap-8 py-16">
                <div className="flex w-full flex-col items-center mt-16">
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
            <ShopGrid />
        </main>
    );
}

export default page;
