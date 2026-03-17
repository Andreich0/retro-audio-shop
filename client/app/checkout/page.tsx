"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { Truck, Landmark, CreditCard, ChevronRight, ShoppingBag, AlertCircle, User, MapPin, Check, ShieldCheck, Mail, Lock } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Чекбокс за запазване на данните
  const [saveDetails, setSaveDetails] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", city: "", paymentMethod: "cod" 
  });

  // STATE ЗА ГРЕШКИ ВЪВ ФОРМАТА
  const [errors, setErrors] = useState({ email: "", phone: "", address: "", server: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const canceled = params.get("canceled");
    const orderId = params.get("orderId");

    if (canceled === "true" && orderId) {
      fetch(`${API_URL}/orders/${orderId}/cancel`, { method: "DELETE" })
        .then(() => {
          alert("Плащането беше прекъснато. Поръчката не е завършена.");
          window.history.replaceState(null, '', '/checkout');
        })
        .catch(err => console.error(err));
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoggedIn(true);
    fetch(`${API_URL}/auth/verify`, { headers: { token: token } })
      .then(res => res.ok ? res.json() : null)
      .then(userData => {
        if (userData) {
          setFormData(prev => ({
            ...prev,
            firstName: userData.first_name || prev.firstName,
            lastName: userData.last_name || prev.lastName,
            email: userData.email || prev.email, // Взимаме имейла
            phone: userData.phone || prev.phone,
            city: userData.city || prev.city,
            address: userData.address || prev.address,
          }));
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
        setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // --- ФУНКЦИЯ ЗА ВАЛИДАЦИЯ ---
  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", phone: "", address: "", server: "" };

    // Валидация Имейл
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        newErrors.email = "Моля, въведете валиден имейл адрес.";
        isValid = false;
    }

    // Валидация на телефон (БГ формат)
    const phoneClean = formData.phone.replace(/[\s\-]/g, '');
    const phoneRegex = /^(\+359|0)[0-9]{8,9}$/;
    if (!phoneRegex.test(phoneClean)) {
        newErrors.phone = "Невалиден телефон (напр. 0888123456 или +35988...)";
        isValid = false;
    }

    // Валидация на адрес (дължина)
    if (formData.address.trim().length < 10) {
        newErrors.address = "Адресът е твърде кратък. Моля, въведете точни данни.";
        isValid = false;
    } else if (formData.address.length > 150) {
        newErrors.address = "Адресът е твърде дълъг (макс. 150 символа).";
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return; 
    }

    setLoading(true);
    setErrors({ ...errors, server: "" });
    const token = localStorage.getItem("token");

    // Ако е логнат и е цъкнал "Запази", ъпдейтваме му профила
    if (isLoggedIn && saveDetails && token) {
        try {
            await fetch(`${API_URL}/auth/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", token },
                body: JSON.stringify({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    phone: formData.phone,
                    city: formData.city,
                    address: formData.address
                })
            });
        } catch (err) {
            console.error("Грешка при запазване на профила:", err);
        }
    }

    const orderData = { customer: formData, items: cart, total: cartTotal };

    try {
      const resOrder = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "token": token || "" },
        body: JSON.stringify(orderData),
      });

      if (!resOrder.ok) {
        setErrors({ ...errors, server: "Възникна грешка при създаване на поръчката. Моля, опитайте пак." });
        setLoading(false);
        return;
      }

      const orderResponse = await resOrder.json(); 

      if (formData.paymentMethod === 'card') {
        const resStripe = await fetch(`${API_URL}/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cart, orderId: orderResponse.orderId }),
        });

        const stripeData = await resStripe.json();

        if (stripeData.url) {
          window.location.href = stripeData.url; 
        } else {
          setErrors({ ...errors, server: "Грешка при свързване със Stripe портала." });
          setLoading(false);
        }
      } else {
        clearCart();
        router.push(`/checkout/success?orderId=${orderResponse.orderId}`);
      }

    } catch (err) {
      console.error(err);
      setErrors({ ...errors, server: "Сървърна грешка. Моля, проверете връзката си." });
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-[#ff6b00]/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center px-4 text-center">
            <div className="text-[#ff6b00] mb-6 md:mb-8 animate-bounce">
                <ShoppingBag className="w-12 h-12 md:w-16 md:h-16" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-2xl md:text-4xl font-black uppercase mb-3 md:mb-4 tracking-tighter italic">
                Няма продукти за <span className="text-[#ff6b00]">плащане</span>
            </h2>
            
            <p className="text-gray-400 mb-8 md:mb-10 max-w-md text-xs md:text-sm uppercase tracking-widest leading-relaxed">
                Количката ви е празна. За да финализирате поръчка, първо трябва да добавите ретро техника от нашия каталог.
            </p>
            
            <Link href="/shop" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-white font-black uppercase text-xs md:text-sm tracking-widest py-3 md:py-4 px-8 md:px-10 rounded-xl transition-all shadow-[0_5px_20px_rgba(255,107,0,0.3)] transform hover:-translate-y-1">
                    Разгледай каталога
                </button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-8 md:py-12 px-4 md:px-8 font-sans selection:bg-[#ff6b00] selection:text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-black uppercase mb-8 md:mb-10 tracking-wider border-b border-[#333] pb-4 md:pb-6">
          Финализиране на <span className="text-[#ff6b00]">Поръчката</span>
        </h1>

        {errors.server && (
            <div className="mb-8 bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-4 rounded-xl flex items-center gap-3 text-sm font-bold uppercase tracking-widest animate-fadeIn">
                <AlertCircle size={20} />
                {errors.server}
            </div>
        )}

        <form id="checkout-form" onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* --- ЛЯВО: ФОРМА ЗА ДОСТАВКА И МЕТОД (Пада първо на мобилни) --- */}
          <div className="w-full lg:w-3/5 flex flex-col gap-8 order-1">
            
            <div className="bg-[#18181b] border border-[#333] p-6 md:p-8 rounded-2xl shadow-lg">
                <h2 className="text-lg md:text-xl font-bold uppercase mb-6 flex items-center gap-2">
                <span className="bg-[#ff6b00] text-black font-black w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-xs md:text-sm shrink-0">1</span>
                Данни за доставка
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5 ml-1">Име *</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-3.5 text-gray-600" />
                            <input type="text" name="firstName" maxLength={50} required value={formData.firstName} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-[#333] pl-10 p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none transition-colors text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5 ml-1">Фамилия *</label>
                        <input type="text" name="lastName" maxLength={50} required value={formData.lastName} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-[#333] p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none transition-colors text-sm" />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5 ml-1">Имейл (за потвърждение) *</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-3.5 text-gray-600" />
                        <input 
                            type="email" 
                            name="email" 
                            required 
                            value={formData.email} 
                            onChange={handleChange} 
                            className={`w-full bg-[#0a0a0a] border pl-10 p-3 rounded-lg text-white outline-none transition-colors text-sm ${errors.email ? 'border-red-500 focus:border-red-500 bg-red-500/5' : 'border-[#333] focus:border-[#ff6b00]'}`} 
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.email}</p>}
                </div>

                <div className="mt-4">
                    <label className="block text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5 ml-1">Телефон *</label>
                    <input 
                        type="tel" 
                        name="phone" 
                        required 
                        placeholder="0888 123 456" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        className={`w-full bg-[#0a0a0a] border p-3 rounded-lg text-white outline-none transition-colors font-mono text-sm ${errors.phone ? 'border-red-500 focus:border-red-500 bg-red-500/5' : 'border-[#333] focus:border-[#ff6b00]'}`} 
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.phone}</p>}
                </div>

                <div className="mt-4">
                    <label className="block text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5 ml-1">Град *</label>
                    <input type="text" name="city" maxLength={50} required value={formData.city} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-[#333] p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none transition-colors text-sm" />
                </div>

                <div className="mt-4">
                    <div className="flex justify-between items-end mb-1.5 ml-1">
                        <label className="block text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Адрес / Офис на Еконт *</label>
                        <span className={`text-[9px] font-mono ${formData.address.length > 130 ? 'text-[#ff6b00]' : 'text-gray-600'}`}>{formData.address.length}/150</span>
                    </div>
                    <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3.5 text-gray-600" />
                        <textarea 
                            name="address" 
                            required 
                            rows={3} 
                            maxLength={150}
                            value={formData.address} 
                            onChange={handleChange} 
                            placeholder="ж.к. Младост 1, бл. 109..."
                            className={`w-full bg-[#0a0a0a] pl-10 border p-3 rounded-lg text-white outline-none transition-colors text-sm resize-none ${errors.address ? 'border-red-500 focus:border-red-500 bg-red-500/5' : 'border-[#333] focus:border-[#ff6b00]'}`}
                        ></textarea>
                    </div>
                    {errors.address && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors.address}</p>}
                </div>

                {isLoggedIn && (
                    <label className="flex items-center gap-3 mt-6 cursor-pointer group w-fit">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${saveDetails ? 'bg-[#ff6b00] border-[#ff6b00]' : 'bg-[#0a0a0a] border-[#555] group-hover:border-[#ff6b00]'}`}>
                            {saveDetails && <Check size={14} className="text-black stroke-[3]" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={saveDetails} onChange={(e) => setSaveDetails(e.target.checked)} />
                        <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest font-bold group-hover:text-white transition-colors select-none">
                            Запази данните за следващи поръчки
                        </span>
                    </label>
                )}
            </div>

            <div className="bg-[#18181b] border border-[#333] p-6 md:p-8 rounded-2xl shadow-lg">
                <h2 className="text-lg md:text-xl font-bold uppercase mb-6 flex items-center gap-2">
                    <span className="bg-[#ff6b00] text-black font-black w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-xs md:text-sm shrink-0">2</span>
                    Метод на плащане
                </h2>
                
                <div className="space-y-3 md:space-y-4">
                    <label className={`group relative block border p-4 md:p-5 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-[#ff6b00] bg-[#ff6b00]/5' : 'border-[#333] hover:border-gray-500 bg-[#0a0a0a]'}`}>
                        <div className="flex items-center gap-3 md:gap-4">
                            <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} className="w-4 h-4 md:w-5 md:h-5 text-[#ff6b00] accent-[#ff6b00]" />
                            <div className="flex-grow">
                                <p className="font-bold uppercase text-xs md:text-sm tracking-wider">Наложен платеж</p>
                                <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">Плащане в брой при доставка.</p>
                            </div>
                            <Truck className={`w-6 h-6 md:w-7 md:h-7 transition-colors shrink-0 ${formData.paymentMethod === 'cod' ? 'text-[#ff6b00]' : 'text-gray-500'}`} strokeWidth={1.5} />
                        </div>
                    </label>

                    <label className={`group relative block border p-4 md:p-5 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'bank' ? 'border-[#ff6b00] bg-[#ff6b00]/5' : 'border-[#333] hover:border-gray-500 bg-[#0a0a0a]'}`}>
                        <div className="flex items-center gap-3 md:gap-4">
                            <input type="radio" name="paymentMethod" value="bank" checked={formData.paymentMethod === 'bank'} onChange={handleChange} className="w-4 h-4 md:w-5 md:h-5 text-[#ff6b00] accent-[#ff6b00]" />
                            <div className="flex-grow">
                                <p className="font-bold uppercase text-xs md:text-sm tracking-wider">Банков превод</p>
                                <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">Изпращане след получен превод.</p>
                            </div>
                            <Landmark className={`w-6 h-6 md:w-7 md:h-7 transition-colors shrink-0 ${formData.paymentMethod === 'bank' ? 'text-[#ff6b00]' : 'text-gray-500'}`} strokeWidth={1.5} />
                        </div>
                        {formData.paymentMethod === 'bank' && (
                            <div className="mt-3 pt-3 md:mt-4 md:pt-4 border-t border-[#333] text-xs md:text-sm text-gray-300 pl-7 md:pl-9 animate-fadeIn">
                                <p className="mb-1.5 md:mb-2"><span className="text-gray-500 text-[10px] uppercase font-bold block tracking-widest">IBAN:</span> BG11 UNCR 7000 1523 4567 89</p>
                                <p><span className="text-gray-500 text-[10px] uppercase font-bold block tracking-widest">Основание:</span> Номер на поръчката</p>
                            </div>
                        )}
                    </label>

                    <label className={`group relative block border p-4 md:p-5 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'card' ? 'border-[#ff6b00] bg-[#ff6b00]/5' : 'border-[#333] hover:border-gray-500 bg-[#0a0a0a]'}`}>
                        <div className="flex items-center gap-3 md:gap-4">
                            <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleChange} className="w-4 h-4 md:w-5 md:h-5 text-[#ff6b00] accent-[#ff6b00]" />
                            <div className="flex-grow">
                                <p className="font-bold uppercase text-xs md:text-sm tracking-wider">Карта</p>
                                <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">Сигурно плащане със Stripe.</p>
                            </div>
                            <CreditCard className={`w-6 h-6 md:w-7 md:h-7 transition-colors shrink-0 ${formData.paymentMethod === 'card' ? 'text-[#ff6b00]' : 'text-gray-500'}`} strokeWidth={1.5} />
                        </div>
                    </label>
                </div>
            </div>

          </div>

          {/* --- ДЯСНО: ОБОБЩЕНИЕ И БУТОН ЗА ПОРЪЧКА (Пада най-долу на мобилни) --- */}
          <div className="w-full lg:w-2/5 order-2 lg:sticky lg:top-28 self-start mb-8 lg:mb-0">
             <div className="bg-[#18181b] border border-[#333] rounded-2xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-lg md:text-xl font-bold uppercase mb-4 md:mb-6 tracking-wider border-b border-[#333] pb-3 md:pb-4 flex items-center gap-2">
                    <ShoppingBag className="text-[#ff6b00]" size={20} /> Вашата Поръчка
                </h3>
                
                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 max-h-48 md:max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item) => (
                        <div key={item.product_id} className="flex justify-between items-center text-xs md:text-sm bg-[#0a0a0a] p-2 md:p-3 rounded-lg border border-[#222]">
                            <div className="flex items-center gap-2 md:gap-3 min-w-0 pr-2">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded overflow-hidden flex-shrink-0 p-1 border border-[#333]">
                                    <img src={item.image_url} className="w-full h-full object-contain" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-200 uppercase tracking-wide truncate">{item.name}</p>
                                    <p className="text-gray-500 text-[10px] md:text-xs font-mono mt-0.5">КОЛ: {item.quantity}</p>
                                </div>
                            </div>
                            <span className="font-bold text-[#ff6b00] whitespace-nowrap">{(Number(item.price) * item.quantity).toFixed(2)} €</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-[#333] pt-4 md:pt-6 space-y-2 md:space-y-3 mb-6 md:mb-8">
                    <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">
                        <span>Междинна сума</span>
                        <span>{cartTotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">
                        <span>Доставка</span>
                        <span className="text-[#ff6b00]">Безплатна</span>
                    </div>
                    <div className="flex justify-between items-end pt-4 md:pt-6 border-t border-[#333] mt-3 md:mt-4">
                        <span className="font-black uppercase tracking-wider text-base md:text-lg text-white">ОБЩО</span>
                        <span className="text-2xl md:text-3xl font-black text-[#ff6b00] leading-none">
                            {cartTotal.toFixed(2)} <span className="text-lg md:text-xl text-gray-400">€</span>
                        </span>
                    </div>
                </div>

                <button 
                    type="submit" 
                    form="checkout-form"
                    disabled={loading}
                    className={`w-full bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black py-4 md:py-5 rounded-xl uppercase tracking-widest transition-all shadow-[0_5px_15px_rgba(255,107,0,0.3)] flex items-center justify-center gap-2 transform hover:-translate-y-1 text-xs md:text-sm ${loading ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
                >
                    {loading ? "Обработване..." : (formData.paymentMethod === 'card' ? "Плати със Stripe" : "Завърши поръчката")} 
                    {!loading && <ShieldCheck size={18} />}
                </button>
                <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <Lock size={10} /> 100% Сигурно криптиране
                </p>
             </div>
          </div>

        </form>
      </div>
    </div>
  );
}