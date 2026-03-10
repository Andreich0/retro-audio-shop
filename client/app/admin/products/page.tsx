"use client";

import { useState, useEffect, ChangeEvent, FormEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";

// Интерфейс за данните (Добавихме condition)
interface Product {
  product_id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  stock: string;
  condition?: string; // <--- НОВО ПОЛЕ
}

export default function AdminPage() {
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  
  const [inputs, setInputs] = useState({
    name: "",
    description: "",
    price: "",
    category: "Cassette",
    image_url: "",
    stock: "",
    condition: "good" // <--- НОВО ПОЛЕ (по подразбиране)
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 1. Взимане на всички продукти
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://retro-audio-shop.vercel.app/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, image_url: e.target.value });
  };

  // --- ЛОГИКА ЗА КАЧВАНЕ ---
  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
        alert("Моля, качете файл изображение!");
        return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://retro-audio-shop.vercel.app/upload", { method: "POST", body: formData });
      const data = await res.json();
      setInputs((prev) => ({ ...prev, image_url: data.url }));
    } catch (err) {
      alert("Неуспешно качване на снимка.");
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

  // ИЗПРАЩАНЕ НА ФОРМАТА
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Моля, влезте в профила си!");
        return;
      }

      const bodyData = {
        ...inputs,
        price: parseFloat(inputs.price),
        stock: parseInt(inputs.stock)
      };

      let url = "http://retro-audio-shop.vercel.app/products";
      let method = "POST";

      if (editingId) {
        url = `http://retro-audio-shop.vercel.app/products/${editingId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "token": token },
        body: JSON.stringify(bodyData)
      });

      if (response.ok) {
        alert(editingId ? "Продуктът е обновен!" : "Продуктът е добавен!");
        resetForm();
        fetchProducts();
      } else {
        alert("Грешка! Уверете се, че сте администратор.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете този продукт?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://retro-audio-shop.vercel.app/products/${id}`, {
        method: "DELETE",
        headers: { "token": token || "" }
      });

      if (response.ok) {
        fetchProducts();
      } else {
        alert("Грешка при изтриване.");
      }
    } catch (err) {
      console.error(err);
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
      condition: product.condition || "good" // <--- Зареждаме текущото състояние
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

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-black text-[#ff6b00] mb-8 text-center uppercase tracking-tighter italic">
          {editingId ? "Редактиране на продукт" : "Добавяне на нов продукт"}
        </h1>
        
        {/* === ФОРМА === */}
        <form onSubmit={handleSubmit} className="bg-[#18181b] p-8 rounded-xl shadow-lg border border-[#333] mb-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-400 font-bold mb-2 uppercase tracking-wider">Име</label>
              <input type="text" name="name" required className="w-full p-3 rounded bg-[#0f0f13] border border-[#333] focus:border-[#ff6b00] outline-none text-white transition font-bold" value={inputs.name} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-bold mb-2 uppercase tracking-wider">Категория</label>
              <select name="category" className="w-full p-3 rounded bg-[#0f0f13] border border-[#333] focus:border-[#ff6b00] outline-none text-white cursor-pointer font-bold" value={inputs.category} onChange={handleChange}>
                <option value="Cassette">Касета (Cassette)</option>
                <option value="Walkman">Уокмен (Walkman)</option>
                <option value="Deck">Дек (Deck)</option>
                <option value="Accessory">Аксесоари (Accessory)</option>
              </select>
            </div>

            {/* --- НОВО: ПОЛЕ ЗА СЪСТОЯНИЕ --- */}
            <div className="md:col-span-2">
                <label className="block text-xs text-[#ff6b00] font-black mb-2 uppercase tracking-wider">Състояние на продукта</label>
                <select name="condition" className="w-full p-3 rounded bg-[#0f0f13] border border-[#ff6b00]/50 focus:border-[#ff6b00] outline-none text-white cursor-pointer font-bold" value={inputs.condition} onChange={handleChange}>
                    <option value="mint">Като нов (Mint)</option>
                    <option value="new">Нов (New)</option>
                    <option value="good">Добро (Good)</option>
                    <option value="fair">Задоволително (Fair)</option>
                    <option value="parts">За части (For Parts)</option>
                </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 font-bold mb-2 uppercase tracking-wider">Описание</label>
              <textarea name="description" required className="w-full p-3 rounded bg-[#0f0f13] border border-[#333] focus:border-[#ff6b00] outline-none text-white h-24 resize-none text-sm" value={inputs.description} onChange={handleChange}></textarea>
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-bold mb-2 uppercase tracking-wider">Цена (€)</label>
              <input type="number" step="0.01" name="price" required className="w-full p-3 rounded bg-[#0f0f13] border border-[#333] focus:border-[#ff6b00] outline-none text-white font-mono" value={inputs.price} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-bold mb-2 uppercase tracking-wider">Наличност (бр.)</label>
              <input type="number" name="stock" required className="w-full p-3 rounded bg-[#0f0f13] border border-[#333] focus:border-[#ff6b00] outline-none text-white font-mono" value={inputs.stock} onChange={handleChange} />
            </div>
          </div>

          {/* === СЕКЦИЯ ЗА СНИМКА === */}
          <div className="mt-8 bg-[#0f0f13] p-6 rounded-xl border border-[#333]">
             <label className="block text-xs text-gray-400 font-bold mb-4 uppercase tracking-wider">Снимка (Качване или Линк)</label>
             
             <input type="file" id="file-upload" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
             
             <label 
               htmlFor="file-upload"
               onDragEnter={handleDragEnter}
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
               className={`flex flex-col items-center justify-center w-full py-8 border-2 border-dashed rounded-lg cursor-pointer transition group relative ${isDragging ? "border-[#ff6b00] bg-[#18181b]" : "border-[#333] hover:border-[#ff6b00] hover:bg-[#18181b]"}`}
             >
                {uploading ? (
                   <p className="text-[#ff6b00] font-bold animate-pulse pointer-events-none uppercase text-xs">Качване...</p>
                ) : (
                   <div className="flex flex-col items-center gap-2 pointer-events-none">
                      <svg className={`w-8 h-8 transition ${isDragging ? "text-[#ff6b00]" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        {isDragging ? (
                            <span className="text-[#ff6b00]">Пуснете файла тук</span>
                        ) : (
                            <>Плъзнете или <span className="text-[#ff6b00] underline">качете файл</span></>
                        )}
                      </p>
                   </div>
                )}
             </label>

             <div className="flex items-center my-6">
                <div className="h-px bg-[#333] flex-1"></div>
                <span className="px-4 text-gray-600 text-[10px] font-black uppercase tracking-widest">ИЛИ ВРЪЗКА</span>
                <div className="h-px bg-[#333] flex-1"></div>
             </div>

             <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="https://example.com/image.jpg" 
                  className="flex-1 p-3 rounded bg-[#18181b] border border-[#333] text-sm text-white focus:border-[#ff6b00] outline-none font-mono"
                  value={inputs.image_url}
                  onChange={handleUrlChange}
                />
             </div>

             {inputs.image_url && (
               <div className="mt-4 flex justify-center bg-white p-2 rounded w-fit mx-auto">
                  <img src={inputs.image_url} alt="Preview" className="h-32 object-contain" />
               </div>
             )}
          </div>

          <div className="flex gap-4 mt-8">
            <button type="submit" disabled={loading || uploading} className={`flex-1 py-4 rounded font-black uppercase text-sm tracking-widest text-white shadow-lg transition transform hover:-translate-y-1 ${editingId ? "bg-blue-600 hover:bg-blue-500" : "bg-[#ff6b00] hover:bg-[#e65c00] text-black"}`}>
              {loading ? "..." : (editingId ? "Запази Промените" : "Добави Продукт")}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-8 py-4 bg-[#333] rounded font-bold uppercase text-sm hover:bg-[#444] text-white transition border border-gray-600">
                Отказ
              </button>
            )}
          </div>
        </form>

        {/* === СПИСЪК С ПРОДУКТИ === */}
        <h2 className="text-xl font-black text-white mb-6 border-b border-[#333] pb-4 uppercase tracking-tighter">Налични Продукти</h2>
        
        <div className="flex flex-col gap-4">
          {products.map((product) => (
            <div key={product.product_id} className="bg-[#18181b] p-4 rounded-xl border border-[#333] hover:border-[#ff6b00] transition flex flex-col md:flex-row items-center gap-6 group">
              
              <div className="w-20 h-20 flex-shrink-0 bg-white rounded p-1 flex items-center justify-center border border-gray-600 overflow-hidden">
                  {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                      <span className="text-[10px] text-gray-500 font-bold">NO IMG</span>
                  )}
              </div>

              <div className="flex-1 w-full text-center md:text-left min-w-0">
                  <h3 className="font-bold text-white text-lg mb-1 truncate uppercase tracking-tight group-hover:text-[#ff6b00] transition">{product.name}</h3>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-xs text-gray-400 font-bold uppercase tracking-wider">
                      <span className="bg-[#333] px-2 py-1 rounded text-white">{product.category}</span>
                      <span className="text-[#ff6b00]">{product.price} €</span>
                      <span className={parseInt(product.stock) > 0 ? "text-green-500" : "text-red-500"}>
                        {product.stock} бр.
                      </span>
                      {product.condition && <span className="text-blue-400 border border-blue-400/30 px-2 py-1 rounded">{product.condition}</span>}
                  </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => startEdit(product)} className="bg-[#222] border border-[#444] hover:bg-[#ff6b00] hover:text-black hover:border-[#ff6b00] text-white text-[10px] font-black uppercase px-4 py-3 rounded transition tracking-widest">
                    Редактирай
                </button>
                <button onClick={() => handleDelete(product.product_id)} className="bg-red-900/20 border border-red-900/50 hover:bg-red-600 hover:text-white text-red-500 text-[10px] font-black uppercase px-4 py-3 rounded transition tracking-widest">
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