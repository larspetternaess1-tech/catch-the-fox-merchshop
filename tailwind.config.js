/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        colors: {
            clrprimary: "#D96538",
            clrtertiary: "#F6C594",
            clrprimarydark: "#471C0B",
            clrdark: "#121212",
            clrwhite: "#FAFAFA",
        },
        fontFamily: {
            sans: ["montserrat", "sans-serif"],
        },
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "hero-image": "url('/DSCF8121.JPG')",
                "hero-image-big": "url('/allonstage.png')",
            },
        },
    },
    plugins: [],
};
