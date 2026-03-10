"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { Truck, Landmark, CreditCard, ChevronRight, ShoppingBag } from "lucide-react";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "", address: "", city: "", postalCode: "", paymentMethod: "cod" 
  });

  // --- АВТОМАТИЧНО ПОПЪЛВАНЕ НА ДАННИ & УЛАВЯНЕ НА ОТКАЗ ОТ STRIPE ---
  useEffect(() => {
    // 1. Улавяме ако потребителят се е отказал в Stripe
    const params = new URLSearchParams(window.location.search);
    const canceled = params.get("canceled");
    const orderId = params.get("orderId");

    if (canceled === "true" && orderId) {
      fetch(`http://retro-audio-api-o7it.onrender.com/orders/${orderId}/cancel`, { method: "DELETE" })
        .then(() => {
          alert("Плащането беше прекъснато. Поръчката не е завършена.");
          // Изчистваме URL адреса, за да не се показва ?canceled=true
          window.history.replaceState(null, '', '/checkout');
        })
        .catch(err => console.error(err));
    }

    // 2. Попълваме профила, ако е логнат
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://retro-audio-api-o7it.onrender.com/auth/verify", { headers: { token: token } })
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderData = { customer: formData, items: cart, total: cartTotal };

    try {
      const token = localStorage.getItem("token");
      const resOrder = await fetch("http://retro-audio-api-o7it.onrender.com/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "token": token || "" },
        body: JSON.stringify(orderData),
      });

      if (!resOrder.ok) {
        alert("Възникна грешка при създаване на поръчката.");
        setLoading(false);
        return;
      }

      const orderResponse = await resOrder.json(); 

      if (formData.paymentMethod === 'card') {
        // За Stripe: НЕ изчистваме количката още! Само пренасочваме.
        const resStripe = await fetch("http://retro-audio-api-o7it.onrender.com/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cart, orderId: orderResponse.orderId }),
        });

        const stripeData = await resStripe.json();

        if (stripeData.url) {
          window.location.href = stripeData.url; 
        } else {
          alert("Грешка при свързване с портала за плащане.");
          setLoading(false);
        }
      } else {
        // За Наложен платеж: Изчистваме количката и отиваме на успех
        clearCart();
        router.push("/checkout/success");
      }

    } catch (err) {
      console.error(err);
      alert("Сървърна грешка.");
      setLoading(false);
    }
  };

