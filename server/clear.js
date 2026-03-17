const pool = require("./db");

const clearDB = async () => {
  try {
    console.log("🗑️ Започва изтриване на всички продукти...");
    
    // TRUNCATE CASCADE изтрива всички продукти и изчиства свързаните с тях 
    // записи в Любими (wishlist) и стари поръчки (order_items).
    await pool.query("TRUNCATE TABLE products CASCADE");
    
    // Ако искаш да нулираш и ID-тата (за да започват пак от 1), ползвай това:
    // await pool.query("TRUNCATE TABLE products RESTART IDENTITY CASCADE");

    console.log("✅ Всички продукти бяха изтрити успешно!");
    console.log("Сега можеш да пуснеш: node seed.js");
    process.exit(0);
  } catch (err) {
    console.error("❌ Грешка при изтриване:", err);
    process.exit(1);
  }
};

clearDB();