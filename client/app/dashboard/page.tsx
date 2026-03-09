"use client";

import React, { useEffect, useState, Fragment } from "react"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, Package, LogOut, MapPin, Calendar, CreditCard, 
  ChevronRight, AlertTriangle, Lock, X, Eye, EyeOff, 
  KeyRound, ShieldCheck, Edit2, Save, Phone
} from "lucide-react";

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone?: string;
  city?: string;
  address?: string;
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
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'pending' | 'awaiting_payment';
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
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // --- State за РЕДАКЦИЯ НА ПРОФИЛ ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "", last_name: "", phone: "", city: "", address: ""
  });
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  // --- ПОМОЩНИ ФУНКЦИИ ЗА СТАТУС ---
  const getStatusLabel = (status: string) => {
    if (!status) return "Неизвестен";
    switch (status.toLowerCase()) {
      case "new": return "Приета";
      case "awaiting_payment": return "Чака плащане";
      case "pending": 
      case "processing": return "Обработва се";
      case "shipped": return "Изпратена";
      case "delivered": return "Доставена";
      case "canceled":
      case "cancelled": return "Отказана";
      default: return status.toUpperCase();
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-700 text-gray-300 border-gray-600";
    switch (status.toLowerCase()) {
      case "new": return "bg-purple-500/10 text-purple-500 border border-purple-500/20";
      case "awaiting_payment": return "bg-orange-500/10 text-orange-500 border border-orange-500/20";
      case "pending":
      case "processing": return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      case "shipped": return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "delivered": return "bg-green-500/10 text-green-500 border border-green-500/20";
      case "canceled":
      case "cancelled": return "bg-red-500/10 text-red-500 border border-red-500/20";
      default: return "bg-gray-800 text-gray-400 border border-gray-600";
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
            headers: { "Content-Type": "application/json", token: token || "" },
            body: JSON.stringify(passData)
        });

        const data = await res.json();

        if (res.ok) {
            setPassMessage({ type: "success", text: "Паролата е променена успешно!" });
            setPassData({ oldPassword: "", newPassword: "" });
            setTimeout(() => {
                setIsPasswordModalOpen(false);
                setPassMessage({ type: "", text: "" });
                setShowOldPassword(false);
                setShowNewPassword(false);
            }, 2000); 
        } else {
            setPassMessage({ type: "error", text: data });
        }
    } catch (err) {
        setPassMessage({ type: "error", text: "Грешка при свързване със сървъра." });
    }
  };

  // --- ЛОГИКА ЗА ОБНОВЯВАНЕ НА ПРОФИЛ ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", token: token || "" },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();

      if (res.ok) {
        setProfileMessage({ type: "success", text: "Данните са запазени успешно!" });
        setUser(prev => prev ? { ...prev, ...profileData } : null);
        setTimeout(() => {
          setIsEditingProfile(false);
          setProfileMessage({ type: "", text: "" });
        }, 1500);
      } else {
        setProfileMessage({ type: "error", text: data });
      }
    } catch (err) {
      setProfileMessage({ type: "error", text: "Грешка при свързване със сървъра." });
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
      console.error("Грешка:", err);
    } finally {
      setItemsLoading(false);
    }
  };

  // --- НОВО: ОТКАЗВАНЕ НА НЕПЛАТЕНА ПОРЪЧКА ---
  const handleCancelUnpaidOrder = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    if (!confirm("Сигурни ли сте, че искате да анулирате тази неплатена поръчка? Продуктите ще бъдат върнати в наличност.")) return;

    try {
      const res = await fetch(`http://localhost:5000/orders/${orderId}/cancel`, {
        method: "DELETE"
      });

      if (res.ok) {
        setOrders(prevOrders => prevOrders.filter(o => o.order_id !== orderId));
        if (expandedOrderId === orderId) setExpandedOrderId(null);
        alert("Поръчката беше успешно анулирана!");
      } else {
        alert("Възникна грешка при анулирането.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- НОВО: ПОВТОРНО ПЛАЩАНЕ ---
  const handleRetryPayment = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/orders/${orderId}/retry-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": token || "" // <-- ТУК БЕШЕ ГРЕШКАТА, ВЕЧЕ Е ОПРАВЕНО!
        }
      });

      const data = await res.json();
      
      if (res.ok && data.url) {
        window.location.href = data.url; 
      } else {
        alert(data.error || "Възникна грешка при генерирането на линк за плащане.");
      }
    } catch (err) {
      console.error(err);
      alert("Сървърна грешка.");
    }
  };

  // --- ГЛАВНО ЗАРЕЖДАНЕ ---
  useEffect(() => {
    const getData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      try {
        const userRes = await fetch("http://localhost:5000/auth/verify", { headers: { token } });
        const ordersRes = await fetch("http://localhost:5000/orders/mine", { headers: { token } });

        if (!userRes.ok) {
            if (userRes.status === 401 || userRes.status === 403) return logout();
            throw new Error("Неуспешно взимане на профил");
        }

        const userData = await userRes.json();
        const ordersData = await ordersRes.json();

        setUser(userData);
        setProfileData({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          phone: userData.phone || "",
          city: userData.city || "",
          address: userData.address || ""
        });

        if (Array.isArray(ordersData)) setOrders(ordersData);

      } catch (err: any) {
        setError(err.message || "Грешка при зареждане");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [router]);

  // Смятаме само завършените плащания (ако искаш да изключиш тези, които чакат плащане)
  const totalSpent = orders
    .filter(order => order.status !== 'awaiting_payment' && order.status !== 'cancelled')
    .reduce((acc, order) => acc + Number(order.total_price), 0);

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6b00]"></div></div>;

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white p-4">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold mb-2">Възникна грешка</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button onClick={logout} className="bg-[#18181b] px-6 py-2 rounded border border-[#333] hover:bg-red-900/20 hover:text-red-500">Изход и нов вход</button>
    </div>
  );

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

        {/* СЕКЦИЯ ДАННИ ЗА ДОСТАВКА */}
        <div className="bg-[#18181b] border border-gray-800 rounded-xl p-6 md:p-8 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase italic">
              <MapPin size={20} className="text-[#ff6b00]"/> Данни за доставка
            </h2>
            <button 
              onClick={() => {
                  setIsEditingProfile(!isEditingProfile);
                  setProfileMessage({ type: "", text: "" });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${isEditingProfile ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/30 hover:bg-[#ff6b00] hover:text-black'}`}
            >
              {isEditingProfile ? <><X size={14}/> Отказ</> : <><Edit2 size={14}/> Редактирай</>}
            </button>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Име</label>
                    <input type="text" required value={profileData.first_name} onChange={(e) => setProfileData({...profileData, first_name: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Фамилия</label>
                    <input type="text" required value={profileData.last_name} onChange={(e) => setProfileData({...profileData, last_name: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Телефон</label>
                    <input type="text" placeholder="Напр. 0888123456" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none font-mono" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Град</label>
                    <input type="text" placeholder="Напр. София" value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none" />
                </div>
                <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Точен Адрес</label>
                    <input type="text" placeholder="ж.к. Младост, ул. Примерна 12" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 p-3 rounded-lg text-white focus:border-[#ff6b00] outline-none" />
                </div>
              </div>
              
              {profileMessage.text && (
                <div className={`text-xs font-bold p-3 rounded text-center uppercase tracking-widest ${profileMessage.type === 'error' ? 'bg-red-900/20 text-red-500' : 'bg-green-900/20 text-green-500'}`}>
                    {profileMessage.text}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-[#ff6b00] to-[#e65c00] text-black font-black uppercase text-xs tracking-widest px-6 py-3 rounded-lg hover:shadow-[0_0_15px_rgba(255,107,0,0.4)] transition-all">
                  <Save size={16} /> Запази промените
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-fadeIn">
                <div>
                    <p className="text-[10px] uppercase font-bold text-gray-600 tracking-widest mb-1">Имена</p>
                    <p className="font-bold text-white flex items-center gap-2"><User size={14} className="text-gray-500"/> {user?.first_name} {user?.last_name}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-gray-600 tracking-widest mb-1">Телефон</p>
                    <p className="font-bold text-white flex items-center gap-2"><Phone size={14} className="text-gray-500"/> {user?.phone || <span className="text-gray-600 italic font-normal">Не е въведен</span>}</p>
                </div>
                <div className="md:col-span-2">
                    <p className="text-[10px] uppercase font-bold text-gray-600 tracking-widest mb-1">Адрес за доставка</p>
                    <p className="font-bold text-white flex items-center gap-2"><MapPin size={14} className="text-gray-500"/> 
                        {user?.city || user?.address ? `${user?.city ? user.city + ', ' : ''}${user?.address || ''}` : <span className="text-gray-600 italic font-normal">Не е въведен</span>}
                    </p>
                </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase italic">
            <Calendar size={20} className="text-[#ff6b00]"/> История на поръчките
          </h2>

          {orders.length === 0 ? (
            <div className="bg-[#18181b] border border-gray-800 rounded-xl p-16 flex flex-col items-center justify-center text-center shadow-inner">
              <Package size={48} className="text-gray-700 mb-4" />
              <p className="font-bold uppercase tracking-widest text-gray-500 mb-6">
                Все още нямате направени поръчки
              </p>
              <Link 
                href="/shop" 
                className="bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black uppercase text-xs tracking-widest px-8 py-4 rounded-xl transition-all transform hover:-translate-y-1 shadow-[0_5px_15px_rgba(255,107,0,0.3)]"
              >
                Разгледай каталога
              </Link>
            </div>
          ) : (
            <div className="bg-[#18181b] border border-gray-800 rounded-xl overflow-hidden shadow-2xl max-h-[600px] overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-gray-900 z-10">
                    <tr className="bg-gray-800/80 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-gray-800 backdrop-blur-md">
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
                          
                          {/* КОЛОНА ЗА СТАТУС И БУТОНИ */}
                          <td className="p-5">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                                {getStatusLabel(order.status)}
                              </span>
                              
                              {/* Добавяме .toLowerCase() за да сме сигурни, че винаги ще хваща статуса! */}
                              {order.status?.toLowerCase() === 'awaiting_payment' && (
                                <div className="flex gap-2">
                                    <button
                                      onClick={(e) => handleRetryPayment(order.order_id, e)}
                                      className="text-[10px] bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/30 hover:bg-[#ff6b00] hover:text-black px-3 py-1 rounded font-bold uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(255,107,0,0.1)]"
                                      title="Продължи към плащане"
                                    >
                                      Плати
                                    </button>
                                    <button
                                      onClick={(e) => handleCancelUnpaidOrder(order.order_id, e)}
                                      className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white px-3 py-1 rounded font-bold uppercase tracking-widest transition-all"
                                      title="Откажи поръчката и върни продуктите"
                                    >
                                      Откажи
                                    </button>
                                </div>
                              )}
                            </div>
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

      {/* МОДАЛ ЗА СМЯНА НА ПАРОЛА */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-opacity">
            <div className="bg-[#0f0f13] border border-[#ff6b00]/20 w-full max-w-md rounded-2xl p-8 relative shadow-[0_0_50px_rgba(255,107,0,0.1)] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent opacity-70"></div>

                <button 
                    onClick={() => {
                        setIsPasswordModalOpen(false);
                        setPassMessage({ type: "", text: "" }); 
                        setShowOldPassword(false);
                        setShowNewPassword(false);
                    }}
                    className="absolute top-4 right-4 text-gray-500 hover:text-[#ff6b00] hover:bg-[#ff6b00]/10 p-2 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8 mt-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/20 mb-4 shadow-[0_0_20px_rgba(255,107,0,0.2)]">
                        <Lock size={32} className="text-[#ff6b00]" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-wider italic">
                        Сигурност
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">Обновяване на паролата</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Текуща парола</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#ff6b00] transition-colors">
                                <KeyRound size={18} />
                            </div>
                            <input 
                                type={showOldPassword ? "text" : "password"}
                                required
                                placeholder="Въведете текущата парола..."
                                className="w-full bg-[#18181b] border border-gray-800 p-4 pl-12 pr-12 rounded-xl text-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none transition-all text-sm font-mono placeholder:font-sans placeholder:text-gray-600"
                                value={passData.oldPassword}
                                onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                            >
                                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Нова парола</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#ff6b00] transition-colors">
                                <ShieldCheck size={18} />
                            </div>
                            <input 
                                type={showNewPassword ? "text" : "password"}
                                required
                                placeholder="Създайте нова парола..."
                                className="w-full bg-[#18181b] border border-gray-800 p-4 pl-12 pr-12 rounded-xl text-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none transition-all text-sm font-mono placeholder:font-sans placeholder:text-gray-600"
                                value={passData.newPassword}
                                onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {passMessage.text && (
                        <div className={`text-xs font-bold p-4 rounded-xl text-center uppercase tracking-widest border transition-all ${passMessage.type === 'error' ? 'bg-red-900/10 text-red-500 border-red-900/30' : 'bg-green-900/10 text-green-500 border-green-900/30'}`}>
                            {passMessage.text}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black uppercase py-4 rounded-xl shadow-[0_5px_15px_rgba(255,107,0,0.3)] hover:shadow-[0_8px_25px_rgba(255,107,0,0.5)] transition-all tracking-widest mt-4 transform hover:-translate-y-1"
                    >
                        Актуализирай
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}