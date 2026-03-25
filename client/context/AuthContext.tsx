"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isLoggedIn: boolean;
  role: string;
  login: (token: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const router = useRouter();

  // Проверка при първоначално зареждане на сайта
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    
    if (token) {
      setIsLoggedIn(true);
      setRole(userRole || "");
    }
  }, []);

  // Функция за Вход (извиква се от Login страницата)
  const login = (token: string, userRole: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", userRole);
    setIsLoggedIn(true);
    setRole(userRole);
    // Не навигираме тук, оставяме формата да реши къде да прати потребителя
  };

  // Функция за Изход (извиква се от Навигацията)
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole("");
    router.push("/auth");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};