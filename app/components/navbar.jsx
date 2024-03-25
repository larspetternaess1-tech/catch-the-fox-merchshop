import Link from "next/link";
import React from "react";
import ShopCart from "./Shoppingcart";

export default function Navbar({}) {
    return (
        <header className=" fixed left-0 right-0 top-0 z-50 bg-clrprimary">
            <nav className="mx-auto flex max-w-7xl justify-between px-4 py-2 text-sm font-black italic lg:text-lg ">
                <div className="flex gap-6">
                    <Link href="/">HOME</Link>
                    <Link href="/#aboutus">ABOUT US</Link>
                    <Link href="/shop">MERCH SHOP</Link>
                </div>
                <div className="flex gap-6">
                    <Link className="flex items-center" href="/#kontakt">
                        <svg
                            width="25"
                            height="24"
                            viewBox="0 0 25 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g clipPath="url(#clip0_475_66)">
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M3.11336 0.766507C3.37582 0.50444 3.69098 0.301144 4.03796 0.170092C4.38493 0.0390392 4.75579 -0.0167773 5.12597 0.00634104C5.49615 0.0294594 5.85719 0.130985 6.18516 0.304189C6.51313 0.477393 6.80055 0.718321 7.02836 1.01101L9.72086 4.47001C10.2144 5.10451 10.3884 5.93101 10.1934 6.71101L9.37286 9.99601C9.33044 10.1662 9.33273 10.3444 9.37952 10.5134C9.4263 10.6824 9.51598 10.8364 9.63986 10.9605L13.3254 14.646C13.4496 14.7701 13.6039 14.86 13.7732 14.9068C13.9425 14.9536 14.121 14.9557 14.2914 14.913L17.5749 14.0925C17.9598 13.9963 18.3615 13.9888 18.7498 14.0706C19.138 14.1525 19.5026 14.3215 19.8159 14.565L23.2749 17.256C24.5184 18.2235 24.6324 20.061 23.5194 21.1725L21.9684 22.7235C20.8584 23.8335 19.1994 24.321 17.6529 23.7765C13.6946 22.3838 10.1008 20.1178 7.13786 17.1465C4.1668 14.184 1.90077 10.5907 0.507863 6.63301C-0.0351373 5.08801 0.452363 3.42751 1.56236 2.31751L3.11336 0.766507Z"
                                    fill="#FAFAFA"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_475_66">
                                    <rect
                                        width="24"
                                        height="24"
                                        fill="white"
                                        transform="translate(0.286133)"
                                    />
                                </clipPath>
                            </defs>
                        </svg>
                    </Link>
                    <button>
                        <ShopCart />
                    </button>
                </div>
            </nav>
        </header>
    );
}
