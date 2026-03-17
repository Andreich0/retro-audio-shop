"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "../../context/CartContext"; 
import { Search, ShoppingCart, Eye, SlidersHorizontal, X, PackageX, Check, ArrowDownUp, ChevronDown, Heart, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

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

  // === НОВО: СТРАНИЦИРАНЕ И ИЗГЛЕД (КОЛОНИ) ===
  const [gridCols, setGridCols] = useState<3 | 4 | 5>(3); // По подразбиране 3 на ред
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // По колко продукта да се показват на страница

  const { addToCart } = useCart(); 
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchProductsAndWishlist = async () => {
      try {
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
    // При всяка промяна на филтрите връщаме на страница 1
    setCurrentPage(1); 
  }, [searchTerm, selectedCategories, selectedConditions, minPrice, maxPrice, sortOrder, products, priceLimit]);

  // Смятане на продуктите за текущата страница
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

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

  // Динамичен клас за колоните на големи екрани
  const gridClass = gridCols === 3 ? "xl:grid-cols-3 lg:grid-cols-3" : gridCols === 4 ? "xl:grid-cols-4 lg:grid-cols-3" : "xl:grid-cols-5 lg:grid-cols-4";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#ff6b00] selection:text-black">
      
      {/* HEADER SECTION */}
      <div className="relative bg-[#0f0f13] border-b border-[#ff6b00] py-8 md:py-12 px-4 overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-500 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
            <h1 className="text-2xl md:text-5xl font-black uppercase italic tracking-tighter mb-1 md:mb-2 drop-shadow-lg">
              КАТАЛОГ <span className="text-[#ff6b00]">РЕТРО АУДИО</span>
            </h1>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        
        {/* MOBILE FILTERS BUTTON */}
        <div className="lg:hidden mb-6 w-full">
            <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="w-full bg-[#18181b] border border-[#333] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:border-[#ff6b00] transition shadow-lg"
            >
                <SlidersHorizontal size={18} /> Покажи Филтри
            </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
            
            {/* SIDEBAR / FILTERS */}
            <aside className={`
                fixed inset-0 z-[60] bg-[#0a0a0a] p-4 sm:p-6 pb-24 lg:pb-0 lg:static lg:bg-transparent lg:p-0 lg:w-1/4 lg:block lg:z-0
                transition-transform duration-300 ease-in-out overflow-y-auto lg:overflow-visible lg:sticky lg:top-24
                ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="space-y-4 md:space-y-6">
                    <div className="flex justify-between items-center lg:hidden mb-4 border-b border-[#333] pb-4 sticky top-0 bg-[#0a0a0a] z-10 pt-2">
                        <span className="text-xl font-black uppercase text-[#ff6b00]">Филтри</span>
                        <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-[#18181b] rounded-full border border-[#333]"><X size={20} /></button>
                    </div>

                    {/* SEARCH */}
                    <div className="bg-[#18181b] p-4 md:p-5 rounded-xl border border-[#333]">
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
                    <div className="bg-[#18181b] p-4 md:p-5 rounded-xl border border-[#333]">
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
                    <div className="bg-[#18181b] p-4 md:p-5 rounded-xl border border-[#333]">
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
                    <div className="bg-[#18181b] p-4 md:p-5 rounded-xl border border-[#333]">
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
                            <div className="relative flex items-center w-[45%]">
                                <input 
                                    type="number" 
                                    value={minPrice} 
                                    onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))} 
                                    onBlur={handleMinInputBlur}
                                    className="w-full bg-[#0a0a0a] border border-[#333] px-2 py-2 rounded-lg text-center focus:border-[#ff6b00] outline-none transition pr-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="absolute right-2 text-gray-500 pointer-events-none text-xs">€</span>
                            </div>
                            <span className="text-gray-600">-</span>
                            <div className="relative flex items-center w-[45%]">
                                <input 
                                    type="number" 
                                    value={maxPrice} 
                                    onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))} 
                                    onBlur={handleMaxInputBlur}
                                    className="w-full bg-[#0a0a0a] border border-[#333] px-2 py-2 rounded-lg text-center focus:border-[#ff6b00] outline-none transition pr-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="absolute right-2 text-gray-500 pointer-events-none text-xs">€</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="lg:w-3/4 w-full">
                <div className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-end mb-6 pb-4 border-b border-[#333] gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white">
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
                        <span className="text-xs md:text-sm text-gray-500 font-mono whitespace-nowrap sm:inline-block">
                            Намерени: <span className="text-[#ff6b00] font-bold">{filteredProducts.length}</span>
                        </span>

                        <div className="flex gap-2 w-full sm:w-auto">
                            {/* === ИЗБОР НА ИЗГЛЕД (само за компютър/лаптоп) === */}
                            <div className="hidden lg:flex items-center bg-[#18181b] border border-[#333] rounded-xl p-1 shrink-0 h-10">
                                <button 
                                    onClick={() => setGridCols(3)} 
                                    title="3 на ред"
                                    className={`w-8 h-full rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${gridCols === 3 ? 'bg-[#ff6b00] text-black shadow-md' : 'text-gray-500 hover:text-white'}`}
                                >
                                    3
                                </button>
                                <button 
                                    onClick={() => setGridCols(4)} 
                                    title="4 на ред"
                                    className={`w-8 h-full rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${gridCols === 4 ? 'bg-[#ff6b00] text-black shadow-md' : 'text-gray-500 hover:text-white'}`}
                                >
                                    4
                                </button>
                                <button 
                                    onClick={() => setGridCols(5)} 
                                    title="5 на ред"
                                    className={`w-8 h-full rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${gridCols === 5 ? 'bg-[#ff6b00] text-black shadow-md' : 'text-gray-500 hover:text-white'}`}
                                >
                                    5
                                </button>
                            </div>

                            <div className="relative z-30 w-full sm:w-48">
                                <button 
                                    onClick={() => setIsSortOpen(!isSortOpen)}
                                    className={`flex items-center justify-between w-full bg-[#18181b] border h-10 ${isSortOpen ? 'border-[#ff6b00]' : 'border-[#333]'} rounded-xl px-4 hover:border-[#ff6b00] transition-colors`}
                                >
                                    <div className="flex items-center gap-2">
                                        <ArrowDownUp size={14} className="text-[#ff6b00]" />
                                        <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest truncate">
                                            {sortOptions.find(o => o.id === sortOrder)?.label}
                                        </span>
                                    </div>
                                    <ChevronDown size={14} className={`text-gray-500 transition-transform shrink-0 ${isSortOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isSortOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)}></div>
                                        <div className="absolute top-full right-0 mt-2 w-full bg-[#0f0f13] border border-[#333] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden">
                                            {sortOptions.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => {
                                                        setSortOrder(opt.id);
                                                        setIsSortOpen(false);
                                                    }}
                                                    className={`block w-full text-left px-4 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${sortOrder === opt.id ? 'bg-[#ff6b00]/10 text-[#ff6b00] border-l-2 border-[#ff6b00]' : 'text-gray-400 hover:bg-[#18181b] hover:text-white border-l-2 border-transparent'}`}
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
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#ff6b00]"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-[#18181b] rounded-xl border border-[#333] shadow-inner px-4">
                        <div className="text-gray-600 mb-4 flex justify-center"><Search size={48} strokeWidth={1}/></div>
                        <p className="text-lg md:text-xl text-gray-400 font-bold mb-4 uppercase tracking-wider">Няма намерени продукти</p>
                        <button 
                            onClick={() => {
                                setSearchTerm(""); 
                                setSelectedCategories([]);
                                setSelectedConditions([]);
                                setMinPrice(0);
                                setMaxPrice(priceLimit);
                                setSortOrder("newest");
                                setCurrentPage(1);
                            }}
                            className="bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/20 hover:bg-[#ff6b00] hover:text-black py-2 px-6 rounded-lg font-bold uppercase text-xs tracking-widest transition-all w-full sm:w-auto"
                        >
                            Изчисти всички филтри
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 ${gridClass}`}>
                            {currentItems.map((product) => (
                           <div 
                                key={product.product_id} 
                                className={`group bg-[#18181b] border border-[#333] rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full ${product.stock === 0 ? 'border-gray-800' : 'hover:border-[#ff6b00] hover:shadow-[0_0_20px_rgba(255,107,0,0.1)]'}`}
                            >
                                <Link href={`/shop/${product.product_id}`} className="block relative h-48 sm:h-52 bg-white p-4 overflow-hidden group/img">
                                    <img
                                        src={product.image_url || "/placeholder.jpg"}
                                        alt={product.name}
                                        className={`w-full h-full object-contain transition duration-500 ${product.stock > 0 ? 'group-hover/img:scale-105' : 'grayscale opacity-70'}`}
                                    />

                                    {product.stock === 0 && (
                                        <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-[1px]">
                                            <span className="text-white font-black text-sm md:text-lg uppercase tracking-widest border-2 border-white px-3 md:px-4 py-1 -rotate-12 shadow-lg">
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
                                            size={16} 
                                            className={`transition-all duration-300 ${
                                                wishlist.includes(product.product_id) 
                                                ? 'fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' 
                                                : 'text-white drop-shadow-md'
                                            }`} 
                                        />
                                    </button>
                                </Link>

                                <div className={`p-4 md:p-5 flex flex-col flex-grow bg-[#18181b] ${product.stock === 0 ? 'grayscale opacity-60' : ''}`}>
                                    <div className="flex gap-2 mb-2 md:mb-3 flex-wrap">
                                        <span className="text-[#ff6b00] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest bg-[#ff6b00]/10 px-2 py-0.5 rounded">
                                            {product.category}
                                        </span>
                                        {product.condition && (
                                            <span className="text-gray-400 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest border border-[#333] px-2 py-0.5 rounded">
                                                {conditionDisplayMap[product.condition] || product.condition}
                                            </span>
                                        )}
                                    </div>

                                    <Link href={`/shop/${product.product_id}`}>
                                        <h2 className={`text-sm sm:text-base font-bold transition mb-1 uppercase leading-tight line-clamp-2 min-h-[2.5rem] ${product.stock > 0 ? 'text-white group-hover:text-[#ff6b00]' : 'text-gray-400'}`}>
                                                {product.name}
                                        </h2>
                                    </Link>
                                    
                                    <div className="mt-auto pt-3 border-t border-[#333]/50">
                                        <div className="flex justify-between items-end mb-3">
                                            <span className={`text-lg sm:text-xl font-black ${product.stock > 0 ? 'text-white' : 'text-gray-500 line-through decoration-[#ff6b00]'}`}>
                                                {Number(product.price).toFixed(2)} <span className="text-xs font-normal">€</span>
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <Link href={`/shop/${product.product_id}`} className="flex-1">
                                                <button className="w-full bg-[#0a0a0a] border border-[#333] hover:border-gray-500 text-gray-300 hover:text-white py-2 rounded-lg font-bold uppercase text-[9px] tracking-widest transition flex items-center justify-center gap-1 shadow-sm">
                                                    <Eye size={12} /> Виж
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
                                                className={`flex-1 font-bold py-2 rounded-lg uppercase text-[9px] tracking-widest transition flex items-center justify-center gap-1 shadow-sm ${
                                                    product.stock > 0 
                                                    ? "bg-[#ff6b00] hover:bg-[#e65c00] text-black shadow-[0_0_10px_rgba(255,107,0,0.2)]" 
                                                    : "bg-[#222] border border-[#333] text-gray-500 cursor-not-allowed"
                                                }`}
                                            >
                                                {product.stock > 0 ? (
                                                    <><ShoppingCart size={12} /> Купи</>
                                                ) : (
                                                    <span className="flex items-center gap-1"><PackageX size={12}/> Няма</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ))}
                        </div>

                        {/* === ПАГИНАЦИЯ (PAGINATION) === */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12 mb-4">
                                <button
                                    onClick={() => {
                                        setCurrentPage(p => Math.max(1, p - 1));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg bg-[#18181b] border border-[#333] text-gray-400 hover:text-[#ff6b00] hover:border-[#ff6b00] disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => {
                                            setCurrentPage(page);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-sm transition ${currentPage === page ? 'bg-[#ff6b00] border-[#ff6b00] text-black shadow-[0_0_15px_rgba(255,107,0,0.4)]' : 'bg-[#18181b] border-[#333] text-gray-400 hover:text-white hover:border-gray-500'}`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => {
                                        setCurrentPage(p => Math.min(totalPages, p + 1));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg bg-[#18181b] border border-[#333] text-gray-400 hover:text-[#ff6b00] hover:border-[#ff6b00] disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
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