"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Какво представлява един продукт в количката
type CartItem = {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // При стартиране: Провери дали има запазена количка в браузъра
  useEffect(() => {
    const savedCart = localStorage.getItem("shopping-cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Всеки път когато количката се промени, запази я в браузъра
  useEffect(() => {
    localStorage.setItem("shopping-cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product: any) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.product_id);
      
      // 1. Колко бройки имаме в момента в количката? (0 ако нямаме)
      const currentQtyInCart = existing ? existing.quantity : 0;

      // 2. Проверка: Ако добавим още един, ще надвишим ли наличността?
      if (currentQtyInCart + 1 > product.stock) {
        alert(`Съжаляваме! Разполагаме само с ${product.stock} бр. от този продукт.`);
        return prev; // Връщаме старата количка без промяна
      }

      // 3. Ако всичко е наред, добавяме
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { ...product, quantity: 1, price: Number(product.price) }];
    });
    
  };

  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((item) => item.product_id !== id));
  };

  const clearCart = () => setItems([]);

  // Изчисляване на обща бройка и обща цена
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

// Хук за лесно ползване
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}