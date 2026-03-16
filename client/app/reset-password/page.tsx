"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; text: string }>({ type: "idle", text: "" });

  // ЗАЩИТА: Ако потребителят отвори този линк, автоматично го разлогваме, 
  // за да предотвратим конфликти с други сесии!
  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка 1: Има ли изобщо токен в URL-а?
    if (!token) {
      setStatus({ type: "error", text: "Липсва токен за сигурност. Моля, заявете нов линк." });
      return;
    }

    // Проверка 2: Съвпадат ли паролите?
    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatus({ type: "error", text: "Паролите не съвпадат!" });
      return;
    }

    // Проверка 3: Дължина на паролата
    if (passwords.newPassword.length < 6) {
      setStatus({ type: "error", text: "Паролата трябва да е поне 6 символа." });
      return;
    }

    setStatus({ type: "loading", text: "" });

    try {
      const res = await fetch("https://retro-audio-api-o7it.onrender.com/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: passwords.newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", text: "Паролата е променена успешно!" });
        setPasswords({ newPassword: "", confirmPassword: "" });
      } else {
        setStatus({ type: "error", text: data || "Линкът е невалиден или е изтекъл." });
      }
    } catch (err) {
      setStatus({ type: "error", text: "Възникна грешка при свързването със сървъра." });
    }
  };

  if (!token) {
      return (
          <div className="w-full max-w-md bg-[#18181b] border border-[#333] p-8 rounded-2xl shadow-2xl relative z-10 text-center">
              <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold uppercase mb-2">Невалиден Линк</h2>
              <p className="text-gray-400 text-sm mb-6">Този линк за възстановяване е невалиден или липсва.</p>
              <Link href="/forgot-password">
                  <button className="bg-[#18181b] border border-[#333] hover:border-[#ff6b00] hover:text-[#ff6b00] text-white px-6 py-2 rounded font-bold uppercase tracking-widest text-xs transition-colors">
                      Заяви нов линк
                  </button>
              </Link>
          </div>
      );
  }

  return (
    <div className="w-full max-w-md bg-[#18181b] border border-[#333] p-8 rounded-2xl shadow-2xl relative z-10">
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
            Нова <span className="text-[#ff6b00]">Парола</span>
        </h1>
        <p className="text-gray-400 text-sm mb-8 tracking-wide">
            Моля, въведете и потвърдете новата си парола по-долу.
        </p>

        {status.type === "success" ? (
            <div className="text-center animate-fadeIn">
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-6 rounded-xl flex flex-col items-center gap-4 mb-6">
                    <CheckCircle size={48} />
                    <p className="font-bold uppercase tracking-widest text-sm">{status.text}</p>
                </div>
                <Link href="/login">
                    <button className="w-full bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black uppercase text-sm tracking-widest py-4 rounded-xl transition-all shadow-[0_5px_15px_rgba(255,107,0,0.3)] flex items-center justify-center gap-2 transform hover:-translate-y-1">
                        Към Вход <ArrowRight size={18} />
                    </button>
                </Link>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Нова парола</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#ff6b00] transition-colors" size={18}/>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required 
                            placeholder="Минимум 6 символа..." 
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-[#333] text-white pl-12 pr-12 py-3.5 rounded-xl focus:border-[#ff6b00] outline-none transition-all font-mono text-sm placeholder:font-sans placeholder:text-gray-600"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Потвърди паролата</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#ff6b00] transition-colors" size={18}/>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required 
                            placeholder="Повторете паролата..." 
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-[#333] text-white pl-12 pr-12 py-3.5 rounded-xl focus:border-[#ff6b00] outline-none transition-all font-mono text-sm placeholder:font-sans placeholder:text-gray-600"
                        />
                    </div>
                </div>

                {status.type === "error" && (
                    <div className="text-xs font-bold p-3 rounded-lg text-center uppercase tracking-widest bg-red-900/10 text-red-500 border border-red-900/30 animate-fadeIn">
                        {status.text}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={status.type === "loading"}
                    className={`w-full bg-gradient-to-r from-[#ff6b00] to-[#e65c00] text-black font-black uppercase text-sm tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,107,0,0.2)] ${status.type === "loading" ? 'opacity-50' : 'hover:from-[#e65c00] hover:to-[#cc5200] transform hover:-translate-y-1'}`}
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff6b00]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <Suspense fallback={<div className="text-[#ff6b00] font-bold animate-pulse tracking-widest relative z-10">ЗАРЕЖДАНЕ...</div>}>
            <ResetPasswordContent />
        </Suspense>
    </div>
  );
}