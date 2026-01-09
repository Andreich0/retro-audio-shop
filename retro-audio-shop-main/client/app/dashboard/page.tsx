"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState({ first_name: "", last_name: "", email: "" });
  const [orders, setOrders] = useState([]); // Тук ще пазим поръчките
  const [loading, setLoading] = useState(true);

  const logout = (e: any) => {
    e.preventDefault();
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const headers = { token: token };

        // 1. Взимаме данните за потребителя
        const userRes = await fetch("http://localhost:5000/auth/verify", {
          method: "GET",
          headers: headers,
        });
        const userData = await userRes.json();

        // 2. Взимаме историята на поръчките
        const ordersRes = await fetch("http://localhost:5000/orders/mine", {
          method: "GET",
          headers: headers,
        });
        const ordersData = await ordersRes.json();

        if (userRes.ok) {
          setUser(userData);
          setOrders(ordersData); // Запазваме поръчките
          setLoading(false);
        } else {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    getData();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Зареждане...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold text-orange-500">Моят Профил</h1>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Изход
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl mb-4">Добре дошъл, <span className="font-bold">{user.first_name} {user.last_name}</span>!</h2>
          <p className="text-gray-400">Email: {user.email}</p>
        </div>

        <h3 className="text-2xl font-bold mb-4 text-orange-400">История на поръчките</h3>
        
        {orders.length === 0 ? (
           <p className="text-gray-400">Все още нямате направени поръчки.</p>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="p-4">Поръчка #</th>
                  <th className="p-4">Дата</th>
                  <th className="p-4">Адрес</th>
                  <th className="p-4">Сума</th>
                  <th className="p-4">Статус</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.order_id} className="border-t border-gray-700 hover:bg-gray-750">
                    <td className="p-4 font-bold text-orange-500">#{order.order_id}</td>
                    <td className="p-4 text-sm text-gray-300">
                      {new Date(order.created_at).toLocaleDateString("bg-BG")}
                    </td>
                    <td className="p-4 text-sm max-w-xs truncate">{order.address}</td>
                    <td className="p-4 font-bold">{order.total_price} лв.</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                        ${order.status === 'pending' ? 'bg-yellow-600 text-white' : ''}
                        ${order.status === 'shipped' ? 'bg-blue-600 text-white' : ''}
                        ${order.status === 'delivered' ? 'bg-green-600 text-white' : ''}
                      `}>
                        {order.status === 'pending' ? 'Обработва се' : order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}