"use client";

import { useCart } from "../../context/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Ако количката е празна, не трябва да сме тук
  if (items.length === 0) {
    return <div className="p-10 text-white text-center">Количката е празна.</div>;
  }

  const handleOrder = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Моля, влезте в профила си, за да поръчате!");
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token, // Пращаме токена, за да знае сървърът кой поръчва
        },
        body: JSON.stringify({
          items: items,
          total_price: cartTotal,
          address: address,
        }),
      });

      if (response.ok) {
        alert("Честито! Поръчката ви е приета.");
        clearCart(); // Изчистваме количката
        router.push("/dashboard"); // Пращаме го в профила да си види поръчката (ще го довършим после)
      } else {
        alert("Възникна грешка при поръчката.");
      }
    } catch (err) {
      console.error(err);
      alert("Сървърна грешка.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-orange-500">Финализиране на поръчката</h1>
        
        <div className="mb-6 p-4 bg-gray-700 rounded">
          <h2 className="text-xl font-bold mb-2">Обобщение</h2>
          {items.map(item => (
            <div key={item.product_id} className="flex justify-between text-gray-300 text-sm mb-1">
              <span>{item.name} (x{item.quantity})</span>
              <span>{(item.price * item.quantity).toFixed(2)} лв.</span>
            </div>
          ))}
          <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between font-bold text-white text-lg">
            <span>Общо за плащане:</span>
            <span>{cartTotal.toFixed(2)} лв.</span>
          </div>
        </div>

        <form onSubmit={handleOrder}>
          <label className="block mb-2 font-bold">Адрес за доставка (Еконт/Спиди/Адрес):</label>
          <textarea
            required
            className="w-full p-3 rounded bg-gray-900 border border-gray-600 focus:border-orange-500 outline-none mb-6 h-32"
            placeholder="Гр. София, офис Еконт Център..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded font-bold text-xl transition ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {loading ? "Обработване..." : "ПОРЪЧАЙ СЕГА"}
          </button>
        </form>
      </div>
    </div>
  );
}