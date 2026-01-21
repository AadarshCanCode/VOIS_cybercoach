import type { Metadata } from "next";
import { AuthProvider } from "@context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
    title: "Cybercoach - Learn Cybersecurity by Doing",
    description: "AI-powered cybersecurity education platform with hands-on labs, proctored assessments, and career tools.",
    themeColor: "#00FF88",
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
        <html lang="en" className="dark">
            <body className="antialiased bg-black text-white">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
