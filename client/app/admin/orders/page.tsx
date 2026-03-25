"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Package, MapPin, ChevronRight, CheckCircle, Truck, XCircle, Clock, Mail } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

interface Order {
  order_id: number;
  created_at: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_city: string;
  customer_address: string;
  customer_phone: string;
  total_price: string;
  status: string;
  payment_method: string;
  user_email?: string;
  customer_email?: string;
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
  
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/login");

        const res = await fetch(`${API_URL}/admin/orders`, {
          headers: { token: token }
        });

        if (res.status === 403) {
            toast.error("Нямате администраторски права!");
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

  const updateStatus = async (id: number, newStatus: string) => {
    try {
        const token = localStorage.getItem("token");
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
        toast.error("Грешка при обновяване.");
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

  const getStatusColor = (status: string) => {
    if (!status) return "border-gray-500 text-gray-500 bg-[#18181b]";
    switch (status.toLowerCase()) {
      case "new": return "border-purple-500/50 text-purple-400 bg-purple-500/10"; 
      case "awaiting_payment": return "border-orange-500/50 text-orange-400 bg-orange-500/10";
      case "pending":
      case "processing": return "border-yellow-500/50 text-yellow-400 bg-yellow-500/10";
      case "shipped": return "border-blue-500/50 text-blue-400 bg-blue-500/10"; 
      case "delivered": return "border-green-500/50 text-green-400 bg-green-500/10";
      case "canceled":
      case "cancelled": return "border-red-500/50 text-red-400 bg-red-500/10";
      default: return "border-gray-500/50 text-gray-400 bg-gray-500/10";
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#ff6b00] text-xs md:text-sm uppercase font-bold tracking-widest animate-pulse">Зареждане...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-4 md:p-8 font-sans selection:bg-[#ff6b00] selection:text-black">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-10 border-b border-[#333] pb-4 md:pb-6">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider italic">Админ <span className="text-[#ff6b00]">Поръчки</span></h1>
            <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest hidden sm:inline-block">
                    Общо: <span className="text-white">{orders.length}</span>
                </span>
                <Link href="/dashboard" className="w-full md:w-auto text-center text-[10px] md:text-xs text-gray-400 hover:text-white transition border border-[#333] hover:border-gray-500 bg-[#18181b] px-4 md:px-6 py-2.5 rounded-lg font-bold uppercase tracking-widest">
                    Към Профил
                </Link>
            </div>
        </div>

        {orders.length === 0 ? (
            <div className="bg-[#18181b] border border-[#333] rounded-xl p-10 md:p-16 flex flex-col items-center justify-center text-center">
                <Package size={48} className="text-gray-600 mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Няма намерени поръчки</p>
            </div>
        ) : (
            <div className="bg-[#18181b] border border-[#333] rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-[#0f0f13] text-gray-500 text-[9px] md:text-[10px] uppercase font-bold tracking-widest border-b border-[#333]">
                                <th className="p-4 md:p-5">ID / Дата</th>
                                <th className="p-4 md:p-5">Клиент / Контакти</th>
                                <th className="p-4 md:p-5">Адрес за доставка</th>
                                <th className="p-4 md:p-5">Плащане</th>
                                <th className="p-4 md:p-5">Сума</th>
                                <th className="p-4 md:p-5">Статус</th>
                                <th className="p-4 md:p-5 text-right">Детайли</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#222] text-xs md:text-sm">
                            {orders.map((order) => (
                                <Fragment key={order.order_id}>
                                    <tr className={`hover:bg-[#222]/50 transition cursor-pointer ${expandedOrderId === order.order_id ? 'bg-[#222]/80' : ''}`} onClick={() => toggleDetails(order.order_id)}>
                                        <td className="p-4 md:p-5">
                                            <p className="font-mono text-[#ff6b00] font-black text-sm">#{order.order_id}</p>
                                            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">{new Date(order.created_at).toLocaleDateString("bg-BG")} {new Date(order.created_at).toLocaleTimeString("bg-BG", {hour: '2-digit', minute:'2-digit'})}</p>
                                        </td>
                                        
                                        <td className="p-4 md:p-5">
                                            <p className="font-bold text-white uppercase tracking-wider text-xs">{order.customer_first_name} {order.customer_last_name}</p>
                                            <div className="mt-1.5 space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                                    <Mail size={10} className="text-gray-500"/>
                                                    {/* Показваме customer_email от новата колона, ако няма - резервния вариант user_email */}
                                                    <span className="truncate max-w-[150px] font-mono">{order.customer_email || order.user_email || 'Няма имейл'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                                    <Clock size={10} className="text-gray-500"/> {/* Замествам Phone с Clock временно, ако не си импортнал Phone */}
                                                    <span className="font-mono">{order.customer_phone || 'Няма телефон'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="p-4 md:p-5 text-gray-300 max-w-[180px] md:max-w-[250px]">
                                            <div className="flex items-start gap-2">
                                                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-[#ff6b00]" />
                                                <div>
                                                    <p className="font-bold text-[10px] uppercase text-gray-400">{order.customer_city}</p>
                                                    <p className="text-[10px] md:text-xs truncate mt-0.5 text-gray-300 leading-snug" title={order.customer_address}>{order.customer_address}</p>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="p-4 md:p-5">
                                            <span className={`inline-block px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${order.payment_method === 'cod' ? 'bg-[#ff6b00]/10 text-[#ff6b00] border-[#ff6b00]/30' : order.payment_method === 'card' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-gray-800 text-gray-300 border-gray-600'}`}>
                                                {order.payment_method === 'cod' ? 'Наложен' : order.payment_method === 'card' ? 'Stripe' : 'Банка'}
                                            </span>
                                        </td>
                                        
                                        <td className="p-4 md:p-5 font-black text-white text-sm md:text-base whitespace-nowrap">
                                            {Number(order.total_price).toFixed(2)} <span className="text-[10px] text-gray-500">€</span>
                                        </td>
                                        
                                        <td className="p-4 md:p-5" onClick={(e) => e.stopPropagation()}>
                                            <select 
                                                value={order.status ? order.status.toLowerCase() : 'new'} 
                                                onChange={(e) => updateStatus(order.order_id, e.target.value)}
                                                className={`border rounded-lg px-2.5 py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer focus:ring-2 focus:ring-[#ff6b00]/50 transition-colors shadow-sm w-full md:w-auto appearance-none ${getStatusColor(order.status || 'new')}`}
                                            >
                                                <option value="new" className="bg-[#18181b] text-white">Нова (Приета)</option>
                                                <option value="awaiting_payment" className="bg-[#18181b] text-white">Чака плащане</option>
                                                <option value="processing" className="bg-[#18181b] text-white">Обработва се</option>
                                                <option value="shipped" className="bg-[#18181b] text-white">Изпратена</option>
                                                <option value="delivered" className="bg-[#18181b] text-white">Доставена</option>
                                                <option value="cancelled" className="bg-[#18181b] text-white">Отказана</option>
                                            </select>
                                        </td>

                                        <td className="p-4 md:p-5 text-right">
                                            <div className={`inline-block p-1.5 md:p-2 rounded-full transition-colors ${expandedOrderId === order.order_id ? 'bg-[#ff6b00]/20' : 'hover:bg-[#333]'}`}>
                                                <ChevronRight size={18} className={`transition-transform duration-200 ${expandedOrderId === order.order_id ? 'rotate-90 text-[#ff6b00]' : 'text-gray-400'}`} />
                                            </div>
                                        </td>
                                    </tr>

                                    {expandedOrderId === order.order_id && (
                                        <tr className="bg-[#0f0f13] border-b border-[#333] shadow-inner">
                                            <td colSpan={7} className="p-4 md:p-6">
                                                <div className="pl-3 md:pl-5 border-l-2 border-[#ff6b00]">
                                                    <h4 className="text-[9px] md:text-[10px] font-bold uppercase text-gray-500 mb-3 md:mb-4 tracking-widest italic flex items-center gap-2">
                                                        <Package size={14} className="text-[#ff6b00]" /> Продукти в поръчката:
                                                    </h4>
                                                    
                                                    {itemsLoading ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-pulse">
                                                            <div className="h-16 bg-[#18181b] border border-[#222] rounded-lg"></div>
                                                            <div className="h-16 bg-[#18181b] border border-[#222] rounded-lg"></div>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                                            {orderItems.map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-3 bg-[#18181b] p-2.5 md:p-3 rounded-lg border border-[#222] hover:border-[#333] transition-colors">
                                                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded flex items-center justify-center p-1 shrink-0 border border-[#333]">
                                                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                                                                    </div>
                                                                    <div className="min-w-0 flex-grow">
                                                                        <p className="text-[10px] md:text-xs font-bold text-white uppercase truncate tracking-wide leading-tight" title={item.name}>{item.name}</p>
                                                                        <p className="text-[9px] md:text-[10px] text-gray-500 mt-1 font-mono">
                                                                            КОЛ: <span className="text-gray-300">{item.quantity}</span>
                                                                        </p>
                                                                    </div>
                                                                    <span className="font-black text-[#ff6b00] text-xs md:text-sm whitespace-nowrap shrink-0">{Number(item.price_at_purchase).toFixed(2)} €</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}