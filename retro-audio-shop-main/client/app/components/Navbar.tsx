"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { 
  ShoppingCart, 
  Menu, 
  X, 
  ChevronDown, 
  Package, 
  List, 
  LogOut, 
  CassetteTape, 
  Users 
} from "lucide-react";

export default function Navbar() {
  const { isLoggedIn, role, logout } = useAuth();
  const { cart } = useCart();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const adminRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (adminRef.current && !adminRef.current.contains(event.target as Node)) {
        setIsAdminOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Помощна променлива: Дали потребителят има админ права (Admin или Superadmin)
  const hasAdminAccess = isLoggedIn && (role === 'admin' || role === 'superadmin');

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 border-t-4 border-t-[#ff6b00] shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-24">
          
          {/* --- ЛОГО --- */}
          <div className="flex-shrink-0 group cursor-pointer">
            <Link href="/" className="flex items-center gap-4">
              <div className="text-[#ff6b00] transform group-hover:rotate-12 transition duration-500">
                <CassetteTape size={42} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-3xl md:text-4xl font-black italic tracking-tighter text-white group-hover:tracking-widest transition-all duration-300">
                  RETRO
                </span>
                <span className="text-sm font-mono text-[#ff6b00] tracking-[0.4em] uppercase font-bold">
                  Audio Shop
                </span>
              </div>
            </Link>
          </div>

          {/* --- ЛИНКОВЕ (DESKTOP) --- */}
          <div className="hidden xl:flex items-center space-x-2">
            
            <Link href="/" className="relative px-5 py-3 text-gray-400 hover:text-white transition font-mono text-base uppercase tracking-widest group overflow-hidden font-bold">
                <span className="relative z-10">Начало</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff6b00] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
            
            <Link href="/shop" className="relative px-5 py-3 text-gray-400 hover:text-white transition font-mono text-base uppercase tracking-widest group font-bold">
                <span className="relative z-10">Каталог</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff6b00] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>

            {isLoggedIn && (
                <Link href="/dashboard" className="relative px-5 py-3 text-gray-400 hover:text-white transition font-mono text-base uppercase tracking-widest group font-bold">
                    <span className="relative z-10">Профил</span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </Link>
            )}

            {/* --- АДМИН БУТОН (За Admin И Superadmin) --- */}
            {hasAdminAccess && (
              <div className="relative ml-6" ref={adminRef}>
                <button 
                  onClick={() => setIsAdminOpen(!isAdminOpen)}
                  className="group relative flex items-center gap-2 px-6 py-2 border-2 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 uppercase font-bold text-sm tracking-widest skew-x-[-10deg]"
                >
                  <span className="skew-x-[10deg] flex items-center gap-2">
                    {role === 'superadmin' ? 'SUPER ADMIN' : 'ADMIN'}
                    <ChevronDown size={16} className={`transition-transform duration-300 ${isAdminOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {isAdminOpen && (
                  <div className="absolute right-0 mt-4 w-64 origin-top-right bg-black border-2 border-red-900 shadow-[0_0_25px_rgba(220,38,38,0.3)] z-50 animate-fadeIn">
                    <div className="absolute -top-1.5 right-6 w-3 h-3 bg-red-900 rotate-45"></div>
                    
                    <div className="py-2">
                        <p className="px-5 text-xs text-red-600 font-mono uppercase border-b border-red-900/30 pb-2 mb-2 mx-2 font-bold">System Control</p>
                        
                        <Link 
                          href="/admin/products" 
                          onClick={() => setIsAdminOpen(false)}
                          className="flex items-center gap-4 px-5 py-4 text-base text-gray-300 hover:text-white hover:bg-red-900/20 transition font-mono uppercase font-bold"
                        >
                          <Package size={18} /> Продукти
                        </Link>
                        
                        <Link 
                          href="/admin/orders" 
                          onClick={() => setIsAdminOpen(false)}
                          className="flex items-center gap-4 px-5 py-4 text-base text-gray-300 hover:text-white hover:bg-red-900/20 transition font-mono uppercase font-bold"
                        >
                          <List size={18} /> Поръчки
                        </Link>

                        <Link 
                          href="/admin/users" 
                          onClick={() => setIsAdminOpen(false)}
                          className="flex items-center gap-4 px-5 py-4 text-base text-gray-300 hover:text-white hover:bg-red-900/20 transition font-mono uppercase font-bold border-t border-red-900/20 mt-2 pt-4"
                        >
                          <Users size={18} /> Потребители
                        </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- ДЯСНА ЧАСТ --- */}
          <div className="flex items-center gap-8">
            
            {/* Количка */}
            <Link href="/cart" className="relative group">
               <div className="p-3 border border-transparent group-hover:border-[#ff6b00]/30 rounded transition duration-300">
                 <ShoppingCart className="w-7 h-7 text-gray-300 group-hover:text-[#ff6b00] transition" />
               </div>
               {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff6b00] text-black text-xs font-black flex items-center justify-center rounded-sm shadow-glow">
                  {totalItems}
                </span>
               )}
            </Link>

            {/* Логин / Изход */}
            <div className="hidden md:block pl-8 border-l border-white/10">
                {isLoggedIn ? (
                    <button 
                        onClick={logout}
                        className="text-sm font-mono text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-2 transition font-bold"
                    >
                        [ ИЗХОД ]
                    </button>
                ) : (
                    <Link 
                        href="/login" 
                        className="relative inline-block px-8 py-3 bg-[#ff6b00] hover:bg-[#e55a00] text-black font-black uppercase text-sm tracking-widest skew-x-[-12deg] transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6)]"
                    >
                        <span className="inline-block skew-x-[12deg]">ВХОД</span>
                    </Link>
                )}
            </div>

            {/* Мобилен бутон */}
            <div className="xl:hidden flex items-center">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#ff6b00] hover:text-white transition">
                {isMobileMenuOpen ? <X size={36} /> : <Menu size={36} />}
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- МОБИЛНО МЕНЮ --- */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#0f0f13] border-b-4 border-[#ff6b00]">
          <div className="px-6 py-8 space-y-4 font-mono">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-4 text-xl text-white hover:bg-[#ff6b00]/10 border-l-4 border-transparent hover:border-[#ff6b00] transition font-bold">НАЧАЛО</Link>
            <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-4 text-xl text-white hover:bg-[#ff6b00]/10 border-l-4 border-transparent hover:border-[#ff6b00] transition font-bold">КАТАЛОГ</Link>
            
            {isLoggedIn && (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-4 text-xl text-cyan-400 hover:bg-cyan-900/10 border-l-4 border-transparent hover:border-cyan-400 transition font-bold">МОЯТ ПРОФИЛ</Link>
            )}

            {/* Проверка и тук за hasAdminAccess */}
            {hasAdminAccess && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                    <p className="px-4 text-sm text-red-500 uppercase mb-3 font-bold">
                        {role === 'superadmin' ? 'Super Admin Access' : 'Admin Access'}
                    </p>
                    <Link href="/admin/products" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-lg text-gray-400 hover:text-red-400">Products</Link>
                    <Link href="/admin/orders" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-lg text-gray-400 hover:text-red-400">Orders</Link>
                    <Link href="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-lg text-gray-400 hover:text-red-400">Users</Link>
                </div>
            )}

            <div className="pt-8 mt-6 border-t border-gray-800">
                {isLoggedIn ? (
                    <button onClick={logout} className="w-full text-left px-4 text-red-500 font-black text-xl">ИЗХОД</button>
                ) : (
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center py-4 bg-[#ff6b00] text-black font-black text-lg uppercase skew-x-[-12deg] mx-2">
                        <span className="skew-x-[12deg]">ВХОД В СИСТЕМАТА</span>
                    </Link>
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}