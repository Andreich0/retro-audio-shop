"use client";

import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-4 text-center">
      
      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-bounce">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
      </div>

      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
        Поръчката е <span className="text-green-500">Успешна!</span>
      </h1>
      
      <p className="text-gray-400 max-w-lg mb-10 text-lg">
        Благодарим ви, че избрахте Retro Audio. Ще се свържем с вас за потвърждение на доставката възможно най-скоро.
      </p>

      <div className="flex gap-4">
        <Link href="/shop">
            <button className="px-8 py-3 border border-[#333] hover:border-[#ff6b00] hover:text-[#ff6b00] rounded font-bold uppercase transition">
                Още пазаруване
            </button>
        </Link>
        <Link href="/dashboard">
            <button className="px-8 py-3 bg-[#ff6b00] hover:bg-[#e65c00] text-white rounded font-bold uppercase transition shadow-lg">
                Моите поръчки
            </button>
        </Link>
      </div>

    </div>
  );
}