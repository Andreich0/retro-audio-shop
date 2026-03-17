const pool = require("./db"); // Взимаме връзката с базата данни

const generateProducts = () => {
  const brands = ["Sony", "Akai", "Pioneer", "Technics", "Nakamichi", "Aiwa", "Kenwood", "TDK", "Maxell", "Marantz"];
  const categories = ["Deck", "Cassette", "Walkman", "Accessory"];
  const conditions = ["new", "mint", "good", "fair", "parts"];
  
  // Яки реални снимки от Unsplash, отговарящи на категориите
  const images = {
    "Deck": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop",
    "Cassette": "https://images.unsplash.com/photo-1514534720935-716b9b32ff30?q=80&w=1000&auto=format&fit=crop",
    "Walkman": "https://images.unsplash.com/photo-1618314115160-5f21226dd18c?q=80&w=1000&auto=format&fit=crop",
    "Accessory": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop"
  };

  const products = [];

  for (let i = 1; i <= 60; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    let name = "";
    let price = 0;

    // Генерираме реалистични имена и цени според категорията
    if (category === "Deck") {
        name = `${brand} Stereo Cassette Deck TC-${Math.floor(Math.random() * 900) + 100}`;
        price = Math.floor(Math.random() * 800) + 150; // От 150 до 950 евро
    } else if (category === "Walkman") {
        name = `${brand} Portable Player WM-${Math.floor(Math.random() * 90) + 10}`;
        price = Math.floor(Math.random() * 200) + 50; // От 50 до 250 евро
    } else if (category === "Cassette") {
        const type = Math.random() > 0.5 ? 'Type II (Chrome)' : 'Type IV (Metal)';
        name = `${brand} Blank Tape ${type} 90min`;
        price = Math.floor(Math.random() * 40) + 5; // От 5 до 45 евро
    } else {
        name = `${brand} Vintage Headphones / Cleaning Kit`;
        price = Math.floor(Math.random() * 80) + 20; // От 20 до 100 евро
    }

    const stock = Math.floor(Math.random() * 8); // Наличност от 0 до 7 (за да имаме и изчерпани)
    const image = images[category];

    const description = `Автентичен ретро продукт от марката ${brand}. Състояние: ${condition.toUpperCase()}. Преминал пълна профилактика (ако е техника) и готов за употреба. Идеален за колекционери и истински аудиофили, които ценят аналоговия звук.`;

    products.push({ name, description, price, category, image_url: image, stock, condition });
  }
  
  return products;
};

const seedDB = async () => {
  try {
    console.log("🌱 Започва генерирането на ретро съкровища...");
    const products = generateProducts();
    
    let count = 0;
    for (const p of products) {
      await pool.query(
        "INSERT INTO products (name, description, price, category, image_url, stock, condition) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [p.name, p.description, p.price, p.category, p.image_url, p.stock, p.condition]
      );
      count++;
    }
    
    console.log(`✅ Успешно заредени ${count} продукта в базата данни!`);
    console.log("Можеш да затвориш този скрипт.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Грешка при посяване:", err);
    process.exit(1);
  }
};

seedDB();