"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, CassetteTape } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const response = await fetch("https://retro-audio-shop.vercel.app/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("idle");
        alert("Възникна грешка при изпращането. Моля, опитайте по-късно.");
      }
    } catch (error) {
      console.error(error);
      setStatus("idle");
      alert("Сървърна грешка. Моля, опитайте по-късно.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 py-16 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Хедър */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-white mb-4">
            Свържете се с <span className="text-[#ff6b00]">Нас</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm uppercase tracking-widest leading-relaxed">
            Имате въпрос относно реставрацията на дек? Търсите конкретна касета? 
            Пишете ни и ние ще ви отговорим в най-кратък срок.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* ЛЯВА ЧАСТ: Инфо за контакти */}
          <div className="space-y-8">
            <div className="bg-[#18181b] p-8 rounded-2xl border border-[#333] shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <CassetteTape size={200} />
              </div>
              
              <h3 className="text-xl font-black uppercase tracking-widest text-white mb-8 border-b border-[#333] pb-4">
                Информация за контакт
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6 group/item">
                  <div className="p-4 bg-[#0a0a0a] rounded-xl border border-[#333] group-hover/item:border-[#ff6b00] group-hover/item:text-[#ff6b00] transition-colors">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Адрес на сервиза</p>
                    <p className="text-white font-bold">гр. Варна, ул. Роза 25</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group/item">
                  <div className="p-4 bg-[#0a0a0a] rounded-xl border border-[#333] group-hover/item:border-[#ff6b00] group-hover/item:text-[#ff6b00] transition-colors">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Телефон</p>
                    <p className="text-white font-bold font-mono">+359 888 123 456</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group/item">
                  <div className="p-4 bg-[#0a0a0a] rounded-xl border border-[#333] group-hover/item:border-[#ff6b00] group-hover/item:text-[#ff6b00] transition-colors">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Имейл адрес</p>
                    <p className="text-white font-bold font-mono">info@retroaudio.bg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ДЯСНА ЧАСТ: Форма */}
          <div className="bg-[#0f0f13] p-8 rounded-2xl border border-[#ff6b00]/30 shadow-[0_0_40px_rgba(255,107,0,0.05)] relative">
            <h3 className="text-xl font-black uppercase tracking-widest text-white mb-8">
              Изпратете запитване
            </h3>

            {status === "success" ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-center animate-fadeIn">
                <CheckCircle size={64} className="text-green-500 mb-4" />
                <h4 className="text-2xl font-bold text-white mb-2 uppercase">Съобщението е изпратено!</h4>
                <p className="text-gray-400 text-sm">Ще се свържем с вас възможно най-скоро.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Вашето Име</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Иван Иванов"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#18181b] border border-[#333] p-4 rounded-xl text-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none transition-all placeholder:text-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Имейл адрес</label>
                    <input 
                      type="email" 
                      required
                      placeholder="ivan@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-[#18181b] border border-[#333] p-4 rounded-xl text-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none transition-all placeholder:text-gray-600 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Съобщение</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Напишете вашето съобщение тук..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-[#18181b] border border-[#333] p-4 rounded-xl text-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none transition-all placeholder:text-gray-600 resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all transform hover:-translate-y-1 shadow-[0_5px_15px_rgba(255,107,0,0.3)] disabled:opacity-50 disabled:transform-none"
                >
                  {status === "loading" ? (
                    <span className="animate-pulse">Изпращане...</span>
                  ) : (
                    <>
                      Изпрати <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}