"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../../context/CartContext"; 
import { ShoppingCart, ArrowLeft, ShieldCheck, Activity, Truck, Package, Check, XCircle, Heart, Eye, PackageX } from "lucide-react";

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  condition?: string;
}

const conditionMap: { [key: string]: string } = {
  "new": "Новo",
  "mint": "Като новo",
  "good": "Добро",
  "fair": "Задоволително",
  "parts": "За части"
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

export default function ProductPage() {
  const params = useParams();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wishlist, setWishlist] = useState<number[]>([]);
  const { addToCart } = useCart(); 

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // 1. Взимаме основния продукт
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error(`Грешка при зареждане: ${res.status}`);
        
        const data = await res.json();
        const mainProduct = Array.isArray(data) ? data[0] : data;
        setProduct(mainProduct);

        // 2. Взимаме всички продукти за "Сходни"
        const allRes = await fetch(`${API_URL}/products`);
        if (allRes.ok) {
            const allData = await allRes.json();
            // Филтрираме същата категория, махаме текущия продукт и взимаме макс 3
            const related = allData
                .filter((p: Product) => p.category === mainProduct.category && p.product_id !== mainProduct.product_id)
                .slice(0, 3);
            setRelatedProducts(related);
        }

        // 3. Взимаме любими (ако е логнат)
        const token = localStorage.getItem("token");
        if (token) {
            const wlRes = await fetch("https://retro-audio-api-o7it.onrender.com/wishlist", { headers: { token } });
            if (wlRes.ok) {
                const wlData = await wlRes.json();
                setWishlist(wlData.map((item: any) => item.product_id));
            }
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const toggleWishlist = async (e: React.MouseEvent, productId: number) => {
      e.preventDefault();
      const token = localStorage.getItem("token");
      
      if (!token) {
          alert("Моля, влезте в профила си, за да добавяте в любими!");
          return;
      }

      try {
          const res = await fetch("https://retro-audio-api-o7it.onrender.com/wishlist/toggle", {
              method: "POST",
              headers: { "Content-Type": "application/json", token },
              body: JSON.stringify({ product_id: productId })
          });
          const data = await res.json();
          
          if (data.isFavorite) {
              setWishlist([...wishlist, productId]);
          } else {
              setWishlist(wishlist.filter(wId => wId !== productId));
          }
      } catch(err) {
          console.error(err);
      }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#ff6b00]"></div>
                <p className="text-gray-500 font-mono text-sm uppercase tracking-widest animate-pulse">Зареждане на компоненти...</p>
            </div>
        </div>
    );
  }

  if (error || !product) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white p-4 text-center">
            <Activity size={64} className="text-red-500 mb-6" />
            <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Системна Грешка</h2>
            <p className="text-gray-400 mb-8 font-mono">{error || "Продуктът не е намерен в базата данни."}</p>
            <Link href="/shop" className="px-8 py-3 bg-[#18181b] border border-[#333] hover:border-[#ff6b00] rounded text-white transition uppercase font-bold tracking-widest text-sm flex items-center gap-2">
                <ArrowLeft size={16} /> Обратно към каталога
            </Link>
        </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#ff6b00] selection:text-black font-sans pb-20">
      
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff6b00]/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative z-10">
        
        {/* BREADCRUMBS */}
        <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] mb-12 font-bold opacity-70 hover:opacity-100 transition duration-300">
          <Link href="/" className="hover:text-[#ff6b00] transition">Home</Link> 
          <span className="text-gray-700">/</span>
          <Link href="/shop" className="hover:text-[#ff6b00] transition">Catalog</Link> 
          <span className="text-gray-700">/</span>
          <span className="text-[#ff6b00] border-b border-[#ff6b00] pb-0.5">{product.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-32">
          
          {/* СНИМКА */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative group w-full bg-[#111] rounded-2xl border border-[#222] p-8 md:p-16 flex items-center justify-center overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
                
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#ff6b00]/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-700"></div>
                
                <img 
                  src={product.image_url || "/placeholder.jpg"} 
                  alt={product.name} 
                  className={`relative z-10 max-w-full max-h-[500px] object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] transition duration-700 ease-out ${isOutOfStock ? 'grayscale opacity-70' : 'group-hover:scale-105'}`}
                />

                <div className="absolute top-6 left-6 flex flex-col gap-2 z-20 pointer-events-none">
                    <span className="bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest rounded shadow-lg">
                        High Fidelity
                    </span>
                    {product.stock < 5 && product.stock > 0 && (
                         <span className="bg-red-500/80 backdrop-blur-md border border-red-500/30 text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest rounded animate-pulse shadow-lg">
                            Low Stock
                        </span>
                    )}
                </div>

                {/* БУТОН СЪРЦЕ ЗА ОСНОВНИЯ ПРОДУКТ */}
                <button
                    onClick={(e) => toggleWishlist(e, product.product_id)}
                    className={`absolute top-6 right-6 p-3 rounded-full transition-all z-30 shadow-[0_2px_15px_rgba(0,0,0,0.5)] backdrop-blur-md border ${
                        wishlist.includes(product.product_id) 
                        ? 'bg-black/60 border-red-500/50 hover:bg-black/80' 
                        : 'bg-black/40 border-white/20 hover:bg-black/60 hover:border-white/50'
                    }`}
                >
                    <Heart 
                        size={24} 
                        className={`transition-all duration-300 ${
                            wishlist.includes(product.product_id) 
                            ? 'fill-red-500 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]' 
                            : 'text-white drop-shadow-md'
                        }`} 
                    />
                </button>

                {isOutOfStock && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                        <span className="border-4 border-white text-white text-4xl font-black uppercase px-8 py-2 -rotate-12 tracking-widest opacity-80">
                            Изчерпано
                        </span>
                    </div>
                )}
            </div>
          </div>

          {/* ИНФОРМАЦИЯ */}
          <div className="lg:col-span-5 flex flex-col">
            
            <div className="mb-2 flex items-center gap-3">
                <span className="text-[#ff6b00] text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-[#ff6b00] animate-ping'}`}></div>
                    Vintage Series
                </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
              {product.name}
            </h1>

            <div className="flex items-end gap-4 mb-8 border-b border-[#222] pb-8">
                <div className={`text-5xl font-medium font-mono ${isOutOfStock ? 'text-gray-500 line-through decoration-[#ff6b00]' : 'text-white'}`}>
                  {Number(product.price).toFixed(2)}<span className="text-2xl text-[#ff6b00] no-underline">€</span>
                </div>
                
                <div className="mb-2 ml-auto text-right">
                     <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Наличност</p>
                     <p className={`text-sm font-bold uppercase flex items-center justify-end gap-2 ${!isOutOfStock ? 'text-green-500' : 'text-red-500'}`}>
                        {!isOutOfStock ? (
                            <><Check size={14} /> В наличност ({product.stock})</>
                        ) : (
                            <><XCircle size={14} /> Изчерпано</>
                        )}
                     </p>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-4">Описание на продукта</h3>
                <p className="text-gray-300 leading-7 font-light text-base border-l-2 border-[#333] pl-4 italic">
                    {product.description || "Този продукт е преминал пълна техническа профилактика и е готов да възпроизведе любимата ви музика с автентичното аналогово звучене."}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-10">
                <div className="bg-[#111] p-4 rounded-xl border border-[#222] hover:border-[#ff6b00]/30 transition group">
                    <ShieldCheck className="text-gray-600 group-hover:text-[#ff6b00] mb-2 transition" size={20}/>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Гаранция</p>
                    <p className="text-sm font-bold text-white">6 Месеца</p>
                </div>
                
                <div className="bg-[#111] p-4 rounded-xl border border-[#222] hover:border-[#ff6b00]/30 transition group">
                    <Activity className="text-gray-600 group-hover:text-[#ff6b00] mb-2 transition" size={20}/>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Състояние</p>
                    <p className="text-sm font-bold text-white">
                        {product.condition ? (conditionMap[product.condition] || product.condition) : "Отлично (A)"}
                    </p>
                </div>

                <div className="bg-[#111] p-4 rounded-xl border border-[#222] hover:border-[#ff6b00]/30 transition group">
                    <Truck className="text-gray-600 group-hover:text-[#ff6b00] mb-2 transition" size={20}/>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Доставка</p>
                    <p className="text-sm font-bold text-white">Безплатна</p>
                </div>
                
                <div className="bg-[#111] p-4 rounded-xl border border-[#222] hover:border-[#ff6b00]/30 transition group">
                    <Package className="text-gray-600 group-hover:text-[#ff6b00] mb-2 transition" size={20}/>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Категория</p>
                    <p className="text-sm font-bold text-white">{product.category}</p>
                </div>
            </div>

            <div className="mt-auto">
              <button 
                onClick={() => addToCart(product)}
                disabled={isOutOfStock}
                className={`w-full py-5 rounded-xl font-black uppercase text-sm tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden ${
                    !isOutOfStock
                    ? "bg-[#ff6b00] hover:bg-[#ff8533] text-black shadow-[0_0_40px_rgba(255,107,0,0.3)] hover:shadow-[0_0_60px_rgba(255,107,0,0.5)]" 
                    : "bg-[#222] text-gray-500 cursor-not-allowed border border-[#333]"
                }`}
              >
                {!isOutOfStock && (
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                )}
                
                {!isOutOfStock ? (
                    <>
                        <ShoppingCart size={18} className="relative z-10" /> 
                        <span className="relative z-10">Добави в количка</span>
                    </>
                ) : (
                    "Изчерпано количество"
                )}
              </button>
              
              <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-widest">
                Сигурно плащане • Преглед и тест преди плащане
              </p>
            </div>

          </div>
        </div>

        {/* --- СЕКЦИЯ СХОДНИ ПРОДУКТИ --- */}
        {relatedProducts.length > 0 && (
            <div className="border-t border-[#222] pt-16">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                            Сходни <span className="text-[#ff6b00]">Продукти</span>
                        </h2>
                        <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Още от категория {product.category}</p>
                    </div>
                    <Link href={`/shop?category=${product.category.toLowerCase()}`} className="text-[#ff6b00] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors border-b border-[#ff6b00] pb-1 hidden sm:block">
                        Виж всички
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedProducts.map((relProduct) => (
                         <div 
                         key={relProduct.product_id} 
                         className={`group bg-[#18181b] border border-[#333] rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full ${relProduct.stock === 0 ? 'border-gray-800' : 'hover:border-[#ff6b00] hover:shadow-[0_0_20px_rgba(255,107,0,0.1)]'}`}
                     >
                         <Link href={`/shop/${relProduct.product_id}`} className="block relative h-48 bg-white p-4 overflow-hidden group/img">
                             <img
                                 src={relProduct.image_url || "/placeholder.jpg"}
                                 alt={relProduct.name}
                                 className={`w-full h-full object-contain transition duration-500 ${relProduct.stock > 0 ? 'group-hover/img:scale-105' : 'grayscale opacity-70'}`}
                             />

                             {relProduct.stock === 0 && (
                                 <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-[1px]">
                                     <span className="text-white font-black text-sm uppercase tracking-widest border-2 border-white px-3 py-1 -rotate-12 shadow-lg">
                                         Изчерпано
                                     </span>
                                 </div>
                             )}

                             {/* БУТОН СЪРЦЕ */}
                             <button
                                 onClick={(e) => toggleWishlist(e, relProduct.product_id)}
                                 className={`absolute top-3 right-3 p-2 rounded-full transition-all z-30 shadow-[0_2px_10px_rgba(0,0,0,0.5)] backdrop-blur-md border ${
                                     wishlist.includes(relProduct.product_id) 
                                     ? 'bg-black/60 border-red-500/50 hover:bg-black/80' 
                                     : 'bg-black/40 border-white/20 hover:bg-black/60 hover:border-white/50'
                                 }`}
                             >
                                 <Heart 
                                     size={16} 
                                     className={`transition-all duration-300 ${
                                         wishlist.includes(relProduct.product_id) 
                                         ? 'fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' 
                                         : 'text-white drop-shadow-md'
                                     }`} 
                                 />
                             </button>
                         </Link>

                         <div className={`p-4 flex flex-col flex-grow bg-[#18181b] ${relProduct.stock === 0 ? 'grayscale opacity-60' : ''}`}>
                             <Link href={`/shop/${relProduct.product_id}`}>
                                 <h2 className={`text-sm font-bold transition mb-1 uppercase leading-tight line-clamp-2 min-h-[2.5rem] ${relProduct.stock > 0 ? 'text-white group-hover:text-[#ff6b00]' : 'text-gray-400'}`}>
                                         {relProduct.name}
                                 </h2>
                             </Link>
                             
                             <div className="mt-auto pt-3 border-t border-[#333]/50">
                                 <div className="flex justify-between items-end mb-3">
                                     <span className={`text-xl font-black ${relProduct.stock > 0 ? 'text-white' : 'text-gray-500 line-through decoration-[#ff6b00]'}`}>
                                         {Number(relProduct.price).toFixed(2)} <span className="text-xs font-normal">€</span>
                                     </span>
                                 </div>

                                 <div className="flex gap-2">
                                     <Link href={`/shop/${relProduct.product_id}`} className="flex-1">
                                         <button className="w-full bg-[#0a0a0a] border border-[#333] hover:border-gray-500 text-gray-300 hover:text-white py-1.5 rounded-lg font-bold uppercase text-[9px] tracking-widest transition flex items-center justify-center gap-1 shadow-sm">
                                             <Eye size={12} /> Виж
                                         </button>
                                     </Link>

                                     <button
                                         onClick={() => addToCart({
                                             product_id: relProduct.product_id,
                                             name: relProduct.name,
                                             price: relProduct.price,
                                             image_url: relProduct.image_url,
                                             category: relProduct.category, 
                                             stock: relProduct.stock 
                                         })}
                                         disabled={relProduct.stock === 0}
                                         className={`flex-1 font-bold py-1.5 rounded-lg uppercase text-[9px] tracking-widest transition flex items-center justify-center gap-1 shadow-sm ${
                                             relProduct.stock > 0 
                                             ? "bg-[#ff6b00] hover:bg-[#e65c00] text-black shadow-[0_0_10px_rgba(255,107,0,0.2)]" 
                                             : "bg-[#222] border border-[#333] text-gray-500 cursor-not-allowed"
                                         }`}
                                     >
                                         {relProduct.stock > 0 ? (
                                             <><ShoppingCart size={12} /> Купи</>
                                         ) : (
                                             <span className="flex items-center gap-1"><PackageX size={12}/> Изчерпано</span>
                                         )}
                                     </button>
                                 </div>
                             </div>
                         </div>
                     </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}