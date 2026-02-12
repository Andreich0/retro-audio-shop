"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

interface Product {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  stock?: number;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setFeaturedProducts(data.slice(0, 4)))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#ff6b00] selection:text-white">
      
      {/* =========================================
          1. HERO СЕКЦИЯ С PARALLAX ЕФЕКТ
      ========================================= */}
      <div 
        className="relative w-full h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-fixed bg-center bg-cover"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')" 
        }}
      >
        
        {/* Тъмен слой */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        
        {/* Градиент долу */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-20"></div>

        {/* Главно Съдържание */}
        <div className="relative z-30 flex flex-col items-center text-center px-4 max-w-7xl mx-auto">
          
          {/* ВЪРНАТОТО ЗАГЛАВИЕ */}
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black uppercase leading-none tracking-tighter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            RETRO <span className="text-[#ff6b00]">AUDIO</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 font-medium mt-6 mb-12 max-w-2xl drop-shadow-md tracking-wide">
            Върни се в златната ера на звука. <br />
            <span className="text-[#ff6b00] text-sm uppercase tracking-[0.3em] font-bold">
              Vintage • Analog • High-Fidelity
            </span>
          </p>

          <Link href="/shop">
            <button className="bg-[#ff6b00] text-white text-lg md:text-xl font-black uppercase px-12 py-5 rounded hover:bg-[#e65c00] transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(255,107,0,0.4)] tracking-widest border-2 border-[#ff6b00] hover:border-[#ff6b00]">
              Към Колекцията
            </button>
          </Link>
        </div>
      </div>

      {/* =========================================
          2. СЕКЦИЯ С КАРТИ (ИЗМЕСТЕНА ОТДОЛУ)
      ========================================= */}
      <section className="bg-[#0a0a0a] py-16 px-6 border-b border-[#222]">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-24 relative z-40">
                
                {/* Box 1: Качество */}
                <div className="bg-[#18181b] border border-[#333] hover:border-[#ff6b00] p-10 rounded-xl text-center shadow-2xl transition duration-300 group">
                    <div className="text-[#ff6b00] mb-6 flex justify-center transform group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold uppercase mb-3 tracking-wider text-white">Качество</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Всяко устройство минава през пълна профилактика и тест.
                    </p>
                </div>
                
                {/* Box 2: Класика */}
                <div className="bg-[#18181b] border border-[#333] hover:border-[#ff6b00] p-10 rounded-xl text-center shadow-2xl transition duration-300 group">
                    <div className="text-[#ff6b00] mb-6 flex justify-center transform group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/><path d="M20 9V7"/><path d="M4 15v2"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold uppercase mb-3 tracking-wider text-white">Класика</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Уникални модели от 80-те и 90-те години.
                    </p>
                </div>

                {/* Box 3: Доставка */}
                <div className="bg-[#18181b] border border-[#333] hover:border-[#ff6b00] p-10 rounded-xl text-center shadow-2xl transition duration-300 group">
                    <div className="text-[#ff6b00] mb-6 flex justify-center transform group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold uppercase mb-3 tracking-wider text-white">Доставка</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Сигурна доставка с преглед и тест.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* =========================================
          3. СЕКЦИЯ ПРОДУКТИ
      ========================================= */}
      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
            
            <h2 className="text-4xl md:text-5xl font-black text-center uppercase mb-16 tracking-wide">
              Избрани <span className="text-[#ff6b00]">Продукти</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div key={product.product_id} className="group bg-[#18181b] border border-[#333] rounded-xl overflow-hidden flex flex-col hover:border-[#ff6b00] hover:shadow-[0_0_20px_rgba(255,107,0,0.15)] transition-all duration-300">
                    
                    {/* Снимка */}
                    <div className="h-64 bg-white p-6 flex items-center justify-center relative overflow-hidden">
                      <img
                        src={product.image_url || "/placeholder.jpg"}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-black/90 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest border border-gray-600">
                         {product.category}
                      </span>
                    </div>

                    {/* Информация */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-wide truncate">
                            {product.name}
                        </h3>
                        <p className="text-[#666] text-xs font-bold uppercase tracking-[0.15em] mb-4">
                            Vintage Series
                        </p>
                      </div>

                      <div className="mt-auto">
                        <p className="text-[#ff6b00] text-2xl font-black mb-4">
                            {Number(product.price).toFixed(2)} €
                        </p>
                        
                        <div className="flex gap-3">
                            <Link href={`/shop/${product.product_id}`} className="flex-1"> {/* Динамичен линк */}
                            <button className="w-full border-2 border-[#444] text-gray-300 font-bold uppercase py-2 rounded hover:border-white hover:text-white transition-colors text-sm">
                                Виж
                            </button>
                            </Link>
                            
                            <button 
                                onClick={() => addToCart(product)}
                                className="flex-1 bg-[#ff6b00] text-white font-bold uppercase py-2 rounded hover:bg-[#e65c00] transition-colors text-sm shadow-lg"
                            >
                                Купи
                            </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ff6b00] mb-2"></div>
                    <p>Зареждане на находки...</p>
                </div>
              )}
            </div>

            <div className="text-center mt-16">
                <Link href="/shop">
                    <button className="text-gray-500 hover:text-[#ff6b00] uppercase font-bold tracking-[0.2em] text-sm border-b border-transparent hover:border-[#ff6b00] pb-1 transition-all">
                        Виж целия каталог →
                    </button>
                </Link>
            </div>
        </div>
      </section>
    </div>
  );
}