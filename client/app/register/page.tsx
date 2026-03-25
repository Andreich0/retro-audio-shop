"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "", password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
        toast.error("Паролата трябва да е поне 8 символа (мин. 1 буква и 1 цифра).");
        return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
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
    <div className="min-h-screen flex bg-[#050505] font-sans selection:bg-[#ff6b00] selection:text-black">
      
      {/* ДЯСНА ЧАСТ - СНИМКА (Само Десктоп, преместена вляво за този екран за симетрия) */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-[#0a0a0a]">
        <div className="absolute top-1/3 right-20 w-48 h-48 border border-[#ff6b00]/20 rounded-full z-20 pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-10 w-24 h-24 border border-white/10 rounded-full z-20 animate-pulse pointer-events-none"></div>
        
        <img 
          src="https://images.unsplash.com/photo-1619983081563-430f53602796?q=80&w=1200&auto=format&fit=crop" 
          alt="Tape Deck" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30 mix-blend-luminosity hover:opacity-50 hover:scale-105 transition-all duration-[10s] ease-out"
        />
        
        <div className="absolute inset-0 bg-gradient-to-l from-[#050505] via-transparent to-transparent z-10"></div>
        
        <div className="absolute top-20 left-20 z-30">
            <p className="text-[#ff6b00] font-mono text-xs font-bold tracking-widest uppercase mb-2">Join the Club</p>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Analog.<br/> Pure & Simple.</h2>
        </div>
      </div>

      {/* ФОРМАТА (Отдясно на Десктоп) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-12 md:px-20 py-12 z-10 relative">
        
        <div className="w-full max-w-md mx-auto">
          
          <div className="mb-10">
            <Link href="/" className="inline-block text-[#ff6b00] font-black text-xl tracking-tighter uppercase italic hover:opacity-80 transition mb-8 lg:hidden">
              Retro <span className="text-white">Audio.</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-4">
              Създай <br/> <span className="text-gray-500">Профил.</span>
            </h1>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
              Започни своето ретро аудио пътуване.
            </p>
          </div>

          {/* ТАБОВЕ */}
          <div className="flex mb-8 border-b border-[#222]">
            <Link href="/login" className="pb-3 text-gray-600 hover:text-white font-bold text-xs uppercase tracking-widest pr-8 transition-colors">
              Вход
            </Link>
            <div className="pb-3 border-b-2 border-[#ff6b00] text-white font-black text-xs uppercase tracking-widest pl-8 cursor-default">
              Регистрация
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
                {/* ИМЕ */}
                <div className="relative group pt-4">
                    <input
                        type="text" name="first_name" id="first_name" required value={formData.first_name} onChange={handleChange}
                        className="block w-full px-0 py-3 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors font-bold text-sm" placeholder=" "
                    />
                    <label htmlFor="first_name" className="absolute text-xs uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-7 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                        Име
                    </label>
                </div>

                {/* ФАМИЛИЯ */}
                <div className="relative group pt-4">
                    <input
                        type="text" name="last_name" id="last_name" required value={formData.last_name} onChange={handleChange}
                        className="block w-full px-0 py-3 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors font-bold text-sm" placeholder=" "
                    />
                    <label htmlFor="last_name" className="absolute text-xs uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-7 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                        Фамилия
                    </label>
                </div>
            </div>

            {/* ИМЕЙЛ */}
            <div className="relative group pt-4">
              <input
                type="email" name="email" id="reg-email" required value={formData.email} onChange={handleChange}
                className="block w-full px-0 py-3 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors font-mono text-sm" placeholder=" "
              />
              <label htmlFor="reg-email" className="absolute text-xs uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-7 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Имейл Адрес
              </label>
            </div>

            {/* ПАРОЛА */}
            <div className="relative group pt-4">
              <input
                type={showPassword ? "text" : "password"} name="password" id="reg-password" required value={formData.password} onChange={handleChange}
                className="block w-full px-0 py-3 pr-10 text-white bg-transparent border-0 border-b-2 border-[#333] appearance-none focus:outline-none focus:ring-0 focus:border-[#ff6b00] peer transition-colors font-mono text-sm tracking-widest" placeholder=" "
              />
              <label htmlFor="reg-password" className="absolute text-xs uppercase tracking-widest font-bold text-gray-500 duration-300 transform -translate-y-6 scale-75 top-7 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#ff6b00] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Парола
              </label>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-3 text-gray-500 hover:text-[#ff6b00] transition">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-10 flex items-center justify-between bg-white hover:bg-[#ff6b00] text-black font-black py-4 px-6 rounded-none transition-all uppercase tracking-widest group ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{isSubmitting ? "Обработка..." : "Създай Профил"}</span>
              {!isSubmitting && <ArrowRight size={20} className="transform group-hover:translate-x-2 transition-transform" />}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}