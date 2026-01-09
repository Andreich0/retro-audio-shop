"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Проверяваме дали има токен при зареждане на страницата
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Функция за изход
  const handleLogout = () => {
    localStorage.removeItem("token"); // Трием токена
    setIsLoggedIn(false);
    router.push("/login"); // Пращаме към логин
    router.refresh(); // Освежаваме страницата
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800 shadow-lg shadow-orange-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. ЛОГО */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-3xl font-bold italic tracking-widest text-white hover:scale-105 transition transform duration-300">
              RETRO<span className="text-orange-500 drop-shadow-[0_0_10px_rgba(255,107,0,0.8)]">AUDIO</span>
            </Link>
          </div>

          {/* 2. ЛИНКОВЕ (Средата) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition px-3 py-2 rounded-md font-medium text-lg">
                НАЧАЛО
              </Link>
              
              <Link href="/shop" className="text-gray-300 hover:text-orange-400 hover:drop-shadow-[0_0_8px_rgba(255,165,0,0.8)] transition px-3 py-2 rounded-md font-medium text-lg">
                КАТАЛОГ
              </Link>

              {/* Показваме тези линкове САМО ако си логнат */}
              {isLoggedIn && (
                <>
                  <Link href="/dashboard" className="text-gray-300 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(0,243,255,0.8)] transition px-3 py-2 rounded-md font-medium text-lg">
                    ПОРЪЧКИ
                  </Link>
                  <Link href="/admin" className="text-red-500 hover:text-red-400 hover:drop-shadow-[0_0_8px_rgba(255,0,0,0.8)] transition px-3 py-2 rounded-md font-medium text-lg">
                    ADMIN
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* 3. ДЯСНА ЧАСТ (Количка и Вход/Изход) */}
          <div className="flex items-center gap-6">
            
            {/* Количка */}
            <Link href="/cart" className="relative group text-2xl">
               <span className="group-hover:text-orange-500 transition">🛒</span>
            </Link>

            {/* Бутон Вход или Изход */}
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="bg-transparent border border-gray-600 text-gray-300 hover:border-orange-500 hover:text-orange-500 px-4 py-2 rounded uppercase font-bold text-sm transition tracking-wider"
              >
                Изход
              </button>
            ) : (
              <Link 
                href="/login" 
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-2 rounded skew-x-[-10deg] transition transform hover:scale-105 shadow-[0_0_15px_rgba(255,107,0,0.4)]"
              >
                <span className="skew-x-[10deg] inline-block tracking-widest">ВХОД</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}