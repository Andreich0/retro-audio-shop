"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogIn, UserPlus, ArrowRight, Mail, Lock, User } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ first_name: "", last_name: "", email: "", password: "" });

  useEffect(() => {
    if (searchParams.get("mode") === "register") {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/auth/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        login(data.token, data.role || "user");
        toast.success("Успешен вход!");
        setTimeout(() => router.push(data.role === 'admin' || data.role === 'superadmin' ? "/admin/orders" : "/dashboard"), 100);
      } else {
        toast.error(data.message || "Грешен имейл или парола.");
      }
    } catch (err) {
      toast.error("Сървърна грешка. Моля, опитайте по-късно.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(registerData.password)) {
        toast.error("Паролата трябва да е поне 8 символа (мин. 1 буква и 1 цифра).");
        return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/auth/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Успешна регистрация! Добре дошли.");
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        router.push("/dashboard");
      } else {
        toast.error(data.message || "Грешка при регистрацията.");
      }
    } catch (err) {
      toast.error("Сървърът не отговаря. Моля, опитайте по-късно.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 md:p-8 font-sans selection:bg-[#ff6b00] selection:text-black overflow-hidden relative">
      
      {/* Декоративни светещи петна на фона */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#ff6b00]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-gray-800/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-5xl h-[850px] md:h-[650px] bg-[#0a0a0a] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden border border-[#222]">
        
        {/* ================================================================= */}
        {/* --- ФОРМА ЗА ВХОД (Лява страна) --- */}
        {/* ================================================================= */}
        <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col justify-center px-8 sm:px-14 transition-all duration-[800ms] ease-in-out z-20 bg-[#0a0a0a] ${isSignUp ? "md:translate-x-full md:opacity-0 md:z-10 hidden md:flex" : "translate-x-0 opacity-100 z-20"}`}>
          <div className="mb-10">
            <Link href="/" className="inline-block text-[#ff6b00] font-black text-xl tracking-tighter uppercase italic hover:opacity-80 transition mb-8 md:hidden">
              Retro <span className="text-white">Audio.</span>
            </Link>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">Добре дошли <br/><span className="text-gray-500 italic">Отново.</span></h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Влезте в профила си за достъп.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Имейл адрес</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-4 text-gray-600" />
                <input 
                  type="email" name="email" required value={loginData.email} onChange={handleLoginChange} 
                  className="w-full bg-[#111] border border-[#222] rounded-xl py-4 pl-12 pr-4 text-white focus:border-[#ff6b00] focus:bg-[#18181b] outline-none transition-all font-mono text-sm shadow-inner" 
                  placeholder="your@email.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Парола</label>
                <Link href="/forgot-password" className="text-[9px] uppercase font-bold text-gray-500 hover:text-[#ff6b00] tracking-widest transition-colors mb-0.5">Забравена?</Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-4 text-gray-600" />
                <input 
                  type={showPassword ? "text" : "password"} name="password" required value={loginData.password} onChange={handleLoginChange} 
                  className="w-full bg-[#111] border border-[#222] rounded-xl py-4 pl-12 pr-12 text-white focus:border-[#ff6b00] focus:bg-[#18181b] outline-none transition-all font-mono text-sm tracking-widest shadow-inner" 
                  placeholder="••••••••" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-500 hover:text-[#ff6b00] transition">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className={`w-full mt-8 flex items-center justify-between bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black py-4 px-6 rounded-xl transition-all uppercase tracking-widest shadow-[0_5px_20px_rgba(255,107,0,0.2)] transform hover:-translate-y-1 group ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <span>{isSubmitting ? "Проверка..." : "Влез в профила"}</span>
              <LogIn size={20} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center md:hidden border-t border-[#222] pt-6">
             <p className="text-gray-500 text-xs mb-2">Нямате регистрация?</p>
             <button onClick={() => setIsSignUp(true)} className="text-[#ff6b00] font-bold text-xs uppercase tracking-widest">Създайте профил</button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* --- ФОРМА ЗА РЕГИСТРАЦИЯ (Лява страна, скрита първоначално) --- */}
        {/* ================================================================= */}
        <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col justify-center px-8 sm:px-14 transition-all duration-[800ms] ease-in-out z-10 bg-[#0a0a0a] ${isSignUp ? "md:translate-x-full opacity-100 z-20" : "opacity-0 -translate-x-full md:translate-x-0 hidden md:flex"}`}>
          <div className="mb-8">
            <Link href="/" className="inline-block text-[#ff6b00] font-black text-xl tracking-tighter uppercase italic hover:opacity-80 transition mb-8 md:hidden">
              Retro <span className="text-white">Audio.</span>
            </Link>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">Създай <br/><span className="text-[#ff6b00] italic">Профил.</span></h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Присъединете се към клуба.</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Име</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-3.5 text-gray-600" />
                    <input type="text" name="first_name" required value={registerData.first_name} onChange={handleRegisterChange} className="w-full bg-[#111] border border-[#222] rounded-xl py-3 pl-11 pr-4 text-white focus:border-[#ff6b00] focus:bg-[#18181b] outline-none transition-all text-sm shadow-inner" placeholder="Иван" />
                  </div>
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Фамилия</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-3.5 text-gray-600" />
                    <input type="text" name="last_name" required value={registerData.last_name} onChange={handleRegisterChange} className="w-full bg-[#111] border border-[#222] rounded-xl py-3 pl-11 pr-4 text-white focus:border-[#ff6b00] focus:bg-[#18181b] outline-none transition-all text-sm shadow-inner" placeholder="Петров" />
                  </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Имейл Адрес</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-gray-600" />
                <input type="email" name="email" required value={registerData.email} onChange={handleRegisterChange} className="w-full bg-[#111] border border-[#222] rounded-xl py-3 pl-11 pr-4 text-white focus:border-[#ff6b00] focus:bg-[#18181b] outline-none transition-all font-mono text-sm shadow-inner" placeholder="your@email.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Парола</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-gray-600" />
                <input type={showPassword ? "text" : "password"} name="password" required value={registerData.password} onChange={handleRegisterChange} className="w-full bg-[#111] border border-[#222] rounded-xl py-3 pl-11 pr-10 text-white focus:border-[#ff6b00] focus:bg-[#18181b] outline-none transition-all font-mono text-sm tracking-widest shadow-inner" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-500 hover:text-[#ff6b00] transition">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[9px] text-gray-600 ml-1 font-bold pt-1">Мин. 8 символа, 1 буква и 1 цифра.</p>
            </div>

            <button type="submit" disabled={isSubmitting} className={`w-full mt-6 flex items-center justify-between bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black py-4 px-6 rounded-xl transition-all uppercase tracking-widest shadow-[0_5px_20px_rgba(255,107,0,0.2)] transform hover:-translate-y-1 group ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <span>{isSubmitting ? "Обработка..." : "Регистрирай се"}</span>
              <UserPlus size={20} className="transform group-hover:scale-110 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center md:hidden border-t border-[#222] pt-6">
             <p className="text-gray-500 text-xs mb-2">Вече имате профил?</p>
             <button onClick={() => setIsSignUp(false)} className="text-[#ff6b00] font-bold text-xs uppercase tracking-widest">Влезте от тук</button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* --- ПЛЪЗГАЩ СЕ ПАНЕЛ (OVERLAY - Само Десктоп) --- */}
        {/* ================================================================= */}
        <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-[800ms] ease-in-out z-50 ${isSignUp ? "-translate-x-full" : "translate-x-0"}`}>
          <div className={`bg-[#050505] relative w-[200%] h-full left-[-100%] transition-transform duration-[800ms] ease-in-out ${isSignUp ? "translate-x-1/2" : "translate-x-0"}`}>
            
            {/* ФОН СЪС СНИМКАТА И ЗАМЪГЛЯВАНЕ */}
            <img 
              src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200&auto=format&fit=crop" 
              alt="Vintage Audio" 
              className="absolute inset-0 w-full h-full object-cover opacity-50 hover:opacity-70 hover:scale-105 transition-all duration-[10s] ease-out"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

            {/* Панел: Приканване към Вход */}
            <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center p-12 text-center transition-all duration-[800ms] ease-in-out ${isSignUp ? "translate-x-0 opacity-100" : "-translate-x-[20%] opacity-0"}`}>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4 drop-shadow-lg">Един от <span className="text-[#ff6b00]">нас?</span></h2>
              <p className="text-gray-300 text-xs uppercase font-bold tracking-widest mb-10 leading-relaxed max-w-sm drop-shadow-md">
                Ако вече сте част от общността, влезте в профила си, за да управлявате своите поръчки.
              </p>
              <button 
                onClick={() => setIsSignUp(false)}
                className="border-2 border-[#ff6b00] bg-black/40 backdrop-blur-md hover:bg-[#ff6b00] text-[#ff6b00] hover:text-black font-black px-10 py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(255,107,0,0.3)]"
              >
                Вход в системата
              </button>
            </div>

            {/* Панел: Приканване към Регистрация */}
            <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center p-12 text-center transition-all duration-[800ms] ease-in-out ${isSignUp ? "translate-x-[20%] opacity-0" : "translate-x-0 opacity-100"}`}>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4 drop-shadow-lg">Нов <span className="text-[#ff6b00]">тук?</span></h2>
              <p className="text-gray-300 text-xs uppercase font-bold tracking-widest mb-10 leading-relaxed max-w-sm drop-shadow-md">
                Създайте профил сега, за да запазвате любими продукти и да проследявате покупките си.
              </p>
              <button 
                onClick={() => setIsSignUp(true)}
                className="border-2 border-[#ff6b00] bg-black/40 backdrop-blur-md hover:bg-[#ff6b00] text-[#ff6b00] hover:text-black font-black px-10 py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(255,107,0,0.3)]"
              >
                Регистрация
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#ff6b00] uppercase tracking-widest text-xs font-bold animate-pulse">
        Зареждане...
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}