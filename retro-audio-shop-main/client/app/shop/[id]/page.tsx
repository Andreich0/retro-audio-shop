"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../../context/CartContext"; 
import { ShoppingCart, ArrowLeft, ShieldCheck, Activity, Truck, Package, Check, XCircle } from "lucide-react";

// Интерфейс на продукта
interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  condition?: string; // Полето от базата данни
}

// Речник за превод на състоянията
const conditionMap: { [key: string]: string } = {
  "new": "Новo",
  "mint": "Като новo",
  "good": "Добро",
  "fair": "Задоволително",
  "parts": "За части"
};

export default function ProductPage() {
  const params = useParams();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart(); 

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/products/${id}`);
        
        if (!res.ok) {
            throw new Error(`Грешка при зареждане: ${res.status}`);
        }

        const data = await res.json();
        
        // Обработка ако API връща масив или единичен обект
        if (Array.isArray(data)) {
            setProduct(data[0]);
        } else {
            setProduct(data);
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // --- LOADING STATE ---
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

  // --- ERROR STATE ---
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
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#ff6b00] selection:text-black font-sans">
      
      {/* Декоративен фон (Ambient Light) */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff6b00]/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative z-10">
        
        {/* --- BREADCRUMBS --- */}
        <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] mb-12 font-bold opacity-70 hover:opacity-100 transition duration-300">
          <Link href="/" className="hover:text-[#ff6b00] transition">Home</Link> 
          <span className="text-gray-700">/</span>
          <Link href="/shop" className="hover:text-[#ff6b00] transition">Catalog</Link> 
          <span className="text-gray-700">/</span>
          <span className="text-[#ff6b00] border-b border-[#ff6b00] pb-0.5">{product.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* --- ЛЯВО: СНИМКА (COL-7) --- */}
          <div className="lg:col-span-7 flex flex-col">
            <div className={`relative group w-full bg-[#111] rounded-2xl border border-[#222] p-8 md:p-16 flex items-center justify-center overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] ${isOutOfStock ? 'grayscale opacity-80' : ''}`}>
                
                {/* Glow ефект зад снимката */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#ff6b00]/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-700"></div>
                
                <img 
                  src={product.image_url || "/placeholder.jpg"} 
                  alt={product.name} 
                  className="relative z-10 max-w-full max-h-[500px] object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition duration-700 ease-out"
                />

                {/* ЕТИКЕТИ */}
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

                {/* SOLD OUT OVERLAY */}
                {isOutOfStock && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                        <span className="border-4 border-white text-white text-4xl font-black uppercase px-8 py-2 -rotate-12 tracking-widest opacity-80">
                            Изчерпано
                        </span>
                    </div>
                )}
            </div>
          </div>

          {/* --- ДЯСНО: ИНФОРМАЦИЯ (COL-5) --- */}
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

            {/* ЦЕНА И НАЛИЧНОСТ */}
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

            {/* ОПИСАНИЕ */}
            <div className="mb-8">
                <h3 className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-4">Описание на продукта</h3>
                <p className="text-gray-300 leading-7 font-light text-base border-l-2 border-[#333] pl-4 italic">
                    {product.description || "Този продукт е преминал пълна техническа профилактика и е готов да възпроизведе любимата ви музика с автентичното аналогово звучене."}
                </p>
            </div>

            {/* ТЕХНИЧЕСКИ ХАРАКТЕРИСТИКИ (GRID) */}
            <div className="grid grid-cols-2 gap-3 mb-10">
                <div className="bg-[#111] p-4 rounded-xl border border-[#222] hover:border-[#ff6b00]/30 transition group">
                    <ShieldCheck className="text-gray-600 group-hover:text-[#ff6b00] mb-2 transition" size={20}/>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Гаранция</p>
                    <p className="text-sm font-bold text-white">6 Месеца</p>
                </div>
                
                <div className="bg-[#111] p-4 rounded-xl border border-[#222] hover:border-[#ff6b00]/30 transition group">
                    <Activity className="text-gray-600 group-hover:text-[#ff6b00] mb-2 transition" size={20}/>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Състояние</p>
                    {/* ДИНАМИЧНО СЪСТОЯНИЕ ОТ БАЗАТА */}
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

            {/* ACTION BUTTON */}
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
      </div>
    </div>
  );
}