if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-4 font-sans relative overflow-hidden">
        {/* Декоративен фон */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff6b00]/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center">
            {/* Иконата БЕЗ фон, само с цвят */}
            <div className="text-[#ff6b00] mb-8 animate-bounce">
                <ShoppingBag size={64} strokeWidth={1.5} />
            </div>
            
            {/* Големият текст */}
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-4 tracking-tighter text-center italic">
                Няма продукти за <span className="text-[#ff6b00]">плащане</span>
            </h2>
            
            <p className="text-gray-400 mb-10 text-center max-w-md text-sm uppercase tracking-widest leading-relaxed">
                Количката ви е празна. За да финализирате поръчка, първо трябва да добавите ретро техника от нашия каталог.
            </p>
            
            <Link href="/shop">
                {/* Бутонът с бял текст и заоблени ъгли (rounded-xl) */}
                <button className="bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-white font-black uppercase text-sm tracking-widest py-4 px-10 rounded-xl transition-all shadow-[0_5px_20px_rgba(255,107,0,0.3)] transform hover:-translate-y-1">
                    Разгледай каталога
                </button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black uppercase mb-10 tracking-wider border-b border-[#333] pb-6">
          Финализиране на <span className="text-[#ff6b00]">Поръчката</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* --- ЛЯВО: ФОРМА ЗА ДОСТАВКА --- */}
          <div>
            <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
              <span className="bg-[#ff6b00] text-black font-black w-8 h-8 flex items-center justify-center rounded-full text-sm">1</span>
              Данни за доставка
            </h2>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Име</label>
                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full bg-[#18181b] border border-[#333] p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none transition-colors" />
                </div>
                <div>
                    <label className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Фамилия</label>
                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full bg-[#18181b] border border-[#333] p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Телефон</label>
                <input type="tel" name="phone" required placeholder="0888 123 456" value={formData.phone} onChange={handleChange} className="w-full bg-[#18181b] border border-[#333] p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none transition-colors font-mono" />
              </div>

              <div>
                <label className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Град</label>
                <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full bg-[#18181b] border border-[#333] p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Адрес / Офис на Еконт</label>
                <textarea name="address" required rows={3} value={formData.address} onChange={handleChange} className="w-full bg-[#18181b] border border-[#333] p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none transition-colors"></textarea>
              </div>

              {/* === МЕТОД НА ПЛАЩАНЕ === */}
              <div className="pt-8 border-t border-[#333] mt-8">
                <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
                    <span className="bg-[#ff6b00] text-black font-black w-8 h-8 flex items-center justify-center rounded-full text-sm">2</span>
                    Метод на плащане
                </h2>
                
                <div className="space-y-4">
                    
                    {/* ОПЦИЯ 1: Наложен Платеж */}
                    <label className={`group relative block border p-5 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-[#ff6b00] bg-[#ff6b00]/5' : 'border-[#333] hover:border-gray-500 bg-[#18181b]'}`}>
                        <div className="flex items-center gap-4">
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="cod" 
                                checked={formData.paymentMethod === 'cod'} 
                                onChange={handleChange} 
                                className="w-5 h-5 text-[#ff6b00] accent-[#ff6b00]" 
                            />
                            <div className="flex-grow">
                                <p className="font-bold uppercase text-sm tracking-wider flex items-center gap-2">
                                  Наложен платеж
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Плащане в брой при доставка.</p>
                            </div>
                            <Truck 
                              size={28} 
                              strokeWidth={1.5}
                              className={`transition-colors ${formData.paymentMethod === 'cod' ? 'text-[#ff6b00]' : 'text-gray-500 group-hover:text-gray-300'}`} 
                            />
                        </div>
                    </label>

                    {/* ОПЦИЯ 2: Банков Превод */}
                    <label className={`group relative block border p-5 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'bank' ? 'border-[#ff6b00] bg-[#ff6b00]/5' : 'border-[#333] hover:border-gray-500 bg-[#18181b]'}`}>
                        <div className="flex items-center gap-4">
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="bank" 
                                checked={formData.paymentMethod === 'bank'} 
                                onChange={handleChange} 
                                className="w-5 h-5 text-[#ff6b00] accent-[#ff6b00]" 
                            />
                            <div className="flex-grow">
                                <p className="font-bold uppercase text-sm tracking-wider">Банков превод</p>
                                <p className="text-xs text-gray-400 mt-1">Изпращане след получен превод.</p>
                            </div>
                            <Landmark 
                              size={28} 
                              strokeWidth={1.5}
                              className={`transition-colors ${formData.paymentMethod === 'bank' ? 'text-[#ff6b00]' : 'text-gray-500 group-hover:text-gray-300'}`} 
                            />
                        </div>
                        
                        {formData.paymentMethod === 'bank' && (
                            <div className="mt-4 pt-4 border-t border-[#333] text-sm text-gray-300 pl-9 animate-fadeIn">
                                <p className="mb-2"><span className="text-gray-500 text-xs uppercase font-bold block tracking-widest">IBAN:</span> BG11 UNCR 7000 1523 4567 89</p>
                                <p><span className="text-gray-500 text-xs uppercase font-bold block tracking-widest">Основание:</span> Номер на поръчката</p>
                            </div>
                        )}
                    </label>

                    {/* ОПЦИЯ 3: Карта */}
                    <label className={`group relative block border p-5 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'card' ? 'border-[#ff6b00] bg-[#ff6b00]/5' : 'border-[#333] hover:border-gray-500 bg-[#18181b]'}`}>
                        <div className="flex items-center gap-4">
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="card" 
                                checked={formData.paymentMethod === 'card'} 
                                onChange={handleChange} 
                                className="w-5 h-5 text-[#ff6b00] accent-[#ff6b00]" 
                            />
                            <div className="flex-grow">
                                <p className="font-bold uppercase text-sm tracking-wider">Карта</p>
                                <p className="text-xs text-gray-400 mt-1">Сигурно плащане със Stripe.</p>
                            </div>
                            <CreditCard 
                              size={28} 
                              strokeWidth={1.5}
                              className={`transition-colors ${formData.paymentMethod === 'card' ? 'text-[#ff6b00]' : 'text-gray-500 group-hover:text-gray-300'}`} 
                            />
                        </div>

                    </label>

                </div>
              </div>

            </form>
          </div>

          {/* --- ДЯСНО: ОБОБЩЕНИЕ --- */}
          <div>
             <div className="bg-[#18181b] border border-[#333] rounded-2xl p-8 sticky top-32 shadow-2xl">
                <h3 className="text-xl font-bold uppercase mb-6 tracking-wider border-b border-[#333] pb-4">Вашата Поръчка</h3>
                
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item) => (
                        <div key={item.product_id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[#0a0a0a] rounded overflow-hidden flex-shrink-0 border border-[#333] p-1">
                                    <img src={item.image_url} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-200 uppercase tracking-wide">{item.name}</p>
                                    <p className="text-gray-500 text-xs font-mono">x{item.quantity}</p>
                                </div>
                            </div>
                            <span className="font-bold text-[#ff6b00] whitespace-nowrap">{(Number(item.price) * item.quantity).toFixed(2)} €</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-[#333] pt-6 space-y-3 mb-8">
                    <div className="flex justify-between text-gray-400 font-bold uppercase text-xs tracking-widest">
                        <span>Междинна сума</span>
                        <span>{cartTotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-gray-400 font-bold uppercase text-xs tracking-widest">
                        <span>Доставка</span>
                        <span className="text-[#ff6b00]">Безплатна</span>
                    </div>
                    <div className="flex justify-between items-end pt-6 border-t border-[#333] mt-4">
                        <span className="font-black uppercase tracking-wider text-lg text-white">ОБЩО</span>
                        <span className="text-3xl font-black text-[#ff6b00] leading-none">
                            {cartTotal.toFixed(2)} <span className="text-xl">€</span>
                        </span>
                    </div>
                </div>

                <button 
                    type="submit" 
                    form="checkout-form"
                    disabled={loading}
                    className={`w-full bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-[0_5px_15px_rgba(255,107,0,0.3)] flex items-center justify-center gap-2 transform hover:-translate-y-1 ${loading ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
                >
                    {loading ? "Обработване..." : "ПОРЪЧАЙ СЕГА"}
                    {!loading && <ChevronRight size={20} />}
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}