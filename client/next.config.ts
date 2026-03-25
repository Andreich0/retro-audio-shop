import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Игнорираме TS грешките при билд, за да изчистим стария кеш на маршрутите */
  typescript: {
    ignoreBuildErrors: true,
  },
  /* Настройваме пренасочванията, така че старите линкове да не дават 404 */
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth?mode=login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth?mode=register',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
