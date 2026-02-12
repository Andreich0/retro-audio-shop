"use client";

import React, { useEffect, useState, Fragment } from "react"; 
import { useRouter } from "next/navigation";
import { User, Package, LogOut, MapPin, Calendar, CreditCard, ChevronRight, AlertTriangle, Lock, X } from "lucide-react";

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface OrderItem {
  name: string;
  image_url: string;
  quantity: number;
  price_at_purchase: string;
}

interface Order {
  order_id: number;
  created_at: string;
  customer_address: string;
  customer_city: string;
  total_price: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'new';
}

export default function Dashboard() {
  const router = useRouter();
  
  // State за данни
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State за детайли на поръчка
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // State за СМЯНА НА ПАРОЛА
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "" });
  const [passMessage, setPassMessage] = useState({ type: "", text: "" });

  // --- ПОМОЩНИ ФУНКЦИИ ---
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": case "new": return "Обработва се";
      case "shipped": return "Изпратена";
      case "delivered": return "Доставена";
      case "cancelled": return "Отказ";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": case "new": return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      case "shipped": return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "delivered": return "bg-green-500/10 text-green-500 border border-green-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border border-red-500/20";
      default: return "bg-gray-700 text-gray-300";
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // --- ЛОГИКА ЗА СМЯНА НА ПАРОЛА ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage({ type: "", text: "" });

    try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/auth/change-password", {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                token: token || "" 
            },
            body: JSON.stringify(passData)
        });

        const data = await res.json();

        if (res.ok) {
            setPassMessage({ type: "success", text: "Паролата е променена успешно!" });
            setPassData({ oldPassword: "", newPassword: "" });
            setTimeout(() => setIsPasswordModalOpen(false), 2000); // Затваряме след 2 сек
        } else {
            setPassMessage({ type: "error", text: data });
        }
    } catch (err) {
        setPassMessage({ type: "error", text: "Грешка при свързване със сървъра." });
    }
  };

  // --- ЛОГИКА ЗА ДЕТАЙЛИ НА ПОРЪЧКА ---
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
      const res = await fetch(`http://localhost:5000/orders/${orderId}/items`, {
        headers: { token: token || "" } 
      });
      const data = await res.json();
      setOrderItems(data);
    } catch (err) {
      console.error("Грешка при детайли:", err);
    } finally {
      setItemsLoading(false);
    }
  };

  // --- ГЛАВНО ЗАРЕЖДАНЕ ---
  useEffect(() => {
    const getData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const userRes = await fetch("http://localhost:5000/auth/verify", {
          headers: { token: token }
        });

        const ordersRes = await fetch("http://localhost:5000/orders/mine", {
            headers: { token: token }
        });

        if (!userRes.ok) {
            if (userRes.status === 401 || userRes.status === 403) {
                logout();
                return;
            }
            throw new Error("Неуспешно взимане на профил");
        }

        const userData = await userRes.json();
        const ordersData = await ordersRes.json();

        setUser(userData);
        if (Array.isArray(ordersData)) {
            setOrders(ordersData);
        } else {
            setOrders([]);
        }

      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError(err.message || "Грешка при зареждане");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [router]);

  const totalSpent = orders.reduce((acc, order) => acc + Number(order.total_price), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6b00]"></div>
      </div>
    );
  }

  if (error) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white p-4">
            <AlertTriangle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold mb-2">Възникна грешка</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button onClick={logout} className="bg-[#18181b] px-6 py-2 rounded border border-[#333] hover:bg-red-900/20 hover:text-red-500">
                Изход и нов вход
            </button>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-12 font-sans selection:bg-[#ff6b00] selection:text-black relative">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-800">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic">
              Моят <span className="text-[#ff6b00]">Профил</span>
            </h1>
            <p className="text-gray-400 mt-1 uppercase text-xs tracking-widest">Контролен панел на потребителя</p>
          </div>
          
          <div className="flex gap-3">
             {/* БУТОН ЗА СМЯНА НА ПАРОЛА */}
             <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex items-center gap-2 bg-[#18181b] hover:bg-[#ff6b00]/10 hover:text-[#ff6b00] hover:border-[#ff6b00] transition-all px-5 py-2.5 rounded border border-gray-700 font-bold text-xs uppercase tracking-widest"
             >
                <Lock size={16} /> Парола
             </button>

             <button 
                onClick={logout} 
                className="flex items-center gap-2 bg-[#18181b] hover:bg-red-900/20 hover:text-red-500 hover:border-red-900 transition-all px-5 py-2.5 rounded border border-gray-700 font-bold text-xs uppercase tracking-widest"
             >
                <LogOut size={16} /> Изход
             </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#18181b] p-6 rounded-xl border border-gray-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#ff6b00]/10 rounded text-[#ff6b00]">
                <User size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Потребител</p>
                <h3 className="text-lg font-bold">
                    {user ? `${user.first_name} ${user.last_name}` : "Зареждане..."}
                </h3>
              </div>
            </div>
            <div className="text-xs font-mono text-gray-500 break-all bg-black/40 p-2 rounded">
              {user?.email}
            </div>
          </div>

          <div className="bg-[#18181b] p-6 rounded-xl border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded text-blue-500">
                <Package size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Общо поръчки</p>
                <h3 className="text-2xl font-black">{orders.length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-[#18181b] p-6 rounded-xl border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded text-green-500">
                <CreditCard size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Общо похарчени</p>
                <h3 className="text-2xl font-black">{totalSpent.toFixed(2)} €</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase italic">
            <Calendar size={20} className="text-[#ff6b00]"/> История на поръчките
          </h2>

          {orders.length === 0 ? (
            <div className="bg-[#18181b] border border-gray-800 rounded-xl p-12 text-center font-bold uppercase tracking-widest text-gray-600">
              Нямате направени поръчки
            </div>
          ) : (
            <div className="bg-[#18181b] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-800/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-gray-800">
                      <th className="p-5">ID</th>
                      <th className="p-5">Дата</th>
                      <th className="p-5">Адрес</th>
                      <th className="p-5">Сума</th>
                      <th className="p-5">Статус</th>
                      <th className="p-5 text-right">Детайли</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {orders.map((order) => (
                      <Fragment key={order.order_id}> 
                        <tr 
                          className={`hover:bg-gray-800/30 transition-colors cursor-pointer ${expandedOrderId === order.order_id ? 'bg-[#ff6b00]/5' : ''}`} 
                          onClick={() => toggleDetails(order.order_id)}
                        >
                          <td className="p-5 font-mono text-[#ff6b00] font-bold">#{order.order_id}</td>
                          <td className="p-5 text-sm uppercase">
                            {new Date(order.created_at).toLocaleDateString("bg-BG")}
                          </td>
                          <td className="p-5 text-gray-400 text-xs">
                            <div className="flex items-center gap-1 truncate max-w-[150px]">
                              <MapPin size={12}/> {order.customer_city}, {order.customer_address}
                            </div>
                          </td>
                          <td className="p-5 font-bold text-white whitespace-nowrap">{Number(order.total_price).toFixed(2)} €</td>
                          <td className="p-5">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            <ChevronRight size={18} className={`inline transition-transform ${expandedOrderId === order.order_id ? 'rotate-90 text-[#ff6b00]' : 'text-gray-600'}`} />
                          </td>
                        </tr>

                        {expandedOrderId === order.order_id && (
                            <tr className="bg-black/40 border-b border-gray-800">
                                <td colSpan={6} className="p-6">
                                    <div className="pl-4 border-l-2 border-[#ff6b00]">
                                        <h4 className="text-[10px] font-bold uppercase text-gray-500 mb-4 tracking-widest italic">Продукти в поръчката:</h4>
                                        {itemsLoading ? (
                                            <div className="text-[#ff6b00] animate-pulse text-xs uppercase font-bold">Зареждане...</div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {orderItems.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 bg-[#0a0a0a] p-3 rounded border border-gray-800">
                                                        <img src={item.image_url} alt="" className="w-10 h-10 object-contain bg-white rounded p-1" />
                                                        <div className="flex-grow">
                                                            <p className="font-bold text-xs uppercase text-white leading-tight">{item.name}</p>
                                                            <p className="text-[10px] text-gray-500">КОЛИЧЕСТВО: {item.quantity}</p>
                                                        </div>
                                                        <p className="font-bold text-[#ff6b00] text-sm">{Number(item.price_at_purchase).toFixed(2)} €</p>
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

      {/* --- МОДАЛ ЗА СМЯНА НА ПАРОЛА --- */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#18181b] border border-gray-700 w-full max-w-md rounded-2xl p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <button 
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 uppercase">
                    <Lock className="text-[#ff6b00]" /> Смяна на парола
                </h3>

                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Стара парола</label>
                        <input 
                            type="password"
                            required
                            className="w-full bg-[#0a0a0a] border border-[#333] p-3 rounded text-white focus:border-[#ff6b00] outline-none"
                            value={passData.oldPassword}
                            onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Нова парола</label>
                        <input 
                            type="password"
                            required
                            className="w-full bg-[#0a0a0a] border border-[#333] p-3 rounded text-white focus:border-[#ff6b00] outline-none"
                            value={passData.newPassword}
                            onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                        />
                    </div>

                    {passMessage.text && (
                        <div className={`text-xs font-bold p-3 rounded text-center ${passMessage.type === 'error' ? 'bg-red-900/20 text-red-500' : 'bg-green-900/20 text-green-500'}`}>
                            {passMessage.text}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-[#ff6b00] hover:bg-[#e65c00] text-black font-black uppercase py-4 rounded transition tracking-widest mt-4"
                    >
                        Запази промените
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}