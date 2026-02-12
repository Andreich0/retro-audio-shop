"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "../../context/CartContext"; 
import { Search, ShoppingCart, Eye, SlidersHorizontal, X, PackageX, Check } from "lucide-react";

// --- ИНТЕРФЕЙСИ ---
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

// 1. РЕЧНИК ЗА ПРЕВОД НА СЪСТОЯНИЯТА (За баджовете)
const conditionDisplayMap: { [key: string]: string } = {
  "new": "НОВ",
  "mint": "КАТО НОВ",
  "good": "ДОБРО",
  "fair": "ЗАДОВОЛИТЕЛНО",
  "parts": "ЗА ЧАСТИ"
};

// 2. СЪСТОЯНИЯ ЗА ФИЛТЪРА
const conditionsList = [
  { id: "new", label: "Нов (New)" },
  { id: "mint", label: "Като нов (Mint)" },
  { id: "good", label: "Добро (Good)" },
  { id: "fair", label: "Задоволително (Fair)" },
  { id: "parts", label: "За части (Parts)" },
];

// 3. КАТЕГОРИИ (ID-то е на Английски, но ще търсим и Българския еквивалент)
const categoriesList = [
  { id: "Cassette", bg: "Касета", label: "Касети" },
  { id: "Deck", bg: "Дек", label: "Декове" },
  { id: "Walkman", bg: "Уокмен", label: "Уокмени" },
  { id: "Accessory", bg: "Аксесоари", label: "Аксесоари" },
];

const ShopContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE ЗА ФИЛТРИТЕ ---
  const [searchTerm, setSearchTerm] = useState("");
  
  // Множествен избор
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  
  // Ценови диапазон
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [priceLimit, setPriceLimit] = useState(2000);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { addToCart } = useCart(); 
  const searchParams = useSearchParams();

  // --- ВЗИМАНЕ НА ПРОДУКТИТЕ ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/products");
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
        
        if (data.length > 0) {
            const highestPrice = Math.ceil(Math.max(...data.map((p: Product) => Number(p.price))));
            setPriceLimit(highestPrice);
            setMaxPrice(highestPrice);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- URL ПАРАМЕТРИ ---
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

  // --- ЛОГИКА ЗА ФИЛТРИРАНЕ (ОПРАВЕНА) ---
  useEffect(() => {
    let result = products;

    // А) Търсене
    if (searchTerm) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Б) Категории - ТЪРСИ И ПО АНГЛИЙСКИ, И ПО БЪЛГАРСКИ
    if (selectedCategories.length > 0) {
      result = result.filter((product) => {
         // Намираме настройките за избраните категории
         const activeCats = categoriesList.filter(c => selectedCategories.includes(c.id));
         
         // Проверяваме дали категорията на продукта съвпада с Английското ID ИЛИ с Българското име
         return activeCats.some(c => 
             product.category === c.id || product.category === c.bg
         );
      });
    }

    // В) Състояние
    if (selectedConditions.length > 0) {
      result = result.filter((product) => 
        selectedConditions.includes(product.condition || 'good')
      );
    }

    // Г) Цена
    result = result.filter((product) => 
        Number(product.price) >= minPrice && 
        Number(product.price) <= maxPrice
    );

    setFilteredProducts(result);
  }, [searchTerm, selectedCategories, selectedConditions, minPrice, maxPrice, products]);

  // --- HELPER ФУНКЦИИ ---
  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const toggleCondition = (condId: string) => {
    setSelectedConditions(prev => 
      prev.includes(condId) ? prev.filter(c => c !== condId) : [...prev, condId]
    );
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxPrice - 1);
    setMinPrice(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minPrice + 1);
    setMaxPrice(value);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#ff6b00] selection:text-black">
      
      {/* HERO */}
      <div className="relative bg-[#0f0f13] border-b border-[#ff6b00] py-12 px-4 overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-500 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-2 drop-shadow-lg">
              КАТАЛОГ <span className="text-[#ff6b00]">РЕТРО АУДИО</span>
            </h1>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
        
        {/* MOBILE FILTER TOGGLE */}
        <div className="lg:hidden mb-6">
            <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="w-full bg-[#18181b] border border-[#333] text-white py-3 rounded-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:border-[#ff6b00] transition"
            >
                <SlidersHorizontal size={18} /> Филтри
            </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* --- SIDEBAR --- */}
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

                    {/* ТЪРСЕНЕ */}
                    <div className="bg-[#18181b] p-5 rounded-xl border border-[#333]">
                        <h3 className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-widest">Търсене</h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Модел..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-[#333] text-white p-2.5 pl-9 rounded focus:border-[#ff6b00] outline-none transition uppercase text-sm font-bold"
                            />
                            <Search className="absolute left-3 top-3 text-gray-500" size={14} />
                        </div>
                    </div>

                    {/* КАТЕГОРИИ */}
                    <div className="bg-[#18181b] p-5 rounded-xl border border-[#333]">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest">Категории</h3>
                            {selectedCategories.length > 0 && (
                                <button onClick={() => setSelectedCategories([])} className="text-[10px] text-[#ff6b00] underline">Изчисти</button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {categoriesList.map((cat) => {
                                const isSelected = selectedCategories.includes(cat.id);
                                return (
                                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group p-2 rounded hover:bg-[#222] transition">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${isSelected ? 'bg-[#ff6b00] border-[#ff6b00]' : 'border-gray-600 group-hover:border-[#ff6b00]'}`}>
                                            {isSelected && <Check size={12} className="text-black" strokeWidth={4} />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={isSelected} 
                                            onChange={() => toggleCategory(cat.id)}
                                        />
                                        <span className={`text-sm font-bold uppercase ${isSelected ? 'text-white' : 'text-gray-400'}`}>{cat.label}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    {/* СЪСТОЯНИЕ */}
                    <div className="bg-[#18181b] p-5 rounded-xl border border-[#333]">
                        <div className="flex justify-between items-center mb-3">
                             <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest">Състояние</h3>
                             {selectedConditions.length > 0 && (
                                <button onClick={() => setSelectedConditions([])} className="text-[10px] text-[#ff6b00] underline">Изчисти</button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {conditionsList.map((cond) => {
                                const isSelected = selectedConditions.includes(cond.id);
                                return (
                                    <label key={cond.id} className="flex items-center gap-3 cursor-pointer group p-2 rounded hover:bg-[#222] transition">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${isSelected ? 'bg-[#ff6b00] border-[#ff6b00]' : 'border-gray-600 group-hover:border-[#ff6b00]'}`}>
                                            {isSelected && <Check size={12} className="text-black" strokeWidth={4} />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={isSelected} 
                                            onChange={() => toggleCondition(cond.id)}
                                        />
                                        <span className={`text-sm font-bold uppercase ${isSelected ? 'text-white' : 'text-gray-400'}`}>{cond.label}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    {/* ЦЕНА (SLIDER) */}
                    <div className="bg-[#18181b] p-5 rounded-xl border border-[#333]">
                        <h3 className="text-xs font-bold uppercase text-gray-500 mb-6 tracking-widest">Цена (€)</h3>
                        
                        <div className="relative w-full h-1 bg-gray-700 rounded-lg mb-6">
                            <div 
                                className="absolute h-full bg-[#ff6b00] rounded-lg z-10"
                                style={{ 
                                    left: `${(minPrice / priceLimit) * 100}%`, 
                                    right: `${100 - (maxPrice / priceLimit) * 100}%` 
                                }}
                            ></div>
                            <input 
                                type="range" 
                                min="0" 
                                max={priceLimit} 
                                value={minPrice} 
                                onChange={handleMinChange}
                                className="absolute w-full h-full opacity-0 z-20 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                            />
                            <input 
                                type="range" 
                                min="0" 
                                max={priceLimit} 
                                value={maxPrice} 
                                onChange={handleMaxChange}
                                className="absolute w-full h-full opacity-0 z-20 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                            />
                            <div 
                                className="absolute w-4 h-4 bg-white border-2 border-[#ff6b00] rounded-full z-30 -mt-1.5 -ml-2 pointer-events-none shadow-md"
                                style={{ left: `${(minPrice / priceLimit) * 100}%` }}
                            ></div>
                            <div 
                                className="absolute w-4 h-4 bg-white border-2 border-[#ff6b00] rounded-full z-30 -mt-1.5 -ml-2 pointer-events-none shadow-md"
                                style={{ left: `${(maxPrice / priceLimit) * 100}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between items-center text-sm font-bold font-mono text-white">
                            <div className="bg-[#0a0a0a] border border-[#333] px-3 py-1 rounded min-w-[60px] text-center">
                                {minPrice} €
                            </div>
                            <span className="text-gray-500">-</span>
                            <div className="bg-[#0a0a0a] border border-[#333] px-3 py-1 rounded min-w-[60px] text-center">
                                {maxPrice} €
                            </div>
                        </div>
                    </div>

                </div>
            </aside>

            {/* --- PRODUCTS GRID --- */}
            <main className="lg:w-3/4 w-full">
                
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 pb-4 border-b border-[#333] gap-4">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                            Продукти
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCategories.map(c => (
                                <span key={c} className="text-[10px] bg-[#ff6b00] text-black px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                                    {categoriesList.find(cat => cat.id === c)?.label}
                                    <X size={10} className="cursor-pointer" onClick={() => toggleCategory(c)} />
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <span className="text-sm text-gray-500 font-mono whitespace-nowrap">
                        Намерени: <span className="text-[#ff6b00] font-bold">{filteredProducts.length}</span>
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#ff6b00]"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-[#18181b] rounded-xl border border-[#333]">
                        <p className="text-xl text-gray-400 font-bold mb-4 uppercase">Няма намерени продукти</p>
                        <button 
                            onClick={() => {
                                setSearchTerm(""); 
                                setSelectedCategories([]);
                                setSelectedConditions([]);
                                setMinPrice(0);
                                setMaxPrice(priceLimit);
                            }}
                            className="text-[#ff6b00] hover:text-white font-bold underline uppercase tracking-widest"
                        >
                            Изчисти всички филтри
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                        <div 
                            key={product.product_id} 
                            className={`group bg-[#18181b] border border-[#333] rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full ${product.stock === 0 ? 'opacity-80 grayscale' : 'hover:border-[#ff6b00] hover:shadow-[0_0_20px_rgba(255,107,0,0.1)]'}`}
                        >
                            <Link href={`/shop/${product.product_id}`} className="block relative h-60 bg-white p-4 overflow-hidden">
                                <img
                                    src={product.image_url || "/placeholder.jpg"}
                                    alt={product.name}
                                    className={`w-full h-full object-contain transition duration-500 ${product.stock > 0 ? 'group-hover:scale-110' : ''}`}
                                />
                                
                                {/* КАТЕГОРИЯ */}
                                <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest border border-gray-800 z-10">
                                    {product.category}
                                </span>

                                {/* СЪСТОЯНИЕ (ОПРАВЕНО) */}
                                {product.condition && (
                                    <span className="absolute bottom-3 left-3 bg-blue-600/90 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest border border-blue-400/30 z-10">
                                        {conditionDisplayMap[product.condition] || product.condition.toUpperCase()}
                                    </span>
                                )}

                                {product.stock === 0 && (
                                    <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-[1px]">
                                        <span className="text-white font-black text-lg uppercase tracking-widest border-2 border-white px-4 py-1 -rotate-12">
                                            Изчерпано
                                        </span>
                                    </div>
                                )}
                            </Link>

                            <div className="p-5 flex flex-col flex-grow">
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
                                            <button className="w-full bg-[#0a0a0a] border border-[#333] hover:border-gray-500 text-gray-300 hover:text-white py-2 rounded font-bold uppercase text-[10px] tracking-widest transition flex items-center justify-center gap-1">
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
                                            className={`flex-1 font-bold py-2 rounded uppercase text-[10px] tracking-widest transition flex items-center justify-center gap-1 ${
                                                product.stock > 0 
                                                ? "bg-[#ff6b00] hover:bg-[#e65c00] text-black" 
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
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-bold">ЗАРЕЖДАНЕ...</div>}>
      <ShopContent />
    </Suspense>
  );
};

export default ShopPage;