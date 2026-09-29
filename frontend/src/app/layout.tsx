import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/LanguageProvider";
import { NavBar } from "@/components/NavBar";
import Footer from "@/components/Footer";
import SkipLink from "@/components/SkipLink";
import FloatingAssistantButton from "@/components/FloatingAssistantButton";
import "./globals.css";
import "@/styles/phase27-accessibility.css";
import "@/styles/setu-redesign.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EKAM — One Gateway. Connected Services.",
  description: "EKAM — An Integrated Citizen Service Orchestration Platform: A unified, consent-aware citizen service experience for Maharashtra government services.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <LanguageProvider>
          <SkipLink />
          <NavBar />
          <main id="main-content" className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
          <FloatingAssistantButton />
        </LanguageProvider>
      </body>
    </html>
  );
}
