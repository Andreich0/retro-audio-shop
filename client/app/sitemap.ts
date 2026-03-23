import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://retro-audio-api-o7it.onrender.com";
  const baseUrl = 'https://retro-audio-shop.vercel.app';

  // 1. Взимаме всички продукти от бекенда за динамичните линкове
  let products = [];
  try {
    const res = await fetch(`${API_URL}/products`);
    if (res.ok) {
      products = await res.json();
    }
  } catch (err) {
    console.error("Грешка при взимане на продукти за sitemap:", err);
  }

  // 2. Генерираме масив с линкове за всеки един продукт
  const productUrls = products.map((product: any) => ({
    url: `${baseUrl}/shop/${product.product_id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 3. Връщаме статичните страници + динамичните продукти
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0, // Най-висок приоритет за началната страница
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...productUrls, // Добавяме всички продукти тук
  ]
}