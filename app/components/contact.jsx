export default function Contact() {
    return (
        <section
            id="kontakt"
            className="flex flex-col gap-8 px-4 pb-48 pt-16 text-center lg:gap-16 lg:pb-32"
        >
            <div className="flex flex-col">
                <h2 className="text-5xl font-black text-clrprimary lg:text-6xl">
                    KONTAKT
                </h2>
                <span className="text-2xl font-black lg:text-3xl">
                    CATCH THE FOX
                </span>
            </div>
            <div className="flex flex-col items-center gap-4">
                <p className="max-w-lg text-xl font-medium">
                    Har du noen spørsmål eller interesse i å booke oss for
                    eventer? ikke nøl med å ta kontakt på epost!
                </p>
                <span className="text-xl font-black">
                    catchthefox.ff@gmail.com
                </span>
            </div>
        </section>
    );
}
