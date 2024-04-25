"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function SuccessPage() {
    const [searchParams] = useSearchParams();
    const session_id = searchParams.get("session_id");
    const [session, setSession] = useState(null);

    useEffect(() => {
        async function fetchSession() {
            const stripe = await stripePromise;
            if (session_id) {
                const { error, session } = await fetch(
                    `/api/retrieve-session?session_id=${session_id}`
                ).then((res) => res.json());
                if (error) {
                    console.error("Failed to retrieve session:", error);
                } else {
                    setSession(session);
                }
            }
        }
        fetchSession();
    }, [session_id]);

    return (
        <main className="min-h-screen">
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

            <section className="mx-auto grid w-full max-w-fit gap-4 p-4">
                <h1 className="text-2xl italic">Takk for at du støtter oss!</h1>
                {session ? (
                    <>
                        <p className="italic font-light">
                            Payment for {session.amount_total / 100}{" "}
                            {session.currency.toUpperCase()} was successful.
                        </p>
                        <p>Med vennlig hilsen,</p>
                        <p>Tommy, LP, Iver og Richie</p>
                    </>
                ) : (
                    <p>Loading payment details...</p>
                )}
            </section>
        </main>
    );
}
