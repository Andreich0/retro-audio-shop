"use client";

import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ShopPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/products");
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error("Грешка при зареждане:", err);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-orange-500">
        Каталог Ретро Аудио
      </h1>

      {loading ? (
        <p className="text-center">Зареждане на касетите...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product: any) => (
            <div 
              key={product.product_id} 
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:border-orange-500 transition-all duration-300 flex flex-col"
            >
              {/* Снимка */}
              <div className="h-64 overflow-hidden relative bg-white">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-contain p-4 transition-transform duration-500 hover:scale-110"
                />
              </div>

              {/* Информация */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <span className="bg-gray-700 text-xs px-2 py-1 rounded text-gray-300 uppercase tracking-wide">
                        {product.category}
                    </span>
                    {product.stock < 3 && product.stock > 0 && (
                        <span className="text-red-400 text-xs font-bold animate-pulse">
                            Остават само {product.stock}!
                        </span>
                    )}
                </div>
                
                <h2 className="text-xl font-bold mb-2">{product.name}</h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                    {product.description}
                </p>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                  <span className="text-2xl font-bold text-white">
                    {product.price} лв.
                  </span>
                  <button onClick={() => addToCart(product)} disabled={product.stock === 0} // Ако е 0, бутонът се изключва 
                    className={`font-bold py-2 px-4 rounded shadow-md transform transition ${
                    product.stock === 0 
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed" // Стил за изчерпано
                    : "bg-orange-500 hover:bg-orange-600 text-white active:scale-95" // Стил за активно
                     }`}>
                        {product.stock === 0 ? "Изчерпано" : "Купи"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}