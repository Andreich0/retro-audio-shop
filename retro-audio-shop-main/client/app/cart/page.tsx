"use client";

import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const total = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-4 font-sans">
        <div className="text-[#ff6b00] mb-6 animate-bounce">
            <ShoppingBag size={64} />
        </div>
        <h2 className="text-3xl font-black uppercase mb-4 tracking-wider">Количката е празна</h2>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          Все още не сте избрали нищо от нашата колекция. Разгледайте каталога за уникални находки.
        </p>
        <Link href="/shop">
          <button className="bg-[#ff6b00] hover:bg-[#e65c00] text-white font-bold py-3 px-8 rounded uppercase tracking-widest transition shadow-[0_0_20px_rgba(255,107,0,0.4)] transform hover:scale-105">
            Към Каталога
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-16 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-4xl font-black uppercase mb-12 tracking-tighter border-b border-[#333] pb-6 flex items-center gap-3">
          Вашата <span className="text-[#ff6b00]">Количка</span>
          <span className="text-sm font-normal text-gray-500 bg-[#18181b] px-3 py-1 rounded-full border border-[#333] ml-auto">
            {cart.length} продукта
          </span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="flex-grow space-y-4">
            {cart.map((item) => (
              <div 
                key={item.product_id} 
                className="bg-[#18181b] border border-[#333] rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 group hover:border-[#ff6b00] transition duration-300 relative overflow-hidden"
              >
                
                <Link href={`/shop/${item.product_id}`} className="w-full sm:w-32 h-32 bg-white rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden p-2 cursor-pointer relative z-10">
                  <img 
                    src={item.image_url || "/placeholder.jpg"} 
                    alt={item.name} 
                    className="max-w-full max-h-full object-contain transform group-hover:scale-110 transition duration-500" 
                  />
                </Link>

                <div className="flex-grow text-center sm:text-left z-10 w-full sm:w-auto">
                  <Link href={`/shop/${item.product_id}`}>
                    <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wide mb-1 hover:text-[#ff6b00] transition cursor-pointer">{item.name}</h3>
                  </Link>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">
                    {item.category || "Аудио техника"}
                  </p>
                  
                  {/* Показваме наличността, ако е малка */}
                  {item.stock < 5 && (
                      <p className="text-red-500 text-[10px] uppercase font-bold animate-pulse">
                          Остават само {item.stock} бр.!
                      </p>
                  )}
                  
                  <div className="text-sm text-gray-400 mb-1 sm:hidden">Ед. цена: <span className="text-white">{Number(item.price).toFixed(2)} €</span></div>
                </div>

                {/* КОНТРОЛИ ЗА КОЛИЧЕСТВО */}
                <div className="flex items-center gap-4 z-10">
                    <div className="flex items-center bg-[#0a0a0a] rounded-lg border border-[#333] overflow-hidden">
                        {/* БУТОН МИНУС */}
                        <button 
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className={`w-10 h-10 flex items-center justify-center transition text-lg font-bold ${item.quantity <= 1 ? 'text-gray-600 cursor-not-allowed' : 'hover:bg-[#333] hover:text-[#ff6b00]'}`}
                            disabled={item.quantity <= 1}
                        >
                        -
                        </button>
                        
                        <span className="w-10 text-center font-mono font-bold text-lg border-x border-[#333]">{item.quantity}</span>
                        
                        {/* БУТОН ПЛЮС (С ПРОВЕРКА ЗА STOCK) */}
                        <button 
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className={`w-10 h-10 flex items-center justify-center transition text-lg font-bold ${item.quantity >= item.stock ? 'text-gray-600 cursor-not-allowed bg-[#111]' : 'hover:bg-[#333] hover:text-[#ff6b00]'}`}
                            disabled={item.quantity >= item.stock}
                            title={item.quantity >= item.stock ? "Няма повече наличност" : "Добави"}
                        >
                        +
                        </button>
                    </div>
                </div>

                <div className="text-center sm:text-right min-w-[100px] z-10">
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1 hidden sm:block">Общо</p>
                  <p className="font-black text-xl text-white whitespace-nowrap">
                    {(Number(item.price) * item.quantity).toFixed(2)} <span className="text-sm text-[#ff6b00]">€</span>
                  </p>
                </div>

                <button 
                  onClick={() => removeFromCart(item.product_id)}
                  className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 text-gray-600 hover:text-red-500 transition p-2 hover:bg-red-500/10 rounded-full z-20"
                  title="Премахни от количката"
                >
                  <Trash2 size={20} />
                </button>

              </div>
            ))}
          </div>

          {/* ОБОБЩЕНИЕ */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-[#18181b] border border-[#333] rounded-xl p-8 sticky top-24 shadow-2xl">
              <h3 className="text-xl font-bold uppercase mb-6 tracking-wider border-b border-[#333] pb-4">Обобщение</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-400 text-sm uppercase font-bold">
                  <span>Междинна сума</span>
                  <span className="whitespace-nowrap">{total.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm uppercase font-bold">
                  <span>Доставка</span>
                  <span className="text-[#ff6b00]">Безплатна</span>
                </div>
              </div>

              <div className="border-t border-[#333] pt-6 mb-8">
                <div className="flex justify-between items-end">
                    <span className="font-bold uppercase tracking-wider text-lg">Общо за плащане</span>
                    <span className="text-3xl font-black text-[#ff6b00] leading-none whitespace-nowrap">
                        {total.toFixed(2)} <span className="text-2xl">€</span>
                    </span>
                </div>
                <p className="text-right text-[10px] text-gray-500 mt-1">с включен ДДС</p>
              </div>

              <Link href="/checkout">
                <button className="w-full bg-[#ff6b00] hover:bg-[#e65c00] text-white font-bold py-4 rounded uppercase tracking-widest transition transform hover:-translate-y-1 shadow-[0_5px_15px_rgba(255,107,0,0.3)] flex items-center justify-center gap-2">
                  Към Плащане <ShoppingBag size={18} />
                </button>
              </Link>
              
              <div className="mt-6 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition duration-500">
                <div className="text-[10px] text-center text-gray-600 uppercase tracking-widest">
                    Сигурно плащане • Еконт / Speedy • Преглед и тест
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}