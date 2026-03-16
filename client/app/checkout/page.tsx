"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { Truck, Landmark, CreditCard, ChevronRight, ShoppingBag, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "", address: "", city: "", postalCode: "", paymentMethod: "cod" 
  });

  // STATE ЗА ГРЕШКИ ВЪВ ФОРМАТА
  const [errors, setErrors] = useState({ phone: "", address: "", server: "" });

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

    fetch(`${API_URL}/auth/verify`, { headers: { token: token } })
      .then(res => res.ok ? res.json() : null)
      .then(userData => {
        if (userData) {
          setFormData(prev => ({
            ...prev,
            firstName: userData.first_name || prev.firstName,
            lastName: userData.last_name || prev.lastName,
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
    // Изчистваме грешката, когато потребителят започне да пише отново
    if (errors[e.target.name as keyof typeof errors]) {
        setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // --- ФУНКЦИЯ ЗА ВАЛИДАЦИЯ ---
  const validateForm = () => {
    let isValid = true;
    const newErrors = { phone: "", address: "", server: "" };

    // Валидация на телефон (БГ формат)
    const phoneClean = formData.phone.replace(/[\s\-]/g, ''); // Махаме интервали и тирета
    const phoneRegex = /^(\+359|0)[0-9]{8,9}$/; // Трябва да започва с 0 или +359 и да има 8/9 цифри
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
    
    // Спираме изпращането, ако формата не е валидна
    if (!validateForm()) {
        // Скролираме леко нагоре, за да се видят грешките на телефон
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return; 
    }

    setLoading(true);
    setErrors({ ...errors, server: "" });

    const orderData = { customer: formData, items: cart, total: cartTotal };

    try {
      const token = localStorage.getItem("token");
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
        router.push("/checkout/success");
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-black uppercase mb-8 md:mb-10 tracking-wider border-b border-[#333] pb-4 md:pb-6">
          Финализиране на <span className="text-[#ff6b00]">Поръчката</span>
        </h1>

        {errors.server && (
            <div className="mb-8 bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-4 rounded-xl flex items-center gap-3 text-sm font-bold uppercase tracking-widest animate-fadeIn">
                <AlertCircle size={20} />
                {errors.server}
            </div>
        )}

        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 md:gap-12">
          
          {/* --- ЛЯВО: ФОРМА ЗА ДОСТАВКА --- */}
          <div>
            <h2 className="text-lg md:text-xl font-bold uppercase mb-4 md:mb-6 flex items-center gap-2">
              <span className="bg-[#ff6b00] text-black font-black w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-xs md:text-sm shrink-0">1</span>
              Данни за доставка
            </h2>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5 md:mb-2 ml-1">Име *</label>
                    <input type="text" name="firstName" maxLength={50} required value={formData.firstName} onChange={handleChange} className="w-full bg-[#18181b] border border-[#333] p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none transition-colors text-sm" />
                </div>
                <div>
                    <label className="block text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5 md:mb-2 ml-1">Фамилия *</label>
                    <input type="text" name="lastName" maxLength={50} required value={formData.lastName} onChange={handleChange} className="w-full bg-[#18181b] border border-[#333] p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none transition-colors text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5 md:mb-2 ml-1">Телефон *</label>
                <input 
                    type="tel" 
                    name="phone" 
                    required 
                    placeholder="0888 123 456" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className={`w-full bg-[#18181b] border p-3 rounded-lg text-white outline-none transition-colors font-mono text-sm ${errors.phone ? 'border-red-500 focus:border-red-500 bg-red-500/5' : 'border-[#333] focus:border-[#ff6b00]'}`} 
                />
                {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1 animate-fadeIn tracking-wider">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5 md:mb-2 ml-1">Град *</label>
                <input type="text" name="city" maxLength={50} required value={formData.city} onChange={handleChange} className="w-full bg-[#18181b] border border-[#333] p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none transition-colors text-sm" />
              </div>

              <div>
                <div className="flex justify-between items-end mb-1.5 md:mb-2 ml-1">
                    <label className="block text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Адрес / Офис на Еконт *</label>
                    <span className={`text-[9px] font-mono ${formData.address.length > 130 ? 'text-[#ff6b00]' : 'text-gray-600'}`}>{formData.address.length}/150</span>
                </div>
                <textarea 
                    name="address" 
                    required 
                    rows={3} 
                    maxLength={150}
                    value={formData.address} 
                    onChange={handleChange} 
                    placeholder="Точен адрес за доставка или име на офис..."
                    className={`w-full bg-[#18181b] border p-3 rounded-lg text-white outline-none transition-colors text-sm resize-none ${errors.address ? 'border-red-500 focus:border-red-500 bg-red-500/5' : 'border-[#333] focus:border-[#ff6b00]'}`}
                ></textarea>
                {errors.address && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1 animate-fadeIn tracking-wider">{errors.address}</p>}
              </div>

              {/* === МЕТОД НА ПЛАЩАНЕ === */}
              <div className="pt-6 md:pt-8 border-t border-[#333] mt-6 md:mt-8">
                <h2 className="text-lg md:text-xl font-bold uppercase mb-4 md:mb-6 flex items-center gap-2">
                    <span className="bg-[#ff6b00] text-black font-black w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-xs md:text-sm shrink-0">2</span>
                    Метод на плащане
                </h2>
                
                <div className="space-y-3 md:space-y-4">
                    
                    {/* ОПЦИЯ 1: Наложен Платеж */}
                    <label className={`group relative block border p-4 md:p-5 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-[#ff6b00] bg-[#ff6b00]/5' : 'border-[#333] hover:border-gray-500 bg-[#18181b]'}`}>
                        <div className="flex items-center gap-3 md:gap-4">
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="cod" 
                                checked={formData.paymentMethod === 'cod'} 
                                onChange={handleChange} 
                                className="w-4 h-4 md:w-5 md:h-5 text-[#ff6b00] accent-[#ff6b00]" 
                            />
                            <div className="flex-grow">
                                <p className="font-bold uppercase text-xs md:text-sm tracking-wider flex items-center gap-2">
                                  Наложен платеж
                                </p>
                                <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Плащане в брой при доставка.</p>
                            </div>
                            <Truck 
                              className={`w-6 h-6 md:w-7 md:h-7 transition-colors shrink-0 ${formData.paymentMethod === 'cod' ? 'text-[#ff6b00]' : 'text-gray-500 group-hover:text-gray-300'}`} 
                              strokeWidth={1.5}
                            />
                        </div>
                    </label>

                    {/* ОПЦИЯ 2: Банков Превод */}
                    <label className={`group relative block border p-4 md:p-5 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'bank' ? 'border-[#ff6b00] bg-[#ff6b00]/5' : 'border-[#333] hover:border-gray-500 bg-[#18181b]'}`}>
                        <div className="flex items-center gap-3 md:gap-4">
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="bank" 
                                checked={formData.paymentMethod === 'bank'} 
                                onChange={handleChange} 
                                className="w-4 h-4 md:w-5 md:h-5 text-[#ff6b00] accent-[#ff6b00]" 
                            />
                            <div className="flex-grow">
                                <p className="font-bold uppercase text-xs md:text-sm tracking-wider">Банков превод</p>
                                <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Изпращане след получен превод.</p>
                            </div>
                            <Landmark 
                              className={`w-6 h-6 md:w-7 md:h-7 transition-colors shrink-0 ${formData.paymentMethod === 'bank' ? 'text-[#ff6b00]' : 'text-gray-500 group-hover:text-gray-300'}`} 
                              strokeWidth={1.5}
                            />
                        </div>
                        
                        {formData.paymentMethod === 'bank' && (
                            <div className="mt-3 pt-3 md:mt-4 md:pt-4 border-t border-[#333] text-xs md:text-sm text-gray-300 pl-7 md:pl-9 animate-fadeIn">
                                <p className="mb-1.5 md:mb-2"><span className="text-gray-500 text-[10px] uppercase font-bold block tracking-widest">IBAN:</span> BG11 UNCR 7000 1523 4567 89</p>
                                <p><span className="text-gray-500 text-[10px] uppercase font-bold block tracking-widest">Основание:</span> Номер на поръчката</p>
                            </div>
                        )}
                    </label>

                    {/* ОПЦИЯ 3: Карта */}
                    <label className={`group relative block border p-4 md:p-5 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'card' ? 'border-[#ff6b00] bg-[#ff6b00]/5' : 'border-[#333] hover:border-gray-500 bg-[#18181b]'}`}>
                        <div className="flex items-center gap-3 md:gap-4">
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="card" 
                                checked={formData.paymentMethod === 'card'} 
                                onChange={handleChange} 
                                className="w-4 h-4 md:w-5 md:h-5 text-[#ff6b00] accent-[#ff6b00]" 
                            />
                            <div className="flex-grow">
                                <p className="font-bold uppercase text-xs md:text-sm tracking-wider">Карта</p>
                                <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Сигурно плащане със Stripe.</p>
                            </div>
                            <CreditCard 
                              className={`w-6 h-6 md:w-7 md:h-7 transition-colors shrink-0 ${formData.paymentMethod === 'card' ? 'text-[#ff6b00]' : 'text-gray-500 group-hover:text-gray-300'}`} 
                              strokeWidth={1.5}
                            />
                        </div>
                    </label>

                </div>
              </div>
            </form>
          </div>

          {/* --- ДЯСНО: ОБОБЩЕНИЕ --- */}
          <div className="w-full lg:sticky lg:top-28 self-start mb-8 lg:mb-0">
             <div className="bg-[#18181b] border border-[#333] rounded-2xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-lg md:text-xl font-bold uppercase mb-4 md:mb-6 tracking-wider border-b border-[#333] pb-3 md:pb-4">Вашата Поръчка</h3>
                
                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 max-h-48 md:max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item) => (
                        <div key={item.product_id} className="flex justify-between items-center text-xs md:text-sm">
                            <div className="flex items-center gap-2 md:gap-3 min-w-0 pr-2">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0a0a0a] rounded overflow-hidden flex-shrink-0 border border-[#333] p-1">
                                    <img src={item.image_url} className="w-full h-full object-contain" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-200 uppercase tracking-wide truncate">{item.name}</p>
                                    <p className="text-gray-500 text-[10px] md:text-xs font-mono">x{item.quantity}</p>
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
                            {cartTotal.toFixed(2)} <span className="text-lg md:text-xl">€</span>
                        </span>
                    </div>
                </div>

                <button 
                    type="submit" 
                    form="checkout-form"
                    disabled={loading}
                    className={`w-full bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black py-3 md:py-4 rounded-xl uppercase tracking-widest transition-all shadow-[0_5px_15px_rgba(255,107,0,0.3)] flex items-center justify-center gap-2 transform hover:-translate-y-1 text-xs md:text-sm ${loading ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
                >
                    {loading ? "Обработване..." : "ПОРЪЧАЙ СЕГА"}
                    {!loading && <ChevronRight size={18} className="md:w-5 md:h-5" />}
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}