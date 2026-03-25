"use client";

import { useState, useEffect, ChangeEvent, FormEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: string | number; 
  category: string;
  image_url: string;
  stock: number; 
  condition?: string;
}

export default function AdminPage() {
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [inputs, setInputs] = useState({
    name: "",
    description: "",
    price: "",
    category: "Cassette",
    image_url: "",
    stock: "",
    condition: "good"
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/verify`, { headers: { token } });
        if (res.ok) {
          const userData = await res.json();
          if (userData.role !== "admin" && userData.role !== "superadmin") {
            toast.error("Нямате достъп до тази страница!");
            router.push("/dashboard");
          } else {
            setIsAdmin(true);
            fetchProducts();
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        router.push("/dashboard");
      }
    };
    checkAuth();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      toast.error("Грешка при зареждане на продукти.");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, image_url: e.target.value });
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
        toast.error("Моля, качете файл изображение!");
        return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_URL}/upload`, { 
        method: "POST", 
        body: formData 
      });
      const data = await res.json();
      setInputs((prev) => ({ ...prev, image_url: data.url }));
      toast.success("Снимката е качена успешно!");
    } catch (err) {
      toast.error("Неуспешно качване на снимка.");
    } finally {
      setUploading(false);
      setIsDragging(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Моля, влезте в профила си като администратор!");
        return;
      }

      const bodyData = {
        ...inputs,
        price: parseFloat(inputs.price),
        stock: parseInt(inputs.stock)
      };

      let url = `${API_URL}/products`;
      let method = "POST";

      if (editingId) {
        url = `${API_URL}/products/${editingId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "token": token },
        body: JSON.stringify(bodyData)
      });

      if (response.ok) {
        toast.success(editingId ? "Продуктът е обновен!" : "Продуктът е добавен!");
        resetForm();
        fetchProducts();
      } else {
        toast.error("Грешка! Уверете се, че сте администратор.");
      }
    } catch (err) {
      toast.error("Сървърна грешка.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете този продукт?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { "token": token || "" }
      });

      if (response.ok) {
        toast.success("Продуктът е изтрит успешно.");
        fetchProducts();
      } else {
        toast.error("Грешка при изтриване.");
      }
    } catch (err) {
      toast.error("Сървърна грешка.");
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.product_id);
    setInputs({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url,
      stock: product.stock.toString(),
      condition: product.condition || "good"
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setInputs({ 
        name: "", 
        description: "", 
        price: "", 
        category: "Cassette", 
        image_url: "", 
        stock: "",
        condition: "good" 
    });
  };

  if (!isAdmin) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#ff6b00] font-bold animate-pulse uppercase tracking-widest text-xs">Проверка на права...</div>;

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white p-4 md:p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
            <h1 className="text-xl md:text-3xl font-black text-[#ff6b00] text-center uppercase tracking-tighter italic">
            {editingId ? "Редактиране на продукт" : "Добавяне на нов продукт"}
            </h1>
            <button onClick={() => router.push('/dashboard')} className="text-[10px] md:text-xs text-gray-400 hover:text-[#ff6b00] transition border border-gray-800 bg-[#18181b] px-4 py-2 rounded-lg font-bold uppercase tracking-widest shrink-0">
                Към Дашборд
            </button>
        </div>
        
        {/* === ФОРМА === */}
        <form onSubmit={handleSubmit} className="bg-[#18181b] p-5 md:p-8 rounded-xl shadow-lg border border-[#333] mb-10 md:mb-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-[10px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 uppercase tracking-wider">Име</label>
              <input type="text" name="name" required className="w-full p-2.5 md:p-3 rounded bg-[#0f0f13] border border-[#333] focus:border-[#ff6b00] outline-none text-white transition font-bold text-sm" value={inputs.name} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-[10px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 uppercase tracking-wider">Категория</label>
              <select name="category" className="w-full p-2.5 md:p-3 rounded bg-[#0f0f13] border border-[#333] focus:border-[#ff6b00] outline-none text-white cursor-pointer font-bold text-sm" value={inputs.category} onChange={handleChange}>
                <option value="Cassette">Касета (Cassette)</option>
                <option value="Walkman">Уокмен (Walkman)</option>
                <option value="Deck">Дек (Deck)</option>
                <option value="Accessory">Аксесоари (Accessory)</option>
              </select>
            </div>

            <div className="md:col-span-2">
                <label className="block text-[10px] md:text-xs text-[#ff6b00] font-black mb-1.5 md:mb-2 uppercase tracking-wider">Състояние на продукта</label>
                <select name="condition" className="w-full p-2.5 md:p-3 rounded bg-[#0f0f13] border border-[#ff6b00]/50 focus:border-[#ff6b00] outline-none text-white cursor-pointer font-bold text-sm" value={inputs.condition} onChange={handleChange}>
                    <option value="mint">Като нов (Mint)</option>
                    <option value="new">Нов (New)</option>
                    <option value="good">Добро (Good)</option>
                    <option value="fair">Задоволително (Fair)</option>
                    <option value="parts">За части (For Parts)</option>
                </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 uppercase tracking-wider">Описание</label>
              <textarea name="description" required className="w-full p-2.5 md:p-3 rounded bg-[#0f0f13] border border-[#333] focus:border-[#ff6b00] outline-none text-white h-24 resize-none text-sm" value={inputs.description} onChange={handleChange}></textarea>
            </div>

            <div>
              <label className="block text-[10px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 uppercase tracking-wider">Цена (€)</label>
              <input type="number" step="0.01" name="price" required className="w-full p-2.5 md:p-3 rounded bg-[#0f0f13] border border-[#333] focus:border-[#ff6b00] outline-none text-white font-mono text-sm" value={inputs.price} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-[10px] md:text-xs text-gray-400 font-bold mb-1.5 md:mb-2 uppercase tracking-wider">Наличност (бр.)</label>
              <input type="number" name="stock" required className="w-full p-2.5 md:p-3 rounded bg-[#0f0f13] border border-[#333] focus:border-[#ff6b00] outline-none text-white font-mono text-sm" value={inputs.stock} onChange={handleChange} />
            </div>
          </div>

          {/* === СЕКЦИЯ ЗА СНИМКА === */}
          <div className="mt-6 md:mt-8 bg-[#0f0f13] p-4 md:p-6 rounded-xl border border-[#333]">
             <label className="block text-[10px] md:text-xs text-gray-400 font-bold mb-3 md:mb-4 uppercase tracking-wider">Снимка (Качване или Линк)</label>
             
             <input type="file" id="file-upload" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
             
             <label 
               htmlFor="file-upload"
               onDragEnter={handleDragEnter}
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
               className={`flex flex-col items-center justify-center w-full py-6 md:py-8 border-2 border-dashed rounded-lg cursor-pointer transition group relative ${isDragging ? "border-[#ff6b00] bg-[#18181b]" : "border-[#333] hover:border-[#ff6b00] hover:bg-[#18181b]"}`}
             >
                {uploading ? (
                   <p className="text-[#ff6b00] font-bold animate-pulse pointer-events-none uppercase text-xs">Качване...</p>
                ) : (
                   <div className="flex flex-col items-center gap-2 pointer-events-none text-center px-4">
                      <svg className={`w-6 h-6 md:w-8 md:h-8 transition ${isDragging ? "text-[#ff6b00]" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                        {isDragging ? (
                            <span className="text-[#ff6b00]">Пуснете файла тук</span>
                        ) : (
                            <>Плъзнете или <span className="text-[#ff6b00] underline">качете файл</span></>
                        )}
                      </p>
                   </div>
                )}
             </label>

             <div className="flex items-center my-4 md:my-6">
                <div className="h-px bg-[#333] flex-1"></div>
                <span className="px-3 md:px-4 text-gray-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest">ИЛИ ВРЪЗКА</span>
                <div className="h-px bg-[#333] flex-1"></div>
             </div>

             <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="https://example.com/image.jpg" 
                  className="flex-1 p-2.5 md:p-3 rounded bg-[#18181b] border border-[#333] text-xs md:text-sm text-white focus:border-[#ff6b00] outline-none font-mono"
                  value={inputs.image_url}
                  onChange={handleUrlChange}
                />
             </div>

             {inputs.image_url && (
               <div className="mt-4 flex justify-center bg-white p-2 rounded w-fit mx-auto border border-gray-600">
                  <img src={inputs.image_url} alt="Preview" className="h-24 md:h-32 object-contain" />
               </div>
             )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
            <button type="submit" disabled={loading || uploading} className={`w-full sm:flex-1 py-3 md:py-4 rounded font-black uppercase text-[10px] md:text-sm tracking-widest text-white shadow-lg transition transform hover:-translate-y-1 ${editingId ? "bg-blue-600 hover:bg-blue-500" : "bg-[#ff6b00] hover:bg-[#e65c00] text-black"}`}>
              {loading ? "..." : (editingId ? "Запази Промените" : "Добави Продукт")}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-[#333] rounded font-bold uppercase text-[10px] md:text-sm hover:bg-[#444] text-white transition border border-gray-600">
                Отказ
              </button>
            )}
          </div>
        </form>

        {/* === СПИСЪК С ПРОДУКТИ === */}
        <h2 className="text-lg md:text-xl font-black text-white mb-4 md:mb-6 border-b border-[#333] pb-3 md:pb-4 uppercase tracking-tighter">Налични Продукти</h2>
        
        <div className="flex flex-col gap-3 md:gap-4">
          {products.map((product) => (
            <div key={product.product_id} className="bg-[#18181b] p-3 md:p-4 rounded-xl border border-[#333] hover:border-[#ff6b00] transition flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 group">
              
              <div className="w-full md:w-20 h-32 md:h-20 flex-shrink-0 bg-white rounded p-2 flex items-center justify-center border border-gray-600 overflow-hidden relative">
                  {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                      <span className="text-[10px] text-gray-500 font-bold">NO IMG</span>
                  )}
                  {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-white px-1 py-0.5 -rotate-12">Няма</span>
                      </div>
                  )}
              </div>

              <div className="flex-1 w-full text-center md:text-left min-w-0">
                  <h3 className="font-bold text-white text-sm md:text-lg mb-2 md:mb-1 truncate uppercase tracking-tight group-hover:text-[#ff6b00] transition">{product.name}</h3>
                  <div className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">
                      <span className="bg-[#333] px-2 py-1 rounded text-white">{product.category}</span>
                      <span className="text-[#ff6b00] px-2 py-1">{Number(product.price).toFixed(2)} €</span>
                      <span className={product.stock > 0 ? "text-green-500 px-2 py-1" : "text-red-500 px-2 py-1"}>
                        {product.stock} бр.
                      </span>
                      {product.condition && <span className="text-blue-400 border border-blue-400/30 px-2 py-1 rounded">{product.condition}</span>}
                  </div>
              </div>

              <div className="flex items-center justify-center w-full md:w-auto gap-2 flex-shrink-0 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#333]">
                <button onClick={() => startEdit(product)} className="flex-1 md:flex-none bg-[#222] border border-[#444] hover:bg-[#ff6b00] hover:text-black hover:border-[#ff6b00] text-white text-[10px] font-black uppercase px-3 py-2.5 rounded transition tracking-widest text-center">
                    Редактирай
                </button>
                <button onClick={() => handleDelete(product.product_id)} className="flex-1 md:flex-none bg-red-900/20 border border-red-900/50 hover:bg-red-600 hover:text-white text-red-500 text-[10px] font-black uppercase px-3 py-2.5 rounded transition tracking-widest text-center">
                    Изтрий
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}