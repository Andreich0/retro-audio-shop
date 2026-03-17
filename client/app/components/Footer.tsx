"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, CassetteTape } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0f0f13] border-t-4 border-[#ff6b00] text-gray-400 py-12 md:py-16 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* На телефон колоните стават 1, на таблет 2, на лаптоп 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12">
          
          {/* 1. ЛОГО И ИНФО */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <Link href="/" className="flex items-center gap-3 md:gap-4 group mb-4">
                <div className="text-[#ff6b00] transform group-hover:rotate-12 transition duration-500">
                    <CassetteTape size={36} className="md:w-[42px] md:h-[42px]" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-2xl md:text-3xl font-bold italic tracking-tighter text-white group-hover:tracking-widest transition-all duration-300">
                    RETRO
                    </span>
                    <span className="text-xs md:text-sm font-medium text-[#ff6b00] tracking-[0.4em] uppercase">
                    Audio Shop
                    </span>
                </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Възстановяваме легендите от миналото. Най-добрата винтидж аудио техника, проверена и готова за нов живот.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-[#1a1a1e] hover:bg-[#ff6b00] hover:text-white flex items-center justify-center rounded transition"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 bg-[#1a1a1e] hover:bg-[#ff6b00] hover:text-white flex items-center justify-center rounded transition"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 bg-[#1a1a1e] hover:bg-[#ff6b00] hover:text-white flex items-center justify-center rounded transition"><Twitter size={18} /></a>
            </div>
          </div>

          {/* 2. БЪРЗИ ВРЪЗКИ (Добавени Контакти) */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left mt-4 sm:mt-0">
            <h4 className="text-white text-lg font-bold uppercase mb-4 md:mb-6 sm:border-l-4 border-[#ff6b00] sm:pl-3">Навигация</h4>
            <ul className="space-y-3 text-sm font-bold uppercase tracking-wide">
              <li><Link href="/" className="hover:text-[#ff6b00] transition block py-1">Начало</Link></li>
              <li><Link href="/shop" className="hover:text-[#ff6b00] transition block py-1">Каталог</Link></li>
              <li><Link href="/contact" className="hover:text-[#ff6b00] transition block py-1">Контакти</Link></li>
              <li><Link href="/cart" className="hover:text-[#ff6b00] transition block py-1">Количка</Link></li>
              <li><Link href="/login" className="hover:text-[#ff6b00] transition block py-1">Вход / Регистрация</Link></li>
            </ul>
          </div>

          {/* 3. КАТЕГОРИИ */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left mt-4 sm:mt-0">
            <h4 className="text-white text-lg font-bold uppercase mb-4 md:mb-6 sm:border-l-4 border-[#ff6b00] sm:pl-3">Категории</h4>
            <ul className="space-y-3 text-sm font-bold uppercase tracking-wide">
              <li><Link href="/shop?category=cassette" className="hover:text-[#ff6b00] transition block py-1">Касети</Link></li>
              <li><Link href="/shop?category=deck" className="hover:text-[#ff6b00] transition block py-1">Декове</Link></li>
              <li><Link href="/shop?category=walkman" className="hover:text-[#ff6b00] transition block py-1">Уокмени</Link></li>
              <li><Link href="/shop?category=accessories" className="hover:text-[#ff6b00] transition block py-1">Аксесоари</Link></li>
            </ul>
          </div>

          {/* 4. КОНТАКТИ */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left mt-4 sm:mt-0">
            <h4 className="text-white text-lg font-bold uppercase mb-4 md:mb-6 sm:border-l-4 border-[#ff6b00] sm:pl-3">Контакти</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
                <MapPin size={20} className="text-[#ff6b00] sm:mt-1 shrink-0" />
                <span>гр. Варна, ул. "Роза" 25<br className="hidden sm:block"/>(Шоурум RetroAudio)</span>
              </li>
              <li className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <Phone size={20} className="text-[#ff6b00] shrink-0" />
                <span>+359 899 857 944</span>
              </li>
              <li className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <Mail size={20} className="text-[#ff6b00] shrink-0" />
                <span>retroaudio.sales@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-800 pt-6 md:pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs uppercase tracking-widest text-gray-600 gap-4 md:gap-0 text-center md:text-left">
          <p>© 2026 RETRO AUDIO SHOP. Всички права запазени.</p>
          <ul className="flex flex-wrap justify-center gap-4 md:gap-6">
            <li><Link href="/terms" className="hover:text-[#ff6b00] transition">Общи условия</Link></li>
            <li><Link href="/privacy" className="hover:text-[#ff6b00] transition">Политика за поверителност</Link></li> 
          </ul>
        </div>
      </div>
    </footer>
  );
}