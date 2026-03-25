"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast"; // ВАЖНО: Импортираме toast

// Дефинираме как изглежда един продукт в количката
interface CartItem {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  stock: number; 
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Зареждане от LocalStorage при стартиране
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  // 2. Запазване в LocalStorage при всяка промяна
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // --- ДОБАВЯНЕ В КОЛИЧКАТА ---
  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product_id === product.product_id);

      if (existingItem) {
        // ПРОВЕРКА: Има ли достатъчно наличност за още 1 бройка?
        if (existingItem.quantity + 1 > product.stock) {
            toast.error(`Съжаляваме, разполагаме само с ${product.stock} бр. от този продукт!`);
            return prevCart; // Не променяме нищо
        }

        toast.success("Добавено още 1 към количката!");
        return prevCart.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Ако го няма, го добавяме с количество 1 (ако има поне 1 наличен)
        if (product.stock < 1) {
            toast.error("Продуктът е изчерпан!");
            return prevCart;
        }
        
        toast.success(`${product.name} е добавен в количката!`);
        return [...prevCart, { ...product, quantity: 1, stock: product.stock }];
      }
    });
  };

  // --- ПРЕМАХВАНЕ ---
  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product_id !== id));
  };

  // --- ОБНОВЯВАНЕ НА КОЛИЧЕСТВОТО ---
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return; // Не позволяваме 0 или отрицателно

    setCart((prevCart) => {
        return prevCart.map((item) => {
            if (item.product_id === id) {
                // ПРОВЕРКА: Ако опитваме да увеличим над наличното
                if (newQuantity > item.stock) {
                     toast.error(`Максималното налично количество е ${item.stock} бр.`);
                     return item; // Връщаме старото състояние
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        });
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // Изчисляване на общата сума
  const cartTotal = cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};