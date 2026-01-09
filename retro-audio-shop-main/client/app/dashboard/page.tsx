"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState({ first_name: "", last_name: "", email: "" });
  const [loading, setLoading] = useState(true); // За да покажем "Зареждане..."

  // Функция за изход
  const logout = (e: any) => {
    e.preventDefault();
    localStorage.removeItem("token"); // Трием токена
    router.push("/login"); // Пращаме към вход
  };

  // Това се изпълнява веднъж при отваряне на страницата
  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        // Ако няма токен, веднага гони потребителя
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("http://localhost:5000/auth/verify", {
          method: "GET",
          headers: { token: token }, // ТУК Е КЛЮЧЪТ: Пращаме токена на сървъра
        });

        const parseRes = await response.json();

        if (response.ok) {
          setUser(parseRes); // Запазваме данните на потребителя
          setLoading(false);
        } else {
          // Ако токенът е невалиден (напр. изтекъл), трием го и гоним
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    getProfile();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Зареждане...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold text-orange-500">Моят Профил</h1>
          <button 
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Изход
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl mb-4">Добре дошли, <span className="font-bold">{user.first_name} {user.last_name}</span>!</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Статус:</strong> Активен потребител</p>
            {/* Тук по-късно ще добавим история на поръчките */}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
                <h3 className="text-lg font-bold mb-2">Моите Поръчки</h3>
                <p className="text-sm text-gray-400">Нямате скорошни поръчки.</p>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
                <h3 className="text-lg font-bold mb-2">Адреси</h3>
                <p className="text-sm text-gray-400">Управление на адреси за доставка.</p>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
                <h3 className="text-lg font-bold mb-2">Любими</h3>
                <p className="text-sm text-gray-400">Списък с желани касети.</p>
            </div>
        </div>
      </div>
    </div>
  );
}