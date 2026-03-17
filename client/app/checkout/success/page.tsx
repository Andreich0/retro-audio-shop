"use client";

import Link from "next/link";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "../../../context/CartContext"; 
import { CheckCircle, Package, ShoppingBag } from "lucide-react";

// Дефинираме API_URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

function SuccessContent() {
  const { clearCart } = useCart(); 
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Веднага изчистваме количката, щом стигне тук
    clearCart();

    const orderId = searchParams.get("orderId");

    if (orderId) {
      fetch(`${API_URL}/orders/${orderId}/success`, {
        method: "PUT"
      }).catch(err => console.error(err));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Декорация */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-[#18181b] border border-[#333] p-8 md:p-12 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-lg w-full text-center relative z-10 animate-fadeIn">
        
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 blur-xl opacity-40 rounded-full animate-pulse"></div>
            <CheckCircle size={80} className="text-green-500 relative z-10 md:w-[100px] md:h-[100px]" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black uppercase text-white mb-2 tracking-tighter italic">
          Поръчката е <span className="text-green-500">Успешна</span>
        </h1>
        
        <p className="text-gray-400 text-xs md:text-sm mb-8 leading-relaxed uppercase tracking-widest">
          Благодарим ви! Вашата поръчка беше приета и вече се обработва.
        </p>

        <div className="bg-[#0f0f13] border border-[#333] rounded-xl p-4 md:p-6 mb-8 text-left space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#ff6b00]/10 rounded-lg shrink-0">
                <Package className="text-[#ff6b00]" size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Статус на пратката</p>
              <p className="text-sm font-bold text-white">В процес на подготовка</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-[#333]">
            <div className="p-2 bg-[#ff6b00]/10 rounded-lg shrink-0">
                <ShoppingBag className="text-[#ff6b00]" size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Следваща стъпка</p>
              <p className="text-sm font-bold text-white">Ще се свържем с вас за потвърждение</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <Link href="/shop" className="flex-1">
            <button className="w-full bg-[#0a0a0a] border border-[#333] hover:border-[#ff6b00] hover:text-[#ff6b00] text-gray-300 font-black uppercase text-[10px] md:text-xs tracking-widest py-4 rounded-xl transition-all transform hover:-translate-y-1">
              Към каталога
            </button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <button className="w-full bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black uppercase text-[10px] md:text-xs tracking-widest py-4 rounded-xl transition-all shadow-[0_5px_15px_rgba(255,107,0,0.3)] transform hover:-translate-y-1">
              Моите Поръчки
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-green-500 font-bold tracking-widest uppercase">Зареждане...</div>}>
      <SuccessContent />
    </Suspense>
  );
}