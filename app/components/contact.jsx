import Link from "next/link";

export default function Contact() {
    return (
        <section
            id="kontakt"
            className="flex flex-col gap-8 px-4 pt-16 text-center lg:gap-16 pb-24"
        >
            <div className="flex flex-col">
                <h2 className="text-xl font-black text-clrprimary">KONTAKT</h2>
                <span className="text-2xl italic font-black">
                    CATCH THE FOX ?
                </span>
            </div>
            <div className="flex flex-col items-center gap-4">
                <p className="max-w-lg text-lg font-medium">
                    Har du noen spørsmål eller interesse i å booke oss for
                    eventer? ikke nøl med å ta kontakt på epost!
                </p>
                <span className="text-xl font-bold italic">
                    catchthefox.ff@gmail.com
                </span>
            </div>
            <div className="flex flex-row-reverse w-full gap-1 p-1 text-xs opacity-50">
                <Link href="/handelsvilkar" className="underline">
                    Handelsvilkår
                </Link>
            </div>
        </section>
    );
}
