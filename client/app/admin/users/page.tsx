"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Shield, ShieldOff, UserCheck, Search, ShieldAlert, Key, Crown } from "lucide-react"; 
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";

interface UserData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [myRole, setMyRole] = useState(""); 

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/login"); return; }

      const res = await fetch(`${API_URL}/admin/users`, { headers: { "token": token } });
      const resMe = await fetch(`${API_URL}/auth/verify`, { headers: { "token": token } });
      
      if (res.ok && resMe.ok) {
        const data = await res.json();
        const me = await resMe.json();
        setUsers(data);
        setMyRole(me.role); 
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("ВНИМАНИЕ: Изтриването на потребител е необратимо! Сигурни ли сте?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: "DELETE", headers: { "token": token || "" }
      });
      if (res.ok) setUsers(users.filter(u => u.user_id !== id));
      else { const msg = await res.json(); alert(msg); }
    } catch (err) { console.error(err); }
  };

  const toggleUserRole = async (user: UserData) => {
    if (myRole !== 'superadmin') {
        alert("Само Super Admin може да променя роли!");
        return;
    }

    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Промяна на правата на ${user.first_name}?`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/users/${user.user_id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "token": token || "" },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        fetchUsers(); 
      } else {
        const msg = await res.json();
        alert(msg);
      }
    } catch (err) { console.error(err); }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    const newPass = prompt(`Въведете НОВА парола за ${userName}:`);
    if (!newPass) return; 

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/users/${userId}/password`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "token": token || "" },
            body: JSON.stringify({ newPassword: newPass })
        });

        if (res.ok) {
            alert("Паролата е сменена успешно!");
        } else {
            const msg = await res.json();
            alert(msg);
        }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#ff6b00] font-bold uppercase tracking-widest animate-pulse text-xs md:text-sm">Зареждане...</div>;

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white p-4 md:p-8 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 border-b border-[#333] pb-4 md:pb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white uppercase">
                Потребители <span className="text-[10px] md:text-xs text-gray-500 font-mono font-bold ml-2">(Role: <span className="text-[#ff6b00]">{myRole}</span>)</span>
            </h1>
            <Link href="/dashboard" className="text-[10px] md:text-xs text-gray-400 hover:text-[#ff6b00] transition border border-gray-800 bg-[#18181b] px-4 py-2 rounded-lg font-bold uppercase tracking-widest shrink-0">
                Към Дашборд
            </Link>
        </div>

        <div className="bg-[#18181b] rounded-xl border border-[#333] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-[#0f0f13] text-gray-500 text-[10px] md:text-xs uppercase font-bold border-b border-[#333] tracking-widest">
                            <th className="p-4 md:p-5">Потребител</th>
                            <th className="p-4 md:p-5">Email</th>
                            <th className="p-4 md:p-5">Роля</th>
                            <th className="p-4 md:p-5 text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333] text-xs md:text-sm">
                        {users.map((user) => (
                            <tr key={user.user_id} className="hover:bg-[#222] transition-colors">
                                <td className="p-4 md:p-5 font-bold">
                                    <div className="flex items-center gap-2 md:gap-3 whitespace-nowrap">
                                        {user.role === 'superadmin' ? <Crown size={16} className="text-yellow-500 shrink-0" /> : <UserCheck size={16} className="text-gray-500 shrink-0"/>}
                                        <span>{user.first_name} {user.last_name}</span>
                                    </div>
                                </td>
                                <td className="p-4 md:p-5 text-gray-400 text-[10px] md:text-sm font-mono truncate max-w-[150px] md:max-w-[250px]" title={user.email}>
                                    {user.email}
                                </td>
                                <td className="p-4 md:p-5">
                                    <span className={`px-2 py-1 rounded text-[9px] md:text-[10px] uppercase font-black tracking-widest whitespace-nowrap ${
                                        user.role === 'superadmin' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                        user.role === 'admin' ? 'bg-[#ff6b00]/20 text-[#ff6b00] border border-[#ff6b00]/30' : 'bg-[#333] text-gray-400 border border-gray-600'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 md:p-5 text-right">
                                    <div className="flex justify-end gap-1.5 md:gap-2">
                                        {/* 1. СМЯНА НА ПАРОЛА */}
                                        <button 
                                            onClick={() => handleResetPassword(user.user_id, user.first_name)}
                                            className="p-1.5 md:p-2 border border-gray-600 text-gray-400 hover:text-[#ff6b00] hover:border-[#ff6b00] hover:bg-[#ff6b00]/10 rounded transition-all"
                                            title="Смени парола"
                                        >
                                            <Key size={14} className="md:w-4 md:h-4" />
                                        </button>

                                        {/* 2. СМЯНА НА РОЛЯ */}
                                        {myRole === 'superadmin' && user.role !== 'superadmin' && (
                                            <button 
                                                onClick={() => toggleUserRole(user)}
                                                className={`p-1.5 md:p-2 border rounded transition-all ${user.role === 'admin' ? 'border-blue-500/50 text-blue-500 hover:bg-blue-500/10' : 'border-green-500/50 text-green-500 hover:bg-green-500/10'}`}
                                                title="Смени права"
                                            >
                                                {user.role === 'admin' ? <ShieldOff size={14} className="md:w-4 md:h-4" /> : <Shield size={14} className="md:w-4 md:h-4" />}
                                            </button>
                                        )}

                                        {/* 3. ИЗТРИВАНЕ */}
                                        {myRole === 'superadmin' && user.role !== 'superadmin' && (
                                            <button 
                                                onClick={() => handleDeleteUser(user.user_id)}
                                                className="p-1.5 md:p-2 bg-red-900/10 text-red-500 border border-red-900/30 hover:bg-red-600 hover:text-white hover:border-red-600 rounded transition-all"
                                                title="Изтрий потребител"
                                            >
                                                <Trash2 size={14} className="md:w-4 md:h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}