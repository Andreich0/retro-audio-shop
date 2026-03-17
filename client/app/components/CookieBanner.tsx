"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Info, X } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Проверяваме дали вече имаме съгласие
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] p-4 pointer-events-none animate-fadeIn">
      <div className="max-w-4xl mx-auto bg-[#18181b] border border-[#ff6b00]/30 p-4 md:p-6 rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto">
        <div className="flex items-start md:items-center gap-4">
          <div className="bg-[#ff6b00]/10 p-2 rounded-full text-[#ff6b00] shrink-0 mt-1 md:mt-0">
            <Info size={24} />
          </div>
          <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
            Използваме "бисквитки" (cookies), за да персонализираме съдържанието и да анализираме трафика си. 
            Продължавайки да използвате сайта, вие се съгласявате с нашата{" "}
            <Link href="/privacy" className="text-[#ff6b00] hover:underline font-bold">
              Политика за поверителност
            </Link>.
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-3 shrink-0">
          <button 
            onClick={acceptCookies}
            className="flex-1 md:flex-none bg-[#ff6b00] hover:bg-[#e65c00] text-black font-black uppercase text-[10px] md:text-xs tracking-widest px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(255,107,0,0.3)]"
          >
            Разбрах
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-3 bg-[#0a0a0a] text-gray-500 hover:text-white rounded-xl border border-[#333] transition-colors"
            title="Затвори"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}