import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BusinessProvider } from "@/context/BusinessContext";

export const metadata: Metadata = {
  title: "Chand Mobile Expert | Smartphone Repair, Accessories & Pre-Owned Phones in Sambhal",
  description:
    "Professional smartphone repairs including screen replacement, battery replacement, charging port repair and motherboard micro-soldering in Sambhal, Uttar Pradesh. Fast service, quality parts and 1-Year warranty.",
  keywords: [
    "Chand Mobile Expert",
    "mobile repair Sambhal",
    "smartphone repair Sarai Tarin",
    "iPhone screen replacement Sambhal",
    "Samsung battery repair",
    "OnePlus phone repair",
    "mobile buy and sell Sambhal",
    "used smartphones",
    "mobile accessories Sambhal",
  ],
  openGraph: {
    title: "Chand Mobile Expert | Smartphone Repair, Accessories & Buy/Sell",
    description:
      "Expert smartphone repair lab with express turnarounds, 1-Year Store Warranty, certified pre-owned devices & premium accessories in Sambhal, UP.",
    type: "website",
    locale: "en_IN",
    siteName: "Chand Mobile Expert",
  },
};

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { GlobalLoader } from "@/components/GlobalLoader";
import NextTopLoader from "nextjs-toploader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-accent selection:text-black"
      >
        <NextTopLoader
          color="#a8d946"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #a8d946,0 0 5px #a8d946"
        />
        <ThemeProvider defaultTheme="system">
          <BusinessProvider>
            <div className="flex flex-col flex-1 w-full relative bg-background">
              <Header />
              <main className="flex flex-col flex-1 w-full">
                {children}
              </main>
              <Footer />
              <ThemeSwitch />
              <FloatingWhatsApp />
              <GlobalLoader />
            </div>
          </BusinessProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
