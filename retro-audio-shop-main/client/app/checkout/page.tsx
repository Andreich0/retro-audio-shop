"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { Truck, Landmark, CreditCard, ChevronRight } from "lucide-react"; // Импортираме иконите

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "cod" // cod = Cash on Delivery (Наложен платеж)
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      customer: formData,
      items: cart,
      total: cartTotal,
    };

    try {
      // Взимаме токена от localStorage (ако има такъв)
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/orders", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "token": token || "" // ИЗПРАЩАМЕ ТОКЕНА ТУК
        },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        clearCart();
        router.push("/checkout/success");
      } else {
        alert("Възникна грешка при поръчката. Моля опитайте отново.");
      }
    } catch (err) {
      console.error(err);
      alert("Сървърна грешка.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
            <h2 className="text-2xl font-bold mb-4">Количката е празна</h2>
            <Link href="/shop" className="text-[#ff6b00] hover:underline">Към каталога</Link>
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
              <span className="bg-[#ff6b00] text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">1</span>
              Данни за доставка
            </h2>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Име</label>
                    <input type="text" name="firstName" required onChange={handleChange} className="w-full bg-[#18181b] border border-[#333] p-3 rounded text-white focus:border-[#ff6b00] outline-none transition-colors" />
                </div>
                <div>
                    <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Фамилия</label>
                    <input type="text" name="lastName" required onChange={handleChange} className="w-full bg-[#18181b] border border-[#333] p-3 rounded text-white focus:border-[#ff6b00] outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Телефон</label>
                <input type="tel" name="phone" required placeholder="0888 123 456" onChange={handleChange} className="w-full bg-[#18181b] border border-[#333] p-3 rounded text-white focus:border-[#ff6b00] outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Град</label>
                <input type="text" name="city" required onChange={handleChange} className="w-full bg-[#18181b] border border-[#333] p-3 rounded text-white focus:border-[#ff6b00] outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Адрес / Офис на Еконт</label>
                <textarea name="address" required rows={3} onChange={handleChange} className="w-full bg-[#18181b] border border-[#333] p-3 rounded text-white focus:border-[#ff6b00] outline-none transition-colors"></textarea>
              </div>

              {/* === МЕТОД НА ПЛАЩАНЕ === */}
              <div className="pt-8 border-t border-[#333] mt-8">
                <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
                    <span className="bg-[#ff6b00] text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">2</span>
                    Метод на плащане
                </h2>
                
                <div className="space-y-4">
                    
                    {/* ОПЦИЯ 1: Наложен Платеж */}
                    <label className={`group relative block border p-5 rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-[#ff6b00] bg-[#ff6b00]/5' : 'border-[#333] hover:border-gray-500 bg-[#18181b]'}`}>
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
                    <label className={`group relative block border p-5 rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'bank' ? 'border-[#ff6b00] bg-[#ff6b00]/5' : 'border-[#333] hover:border-gray-500 bg-[#18181b]'}`}>
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
                                <p className="mb-2"><span className="text-gray-500 text-xs uppercase font-bold block">IBAN:</span> BG11 UNCR 7000 1523 4567 89</p>
                                <p><span className="text-gray-500 text-xs uppercase font-bold block">Основание:</span> Номер на поръчката</p>
                            </div>
                        )}
                    </label>

                    {/* ОПЦИЯ 3: Карта */}
                    <label className={`group relative block border p-5 rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'card' ? 'border-[#ff6b00] bg-[#ff6b00]/5' : 'border-[#333] hover:border-gray-500 bg-[#18181b]'}`}>
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

                         {formData.paymentMethod === 'card' && (
                            <div className="mt-4 pt-4 border-t border-[#333] pl-9">
                                <p className="text-yellow-500 text-sm flex items-center gap-2">
                                    ⚠️ Тази опция ще бъде налична скоро.
                                </p>
                            </div>
                        )}
                    </label>

                </div>
              </div>

            </form>
          </div>

          {/* --- ДЯСНО: ОБОБЩЕНИЕ --- */}
          <div>
             <div className="bg-[#18181b] border border-[#333] rounded-xl p-8 sticky top-6">
                <h3 className="text-xl font-bold uppercase mb-6 tracking-wider border-b border-[#333] pb-4">Вашата Поръчка</h3>
                
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item) => (
                        <div key={item.product_id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white rounded overflow-hidden flex-shrink-0 border border-gray-700">
                                    <img src={item.image_url} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-200">{item.name}</p>
                                    <p className="text-gray-500 text-xs">x{item.quantity}</p>
                                </div>
                            </div>
                            <span className="font-bold text-[#ff6b00]">{(Number(item.price) * item.quantity).toFixed(2)} €</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-[#333] pt-4 space-y-2 mb-6">
                    <div className="flex justify-between text-gray-400">
                        <span>Междинна сума</span>
                        <span>{cartTotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span>Доставка</span>
                        <span className="text-[#ff6b00] font-bold text-xs uppercase">Безплатна</span>
                    </div>
                    <div className="flex justify-between text-white font-black text-xl pt-4 border-t border-[#333]">
                        <span>ОБЩО</span>
                        <span>{cartTotal.toFixed(2)} €</span>
                    </div>
                </div>

                <button 
                    type="submit" 
                    form="checkout-form"
                    disabled={loading}
                    className={`w-full bg-[#ff6b00] hover:bg-[#e65c00] text-white font-black py-4 rounded uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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