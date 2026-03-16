"use client";

import Link from "next/link";
import { useEffect, Suspense } from "react";
import { useCart } from "../../../context/CartContext"; 

function SuccessContent() {
  const { clearCart } = useCart(); 
  
  useEffect(() => {
    // Веднага изчистваме количката, щом стигне тук
    clearCart();

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");

    if (orderId) {
      fetch(`https://retro-audio-api-o7it.onrender.com/orders/${orderId}/success`, {
        method: "PUT"
      }).catch(err => console.error(err));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-4 text-center">
      
      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-bounce">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
        </svg>
      </div>

      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
        Поръчката е <span className="text-green-500">Успешна!</span>
      </h1>
      
      <p className="text-gray-400 max-w-lg mb-10 text-lg">
        Благодарим ви, че избрахте Retro Audio. Ще се свържем с вас за потвърждение на доставката възможно най-скоро.
      </p>

      {/* ОПРАВЕНИ БУТОНИ С БОЛДНАТО БЯЛО */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/shop">
            <button className="bg-[#0a0a0a] border border-[#333] hover:border-[#ff6b00] hover:text-[#ff6b00] text-gray-300 font-black uppercase text-xs tracking-widest px-8 py-4 rounded-xl transition-all transform hover:-translate-y-1">
                Към Каталога
            </button>
        </Link>
        <Link href="/dashboard">
            <button className="bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-white font-black uppercase text-xs tracking-widest px-8 py-4 rounded-xl transition-all shadow-[0_5px_15px_rgba(255,107,0,0.3)] transform hover:-translate-y-1">
                Моите Поръчки
            </button>
        </Link>
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