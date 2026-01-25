import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { AuthProvider } from "@context/AuthContext";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

const sourceSerif = Source_Serif_4({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-serif",
    weight: ["400", "600", "700"],
});

export const viewport = {
    themeColor: "#00FF88",
};

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    title: "Cybercoach - Learn Cybersecurity by Doing",
    description: "AI-powered cybersecurity education platform with hands-on labs, proctored assessments, and career tools.",
    keywords: ["cybersecurity", "education", "training", "labs", "assessment", "career", "AI tutor"],
    authors: [{ name: "Cybercoach Team" }],
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/cybercoach-logo.png", sizes: "192x192", type: "image/png" },
        ],
        apple: "/cybercoach-logo.png",
    },
    openGraph: {
        title: "Cybercoach - Learn Cybersecurity by Doing",
        description: "AI-powered cybersecurity education with hands-on labs, proctored assessments, and career tools.",
        images: ["/cybercoach-logo.png"],
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`dark ${inter.variable} ${sourceSerif.variable}`}>
            <body className={`${inter.className} antialiased bg-black text-white`}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
