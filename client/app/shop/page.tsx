"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "../../context/CartContext"; 
import { Search, ShoppingCart, Eye, SlidersHorizontal, X, PackageX, Check, ArrowDownUp, ChevronDown, Heart } from "lucide-react";

// ВЗИМАМЕ URL АДРЕСА НА API-ТО ОТ ПРОМЕНЛИВИТЕ НА СРЕДАТА
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-shop.vercel.app";

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

const conditionDisplayMap: { [key: string]: string } = {
  "new": "НОВ",
  "mint": "КАТО НОВ",
  "good": "ДОБРО",
  "fair": "ЗАДОВОЛИТЕЛНО",
  "parts": "ЗА ЧАСТИ"
};

const conditionsList = [
  { id: "new", label: "Нов (New)" },
  { id: "mint", label: "Като нов (Mint)" },
  { id: "good", label: "Добро (Good)" },
  { id: "fair", label: "Задоволително (Fair)" },
  { id: "parts", label: "За части (Parts)" },
];

const categoriesList = [
  { id: "Cassette", bg: "Касета", label: "Касети" },
  { id: "Deck", bg: "Дек", label: "Декове" },
  { id: "Walkman", bg: "Уокмен", label: "Уокмени" },
  { id: "Accessory", bg: "Аксесоари", label: "Аксесоари" },
];

const sortOptions = [
    { id: "newest", label: "Най-нови" },
    { id: "price_asc", label: "Цена: Най-ниска" },
    { id: "price_desc", label: "Цена: Най-висока" }
];

const ShopContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  
  const [minPrice, setMinPrice] = useState<number | "">(0);
  const [maxPrice, setMaxPrice] = useState<number | "">(2000);
  const [priceLimit, setPriceLimit] = useState(2000);
  
  const [sortOrder, setSortOrder] = useState("newest");
  const [isSortOpen, setIsSortOpen] = useState(false); 
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [wishlist, setWishlist] = useState<number[]>([]);

  const { addToCart } = useCart(); 
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchProductsAndWishlist = async () => {
      try {
        // 1. ЗАМЕНЕНО: Използваме API_URL променливата
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
        
        if (data.length > 0) {
            const highestPrice = Math.ceil(Math.max(...data.map((p: Product) => Number(p.price))));
            setPriceLimit(highestPrice);
            setMaxPrice(highestPrice);
        }

        const token = localStorage.getItem("token");
        if (token) {
            // 2. ЗАМЕНЕНО: Използваме API_URL променливата
            const wlRes = await fetch(`${API_URL}/wishlist`, { headers: { token } });
            if (wlRes.ok) {
                const wlData = await wlRes.json();
                setWishlist(wlData.map((item: any) => item.product_id));
            }
        }

        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
      }
    };
    fetchProductsAndWishlist();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      const categoryMap: { [key: string]: string } = {
        "cassette": "Cassette",
        "deck": "Deck",
        "walkman": "Walkman",
        "accessories": "Accessory"
      };
      const mappedCategory = categoryMap[categoryParam];
      if (mappedCategory) setSelectedCategories([mappedCategory]);
    }
  }, [searchParams]);

  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((product) => {
         const activeCats = categoriesList.filter(c => selectedCategories.includes(c.id));
         return activeCats.some(c => product.category === c.id || product.category === c.bg);
      });
    }

    if (selectedConditions.length > 0) {
      result = result.filter((product) => selectedConditions.includes(product.condition || 'good'));
    }

    const currentMin = Number(minPrice) || 0;
    const currentMax = Number(maxPrice) || priceLimit;

    result = result.filter((product) => Number(product.price) >= currentMin && Number(product.price) <= currentMax);

    if (sortOrder === "newest") {
        result.sort((a, b) => b.product_id - a.product_id);
    } else if (sortOrder === "price_asc") {
        result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOrder === "price_desc") {
        result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategories, selectedConditions, minPrice, maxPrice, sortOrder, products, priceLimit]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]);
  };

  const toggleCondition = (condId: string) => {
    setSelectedConditions(prev => prev.includes(condId) ? prev.filter(c => c !== condId) : [...prev, condId]);
  };

  const toggleWishlist = async (e: React.MouseEvent, productId: number) => {
      e.preventDefault();
      const token = localStorage.getItem("token");
      
      if (!token) {
          alert("Моля, влезте в профила си, за да добавяте в любими!");
          return;
      }

      try {
          // 3. ЗАМЕНЕНО: Използваме API_URL променливата
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

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), (Number(maxPrice) || priceLimit) - 1);
    setMinPrice(value);
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), (Number(minPrice) || 0) + 1);
    setMaxPrice(value);
  };

  const handleMinInputBlur = () => {
      let val = Number(minPrice);
      const currentMax = Number(maxPrice) || priceLimit;
      if (isNaN(val) || val < 0) val = 0;
      if (val > priceLimit) val = priceLimit - 1;
      if (val >= currentMax) val = currentMax > 0 ? currentMax - 1 : 0;
      setMinPrice(val);
  };

  const handleMaxInputBlur = () => {
      let val = Number(maxPrice);
      const currentMin = Number(minPrice) || 0;
      if (isNaN(val) || val > priceLimit) val = priceLimit;
      if (val <= currentMin) val = currentMin + 1;
      setMaxPrice(val);
  };

  const visualMin = Math.min(Math.max(0, Number(minPrice) || 0), priceLimit);
  const visualMax = Math.max(visualMin, Math.min(Number(maxPrice) || priceLimit, priceLimit));
  
  const minPercent = priceLimit > 0 ? (visualMin / priceLimit) * 100 : 0;
  const maxPercent = priceLimit > 0 ? (visualMax / priceLimit) * 100 : 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#ff6b00] selection:text-black">
      
      {/* HEADER SECTION */}
      <div className="relative bg-[#0f0f13] border-b border-[#ff6b00] py-12 px-4 overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-500 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-2 drop-shadow-lg">
              КАТАЛОГ <span className="text-[#ff6b00]">РЕТРО АУДИО</span>
            </h1>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
        
        {/* MOBILE FILTERS BUTTON */}
        <div className="lg:hidden mb-6 flex gap-4">
            <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex-1 bg-[#18181b] border border-[#333] text-white py-3 rounded-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:border-[#ff6b00] transition"
            >
                <SlidersHorizontal size={18} /> Филтри
            </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* SIDEBAR / FILTERS */}
            <aside className={`
                fixed inset-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md p-6 lg:static lg:bg-transparent lg:p-0 lg:w-1/4 lg:block lg:z-0
                transition-transform duration-300 ease-in-out overflow-y-auto lg:overflow-visible lg:sticky lg:top-24
                ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="space-y-6">
                    <div className="flex justify-between items-center lg:hidden mb-6 border-b border-[#333] pb-4">
                        <span className="text-xl font-black uppercase text-[#ff6b00]">Филтри</span>
                        <button onClick={() => setIsMobileFilterOpen(false)}><X size={24} /></button>
                    </div>

                    {/* SEARCH */}
                    <div className="bg-[#18181b] p-5 rounded-xl border border-[#333]">
                        <h3 className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-widest">Търсене</h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Модел..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-[#333] text-white p-3 pl-10 rounded-lg focus:border-[#ff6b00] outline-none transition uppercase text-sm font-bold placeholder:text-gray-600"
                            />
                            <Search className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                        </div>
                    </div>

                    {/* CATEGORIES */}
                    <div className="bg-[#18181b] p-5 rounded-xl border border-[#333]">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest">Категории</h3>
                            {selectedCategories.length > 0 && (
                                <button onClick={() => setSelectedCategories([])} className="text-[10px] text-[#ff6b00] hover:text-white transition underline uppercase font-bold tracking-widest">Изчисти</button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {categoriesList.map((cat) => {
                                const isSelected = selectedCategories.includes(cat.id);
                                return (
                                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-[#222] transition">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${isSelected ? 'bg-[#ff6b00] border-[#ff6b00]' : 'border-gray-600 group-hover:border-[#ff6b00]'}`}>
                                            {isSelected && <Check size={12} className="text-black" strokeWidth={4} />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleCategory(cat.id)} />
                                        <span className={`text-sm font-bold uppercase ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{cat.label}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    {/* CONDITION */}
                    <div className="bg-[#18181b] p-5 rounded-xl border border-[#333]">
                        <div className="flex justify-between items-center mb-3">
                             <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest">Състояние</h3>
                             {selectedConditions.length > 0 && (
                                <button onClick={() => setSelectedConditions([])} className="text-[10px] text-[#ff6b00] hover:text-white transition underline uppercase font-bold tracking-widest">Изчисти</button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {conditionsList.map((cond) => {
                                const isSelected = selectedConditions.includes(cond.id);
                                return (
                                    <label key={cond.id} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-[#222] transition">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${isSelected ? 'bg-[#ff6b00] border-[#ff6b00]' : 'border-gray-600 group-hover:border-[#ff6b00]'}`}>
                                            {isSelected && <Check size={12} className="text-black" strokeWidth={4} />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleCondition(cond.id)} />
                                        <span className={`text-sm font-bold uppercase ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{cond.label}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    {/* PRICE RANGE */}
                    <div className="bg-[#18181b] p-5 rounded-xl border border-[#333]">
                        <h3 className="text-xs font-bold uppercase text-gray-500 mb-6 tracking-widest">Цена (€)</h3>
                        <div className="relative w-full h-1 bg-gray-700 rounded-lg mb-8 mt-2">
                            <div 
                                className="absolute h-full bg-[#ff6b00] rounded-lg z-10 transition-all duration-75"
                                style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                            ></div>
                            <input 
                                type="range" min="0" max={priceLimit} value={visualMin} onChange={handleMinSliderChange}
                                className="absolute w-full h-full opacity-0 z-20 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                            />
                            <input 
                                type="range" min="0" max={priceLimit} value={visualMax} onChange={handleMaxSliderChange}
                                className="absolute w-full h-full opacity-0 z-20 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                            />
                            <div className="absolute w-4 h-4 bg-white border-2 border-[#ff6b00] rounded-full z-30 -mt-1.5 -ml-2 pointer-events-none shadow-md transition-all duration-75" style={{ left: `${minPercent}%` }}></div>
                            <div className="absolute w-4 h-4 bg-white border-2 border-[#ff6b00] rounded-full z-30 -mt-1.5 -ml-2 pointer-events-none shadow-md transition-all duration-75" style={{ left: `${maxPercent}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center text-sm font-bold font-mono text-white gap-2">
                            <div className="relative flex items-center w-24">
                                <input 
                                    type="number" 
                                    value={minPrice} 
                                    onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))} 
                                    onBlur={handleMinInputBlur}
                                    className="w-full bg-[#0a0a0a] border border-[#333] px-2 py-2 rounded-lg text-center focus:border-[#ff6b00] outline-none transition pr-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="absolute right-3 text-gray-500 pointer-events-none">€</span>
                            </div>
                            <span className="text-gray-600">-</span>
                            <div className="relative flex items-center w-24">
                                <input 
                                    type="number" 
                                    value={maxPrice} 
                                    onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))} 
                                    onBlur={handleMaxInputBlur}
                                    className="w-full bg-[#0a0a0a] border border-[#333] px-2 py-2 rounded-lg text-center focus:border-[#ff6b00] outline-none transition pr-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="absolute right-3 text-gray-500 pointer-events-none">€</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="lg:w-3/4 w-full">
                <div className="relative z-50 flex flex-col md:flex-row justify-between items-start md:items-end mb-6 pb-4 border-b border-[#333] gap-4">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                            Продукти
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCategories.map(c => (
                                <span key={c} className="text-[10px] bg-[#ff6b00] text-black px-2 py-1 rounded font-bold uppercase flex items-center gap-1 shadow-sm">
                                    {categoriesList.find(cat => cat.id === c)?.label}
                                    <X size={12} className="cursor-pointer hover:bg-black/20 rounded-full" onClick={() => toggleCategory(c)} />
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <span className="text-sm text-gray-500 font-mono whitespace-nowrap hidden sm:inline-block">
                            Намерени: <span className="text-[#ff6b00] font-bold">{filteredProducts.length}</span>
                        </span>

                        <div className="relative z-50 w-full sm:w-auto">
                            <button 
                                onClick={() => setIsSortOpen(!isSortOpen)}
                                className={`flex items-center justify-between w-full sm:w-56 bg-[#18181b] border ${isSortOpen ? 'border-[#ff6b00]' : 'border-[#333]'} rounded-xl px-4 py-2.5 hover:border-[#ff6b00] transition-colors`}
                            >
                                <div className="flex items-center gap-2">
                                    <ArrowDownUp size={16} className="text-[#ff6b00]" />
                                    <span className="text-white text-xs font-bold uppercase tracking-widest">
                                        {sortOptions.find(o => o.id === sortOrder)?.label}
                                    </span>
                                </div>
                                <ChevronDown size={16} className={`text-gray-500 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isSortOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)}></div>
                                    <div className="absolute top-full right-0 mt-2 w-full sm:w-56 bg-[#0f0f13] border border-[#333] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden">
                                        {sortOptions.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => {
                                                    setSortOrder(opt.id);
                                                    setIsSortOpen(false);
                                                }}
                                                className={`block w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${sortOrder === opt.id ? 'bg-[#ff6b00]/10 text-[#ff6b00] border-l-2 border-[#ff6b00]' : 'text-gray-400 hover:bg-[#18181b] hover:text-white border-l-2 border-transparent'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#ff6b00]"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-[#18181b] rounded-xl border border-[#333] shadow-inner">
                        <div className="text-gray-600 mb-4 flex justify-center"><Search size={48} strokeWidth={1}/></div>
                        <p className="text-xl text-gray-400 font-bold mb-4 uppercase tracking-wider">Няма намерени продукти</p>
                        <button 
                            onClick={() => {
                                setSearchTerm(""); 
                                setSelectedCategories([]);
                                setSelectedConditions([]);
                                setMinPrice(0);
                                setMaxPrice(priceLimit);
                                setSortOrder("newest");
                            }}
                            className="bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/20 hover:bg-[#ff6b00] hover:text-black py-2 px-6 rounded-lg font-bold uppercase text-xs tracking-widest transition-all"
                        >
                            Изчисти всички филтри
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
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

                                <button
                                    onClick={(e) => toggleWishlist(e, product.product_id)}
                                    className={`absolute top-3 right-3 p-2 rounded-full transition-all z-30 shadow-[0_2px_10px_rgba(0,0,0,0.5)] backdrop-blur-md border ${
                                        wishlist.includes(product.product_id) 
                                        ? 'bg-black/60 border-red-500/50 hover:bg-black/80' 
                                        : 'bg-black/40 border-white/20 hover:bg-black/60 hover:border-white/50'
                                    }`}
                                >
                                    <Heart 
                                        size={18} 
                                        className={`transition-all duration-300 ${
                                            wishlist.includes(product.product_id) 
                                            ? 'fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' 
                                            : 'text-white drop-shadow-md'
                                        }`} 
                                    />
                                </button>
                            </Link>

                            <div className={`p-5 flex flex-col flex-grow bg-[#18181b] ${product.stock === 0 ? 'grayscale opacity-60' : ''}`}>
                                <div className="flex gap-2 mb-3">
                                    <span className="text-[#ff6b00] text-[9px] font-bold uppercase tracking-widest bg-[#ff6b00]/10 px-2 py-0.5 rounded">
                                        {product.category}
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
            </main>
        </div>
      </div>
    </div>
  );
};

const ShopPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#ff6b00] animate-pulse font-bold tracking-widest">ЗАРЕЖДАНЕ...</div>}>
      <ShopContent />
    </Suspense>
  );
};

export default ShopPage;