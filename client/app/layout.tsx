import type { Metadata } from "next";
import { Jura } from "next/font/google"; 
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; 
import CookieBanner from "./components/CookieBanner";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

const jura = Jura({ 
  subsets: ["latin", "cyrillic"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jura",
});

export const metadata: Metadata = {
  title: "Retro Audio Shop",
  description: "High-end vintage audio equipment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className={`${jura.className} bg-[#0a0a0a] text-gray-200 antialiased selection:bg-[#ff6b00] selection:text-black`}>
        <AuthProvider>
          <CartProvider>
            
            <Navbar />
            
            <main className="min-h-screen">
              {children}
            </main>
            
            <Footer /> 

          </CartProvider>
        </AuthProvider>
        
        <CookieBanner />
      </body>
    </html>
  );
}