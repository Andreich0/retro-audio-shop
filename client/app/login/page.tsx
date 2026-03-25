"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogIn, ArrowRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      const parseRes = await res.json();

      if (res.ok && parseRes.token) {
        login(parseRes.token, parseRes.role || "user");
        toast.success("Успешен вход!");
        setTimeout(() => {
          router.push(parseRes.role === 'admin' || parseRes.role === 'superadmin' ? "/admin/orders" : "/dashboard");
        }, 100);
      } else {
        toast.error(parseRes.message || "Грешен имейл или парола.");
      }
    } catch (err) {
      toast.error("Сървърна грешка. Опитайте по-късно.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex bg-[#050505] font-sans selection:bg-[#ff6b00] selection:text-black">
      
      {/* ЛЯВА ЧАСТ - ФОРМАТА */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-12 md:px-20 py-12 z-10">
        <div className="w-full max-w-md mx-auto">
          
          <div className="mb-12">
            <Link href="/" className="inline-block text-[#ff6b00] font-black text-xl tracking-tighter uppercase italic hover:opacity-80 transition mb-12">
              Retro <span className="text-white">Audio.</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-4">
              Добре дошли <br/> <span className="text-gray-500">Отново.</span>
            </h1>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
              Влезте в профила си, за да продължите.
            </p>
          </div>

          {/* ТАБОВЕ */}
          <div className="flex mb-10 border-b border-[#222]">
            <div className="pb-3 border-b-2 border-[#ff6b00] text-white font-black text-xs uppercase tracking-widest pr-8 cursor-default">
              Вход
            </div>
            <Link href="/register" className="pb-3 text-gray-600 hover:text-white font-bold text-xs uppercase tracking-widest pl-8 transition-colors">
              Регистрация
            </Link>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            
            {/* ИМЕЙЛ */}
            <div className="relative group">
              <input
                type="email"
                name="email"
                id="email"
                required
                value={inputs.email}
                onChange={handleChange}
                className="block w-full px-0 py-4 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors font-mono text-sm"
                placeholder=" "
              />
              <label 
                htmlFor="email" 
                className="absolute text-xs uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-4 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Имейл Адрес
              </label>
            </div>

            {/* ПАРОЛА */}
            <div className="relative group pt-4">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                required
                value={inputs.password}
                onChange={handleChange}
                className="block w-full px-0 py-4 pr-10 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors font-mono text-sm tracking-widest"
                placeholder=" "
              />
              <label 
                htmlFor="password" 
                className="absolute text-xs uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-8 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Парола
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-4 text-gray-500 hover:text-[#ff6b00] transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <Link href="/forgot-password" className="text-[10px] uppercase font-bold text-gray-500 hover:text-[#ff6b00] tracking-widest transition-colors">
                Забравена парола?
              </Link>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-8 flex items-center justify-between bg-white hover:bg-[#ff6b00] text-black font-black py-4 px-6 rounded-none transition-all uppercase tracking-widest group ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{isSubmitting ? "Проверка..." : "Влез в профила"}</span>
              {!isSubmitting && <ArrowRight size={20} className="transform group-hover:translate-x-2 transition-transform" />}
            </button>
          </form>

        </div>
      </div>

      {/* ДЯСНА ЧАСТ - СНИМКА С ЕФЕКТ (Само Десктоп) */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-[#0a0a0a]">
        {/* Абстрактни графики върху снимката */}
        <div className="absolute top-1/4 left-10 w-32 h-32 border border-[#ff6b00]/30 rounded-full z-20 animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-10 w-64 h-64 border border-white/10 rounded-full z-20 pointer-events-none"></div>
        
        <img 
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop" 
          alt="Vintage Audio" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity hover:opacity-60 hover:scale-105 transition-all duration-[10s] ease-out"
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent z-10"></div>
        
        {/* Текст върху снимката */}
        <div className="absolute bottom-20 right-20 z-30 text-right">
            <p className="text-[#ff6b00] font-mono text-xs font-bold tracking-widest uppercase mb-2">Since 1982</p>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">The Sound of <br/> Yesterday.</h2>
        </div>
      </div>

    </div>
  );
}