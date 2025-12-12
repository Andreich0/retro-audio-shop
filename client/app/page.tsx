import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Retro Audio Shop</h1>
      <p className="mb-8">Добре дошли в света на аналоговия звук.</p>
      
      <div className="flex gap-4">
        <Link 
          href="/register" 
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
        >
          Регистрация
        </Link>
        <Link 
          href="/login" 
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Вход
        </Link>
      </div>
    </main>
  );
}