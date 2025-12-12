"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  // Тук слагаме ': any', за да е по-лесно за сега и TS да не дава червени черти
  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Успешна регистрация! Сега можете да влезете.");
        router.push("/login");
      } else {
        setError(data.message || "Възникна грешка.");
      }
    } catch (err) {
      setError("Сървърът не отговаря. Проверете дали backend-ът работи.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Създай Профил</h2>
        
        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="first_name"
            placeholder="Име"
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 outline-none"
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Фамилия"
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 outline-none"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Парола"
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 outline-none"
            required
          />
          
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Регистрирай се
          </button>
        </form>
      </div>
    </div>
  );
}