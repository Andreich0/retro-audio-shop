"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://retro-audio-shop.vercel.app/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data);
    } catch (err) {
      setMessage("Възникна грешка при свързването.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff6b00]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#18181b] border border-[#333] p-8 rounded-2xl shadow-2xl relative z-10">
            <Link href="/login" className="text-gray-500 hover:text-[#ff6b00] transition flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-8">
                <ArrowLeft size={16} /> Назад към Вход
            </Link>

            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Забравена <span className="text-[#ff6b00]">Парола</span></h1>
            <p className="text-gray-400 text-sm mb-8 tracking-wide">Въведете вашия имейл и ние ще ви изпратим линк за възстановяване на паролата.</p>

            {message ? (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-6 rounded-xl flex flex-col items-center text-center gap-4 animate-fadeIn">
                    <CheckCircle size={48} />
                    <p className="font-bold uppercase tracking-widest text-sm">{message}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#ff6b00] transition-colors" size={20}/>
                        <input 
                            type="email" 
                            required 
                            placeholder="Вашият имейл..." 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#333] text-white pl-12 pr-4 py-4 rounded-xl focus:border-[#ff6b00] outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black uppercase text-sm tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,107,0,0.2)] ${loading ? 'opacity-50' : 'transform hover:-translate-y-1'}`}
                    >
                        {loading ? "Изпращане..." : "Изпрати линк"}
                    </button>
                </form>
            )}
        </div>
    </div>
  );
}