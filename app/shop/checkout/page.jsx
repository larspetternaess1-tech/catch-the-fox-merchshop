import CartComponent from "../components/CartComponent";
const Page = () => {
    return (
        <main>
            <div className="flex w-full flex-col items-center gap-2 py-16">
                <h1 className="text-5xl font-black text-clrprimary">
                    YOUR CART
                </h1>
                <span className="text-2xl font-black">CATCH THE FOX</span>
            </div>
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 bg-clrprimary px-8 py-4">
                <div className="flex w-full flex-col gap-2">
                    <CartComponent />
                </div>
            </div>
        </main>
    );
};
export default Page;
