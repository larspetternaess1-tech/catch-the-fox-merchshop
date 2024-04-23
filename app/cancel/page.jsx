import Link from "next/link";
import ShopCart from "../components/Shoppingcart";

export default function CancelPage() {
    return (
        <section className="mx-auto min-h-screen grid w-full max-w-7xl gap-8 p-4 place-items-center">
            <div className="flex flex-col items-center gap-2">
                <h1 className="text-3xl font-black italic">Ordre kansellert</h1>
                <p className="italic">Hva gjør vi da?</p>
            </div>

            <div className="flex flex-col items-center gap-8">
                <Link
                    className="w-fit flex  bg-clrprimary px-12 py-4 font-extrabold text-xl rounded-full hover:bg-opacity-70 "
                    href="shop/checkout"
                >
                    <span>Back to Cart</span>
                    <span>
                        <ShopCart />
                    </span>
                </Link>
                <Link
                    className="w-fit bg-clrprimary px-12 py-4 font-extrabold text-xl rounded-full hover:bg-opacity-70 "
                    href="/shop"
                >
                    Merch Shop
                </Link>
            </div>
            <p className="italic text-xs max-w-72 text-center opacity-60">
                Gjerne send oss en epost om noe uventet skjedde under handelen .
                . .
            </p>
        </section>
    );
}
