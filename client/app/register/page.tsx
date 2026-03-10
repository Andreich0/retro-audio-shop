"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ДЕФИНИРАМЕ API URL ТУК ЗА МАКСИМАЛНА СИГУРНОСТ
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // ИЗПОЛЗВАМЕ API_URL КОНСТАНТАТА
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Успешна регистрация! Сега можете да влезете.");
        router.push("/login");
      } else {
        setError(data.message || "Възникна грешка при регистрацията.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Сървърът не отговаря. Моля, проверете връзката си или опитайте по-късно.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f13] px-4 py-10">
      <div className="bg-[#18181b] p-10 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md border border-[#333]">
        <h1 className="text-4xl font-black text-center mb-10 text-white tracking-widest uppercase italic">
          Регистрация
        </h1>
        
        {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-sm text-center animate-pulse">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <label className="block text-gray-400 mb-2 font-bold text-xs uppercase tracking-widest">Име</label>
              <input
                type="text"
                name="first_name"
                required
                onChange={handleChange}
                className="w-full bg-[#0f0f13] text-white border border-[#333] rounded p-4 focus:border-[#ff6b00] focus:outline-none transition-all duration-300 placeholder:text-gray-700"
                placeholder="Иван"
              />
            </div>
            <div className="w-full">
              <label className="block text-gray-400 mb-2 font-bold text-xs uppercase tracking-widest">Фамилия</label>
              <input
                type="text"
                name="last_name"
                required
                onChange={handleChange}
                className="w-full bg-[#0f0f13] text-white border border-[#333] rounded p-4 focus:border-[#ff6b00] focus:outline-none transition-all duration-300 placeholder:text-gray-700"
                placeholder="Петров"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-2 font-bold text-xs uppercase tracking-widest">Имейл</label>
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              className="w-full bg-[#0f0f13] text-white border border-[#333] rounded p-4 focus:border-[#ff6b00] focus:outline-none transition-all duration-300 placeholder:text-gray-700"
              placeholder="example@mail.com"
            />
          </div>

          <div className="relative">
            <label className="block text-gray-400 mb-2 font-bold text-xs uppercase tracking-widest">Парола</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              onChange={handleChange}
              className="w-full bg-[#0f0f13] text-white border border-[#333] rounded p-4 pr-12 focus:border-[#ff6b00] focus:outline-none transition-all duration-300 placeholder:text-gray-700"
              placeholder="••••••••"
            />
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[42px] text-gray-500 hover:text-[#ff6b00] transition"
            >
              {showPassword ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#ff6b00] hover:bg-[#e65c00] text-white font-black py-4 rounded transition-all shadow-lg uppercase tracking-widest transform hover:-translate-y-1 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? "Обработка..." : "Регистрирай се"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#333] pt-6">
          <p className="text-gray-500 text-sm">Вече имаш акаунт?</p>
          <Link href="/login" className="text-white font-bold hover:text-[#ff6b00] mt-2 inline-block transition uppercase text-xs tracking-widest border-b border-transparent hover:border-[#ff6b00] pb-1">
            Влез тук
          </Link>
        </div>
      </div>
    </div>
  );
}