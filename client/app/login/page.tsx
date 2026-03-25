"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogIn, UserPlus, ArrowRight, User, Mail, Lock } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // Състояние, което контролира плъзгането (дали сме на Регистрация или Вход)
  const [isSignUp, setIsSignUp] = useState(false);

  // Ако някой влезе през /login?mode=register, директно му отваряме регистрацията
  useEffect(() => {
    if (searchParams.get("mode") === "register") {
      setIsSignUp(true);
    }
  }, [searchParams]);

  // Състояния за формите
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ first_name: "", last_name: "", email: "", password: "" });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  // --- ХЕНДЛЪР ЗА ВХОД ---
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
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
      toast.error("Сървърна грешка. Опитайте по-късно.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ХЕНДЛЪР ЗА РЕГИСТРАЦИЯ ---
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(registerData.password)) {
        toast.error("Паролата трябва да е поне 8 символа (мин. 1 буква и 1 цифра).");
        return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Успешна регистрация! Добре дошли!");
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 md:p-8 font-sans selection:bg-[#ff6b00] selection:text-black overflow-hidden relative">
      
      {/* Декоративни елементи на фона */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#ff6b00]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* ГЛАВЕН КОНТЕЙНЕР ЗА АНИМАЦИЯТА */}
      <div className="relative w-full max-w-5xl h-[800px] md:h-[650px] bg-[#111] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-[#333]">
        
        {/* ================================================================= */}
        {/* ФОРМА ЗА РЕГИСТРАЦИЯ (Отляво, скрита под панела първоначално) */}
        {/* ================================================================= */}
        <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col justify-center px-8 md:px-12 transition-all duration-[800ms] ease-in-out ${isSignUp ? "translate-x-0 opacity-100 z-20" : "-translate-x-full opacity-0 z-0"}`}>
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Създай <span className="text-[#ff6b00]">Профил</span></h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Присъедини се към аудиофилския клуб.</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                  <input type="text" name="first_name" id="first_name" required value={registerData.first_name} onChange={handleRegisterChange} className="block w-full px-0 py-3 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors text-sm" placeholder=" " />
                  <label htmlFor="first_name" className="absolute text-[10px] uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-6 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Име</label>
              </div>
              <div className="relative group">
                  <input type="text" name="last_name" id="last_name" required value={registerData.last_name} onChange={handleRegisterChange} className="block w-full px-0 py-3 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors text-sm" placeholder=" " />
                  <label htmlFor="last_name" className="absolute text-[10px] uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-6 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Фамилия</label>
              </div>
            </div>

            <div className="relative group pt-2">
              <input type="email" name="email" id="reg-email" required value={registerData.email} onChange={handleRegisterChange} className="block w-full px-0 py-3 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors font-mono text-sm" placeholder=" " />
              <label htmlFor="reg-email" className="absolute text-[10px] uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-6 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Имейл Адрес</label>
            </div>

            <div className="relative group pt-2">
              <input type={showPassword ? "text" : "password"} name="password" id="reg-password" required value={registerData.password} onChange={handleRegisterChange} className="block w-full px-0 py-3 pr-8 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors font-mono text-sm" placeholder=" " />
              <label htmlFor="reg-password" className="absolute text-[10px] uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-6 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Парола</label>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-3 text-gray-500 hover:text-[#ff6b00] transition">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full mt-8 flex items-center justify-between bg-white hover:bg-[#ff6b00] text-black font-black py-4 px-6 rounded-none transition-all uppercase tracking-widest group">
              <span>{isSubmitting ? "Проверка..." : "Регистрирай се"}</span>
              <UserPlus size={18} className="transform group-hover:scale-110 transition-transform" />
            </button>
          </form>
          
          {/* Мобилен превключвател */}
          <div className="mt-8 text-center md:hidden">
             <p className="text-gray-500 text-xs mb-2">Вече имаш акаунт?</p>
             <button onClick={() => setIsSignUp(false)} className="text-[#ff6b00] font-bold text-xs uppercase tracking-widest">Влез от тук</button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ФОРМА ЗА ВХОД (Отдясно, активна по подразбиране) */}
        {/* ================================================================= */}
        <div className={`absolute top-0 right-0 w-full md:w-1/2 h-full flex flex-col justify-center px-8 md:px-12 transition-all duration-[800ms] ease-in-out ${isSignUp ? "translate-x-full opacity-0 z-0" : "translate-x-0 opacity-100 z-20"}`}>
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">Добре дошли <br/><span className="text-gray-500 italic">Отново.</span></h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Влезте в профила си, за да продължите.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="relative group">
              <input type="email" name="email" id="login-email" required value={loginData.email} onChange={handleLoginChange} className="block w-full px-0 py-4 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors font-mono text-sm" placeholder=" " />
              <label htmlFor="login-email" className="absolute text-[10px] uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-5 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Имейл Адрес</label>
            </div>

            <div className="relative group pt-4">
              <input type={showPassword ? "text" : "password"} name="password" id="login-password" required value={loginData.password} onChange={handleLoginChange} className="block w-full px-0 py-4 pr-10 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors font-mono text-sm tracking-widest" placeholder=" " />
              <label htmlFor="login-password" className="absolute text-[10px] uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-8 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Парола</label>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-4 text-gray-500 hover:text-[#ff6b00] transition">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-[10px] uppercase font-bold text-gray-500 hover:text-[#ff6b00] tracking-widest transition-colors">Забравена парола?</Link>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full mt-8 flex items-center justify-between bg-[#ff6b00] hover:bg-[#e65c00] text-black font-black py-4 px-6 rounded-none transition-all uppercase tracking-widest group">
              <span>{isSubmitting ? "Проверка..." : "Влез в профила"}</span>
              <LogIn size={20} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Мобилен превключвател */}
          <div className="mt-8 text-center md:hidden">
             <p className="text-gray-500 text-xs mb-2">Нямаш акаунт?</p>
             <button onClick={() => setIsSignUp(true)} className="text-[#ff6b00] font-bold text-xs uppercase tracking-widest">Създай от тук</button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ПЛЪЗГАЩИЯТ СЕ ПАНЕЛ СЪС СНИМКАТА (OVERLAY) */}
        {/* ================================================================= */}
        <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-[800ms] ease-in-out z-50 ${isSignUp ? "-translate-x-full" : "translate-x-0"}`}>
          
          <div className={`bg-[#050505] relative w-[200%] h-full left-[-100%] transition-transform duration-[800ms] ease-in-out ${isSignUp ? "translate-x-1/2" : "translate-x-0"}`}>
            
            {/* Снимка за фон на панела */}
            <img 
              src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200&auto=format&fit=crop" 
              alt="Vintage Audio" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>

            {/* Текст за Вход (когато сме на Регистрация) */}
            <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center p-12 text-center transition-all duration-[800ms] ease-in-out ${isSignUp ? "translate-x-0 opacity-100" : "-translate-x-[20%] opacity-0"}`}>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Един от нас?</h2>
              <p className="text-gray-300 text-xs uppercase font-bold tracking-widest mb-8 leading-relaxed">
                Ако вече си част от нашето аудиофилско семейство, влез в профила си, за да видиш любимите си декове.
              </p>
              <button 
                onClick={() => setIsSignUp(false)}
                className="border-2 border-white hover:bg-white hover:text-black text-white font-black px-10 py-3 uppercase tracking-widest text-xs transition-all"
              >
                Вход
              </button>
            </div>

            {/* Текст за Регистрация (когато сме на Вход) */}
            <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center p-12 text-center transition-all duration-[800ms] ease-in-out ${isSignUp ? "translate-x-[20%] opacity-0" : "translate-x-0 opacity-100"}`}>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Нов тук?</h2>
              <p className="text-gray-300 text-xs uppercase font-bold tracking-widest mb-8 leading-relaxed">
                Създай профил сега, за да запазваш касети, да следиш поръчки и да получаваш специални оферти.
              </p>
              <button 
                onClick={() => setIsSignUp(true)}
                className="border-2 border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00] hover:text-black font-black px-10 py-3 uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(255,107,0,0.2)]"
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