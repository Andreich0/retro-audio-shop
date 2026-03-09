"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, CassetteTape } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0f0f13] border-t-4 border-[#ff6b00] text-gray-400 py-16 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* 1. ЛОГО И ИНФО */}
          <div>
            <Link href="/" className="flex items-center gap-4 group">
                <div className="text-[#ff6b00] transform group-hover:rotate-12 transition duration-500">
                    {/* strokeWidth={1.5} прави иконата тънка и елегантна */}
                    <CassetteTape size={42} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col leading-none">
                    {/* Сменихме font-black на font-bold за по-чист вид */}
                    <span className="text-3xl font-bold italic tracking-tighter text-white group-hover:tracking-widest transition-all duration-300">
                    RETRO
                    </span>
                    {/* Сменихме font-bold на font-medium */}
                    <span className="text-sm font-medium text-[#ff6b00] tracking-[0.4em] uppercase">
                    Audio Shop
                    </span>
                </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Възстановяваме легендите от миналото. Най-добрата винтидж аудио техника, проверена и готова за нов живот.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-[#1a1a1e] hover:bg-[#ff6b00] hover:text-white flex items-center justify-center rounded transition"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 bg-[#1a1a1e] hover:bg-[#ff6b00] hover:text-white flex items-center justify-center rounded transition"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 bg-[#1a1a1e] hover:bg-[#ff6b00] hover:text-white flex items-center justify-center rounded transition"><Twitter size={18} /></a>
            </div>
          </div>

          {/* 2. БЪРЗИ ВРЪЗКИ */}
          <div>
            <h4 className="text-white text-lg font-bold uppercase mb-6 border-l-4 border-[#ff6b00] pl-3">Навигация</h4>
            <ul className="space-y-3 text-sm font-bold uppercase tracking-wide">
              <li><Link href="/" className="hover:text-[#ff6b00] transition block py-1">Начало</Link></li>
              <li><Link href="/shop" className="hover:text-[#ff6b00] transition block py-1">Каталог</Link></li>
              <li><Link href="/cart" className="hover:text-[#ff6b00] transition block py-1">Количка</Link></li>
              <li><Link href="/login" className="hover:text-[#ff6b00] transition block py-1">Вход / Регистрация</Link></li>
            </ul>
          </div>

          {/* 3. КАТЕГОРИИ (ОПРАВЕНИ) */}
          <div>
            <h4 className="text-white text-lg font-bold uppercase mb-6 border-l-4 border-[#ff6b00] pl-3">Категории</h4>
            <ul className="space-y-3 text-sm font-bold uppercase tracking-wide">
              {/* Сложих правилните параметри, които да съвпадат с логиката ти в Shop страницата */}
              <li><Link href="/shop?category=cassette" className="hover:text-[#ff6b00] transition block py-1">Касети</Link></li>
              <li><Link href="/shop?category=deck" className="hover:text-[#ff6b00] transition block py-1">Декове</Link></li>
              <li><Link href="/shop?category=walkman" className="hover:text-[#ff6b00] transition block py-1">Уокмени</Link></li>
              <li><Link href="/shop?category=accessories" className="hover:text-[#ff6b00] transition block py-1">Аксесоари</Link></li>
            </ul>
          </div>

          {/* 4. КОНТАКТИ */}
          <div>
            <h4 className="text-white text-lg font-bold uppercase mb-6 border-l-4 border-[#ff6b00] pl-3">Контакти</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-[#ff6b00] mt-1 shrink-0" />
                <span>гр. София, бул. "Витоша" 15<br/>(Шоурум RetroAudio)</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-[#ff6b00] shrink-0" />
                <span>+359 888 123 456</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-[#ff6b00] shrink-0" />
                <span>sales@retroaudio.bg</span>
              </li>
            </ul>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-xs uppercase tracking-widest text-gray-600">
          <p>© 2026 RETRO AUDIO SHOP. Всички права запазени.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <li><Link href="/terms" className="hover:text-[#ff6b00] transition">Общи условия</Link></li>
            <li><Link href="/privacy" className="hover:text-[#ff6b00] transition">Политика за поверителност</Link></li> 
         </div>
        </div>
      </div>
    </footer>
  );
}