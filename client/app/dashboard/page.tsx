"use client";

import React, { useEffect, useState, Fragment } from "react"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, Package, LogOut, MapPin, Calendar, CreditCard, 
  ChevronRight, AlertTriangle, Lock, X, Eye, EyeOff, 
  KeyRound, ShieldCheck, Edit2, Save, Phone
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

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
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // --- PASSWORD MODAL STATES ---
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passMessage, setPassMessage] = useState({ type: "", text: "" });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- PROFILE EDIT STATES ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "", last_name: "", phone: "", city: "", address: ""
  });
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

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
    localStorage.removeItem("role"); 
    router.push("/auth");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage({ type: "", text: "" });

    // ВАЛИДАЦИЯ: Проверка дали двете нови пароли съвпадат
    if (passData.newPassword !== passData.confirmPassword) {
        setPassMessage({ type: "error", text: "Новите пароли не съвпадат!" });
        return;
    }

    try {
        const token = localStorage.getItem("token");
        
        // Пращаме само oldPassword и newPassword към API-то
        const payload = {
            oldPassword: passData.oldPassword,
            newPassword: passData.newPassword
        };

        const res = await fetch(`${API_URL}/auth/change-password`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", token: token || "" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            setPassMessage({ type: "success", text: "Паролата е променена успешно!" });
            setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
            setTimeout(() => {
                setIsPasswordModalOpen(false);
                setPassMessage({ type: "", text: "" });
                setShowOldPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
            }, 2000); 
        } else {
            setPassMessage({ type: "error", text: data });
        }
    } catch (err) {
        setPassMessage({ type: "error", text: "Грешка при свързване със сървъра." });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/profile`, {
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
      console.error("Грешка:", err);
    } finally {
      setItemsLoading(false);
    }
  };

  const handleCancelUnpaidOrder = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    if (!confirm("Сигурни ли сте, че искате да анулирате тази неплатена поръчка? Продуктите ще бъдат върнати в наличност.")) return;

    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: "DELETE"
      });

      if (res.ok) {
        setOrders(prevOrders => prevOrders.filter(o => o.order_id !== orderId));
        if (expandedOrderId === orderId) setExpandedOrderId(null);
        toast.success("Поръчката беше успешно анулирана!");
      } else {
        toast.error("Възникна грешка при анулирането.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetryPayment = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/orders/${orderId}/retry-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": token || "" 
        }
      });

      const data = await res.json();
      
      if (res.ok && data.url) {
        window.location.href = data.url; 
      } else {
        toast.error(data.error || "Възникна грешка при генерирането на линк за плащане.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Сървърна грешка.");
    }
  };

  useEffect(() => {
    const getData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/auth");

      try {
        const userRes = await fetch(`${API_URL}/auth/verify`, { headers: { token } });
        const ordersRes = await fetch(`${API_URL}/orders/mine`, { headers: { token } });

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

  const totalSpent = orders
    .filter(order => order.status !== 'awaiting_payment' && order.status !== 'cancelled')
    .reduce((acc, order) => acc + Number(order.total_price), 0);

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#ff6b00] font-bold tracking-widest uppercase animate-pulse text-xs md:text-sm">Зареждане...</div>;

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white p-4 text-center">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold mb-2">Възникна грешка</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button onClick={logout} className="bg-[#18181b] px-6 py-2 rounded border border-[#333] hover:bg-red-900/20 hover:text-red-500 transition-colors uppercase tracking-widest text-xs font-bold">Изход и нов вход</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-4 md:p-6 lg:p-12 font-sans selection:bg-[#ff6b00] selection:text-black relative">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-800">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic">
              Моят <span className="text-[#ff6b00]">Профил</span>
            </h1>
            <p className="text-gray-400 mt-1 uppercase text-[10px] md:text-xs tracking-widest">Контролен панел на потребителя</p>
          </div>
          
          <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
             {/* Admin Button Link (Only if user is admin) */}
             {(user?.role === 'admin' || user?.role === 'superadmin') && (
               <Link href="/admin/orders" className="flex-1 md:flex-none">
                 <button className="w-full flex items-center justify-center gap-2 bg-[#ff6b00]/10 text-[#ff6b00] hover:bg-[#ff6b00] hover:text-black transition-all px-4 md:px-5 py-2.5 rounded border border-[#ff6b00]/30 font-bold text-[10px] md:text-xs uppercase tracking-widest">
                   <ShieldCheck size={16} /> Админ
                 </button>
               </Link>
             )}

             <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#18181b] hover:bg-[#ff6b00]/10 hover:text-[#ff6b00] hover:border-[#ff6b00] transition-all px-4 md:px-5 py-2.5 rounded border border-gray-700 font-bold text-[10px] md:text-xs uppercase tracking-widest"
             >
                <Lock size={16} /> Парола
             </button>

             <button 
                onClick={logout} 
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#18181b] hover:bg-red-900/20 hover:text-red-500 hover:border-red-900 transition-all px-4 md:px-5 py-2.5 rounded border border-gray-700 font-bold text-[10px] md:text-xs uppercase tracking-widest"
             >
                <LogOut size={16} /> Изход
             </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-[#18181b] p-5 md:p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#ff6b00]/10 rounded text-[#ff6b00]">
                <User size={20} className="md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Потребител</p>
                <h3 className="text-base md:text-lg font-bold truncate pr-2">
                    {user ? `${user.first_name} ${user.last_name}` : "Зареждане..."}
                </h3>
              </div>
            </div>
            <div className="text-[10px] md:text-xs font-mono text-gray-500 break-all bg-black/40 p-2 rounded">
              {user?.email}
            </div>
          </div>

          <div className="bg-[#18181b] p-5 md:p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded text-blue-500">
                <Package size={20} className="md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Общо поръчки</p>
                <h3 className="text-xl md:text-2xl font-black">{orders.length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-[#18181b] p-5 md:p-6 rounded-xl border border-gray-800 sm:col-span-2 md:col-span-1 hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded text-green-500">
                <CreditCard size={20} className="md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Общо похарчени</p>
                <h3 className="text-xl md:text-2xl font-black">{totalSpent.toFixed(2)} €</h3>
              </div>
            </div>
          </div>
        </div>

        {/* СЕКЦИЯ ДАННИ ЗА ДОСТАВКА */}
        <div className="bg-[#18181b] border border-gray-800 rounded-xl p-5 md:p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 uppercase italic">
              <MapPin size={18} className="text-[#ff6b00] md:w-5 md:h-5"/> Данни за доставка
            </h2>
            <button 
              onClick={() => {
                  setIsEditingProfile(!isEditingProfile);
                  setProfileMessage({ type: "", text: "" });
              }}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${isEditingProfile ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/30 hover:bg-[#ff6b00] hover:text-black'}`}
            >
              {isEditingProfile ? <><X size={14}/> Отказ</> : <><Edit2 size={14}/> Редактирай</>}
            </button>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Име</label>
                    <input type="text" required value={profileData.first_name} onChange={(e) => setProfileData({...profileData, first_name: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 p-3 rounded-lg text-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none text-sm transition-all" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Фамилия</label>
                    <input type="text" required value={profileData.last_name} onChange={(e) => setProfileData({...profileData, last_name: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 p-3 rounded-lg text-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none text-sm transition-all" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Телефон</label>
                    <input type="tel" placeholder="Напр. 0888123456" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 p-3 rounded-lg text-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none font-mono text-sm transition-all" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Град</label>
                    <input type="text" placeholder="Напр. София" value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 p-3 rounded-lg text-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none text-sm transition-all" />
                </div>
                <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Точен Адрес</label>
                    <input type="text" placeholder="ж.к. Младост, ул. Примерна 12" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 p-3 rounded-lg text-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none text-sm transition-all" />
                </div>
              </div>
              
              {profileMessage.text && (
                <div className={`text-[10px] md:text-xs font-bold p-3 rounded text-center uppercase tracking-widest ${profileMessage.type === 'error' ? 'bg-red-900/20 text-red-500 border border-red-900/30' : 'bg-green-900/20 text-green-500 border border-green-900/30'}`}>
                    {profileMessage.text}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff6b00] to-[#e65c00] text-black font-black uppercase text-[10px] md:text-xs tracking-widest px-6 py-3 rounded-lg hover:shadow-[0_0_15px_rgba(255,107,0,0.4)] transition-all">
                  <Save size={16} /> Запази промените
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-fadeIn bg-black/20 p-4 md:p-5 rounded-lg border border-gray-800/50">
                <div>
                    <p className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1.5">Имена</p>
                    <p className="font-bold text-white text-sm flex items-center gap-2"><User size={14} className="text-[#ff6b00] shrink-0"/> <span className="truncate">{user?.first_name} {user?.last_name}</span></p>
                </div>
                <div>
                    <p className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1.5">Телефон</p>
                    <p className="font-bold text-white text-sm flex items-center gap-2"><Phone size={14} className="text-[#ff6b00] shrink-0"/> {user?.phone || <span className="text-gray-600 italic font-normal text-xs">Не е въведен</span>}</p>
                </div>
                <div className="sm:col-span-2 md:col-span-2">
                    <p className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1.5">Адрес за доставка</p>
                    <p className="font-bold text-white text-sm flex items-start gap-2"><MapPin size={14} className="text-[#ff6b00] shrink-0 mt-0.5"/> 
                        <span className="line-clamp-2 leading-tight">{user?.city || user?.address ? `${user?.city ? user.city + ', ' : ''}${user?.address || ''}` : <span className="text-gray-600 italic font-normal text-xs">Не е въведен адрес</span>}</span>
                    </p>
                </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 uppercase italic">
            <Calendar size={18} className="text-[#ff6b00] md:w-5 md:h-5"/> История на поръчките
          </h2>

          {orders.length === 0 ? (
            <div className="bg-[#18181b] border border-gray-800 rounded-xl p-10 md:p-16 flex flex-col items-center justify-center text-center shadow-inner">
              <Package size={40} className="text-gray-700 mb-4 md:w-12 md:h-12" />
              <p className="font-bold uppercase tracking-widest text-gray-500 mb-6 text-xs md:text-sm">
                Все още нямате направени поръчки
              </p>
              <Link 
                href="/shop" 
                className="w-full sm:w-auto bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black uppercase text-[10px] md:text-xs tracking-widest px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all transform hover:-translate-y-1 shadow-[0_5px_15px_rgba(255,107,0,0.3)] text-center"
              >
                Разгледай каталога
              </Link>
            </div>
          ) : (
            <div className="bg-[#18181b] border border-gray-800 rounded-xl overflow-hidden shadow-2xl max-h-[600px] overflow-y-auto custom-scrollbar">
              <div className="overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="sticky top-0 bg-[#0f0f13] z-10 shadow-sm">
                    <tr className="text-gray-400 text-[9px] md:text-[10px] uppercase font-bold tracking-widest border-b border-gray-800">
                      <th className="p-4 md:p-5">ID</th>
                      <th className="p-4 md:p-5">Дата</th>
                      <th className="p-4 md:p-5">Адрес</th>
                      <th className="p-4 md:p-5">Сума</th>
                      <th className="p-4 md:p-5">Статус</th>
                      <th className="p-4 md:p-5 text-right">Детайли</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50 text-xs md:text-sm">
                    {orders.map((order) => (
                      <Fragment key={order.order_id}> 
                        <tr 
                          className={`hover:bg-gray-800/30 transition-colors cursor-pointer group ${expandedOrderId === order.order_id ? 'bg-[#ff6b00]/5' : ''}`} 
                          onClick={() => toggleDetails(order.order_id)}
                        >
                          <td className="p-4 md:p-5 font-mono text-[#ff6b00] font-bold">#{order.order_id}</td>
                          <td className="p-4 md:p-5 uppercase whitespace-nowrap text-gray-300">
                            {new Date(order.created_at).toLocaleDateString("bg-BG")}
                          </td>
                          <td className="p-4 md:p-5 text-gray-400 text-[10px] md:text-xs max-w-[150px] md:max-w-[200px]">
                            <div className="flex items-center gap-1.5 truncate" title={`${order.customer_city}, ${order.customer_address}`}>
                              <MapPin size={12} className="shrink-0 text-gray-500 group-hover:text-[#ff6b00] transition-colors"/> <span className="truncate">{order.customer_city}, {order.customer_address}</span>
                            </div>
                          </td>
                          <td className="p-4 md:p-5 font-bold text-white whitespace-nowrap">{Number(order.total_price).toFixed(2)} €</td>
                          
                          <td className="p-4 md:p-5">
                            <div className="flex flex-col gap-2">
                              <span className={`inline-block w-fit px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter text-center ${getStatusColor(order.status)}`}>
                                {getStatusLabel(order.status)}
                              </span>
                              
                              {order.status?.toLowerCase() === 'awaiting_payment' && (
                                <div className="flex gap-1.5 mt-1">
                                    <button
                                      onClick={(e) => handleRetryPayment(order.order_id, e)}
                                      className="flex-1 text-[9px] bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/30 hover:bg-[#ff6b00] hover:text-black px-1.5 py-1 rounded font-bold uppercase tracking-widest transition-all text-center shadow-sm hover:shadow-[0_0_10px_rgba(255,107,0,0.3)]"
                                      title="Продължи към плащане"
                                    >
                                      Плати
                                    </button>
                                    <button
                                      onClick={(e) => handleCancelUnpaidOrder(order.order_id, e)}
                                      className="flex-1 text-[9px] bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white px-1.5 py-1 rounded font-bold uppercase tracking-widest transition-all text-center shadow-sm"
                                      title="Откажи поръчката"
                                    >
                                      Отказ
                                    </button>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="p-4 md:p-5 text-right">
                            <div className={`p-1.5 inline-block rounded-full transition-colors ${expandedOrderId === order.order_id ? 'bg-[#ff6b00]/10' : 'group-hover:bg-gray-800'}`}>
                                <ChevronRight size={18} className={`transition-transform duration-200 ${expandedOrderId === order.order_id ? 'rotate-90 text-[#ff6b00]' : 'text-gray-500'}`} />
                            </div>
                          </td>
                        </tr>

                        {expandedOrderId === order.order_id && (
                            <tr className="bg-[#0f0f13] border-b border-gray-800 shadow-inner">
                                <td colSpan={6} className="p-4 md:p-6">
                                    <div className="pl-3 md:pl-4 border-l-2 border-[#ff6b00]">
                                        <h4 className="text-[9px] md:text-[10px] font-bold uppercase text-gray-500 mb-3 md:mb-4 tracking-widest italic">Продукти в поръчката:</h4>
                                        {itemsLoading ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 animate-pulse">
                                                <div className="h-16 bg-gray-800 rounded border border-gray-700"></div>
                                                <div className="h-16 bg-gray-800 rounded border border-gray-700"></div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                                                {orderItems.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 md:gap-4 bg-[#18181b] p-2 md:p-3 rounded border border-gray-800/80 hover:border-gray-700 transition-colors">
                                                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded p-1 shrink-0 flex items-center justify-center border border-gray-700">
                                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                                                        </div>
                                                        <div className="flex-grow min-w-0">
                                                            <p className="font-bold text-[10px] md:text-xs uppercase text-gray-200 leading-tight truncate">{item.name}</p>
                                                            <p className="text-[9px] md:text-[10px] text-gray-500 mt-0.5 font-mono">КОЛ: {item.quantity}</p>
                                                        </div>
                                                        <p className="font-bold text-[#ff6b00] text-xs md:text-sm whitespace-nowrap shrink-0">{Number(item.price_at_purchase).toFixed(2)} €</p>
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
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={(e) => {
                // Затваря модала, ако кликнеш върху черния фон
                if (e.target === e.currentTarget) {
                    setIsPasswordModalOpen(false);
                    setPassMessage({ type: "", text: "" }); 
                    setShowOldPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                    setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                }
            }}
        >
            <div className="bg-[#0f0f13] border border-gray-800 w-full max-w-md rounded-2xl p-6 md:p-8 relative shadow-2xl overflow-hidden animate-fadeIn">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent opacity-70"></div>

                <button 
                    onClick={() => {
                        setIsPasswordModalOpen(false);
                        setPassMessage({ type: "", text: "" }); 
                        setShowOldPassword(false);
                        setShowNewPassword(false);
                        setShowConfirmPassword(false);
                        setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                    }}
                    className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-500 hover:text-white bg-[#18181b] hover:bg-gray-800 p-2 rounded-full transition-all border border-gray-800 hover:border-gray-600"
                >
                    <X size={16} />
                </button>

                <div className="text-center mb-6 md:mb-8 mt-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#18181b] border border-gray-800 mb-3 md:mb-4 text-gray-400">
                        <Lock size={24} />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider italic">
                        Сигурност
                    </h3>
                    <p className="text-[10px] md:text-xs text-[#ff6b00] mt-1 md:mt-2 uppercase tracking-widest font-bold">Обновяване на паролата</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 md:space-y-5">
                    {/* ПОЛЕ 1: Текуща парола */}
                    <div className="space-y-1.5">
                        <label className="block text-[9px] md:text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Текуща парола</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#ff6b00] transition-colors">
                                <KeyRound size={16} />
                            </div>
                            <input 
                                type={showOldPassword ? "text" : "password"}
                                required
                                placeholder="Въведете текущата парола..."
                                className="w-full bg-[#18181b] border border-gray-800 p-3.5 pl-10 md:pl-12 pr-10 rounded-xl text-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none transition-all text-xs md:text-sm font-mono placeholder:font-sans placeholder:text-gray-600"
                                value={passData.oldPassword}
                                onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                            >
                                {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* ПОЛЕ 2: Нова парола */}
                    <div className="space-y-1.5">
                        <label className="block text-[9px] md:text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Нова парола</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#ff6b00] transition-colors">
                                <ShieldCheck size={16} />
                            </div>
                            <input 
                                type={showNewPassword ? "text" : "password"}
                                required
                                placeholder="Създайте нова парола..."
                                className="w-full bg-[#18181b] border border-gray-800 p-3.5 pl-10 md:pl-12 pr-10 rounded-xl text-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none transition-all text-xs md:text-sm font-mono placeholder:font-sans placeholder:text-gray-600"
                                value={passData.newPassword}
                                onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                            >
                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* ПОЛЕ 3: Потвърждение на новата парола */}
                    <div className="space-y-1.5">
                        <label className="block text-[9px] md:text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Потвърди новата парола</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#ff6b00] transition-colors">
                                <ShieldCheck size={16} />
                            </div>
                            <input 
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                placeholder="Повторете новата парола..."
                                className="w-full bg-[#18181b] border border-gray-800 p-3.5 pl-10 md:pl-12 pr-10 rounded-xl text-white focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] outline-none transition-all text-xs md:text-sm font-mono placeholder:font-sans placeholder:text-gray-600"
                                value={passData.confirmPassword}
                                onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {passMessage.text && (
                        <div className={`text-[10px] md:text-xs font-bold p-3 md:p-4 rounded-lg text-center uppercase tracking-widest border transition-all ${passMessage.type === 'error' ? 'bg-red-900/10 text-red-500 border-red-900/30' : 'bg-green-900/10 text-green-500 border-green-900/30'}`}>
                            {passMessage.text}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#ff6b00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-black font-black uppercase py-3.5 rounded-xl shadow-[0_5px_15px_rgba(255,107,0,0.2)] hover:shadow-[0_8px_25px_rgba(255,107,0,0.4)] transition-all tracking-widest mt-2 transform hover:-translate-y-1 text-xs"
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