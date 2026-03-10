"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Shield, ShieldOff, UserCheck, Search, ShieldAlert, Key, Crown } from "lucide-react"; // Crown иконка за SuperAdmin

// Добавяме икона Key и Crown

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
  
  // Трябва да знаем ролята на ТЕКУЩИЯ потребител (ти), за да крием бутони
  const [myRole, setMyRole] = useState(""); 

  // Взимане на потребителите + Моята роля
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/login"); return; }

      // 1. Взимаме потребителите
      const res = await fetch("http://retro-audio-shop.vercel.app/admin/users", { headers: { "token": token } });
      
      // 2. Взимаме и кой съм аз (за да разберем дали съм superadmin)
      const resMe = await fetch("http://retro-audio-shop.vercel.app/auth/verify", { headers: { "token": token } });
      
      if (res.ok && resMe.ok) {
        const data = await res.json();
        const me = await resMe.json();
        setUsers(data);
        setMyRole(me.role); // Запазваме моята роля
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
      const res = await fetch(`http://retro-audio-shop.vercel.app/admin/users/${id}`, {
        method: "DELETE", headers: { "token": token || "" }
      });
      if (res.ok) setUsers(users.filter(u => u.user_id !== id));
      else { const msg = await res.json(); alert(msg); }
    } catch (err) { console.error(err); }
  };

  const toggleUserRole = async (user: UserData) => {
    // Ако не си superadmin, не прави нищо (дори да кликнеш)
    if (myRole !== 'superadmin') {
        alert("Само Super Admin може да променя роли!");
        return;
    }

    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Промяна на правата на ${user.first_name}?`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://retro-audio-shop.vercel.app/admin/users/${user.user_id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "token": token || "" },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        fetchUsers(); // Презареждаме, за да видим новата роля
      } else {
        const msg = await res.json();
        alert(msg);
      }
    } catch (err) { console.error(err); }
  };

  // НОВА ФУНКЦИЯ: Смяна на парола
  const handleResetPassword = async (userId: string, userName: string) => {
    const newPass = prompt(`Въведете НОВА парола за ${userName}:`);
    if (!newPass) return; // Ако е натиснал Cancel

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://retro-audio-shop.vercel.app/admin/users/${userId}/password`, {
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

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase mb-8">
            Управление (Role: <span className="text-[#ff6b00]">{myRole}</span>)
        </h1>

        <div className="bg-[#18181b] rounded-xl border border-[#333] overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#0f0f13] text-gray-500 text-[10px] uppercase font-bold border-b border-[#333]">
                        <th className="p-5">Потребител</th>
                        <th className="p-5">Email</th>
                        <th className="p-5">Роля</th>
                        <th className="p-5 text-right">Действия</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#333]">
                    {users.map((user) => (
                        <tr key={user.user_id} className="hover:bg-[#222]">
                            <td className="p-5 font-bold flex items-center gap-3">
                                {user.role === 'superadmin' ? <Crown size={16} className="text-yellow-500" /> : <UserCheck size={16} className="text-gray-500"/>}
                                {user.first_name} {user.last_name}
                            </td>
                            <td className="p-5 text-gray-400 text-sm font-mono">{user.email}</td>
                            <td className="p-5">
                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-black ${
                                    user.role === 'superadmin' ? 'bg-yellow-500/20 text-yellow-500' :
                                    user.role === 'admin' ? 'bg-[#ff6b00]/20 text-[#ff6b00]' : 'bg-[#333] text-gray-400'
                                }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="p-5 text-right flex justify-end gap-2">
                                
                                {/* 1. СМЯНА НА ПАРОЛА (За всички админи) */}
                                <button 
                                    onClick={() => handleResetPassword(user.user_id, user.first_name)}
                                    className="p-2 border border-gray-600 text-gray-400 hover:text-white hover:border-white rounded transition"
                                    title="Смени парола"
                                >
                                    <Key size={16} />
                                </button>

                                {/* 2. СМЯНА НА РОЛЯ (Само за SUPERADMIN) */}
                                {myRole === 'superadmin' && user.role !== 'superadmin' && (
                                    <button 
                                        onClick={() => toggleUserRole(user)}
                                        className={`p-2 border rounded transition ${user.role === 'admin' ? 'border-blue-500/50 text-blue-500' : 'border-green-500/50 text-green-500'}`}
                                        title="Смени права"
                                    >
                                        {user.role === 'admin' ? <ShieldOff size={16} /> : <Shield size={16} />}
                                    </button>
                                )}

                                {/* 3. ИЗТРИВАНЕ (Само за SUPERADMIN) */}
                                {myRole === 'superadmin' && user.role !== 'superadmin' && (
                                    <button 
                                        onClick={() => handleDeleteUser(user.user_id)}
                                        className="p-2 bg-red-900/10 text-red-500 border border-red-900/30 hover:bg-red-600 hover:text-white rounded transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}