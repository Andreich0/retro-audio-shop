import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

// 1. Импортираме CartProvider (провери пътя, ако даде грешка!)
import { CartProvider } from "../context/CartContext"; 

const rajdhani = Rajdhani({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "Retro Audio Shop",
  description: "Най-доброто винтидж аудио оборудване.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className={`${rajdhani.className} bg-gray-950 text-gray-100 antialiased selection:bg-orange-500 selection:text-white`}>
        
        {/* 2. Обвиваме ВСИЧКО с CartProvider */}
        <CartProvider>
          
          <Navbar />

          <main className="min-h-screen">
            {children}
          </main>
          
        </CartProvider>

      </body>
    </html>
  );
}