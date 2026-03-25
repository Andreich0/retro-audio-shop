"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogIn, UserPlus, ArrowRight } from "lucide-react";

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
      const res = await fetch(`${API_URL}/auth/register`, {
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
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#ff6b00]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-gray-800/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-5xl h-[850px] md:h-[650px] bg-[#111] rounded-2xl shadow-2xl overflow-hidden border border-[#222]">
        
        {/* --- Форма за Вход --- */}
        <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col justify-center px-8 sm:px-16 transition-all duration-[800ms] ease-in-out z-20 bg-[#111] ${isSignUp ? "md:translate-x-full md:opacity-0 md:z-10 hidden md:flex" : "translate-x-0 opacity-100 z-20"}`}>
          <div className="mb-10">
            <Link href="/" className="inline-block text-[#ff6b00] font-black text-xl tracking-tighter uppercase italic hover:opacity-80 transition mb-8 md:hidden">
              Retro <span className="text-white">Audio.</span>
            </Link>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">Добре дошли <br/><span className="text-gray-500 italic">Отново.</span></h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Влезте в профила си за достъп.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="relative group">
              <input type="email" name="email" id="login-email" required value={loginData.email} onChange={handleLoginChange} className="block w-full px-0 py-3 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors font-mono text-sm" placeholder=" " />
              <label htmlFor="login-email" className="absolute text-[10px] uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Имейл Адрес</label>
            </div>

            <div className="relative group pt-4">
              <input type={showPassword ? "text" : "password"} name="password" id="login-password" required value={loginData.password} onChange={handleLoginChange} className="block w-full px-0 py-3 pr-10 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors font-mono text-sm tracking-widest" placeholder=" " />
              <label htmlFor="login-password" className="absolute text-[10px] uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-8 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Парола</label>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-3 text-gray-500 hover:text-[#ff6b00] transition">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-[10px] uppercase font-bold text-gray-500 hover:text-[#ff6b00] tracking-widest transition-colors">Забравена парола?</Link>
            </div>

            <button type="submit" disabled={isSubmitting} className={`w-full mt-8 flex items-center justify-between bg-white hover:bg-[#ff6b00] text-black font-black py-4 px-6 transition-all uppercase tracking-widest group ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <span>{isSubmitting ? "Проверка..." : "Влез в профила"}</span>
              <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Мобилен изглед - превключвател */}
          <div className="mt-8 text-center md:hidden border-t border-[#222] pt-6">
             <p className="text-gray-500 text-xs mb-2">Нямате регистрация?</p>
             <button onClick={() => setIsSignUp(true)} className="text-[#ff6b00] font-bold text-xs uppercase tracking-widest">Създайте профил</button>
          </div>
        </div>

        {/* --- Форма за Регистрация --- */}
        <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col justify-center px-8 sm:px-16 transition-all duration-[800ms] ease-in-out z-10 bg-[#111] ${isSignUp ? "md:translate-x-full opacity-100 z-20" : "opacity-0 -translate-x-full md:translate-x-0 hidden md:flex"}`}>
          <div className="mb-10">
            <Link href="/" className="inline-block text-[#ff6b00] font-black text-xl tracking-tighter uppercase italic hover:opacity-80 transition mb-8 md:hidden">
              Retro <span className="text-white">Audio.</span>
            </Link>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">Създай <br/><span className="text-[#ff6b00] italic">Профил.</span></h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Присъединете се към клуба.</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                  <input type="text" name="first_name" id="first_name" required value={registerData.first_name} onChange={handleRegisterChange} className="block w-full px-0 py-3 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors text-sm font-bold" placeholder=" " />
                  <label htmlFor="first_name" className="absolute text-[10px] uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Име</label>
              </div>
              <div className="relative group">
                  <input type="text" name="last_name" id="last_name" required value={registerData.last_name} onChange={handleRegisterChange} className="block w-full px-0 py-3 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors text-sm font-bold" placeholder=" " />
                  <label htmlFor="last_name" className="absolute text-[10px] uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Фамилия</label>
              </div>
            </div>

            <div className="relative group pt-4">
              <input type="email" name="email" id="reg-email" required value={registerData.email} onChange={handleRegisterChange} className="block w-full px-0 py-3 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors font-mono text-sm" placeholder=" " />
              <label htmlFor="reg-email" className="absolute text-[10px] uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-8 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Имейл Адрес</label>
            </div>

            <div className="relative group pt-4">
              <input type={showPassword ? "text" : "password"} name="password" id="reg-password" required value={registerData.password} onChange={handleRegisterChange} className="block w-full px-0 py-3 pr-10 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors font-mono text-sm tracking-widest" placeholder=" " />
              <label htmlFor="reg-password" className="absolute text-[10px] uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-8 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Парола</label>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-3 text-gray-500 hover:text-[#ff6b00] transition">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" disabled={isSubmitting} className={`w-full mt-8 flex items-center justify-between bg-white hover:bg-[#ff6b00] text-black font-black py-4 px-6 transition-all uppercase tracking-widest group ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <span>{isSubmitting ? "Обработка..." : "Регистрирай се"}</span>
              <UserPlus size={18} className="transform group-hover:scale-110 transition-transform" />
            </button>
          </form>

          {/* Мобилен изглед - превключвател */}
          <div className="mt-8 text-center md:hidden border-t border-[#222] pt-6">
             <p className="text-gray-500 text-xs mb-2">Вече имате профил?</p>
             <button onClick={() => setIsSignUp(false)} className="text-[#ff6b00] font-bold text-xs uppercase tracking-widest">Влезте от тук</button>
          </div>
        </div>

        {/* --- Плъзгащ се Панел (Само Десктоп) --- */}
        <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-[800ms] ease-in-out z-50 ${isSignUp ? "-translate-x-full" : "translate-x-0"}`}>
          <div className={`bg-[#050505] relative w-[200%] h-full left-[-100%] transition-transform duration-[800ms] ease-in-out ${isSignUp ? "translate-x-1/2" : "translate-x-0"}`}>
            
            <img 
              src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200&auto=format&fit=crop" 
              alt="Vintage Audio" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a] opacity-90"></div>

            {/* Панел: Приканване към Вход */}
            <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center p-12 text-center transition-all duration-[800ms] ease-in-out ${isSignUp ? "translate-x-0 opacity-100" : "-translate-x-[20%] opacity-0"}`}>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Един от нас?</h2>
              <p className="text-gray-300 text-xs uppercase font-bold tracking-widest mb-8 leading-relaxed">
                Ако вече сте част от общността, влезте в профила си, за да управлявате своите поръчки.
              </p>
              <button 
                onClick={() => setIsSignUp(false)}
                className="border-2 border-white hover:bg-white hover:text-black text-white font-black px-10 py-3 uppercase tracking-widest text-xs transition-all"
              >
                Вход в системата
              </button>
            </div>

            {/* Панел: Приканване към Регистрация */}
            <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center p-12 text-center transition-all duration-[800ms] ease-in-out ${isSignUp ? "translate-x-[20%] opacity-0" : "translate-x-0 opacity-100"}`}>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Нов тук?</h2>
              <p className="text-gray-300 text-xs uppercase font-bold tracking-widest mb-8 leading-relaxed">
                Създайте профил сега, за да запазвате любими продукти и да проследявате покупките си.
              </p>
              <button 
                onClick={() => setIsSignUp(true)}
                className="border-2 border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00] hover:text-black font-black px-10 py-3 uppercase tracking-widest text-xs transition-all"
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
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#ff6b00] uppercase font-bold text-xs tracking-widest animate-pulse">Зареждане...</div>}>
      <AuthContent />
    </Suspense>
  );
}