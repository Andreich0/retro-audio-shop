"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ДОБАВЕНО ЗА ПРЕНАСОЧВАНЕТО
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
  Users,
  Heart,
  User
} from "lucide-react";

export default function Navbar() {
  const router = useRouter(); // ИНИЦИАЛИЗИРАМЕ РУТЕРА
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

  // НОВА ФУНКЦИЯ ЗА ИЗХОД + ПРЕНАСОЧВАНЕ КЪМ /auth
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    router.push("/auth");
  };

  const hasAdminAccess = isLoggedIn && (role === 'admin' || role === 'superadmin');
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 border-t-4 border-t-[#ff6b00] shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-12">
        <div className="flex items-center justify-between h-20 md:h-24">
          
          {/* --- ЛОГО --- */}
          <div className="flex-shrink-0 group cursor-pointer z-50">
            <Link href="/" className="flex items-center gap-2 md:gap-4">
              <div className="text-[#ff6b00] transform group-hover:rotate-12 transition duration-500">
                <CassetteTape className="w-8 h-8 md:w-[42px] md:h-[42px]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-2xl md:text-3xl lg:text-4xl font-black italic tracking-tighter text-white group-hover:tracking-widest transition-all duration-300">
                  RETRO
                </span>
                <span className="text-[10px] md:text-sm font-mono text-[#ff6b00] tracking-[0.2em] md:tracking-[0.4em] uppercase font-bold">
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

            <Link href="/contact" className="relative px-5 py-3 text-gray-400 hover:text-white transition font-mono text-base uppercase tracking-widest group font-bold">
                <span className="relative z-10">Контакти</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff6b00] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>

            {isLoggedIn && (
                <Link href="/dashboard" className="relative px-5 py-3 text-gray-400 hover:text-white transition font-mono text-base uppercase tracking-widest group font-bold">
                    <span className="relative z-10">Профил</span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </Link>
            )}

            {/* --- АДМИН БУТОН --- */}
            {hasAdminAccess && (
              <div className="relative ml-6" ref={adminRef}>
                <button 
                  onClick={() => setIsAdminOpen(!isAdminOpen)}
                  className="group relative flex items-center gap-2 px-5 py-2 border border-red-500/50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 uppercase font-bold text-xs tracking-widest"
                >
                  <span className="flex items-center gap-2">
                    {role === 'superadmin' ? 'SUPER ADMIN' : 'ADMIN'}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isAdminOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {isAdminOpen && (
                  <div className="absolute right-0 mt-4 w-64 origin-top-right bg-black border border-red-900 shadow-[0_0_25px_rgba(220,38,38,0.3)] z-50 animate-fadeIn rounded-xl overflow-hidden">
                    <div className="py-2">
                        <p className="px-5 text-xs text-red-600 font-mono uppercase border-b border-red-900/30 pb-2 mb-2 mx-2 font-bold">System Control</p>
                        
                        <Link href="/admin/products" onClick={() => setIsAdminOpen(false)} className="flex items-center gap-4 px-5 py-4 text-sm text-gray-300 hover:text-white hover:bg-red-900/20 transition font-mono uppercase font-bold">
                          <Package size={16} /> Продукти
                        </Link>
                        
                        <Link href="/admin/orders" onClick={() => setIsAdminOpen(false)} className="flex items-center gap-4 px-5 py-4 text-sm text-gray-300 hover:text-white hover:bg-red-900/20 transition font-mono uppercase font-bold">
                          <List size={16} /> Поръчки
                        </Link>

                        <Link href="/admin/users" onClick={() => setIsAdminOpen(false)} className="flex items-center gap-4 px-5 py-4 text-sm text-gray-300 hover:text-white hover:bg-red-900/20 transition font-mono uppercase font-bold border-t border-red-900/20 mt-2 pt-4">
                          <Users size={16} /> Потребители
                        </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- ДЯСНА ЧАСТ --- */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 z-50">

            {/* БУТОН ЛЮБИМИ */}
            <Link href="/wishlist" className="relative p-2 text-gray-400 hover:text-red-500 transition-all duration-300 group" title="Любими продукти">
                <Heart className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.6)] transition-all" />
            </Link>
            
            {/* КОЛИЧКА (ОПРАВЕНА ПОЗИЦИЯ НА КРЪГЧЕТО) */}
            <Link href="/cart" className="relative group mr-2">
               <div className="p-2 border border-transparent group-hover:border-[#ff6b00]/30 rounded-full transition duration-300">
                 <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-[#ff6b00] transition" />
               </div>
               {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-[#ff6b00] text-black text-[10px] md:text-xs font-black flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(255,107,0,0.5)] z-10">
                  {totalItems}
                </span>
               )}
            </Link>

            {/* --- БУТОНИ ЗА ВХОД / ИЗХОД --- */}
            <div className="hidden md:flex pl-6 border-l border-[#333] items-center gap-4">
                {isLoggedIn ? (
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300"
                    >
                        <LogOut size={16} /> Изход
                    </button>
                ) : (
                    <Link 
                        href="/auth" 
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#ff6b00]/10 text-[#ff6b00] hover:bg-[#ff6b00] hover:text-black border border-[#ff6b00]/30 hover:border-[#ff6b00] rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(255,107,0,0.1)] hover:shadow-[0_0_20px_rgba(255,107,0,0.4)]"
                    >
                        <User size={16} /> Вход
                    </Link>
                )}
            </div>

            {/* Мобилен бутон */}
            <div className="xl:hidden flex items-center">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#ff6b00] hover:text-white transition p-2 bg-[#18181b] rounded-lg border border-[#333]">
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- МОБИЛНО МЕНЮ --- */}
      {isMobileMenuOpen && (
        <div className="xl:hidden absolute top-full left-0 w-full bg-[#0a0a0a] border-b-4 border-[#ff6b00] shadow-[0_20px_40px_rgba(0,0,0,0.9)] max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="px-6 py-6 space-y-2 font-mono">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-lg md:text-xl text-white hover:bg-[#18181b] rounded-lg transition font-bold">НАЧАЛО</Link>
            <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-lg md:text-xl text-white hover:bg-[#18181b] rounded-lg transition font-bold">КАТАЛОГ</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-lg md:text-xl text-white hover:bg-[#18181b] rounded-lg transition font-bold">КОНТАКТИ</Link>
            
            {isLoggedIn && (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-lg md:text-xl text-cyan-400 hover:bg-[#18181b] rounded-lg transition font-bold">МОЯТ ПРОФИЛ</Link>
            )}

            {hasAdminAccess && (
                <div className="mt-4 pt-4 border-t border-[#333]">
                    <p className="px-4 text-xs text-red-500 uppercase mb-2 font-bold tracking-widest">
                        {role === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </p>
                    <Link href="/admin/products" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base text-gray-400 hover:bg-[#18181b] hover:text-white rounded-lg transition">Продукти</Link>
                    <Link href="/admin/orders" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base text-gray-400 hover:bg-[#18181b] hover:text-white rounded-lg transition">Поръчки</Link>
                    <Link href="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base text-gray-400 hover:bg-[#18181b] hover:text-white rounded-lg transition">Потребители</Link>
                </div>
            )}

            <div className="pt-6 mt-4 border-t border-[#333] pb-4">
                {isLoggedIn ? (
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl font-bold uppercase tracking-widest">
                      <LogOut size={18} /> ИЗХОД
                    </button>
                ) : (
                    <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 py-4 bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/30 hover:bg-[#ff6b00] hover:text-black rounded-xl font-bold uppercase tracking-widest transition-all">
                        <User size={18} /> ВХОД В СИСТЕМАТА
                    </Link>
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}