"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
    const [searchParams] = useSearchParams();
    const [session, setSession] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            const sessionId = searchParams.get("session_id");
            if (!sessionId) return;

            try {
                const response = await fetch(
                    `/api/get-stripe-session?sessionId=${sessionId}`
                );
                const data = await response.json();
                if (response.ok) {
                    setSession(data.session);
                } else {
                    throw new Error(
                        data.error || "Unable to fetch session details"
                    );
                }
            } catch (error) {
                console.error("Failed to fetch session:", error.message);
            }
        };

        fetchSession();
    }, [searchParams]);

    if (!session) {
        return <p>Loading session details...</p>;
    }
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
                <p className="italic font-light flex flex-col">
                    Ordrenummer: {session.id}
                </p>
                <p>Med vennlig hilsen,</p>
                <p>Tommy Jee, Lars Petter Næss, </p>
            </section>
        </main>
    );
}
