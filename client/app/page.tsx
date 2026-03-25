"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { Eye, ShoppingCart, PackageX, Heart } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

interface Product {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  condition?: string;
}

const conditionDisplayMap: { [key: string]: string } = {
  "new": "НОВ",
  "mint": "КАТО НОВ",
  "good": "ДОБРО",
  "fair": "ЗАДОВОЛИТЕЛНО",
  "parts": "ЗА ЧАСТИ"
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
          setFeaturedProducts(data.slice(0, 4));
          setLoading(false);
      })
      .catch((err) => {
          console.error(err);
          setLoading(false);
      });

    const token = localStorage.getItem("token");
    if (token) {
        fetch(`${API_URL}/wishlist`, { headers: { token } })
            .then(res => res.json())
            .then(data => setWishlist(Array.isArray(data) ? data.map((item: any) => item.product_id) : []))
            .catch(err => console.error(err));
    }
  }, []);

  const toggleWishlist = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    if (!token) {
        toast.error("Моля, влезте в профила си, за да добавяте в любими!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/wishlist/toggle`, {
            method: "POST",
            headers: { "Content-Type": "application/json", token },
            body: JSON.stringify({ product_id: productId })
        });
        const data = await res.json();
        
        if (data.isFavorite) {
            setWishlist([...wishlist, productId]);
        } else {
            setWishlist(wishlist.filter(id => id !== productId));
        }
    } catch(err) {
        console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#ff6b00] selection:text-white">
      
      {/* 1. HERO СЕКЦИЯ С PARALLAX */}
      <div 
        className="relative w-full h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-fixed bg-center bg-cover"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')" 
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-20"></div>

        <div className="relative z-30 flex flex-col items-center text-center px-4 max-w-7xl mx-auto mt-10 md:mt-0">
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black uppercase leading-none tracking-tighter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            RETRO <span className="text-[#ff6b00] block md:inline mt-1 md:mt-0">AUDIO</span>
          </h1>
          
          <p className="text-base md:text-2xl text-gray-200 font-medium mt-4 md:mt-6 mb-8 md:mb-12 max-w-2xl drop-shadow-md tracking-wide px-4">
            Върни се в златната ера на звука. <br className="hidden md:block"/>
            <span className="text-[#ff6b00] text-[10px] md:text-sm uppercase tracking-[0.15em] md:tracking-[0.3em] font-black block mt-4 md:mt-5 bg-black/50 md:bg-transparent px-4 py-2 md:p-0 rounded-full w-fit mx-auto border border-[#ff6b00]/30 md:border-none">
              Vintage • Analog • High-Fidelity
            </span>
          </p>

          <Link href="/shop">
            <button className="mt-4 md:mt-0 bg-[#ff6b00] text-black text-sm md:text-xl font-black uppercase px-8 md:px-12 py-4 md:py-5 rounded-xl hover:bg-[#e65c00] transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,107,0,0.3)] tracking-widest">
              Към Колекцията
            </button>
          </Link>
        </div>
      </div>

      {/* 2. СЕКЦИЯ С КАРТИ */}
      <section className="bg-[#0a0a0a] py-16 px-4 md:px-6 border-b border-[#222]">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 md:-mt-24 relative z-40">
                <div className="bg-[#18181b] border border-[#333] hover:border-[#ff6b00] p-8 md:p-10 rounded-xl text-center shadow-2xl transition duration-300 group">
                    <div className="text-[#ff6b00] mb-6 flex justify-center transform group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" className="md:w-[54px] md:h-[54px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold uppercase mb-3 tracking-wider text-white">Качество</h3>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed">Всяко устройство минава през пълна профилактика и тест.</p>
                </div>
                
                <div className="bg-[#18181b] border border-[#333] hover:border-[#ff6b00] p-8 md:p-10 rounded-xl text-center shadow-2xl transition duration-300 group">
                    <div className="text-[#ff6b00] mb-6 flex justify-center transform group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" className="md:w-[54px] md:h-[54px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/><path d="M20 9V7"/><path d="M4 15v2"/>
                        </svg>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold uppercase mb-3 tracking-wider text-white">Класика</h3>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed">Уникални модели от 80-те и 90-те години.</p>
                </div>

                <div className="bg-[#18181b] border border-[#333] hover:border-[#ff6b00] p-8 md:p-10 rounded-xl text-center shadow-2xl transition duration-300 group">
                    <div className="text-[#ff6b00] mb-6 flex justify-center transform group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" className="md:w-[54px] md:h-[54px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold uppercase mb-3 tracking-wider text-white">Доставка</h3>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed">Сигурна доставка с преглед и тест.</p>
                </div>
            </div>
        </div>
      </section>

      {/* 3. СЕКЦИЯ ПРОДУКТИ */}
      <section className="py-16 md:py-24 px-3 sm:px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-center uppercase mb-10 md:mb-16 tracking-wide">
              Избрани <span className="text-[#ff6b00] block md:inline">Продукти</span>
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
              {loading ? (
                // === СИВИТЕ СКЕЛЕТНИ КАРТИ ===
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-[#111] border border-[#333] rounded-2xl overflow-hidden flex flex-col h-full animate-pulse">
                        <div className="h-36 md:h-60 bg-[#222]"></div>
                        <div className="p-3 md:p-5 flex flex-col flex-grow">
                            <div className="flex gap-2 mb-2 md:mb-3">
                                <div className="h-3 w-12 bg-[#333] rounded"></div>
                            </div>
                            <div className="h-4 sm:h-5 w-3/4 bg-[#333] rounded mb-2"></div>
                            <div className="h-4 sm:h-5 w-1/2 bg-[#333] rounded mb-4"></div>
                            <div className="mt-auto pt-3 md:pt-4 border-t border-[#333]/50">
                                <div className="h-6 sm:h-8 w-1/3 bg-[#333] rounded mb-3 md:mb-4"></div>
                                <div className="flex gap-1.5">
                                    <div className="h-8 md:h-10 w-full bg-[#333] rounded"></div>
                                    <div className="h-8 md:h-10 w-full bg-[#333] rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div 
                      key={product.product_id} 
                      className={`group bg-[#111] border border-[#333] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full ${product.stock === 0 ? 'border-gray-800 opacity-80' : 'hover:border-[#ff6b00] hover:shadow-[0_0_20px_rgba(255,107,0,0.1)]'}`}
                  >
                      <Link href={`/shop/${product.product_id}`} className="block relative h-36 md:h-60 bg-[#0a0a0a] p-3 sm:p-4 overflow-hidden group/img border-b border-[#222]">
                          <img
                              src={product.image_url || "/placeholder.jpg"}
                              alt={product.name}
                              className={`w-full h-full object-contain transition-transform duration-500 ${product.stock > 0 ? 'group-hover/img:scale-105' : 'grayscale'}`}
                          />

                          {product.stock === 0 && (
                              <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-[2px]">
                                  <span className="text-white font-black text-[10px] md:text-lg uppercase tracking-widest border-2 border-white px-2 md:px-4 py-1 -rotate-12 shadow-2xl">
                                      Изчерпано
                                  </span>
                              </div>
                          )}

                          <button
                              onClick={(e) => toggleWishlist(e, product.product_id)}
                              className={`absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 rounded-full transition-all z-30 shadow-lg backdrop-blur-md border ${
                                  wishlist.includes(product.product_id) 
                                  ? 'bg-black/80 border-red-500/50 hover:bg-black' 
                                  : 'bg-black/50 border-white/10 hover:bg-black/80 hover:border-white/30'
                              }`}
                          >
                              <Heart 
                                  size={14} 
                                  className={`md:w-4 md:h-4 transition-all duration-300 ${
                                      wishlist.includes(product.product_id) 
                                      ? 'fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' 
                                      : 'text-gray-300 drop-shadow-md'
                                  }`} 
                              />
                          </button>
                      </Link>

                      <div className={`p-3 md:p-5 flex flex-col flex-grow bg-[#18181b] ${product.stock === 0 ? 'grayscale' : ''}`}>
                          <div className="flex gap-1.5 mb-2 md:mb-3 flex-wrap">
                              <span className="text-[#ff6b00] text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-[#ff6b00]/10 border border-[#ff6b00]/20 px-1.5 py-0.5 rounded-md">
                                  {product.category}
                              </span>
                          </div>

                          <Link href={`/shop/${product.product_id}`}>
                              <h2 className={`text-xs sm:text-base font-bold transition-colors mb-1 md:mb-2 uppercase leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] ${product.stock > 0 ? 'text-gray-100 group-hover:text-[#ff6b00]' : 'text-gray-500'}`}>
                                      {product.name}
                              </h2>
                          </Link>
                          
                          <div className="mt-auto pt-3 border-t border-[#333]">
                              <div className="flex justify-between items-end mb-2.5 sm:mb-4">
                                  <span className={`text-base sm:text-xl font-black tracking-tight ${product.stock > 0 ? 'text-white' : 'text-gray-600 line-through decoration-[#ff6b00]'}`}>
                                      {Number(product.price).toFixed(2)} <span className="text-[10px] sm:text-xs font-bold text-gray-500">€</span>
                                  </span>
                              </div>

                              <div className="flex gap-1.5 w-full">
                                  <Link href={`/shop/${product.product_id}`} className="flex-1">
                                      <button className="w-full bg-[#0a0a0a] border border-[#444] hover:border-gray-400 text-gray-300 hover:text-white py-2 sm:py-2.5 rounded-lg font-black uppercase text-[8px] sm:text-[10px] tracking-widest transition-all flex items-center justify-center gap-1 shadow-sm">
                                          <Eye size={12} className="sm:w-3.5 sm:h-3.5" /> Виж
                                      </button>
                                  </Link>

                                  <button
                                      onClick={() => addToCart({
                                          product_id: product.product_id,
                                          name: product.name,
                                          price: product.price,
                                          image_url: product.image_url,
                                          category: product.category, 
                                          stock: product.stock 
                                      })}
                                      disabled={product.stock === 0}
                                      className={`flex-1 font-black py-2 sm:py-2.5 rounded-lg uppercase text-[8px] sm:text-[10px] tracking-widest transition-all flex items-center justify-center gap-1 shadow-md ${
                                          product.stock > 0 
                                          ? "bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black transform hover:-translate-y-0.5" 
                                          : "bg-[#222] border border-[#333] text-gray-600 cursor-not-allowed"
                                      }`}
                                  >
                                      {product.stock > 0 ? (
                                          <><ShoppingCart size={12} className="sm:w-3.5 sm:h-3.5" /> Купи</>
                                      ) : (
                                          <span className="flex items-center gap-1"><PackageX size={12} className="sm:w-3.5 sm:h-3.5"/> Няма</span>
                                      )}
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-10">
                    <p className="font-bold uppercase tracking-widest text-sm">Няма намерени продукти</p>
                </div>
              )}
            </div>

            <div className="text-center mt-12 md:mt-16">
                <Link href="/shop">
                    <button className="text-gray-500 hover:text-[#ff6b00] uppercase font-bold tracking-[0.2em] text-xs md:text-sm border-b border-transparent hover:border-[#ff6b00] pb-1 transition-all">
                        Виж целия каталог →
                    </button>
                </Link>
            </div>
        </div>
      </section>
    </div>
  );
}