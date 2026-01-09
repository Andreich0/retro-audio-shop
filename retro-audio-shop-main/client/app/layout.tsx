import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "../context/CartContext"; // <--- Импортираме контекста
import Link from "next/link"; // За навигацията

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Retro Audio Shop",
  description: "Магазин за касети и декове",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider> {/* <--- ОПАКОВАМЕ ВСИЧКО ТУК */}
          
          {/* Добавяме и проста Навигация, за да е удобно */}
          <nav className="bg-gray-800 p-4 border-b border-gray-700 text-white flex justify-between items-center sticky top-0 z-50">
            <Link href="/" className="text-xl font-bold text-orange-500">RetroAudio</Link>
            <div className="flex gap-4">
              <Link href="/shop" className="hover:text-orange-400">Каталог</Link>
              <Link href="/cart" className="hover:text-orange-400 font-bold">🛒 Количка</Link>
              <Link href="/dashboard" className="hover:text-orange-400">Профил</Link>
            </div>
          </nav>

          {children}
        </CartProvider>
      </body>
    </html>
  );
}