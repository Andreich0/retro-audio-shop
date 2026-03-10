"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Package, MapPin, ChevronRight, CheckCircle, Truck, XCircle, Clock } from "lucide-react";
import Link from "next/link";

// ДЕФИНИРАМЕ API_URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

interface Order {
  order_id: number;
  created_at: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_city: string;
  customer_address: string;
  total_price: string;
  status: string;
  payment_method: string;
  user_email?: string;
}

interface OrderItem {
  name: string;
  image_url: string;
  quantity: number;
  price_at_purchase: string;
}

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Детайли (Разпъване)
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/login");

        // ИЗПОЛЗВАМЕ API_URL ТУК
        const res = await fetch(`${API_URL}/admin/orders`, {
          headers: { token: token }
        });

        if (res.status === 403) {
            alert("Нямате администраторски права!");
            router.push("/dashboard");
            return;
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  // Функция за смяна на статуса
  const updateStatus = async (id: number, newStatus: string) => {
    try {
        const token = localStorage.getItem("token");
        // ИЗПОЛЗВАМЕ API_URL ТУК
        const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "token": token || ""
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            setOrders(orders.map(o => o.order_id === id ? { ...o, status: newStatus } : o));
        }
    } catch (err) {
        console.error(err);
        alert("Грешка при обновяване.");
    }
  };

  const toggleDetails = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);
    setItemsLoading(true);
    setOrderItems([]); 

    try {
      const token = localStorage.getItem("token");
      // ИЗПОЛЗВАМЕ API_URL ТУК (в оригиналния код сочеше към vercel)
      const res = await fetch(`${API_URL}/orders/${orderId}/items`, {
        headers: { token: token || "" }
      });
      const data = await res.json();
      setOrderItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setItemsLoading(false);
    }
  };

  // Помощна функция за цветовете на статуса
  const getStatusColor = (status: string) => {
    if (!status) return "border-gray-500 text-gray-500";
    switch (status.toLowerCase()) {
      case "new": return "border-purple-500 text-purple-500"; 
      case "pending":
      case "processing": return "border-yellow-500 text-yellow-500";
      case "shipped": return "border-blue-500 text-blue-500"; 
      case "delivered": return "border-green-500 text-green-500";
      case "canceled":
      case "cancelled": return "border-red-500 text-red-500";
      default: return "border-gray-500 text-gray-500";
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Зареждане...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-[#333] pb-6">
            <h1 className="text-3xl font-black uppercase tracking-wider">Админ <span className="text-[#ff6b00]">Поръчки</span></h1>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition">Обратно към Дашборд</Link>
        </div>

        <div className="bg-[#18181b] border border-[#333] rounded-xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#0f0f13] text-gray-400 text-xs uppercase tracking-widest border-b border-[#333]">
                        <th className="p-4">ID</th>
                        <th className="p-4">Клиент</th>
                        <th className="p-4">Адрес</th>
                        <th className="p-4">Метод</th>
                        <th className="p-4">Сума</th>
                        <th className="p-4">Статус (Промяна)</th>
                        <th className="p-4 text-right">Детайли</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#333]">
                    {orders.map((order) => (
                        <Fragment key={order.order_id}>
                            <tr className={`hover:bg-[#222] transition ${expandedOrderId === order.order_id ? 'bg-[#222]' : ''}`}>
                                <td className="p-4 font-mono text-[#ff6b00]">#{order.order_id}</td>
                                <td className="p-4">
                                    <p className="font-bold text-white">{order.customer_first_name} {order.customer_last_name}</p>
                                    <p className="text-xs text-gray-500">{order.created_at.split('T')[0]}</p>
                                    {order.user_email && <p className="text-xs text-[#ff6b00]">{order.user_email}</p>}
                                </td>
                                <td className="p-4 text-sm text-gray-300 max-w-[200px]">
                                    <div className="flex items-start gap-2">
                                        <MapPin size={14} className="mt-1 flex-shrink-0 text-gray-500" />
                                        <span>{order.customer_city}, {order.customer_address}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-xs font-bold uppercase text-gray-400">
                                    {order.payment_method === 'cod' ? 'Наложен платеж' : 'Банков превод'}
                                </td>
                                <td className="p-4 font-bold text-white">{order.total_price} €</td>
                                
                                {/* ПАДАЩО МЕНЮ ЗА СТАТУС */}
                                <td className="p-4">
                                    <select 
                                        value={order.status ? order.status.toLowerCase() : 'new'} 
                                        onChange={(e) => updateStatus(order.order_id, e.target.value)}
                                        className={`bg-[#0a0a0a] border ${getStatusColor(order.status || 'new')} rounded px-2 py-1 text-xs font-bold uppercase outline-none cursor-pointer focus:ring-2 ring-opacity-50`}
                                    >
                                        <option value="new">Приета</option>
                                        <option value="processing">Обработва се</option>
                                        <option value="shipped">Изпратена</option>
                                        <option value="delivered">Доставена</option>
                                        <option value="cancelled">Отказана</option>
                                    </select>
                                </td>

                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => toggleDetails(order.order_id)}
                                        className={`p-2 rounded-full hover:bg-[#333] transition ${expandedOrderId === order.order_id ? 'rotate-90 text-[#ff6b00]' : 'text-gray-400'}`}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </td>
                            </tr>

                            {/* РАЗПЪНАТИ ДЕТАЙЛИ */}
                            {expandedOrderId === order.order_id && (
                                <tr className="bg-[#111]">
                                    <td colSpan={7} className="p-6 border-l-4 border-[#ff6b00]">
                                        <h4 className="text-xs font-bold uppercase text-gray-500 mb-4">Съдържание на поръчка #{order.order_id}</h4>
                                        {itemsLoading ? (
                                            <p className="text-sm text-gray-500">Зареждане...</p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {orderItems.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 bg-[#18181b] p-3 rounded border border-[#333]">
                                                        <img src={item.image_url} className="w-12 h-12 object-contain bg-white rounded" />
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{item.name}</p>
                                                            <p className="text-xs text-gray-400">x{item.quantity} бр. | {item.price_at_purchase} €</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}