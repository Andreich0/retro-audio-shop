import type { Metadata } from "next";
import { Jura } from "next/font/google"; 
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; 
import CookieBanner from "./components/CookieBanner";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
// 1. ИМПОРТИРАМЕ TOASTER
import { Toaster } from "react-hot-toast"; 

const jura = Jura({ 
  subsets: ["latin", "cyrillic"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jura",
});

// --- ТУК Е SEO ОПТИМИЗАЦИЯТА ЗА GOOGLE И СОЦИАЛНИТЕ МРЕЖИ ---
export const metadata: Metadata = {
  title: "Retro Audio Shop | Винтидж аудио техника",
  description: "Най-добрата винтидж аудио техника, преминала пълна техническа профилактика. Декове, касети, уокмени и аксесоари за истински аудиофили.",
  keywords: ["ретро аудио", "винтидж техника", "касетен дек", "уокмен", "аудио касети", "retro audio bg", "vintage hifi"],
  openGraph: {
    title: "Retro Audio Shop | Върни се в златната ера на звука",
    description: "Разгледай нашата селекция от реставрирана винтидж аудио техника. Високо качество и гаранция.",
    url: "https://retro-audio-shop.vercel.app", 
    siteName: "Retro Audio Shop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop", 
        width: 1200,
        height: 630,
        alt: "Retro Audio Shop - Винтидж техника",
      },
    ],
    locale: "bg_BG",
    type: "website",
  },
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

        {/* 2. ДОБАВЯМЕ КОМПОНЕНТА ЗА ИЗСКАЧАЩИ СЪОБЩЕНИЯ */}
        <Toaster 
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#18181b', // Тъмен фон като картите ни
              color: '#fff',
              border: '1px solid #333',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            },
            success: {
              iconTheme: { primary: '#ff6b00', secondary: '#000' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}