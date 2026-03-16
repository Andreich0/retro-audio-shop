"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, HeartCrack, ShoppingCart, Eye, PackageX } from "lucide-react";
import { useCart } from "../../context/CartContext";

interface Product {
  product_id: number;
  name: string;
  price: string;
  image_url: string;
  category: string;
  stock: number;
  condition?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

const conditionDisplayMap: { [key: string]: string } = {
  "new": "НОВ",
  "mint": "КАТО НОВ",
  "good": "ДОБРО",
  "fair": "ЗАДОВОЛИТЕЛНО",
  "parts": "ЗА ЧАСТИ"
};

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart(); // Взимаме количката, за да можем да купуваме директно!

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/wishlist`, {
        headers: { token }
      });
      const data = await res.json();
      setWishlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault(); // Спира линка към продукта
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/wishlist/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token: token || "" },
        body: JSON.stringify({ product_id: productId })
      });
      // Махаме го веднага от екрана
      setWishlist(wishlist.filter(p => p.product_id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#ff6b00] uppercase font-bold tracking-widest animate-pulse">Зареждане...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-sans relative overflow-hidden">
        {/* Декорация */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-4 mb-10 border-b border-gray-800 pb-6">
                <div className="p-4 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    <Heart size={32} className="fill-red-500" />
                </div>
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                        Моите <span className="text-red-500">Любими</span>
                    </h1>
                    <p className="text-gray-400 text-xs tracking-widest uppercase mt-1">Запазени продукти за по-късно</p>
                </div>
            </div>

            {wishlist.length === 0 ? (
                <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-16 flex flex-col items-center text-center shadow-2xl">
                    <HeartCrack size={64} className="text-gray-700 mb-6" />
                    <h2 className="text-2xl font-bold uppercase mb-2">Списъкът е празен</h2>
                    <p className="text-gray-500 mb-8 max-w-md text-sm">Все още не сте добавили нищо в любими. Разгледайте каталога и запазете техниките, които ви харесват.</p>
                    <Link href="/shop">
                        <button className="bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black uppercase px-8 py-4 rounded-xl text-xs tracking-widest transition-all shadow-[0_5px_15px_rgba(255,107,0,0.3)] transform hover:-translate-y-1">
                            Към Каталога
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((product) => (
                        <div 
                            key={product.product_id} 
                            className={`group bg-[#18181b] border border-[#333] rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full ${product.stock === 0 ? 'border-gray-800' : 'hover:border-[#ff6b00] hover:shadow-[0_0_20px_rgba(255,107,0,0.1)]'}`}
                        >
                            <Link href={`/shop/${product.product_id}`} className="block relative h-60 bg-white p-4 overflow-hidden group/img">
                                <img
                                    src={product.image_url || "/placeholder.jpg"}
                                    alt={product.name}
                                    className={`w-full h-full object-contain transition duration-500 ${product.stock > 0 ? 'group-hover/img:scale-105' : 'grayscale opacity-70'}`}
                                />

                                {product.stock === 0 && (
                                    <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-[1px]">
                                        <span className="text-white font-black text-lg uppercase tracking-widest border-2 border-white px-4 py-1 -rotate-12 shadow-lg">
                                            Изчерпано
                                        </span>
                                    </div>
                                )}

                                {/* БУТОН СЪРЦЕ - Светещо червено, служи за премахване! */}
                                <button
                                    onClick={(e) => removeFromWishlist(e, product.product_id)}
                                    className="absolute top-3 right-3 p-2 rounded-full transition-all z-30 shadow-[0_2px_10px_rgba(0,0,0,0.5)] backdrop-blur-md border bg-black/60 border-red-500/50 hover:bg-black/80 group/btn"
                                    title="Премахни от любими"
                                >
                                    <Heart 
                                        size={18} 
                                        className="fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-transform duration-300 group-hover/btn:scale-110" 
                                    />
                                </button>
                            </Link>

                            <div className={`p-5 flex flex-col flex-grow bg-[#18181b] ${product.stock === 0 ? 'grayscale opacity-60' : ''}`}>
                                <div className="flex gap-2 mb-3">
                                    <span className="text-[#ff6b00] text-[9px] font-bold uppercase tracking-widest bg-[#ff6b00]/10 px-2 py-0.5 rounded">
                                        {product.category || "Продукт"}
                                    </span>
                                    {product.condition && (
                                        <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest border border-[#333] px-2 py-0.5 rounded">
                                            {conditionDisplayMap[product.condition] || product.condition}
                                        </span>
                                    )}
                                </div>

                                <Link href={`/shop/${product.product_id}`}>
                                    <h2 className={`text-lg font-bold transition mb-1 uppercase leading-tight ${product.stock > 0 ? 'text-white group-hover:text-[#ff6b00]' : 'text-gray-400'}`}>
                                            {product.name}
                                    </h2>
                                </Link>
                                
                                <div className="mt-auto pt-4 border-t border-[#333]/50">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className={`text-2xl font-black ${product.stock > 0 ? 'text-white' : 'text-gray-500 line-through decoration-[#ff6b00]'}`}>
                                            {Number(product.price).toFixed(2)} <span className="text-sm font-normal">€</span>
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/shop/${product.product_id}`} className="flex-1">
                                            <button className="w-full bg-[#0a0a0a] border border-[#333] hover:border-gray-500 text-gray-300 hover:text-white py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest transition flex items-center justify-center gap-1 shadow-sm">
                                                <Eye size={14} /> Виж
                                            </button>
                                        </Link>

                                        {/* БУТОН ЗА КОЛИЧКАТА - Замества старата икона с кошче! */}
                                        <button
                                            onClick={() => addToCart({
                                                product_id: product.product_id,
                                                name: product.name,
                                                price: Number(product.price),
                                                image_url: product.image_url,
                                                category: product.category || 'Продукт', 
                                                stock: product.stock 
                                            })}
                                            disabled={product.stock === 0}
                                            className={`flex-1 font-bold py-2 rounded-lg uppercase text-[10px] tracking-widest transition flex items-center justify-center gap-1 shadow-sm ${
                                                product.stock > 0 
                                                ? "bg-[#ff6b00] hover:bg-[#e65c00] text-black shadow-[0_0_10px_rgba(255,107,0,0.2)]" 
                                                : "bg-[#222] border border-[#333] text-gray-500 cursor-not-allowed"
                                            }`}
                                        >
                                            {product.stock > 0 ? (
                                                <><ShoppingCart size={14} /> Купи</>
                                            ) : (
                                                <span className="flex items-center gap-1"><PackageX size={14}/> Изчерпано</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}