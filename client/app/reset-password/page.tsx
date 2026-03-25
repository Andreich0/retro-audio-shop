"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; text: string }>({ type: "idle", text: "" });

  // ЗАЩИТА: Изтриваме стара сесия, ако има такава
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setStatus({ type: "error", text: "Липсва токен за сигурност. Моля, заявете нов линк." });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatus({ type: "error", text: "Паролите не съвпадат!" });
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(passwords.newPassword)) {
        setStatus({ type: "error", text: "Паролата трябва да е поне 8 символа (мин. 1 буква и 1 цифра)." });
        return;
    }

    setStatus({ type: "loading", text: "" });

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: passwords.newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", text: "Паролата е променена успешно!" });
        setPasswords({ newPassword: "", confirmPassword: "" });
      } else {
        setStatus({ type: "error", text: data.message || data || "Линкът е невалиден или е изтекъл." });
      }
    } catch (err) {
      setStatus({ type: "error", text: "Възникна грешка при свързването със сървъра." });
    }
  };

  if (!token) {
      return (
          <div className="w-full max-w-md bg-[#0a0a0a] border border-[#222] p-8 md:p-12 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-10 text-center">
              <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl font-black uppercase mb-4 tracking-tight">Невалиден Линк</h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">Този линк за възстановяване на парола е невалиден, използван или е изтекъл.</p>
              <Link href="/forgot-password">
                  <button className="w-full bg-[#111] border border-[#333] hover:border-[#ff6b00] hover:text-[#ff6b00] text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors">
                      Заяви нов линк
                  </button>
              </Link>
          </div>
      );
  }

  return (
    <div className="w-full max-w-md bg-[#0a0a0a] border border-[#222] p-8 md:p-12 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-10">
        
        <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
                Нова <span className="text-[#ff6b00]">Парола</span>
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                Създайте нова сигурна парола.
            </p>
        </div>

        {status.type === "success" ? (
            <div className="text-center animate-fadeIn">
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-8 rounded-xl flex flex-col items-center gap-4 mb-8">
                    <CheckCircle size={48} />
                    <p className="font-bold uppercase tracking-widest text-sm leading-relaxed">{status.text}</p>
                </div>
                <Link href="/auth">
                    <button className="w-full bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black uppercase text-xs tracking-widest py-4 rounded-xl transition-all shadow-[0_5px_20px_rgba(255,107,0,0.2)] flex items-center justify-center gap-2 transform hover:-translate-y-1">
                        Към Вход <ArrowRight size={18} />
                    </button>
                </Link>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Нова парола</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-4 text-gray-600" size={18}/>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required 
                            placeholder="••••••••" 
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                            className="w-full bg-[#111] border border-[#222] text-white pl-12 pr-12 py-4 rounded-xl focus:border-[#ff6b00] focus:bg-[#18181b] outline-none transition-all font-mono text-sm tracking-widest shadow-inner placeholder:font-sans placeholder:text-gray-700"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-4 text-gray-500 hover:text-[#ff6b00] transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Потвърди паролата</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-4 text-gray-600" size={18}/>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required 
                            placeholder="••••••••" 
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                            className="w-full bg-[#111] border border-[#222] text-white pl-12 pr-12 py-4 rounded-xl focus:border-[#ff6b00] focus:bg-[#18181b] outline-none transition-all font-mono text-sm tracking-widest shadow-inner placeholder:font-sans placeholder:text-gray-700"
                        />
                    </div>
                    <p className="text-[9px] text-gray-600 ml-1 font-bold pt-1">Мин. 8 символа, 1 буква и 1 цифра.</p>
                </div>

                {status.type === "error" && (
                    <div className="text-[10px] sm:text-xs font-bold p-4 rounded-xl text-center uppercase tracking-widest bg-red-900/10 text-red-500 border border-red-900/30 animate-fadeIn">
                        {status.text}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={status.type === "loading"}
                    className={`w-full mt-8 bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black uppercase text-xs tracking-widest py-4 rounded-xl transition-all shadow-[0_5px_20px_rgba(255,107,0,0.2)] ${status.type === "loading" ? 'opacity-50 cursor-not-allowed' : 'transform hover:-translate-y-1'}`}
                >
                    {status.type === "loading" ? "Запазване..." : "Запази паролата"}
                </button>
            </form>
        )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 font-sans relative overflow-hidden">
        {/* Декоративни светещи петна на фона */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff6b00]/10 rounded-full blur-[150px] pointer-events-none"></div>
        
        <Suspense fallback={
            <div className="text-[#ff6b00] font-bold animate-pulse tracking-widest uppercase text-xs relative z-10">
                Зареждане...
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    </div>
  );
}