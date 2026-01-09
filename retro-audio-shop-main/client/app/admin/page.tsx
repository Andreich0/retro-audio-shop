"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

// Интерфейс за данните
interface Product {
  product_id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  stock: string;
}

export default function AdminPage() {
  const router = useRouter();
  
  // Списък с продукти
  const [products, setProducts] = useState<Product[]>([]);
  
  // Състояние на формата
  const [inputs, setInputs] = useState({
    name: "",
    description: "",
    price: "",
    category: "Cassette",
    image_url: "",
    stock: ""
  });

  // ID на продукта, който редактираме (ако е null, значи създаваме нов)
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 1. Взимане на всички продукти при зареждане
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
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

  // Качване на снимка
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/upload", { method: "POST", body: formData });
      const data = await res.json();
      setInputs((prev) => ({ ...prev, image_url: data.url }));
    } catch (err) {
      alert("Неуспешно качване на снимка.");
    } finally {
      setUploading(false);
    }
  };

  // ИЗПРАЩАНЕ НА ФОРМАТА (СЪЗДАВАНЕ ИЛИ РЕДАКТИРАНЕ)
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

      let url = "http://localhost:5000/products";
      let method = "POST";

      // Ако редактираме, сменяме URL и метода
      if (editingId) {
        url = `http://localhost:5000/products/${editingId}`;
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
        fetchProducts(); // Обновяваме списъка
      } else {
        alert("Грешка! Уверете се, че сте администратор.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ИЗТРИВАНЕ
  const handleDelete = async (id: number) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете този продукт?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/products/${id}`, {
        method: "DELETE",
        headers: { "token": token || "" }
      });

      if (response.ok) {
        fetchProducts(); // Махаме го от списъка веднага
      } else {
        alert("Грешка при изтриване.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ЗАПОЧВАНЕ НА РЕДАКЦИЯ
  const startEdit = (product: Product) => {
    setEditingId(product.product_id);
    setInputs({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url,
      stock: product.stock.toString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Скролваме горе до формата
  };

  const resetForm = () => {
    setEditingId(null);
    setInputs({ name: "", description: "", price: "", category: "Cassette", image_url: "", stock: "" });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-orange-500 mb-8 text-center">
          {editingId ? "РЕДАКТИРАНЕ НА ПРОДУКТ" : "ДОБАВЯНЕ НА НОВ ПРОДУКТ"}
        </h1>
        
        {/* ФОРМА */}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400">Име</label>
              <input type="text" name="name" required className="w-full p-2 rounded bg-gray-900 border border-gray-600" value={inputs.name} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm text-gray-400">Категория</label>
              <select name="category" className="w-full p-2 rounded bg-gray-900 border border-gray-600" value={inputs.category} onChange={handleChange}>
                <option value="Cassette">Касета</option>
                <option value="Walkman">Уокмен</option>
                <option value="Deck">Дек</option>
                <option value="Accessory">Аксесоар</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400">Описание</label>
              <textarea name="description" required className="w-full p-2 rounded bg-gray-900 border border-gray-600 h-20" value={inputs.description} onChange={handleChange}></textarea>
            </div>
            <div>
              <label className="block text-sm text-gray-400">Цена (лв.)</label>
              <input type="number" step="0.01" name="price" required className="w-full p-2 rounded bg-gray-900 border border-gray-600" value={inputs.price} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm text-gray-400">Наличност (бр.)</label>
              <input type="number" name="stock" required className="w-full p-2 rounded bg-gray-900 border border-gray-600" value={inputs.stock} onChange={handleChange} />
            </div>
          </div>

          <div className="mt-4 p-4 border border-dashed border-gray-600 rounded">
            <label className="block mb-2 text-sm text-orange-400">Снимка (PNG, JPG, JPEG)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-400 file:mr-4 file:py-1 file:px-4 file:rounded-full file:bg-orange-600 file:text-white file:border-0 hover:file:bg-orange-500 cursor-pointer" />
            {uploading && <p className="text-yellow-400 text-xs mt-1">Качване...</p>}
            {inputs.image_url && <img src={inputs.image_url} alt="Preview" className="h-20 mt-2 object-contain" />}
          </div>

          <div className="flex gap-4 mt-6">
            <button type="submit" disabled={loading || uploading} className={`flex-1 py-3 rounded font-bold ${editingId ? "bg-blue-600 hover:bg-blue-500" : "bg-green-600 hover:bg-green-500"}`}>
              {loading ? "..." : (editingId ? "ЗАПАЗИ ПРОМЕНИТЕ" : "ДОБАВИ")}
            </button>
            
            {editingId && (
              <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-600 rounded font-bold hover:bg-gray-500">
                ОТКАЗ
              </button>
            )}
          </div>
        </form>

        {/* СПИСЪК С ПРОДУКТИ */}
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Налични Продукти</h2>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.product_id} className="bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between border border-gray-700">
              <div className="flex items-center gap-4 w-full md:w-auto">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded bg-gray-900" />
                    ) : (
                    <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500">
                        Няма
                    </div>
                        )}
                <div>
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-gray-400 text-sm">{product.category} | {product.price} лв. | Наличност: {product.stock}</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4 md:mt-0">
                <button onClick={() => startEdit(product)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold">
                  РЕДАКТИРАЙ
                </button>
                <button onClick={() => handleDelete(product.product_id)} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-bold">
                  ИЗТРИЙ
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}