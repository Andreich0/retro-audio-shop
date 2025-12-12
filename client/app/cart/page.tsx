"use client";

import { useCart } from "../../context/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { items, removeFromCart, cartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h2 className="text-3xl mb-4">Количката е празна</h2>
        <Link href="/shop" className="bg-orange-500 px-6 py-2 rounded font-bold">
          Към магазина
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-4">Вашата Количка</h1>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.product_id} className="flex items-center justify-between bg-gray-800 p-4 rounded border border-gray-700">
              <div className="flex items-center gap-4">
                <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded bg-white" />
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-gray-400">{item.price} лв. x {item.quantity}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="font-bold text-orange-400 text-xl">
                  {(item.price * item.quantity).toFixed(2)} лв.
                </span>
                <button 
                  onClick={() => removeFromCart(item.product_id)}
                  className="text-red-500 hover:text-red-400 font-bold px-3 py-1 border border-red-500 rounded hover:bg-red-500 hover:text-white transition"
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end items-center border-t border-gray-700 pt-6">
          <div className="text-right">
            <p className="text-gray-400">Обща сума:</p>
            <p className="text-4xl font-bold text-orange-500 mb-4">{cartTotal.toFixed(2)} лв.</p>
	    <Link href="/checkout">
  		<button className="bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-3 px-8 rounded shadow-lg">
    		Плащане (Checkout)
  		</button>
	    </Link>
          </div>
        </div>
      </div>
    </div>
  );
}