const pool = require("./db"); // Взимаме връзката с базата данни

const generateProducts = () => {
  const brands = ["Sony", "Akai", "Pioneer", "Technics", "Nakamichi", "Aiwa", "Kenwood", "TDK", "Maxell", "Marantz"];
  const categories = ["Deck", "Cassette", "Walkman", "Accessory"];
  const conditions = ["new", "mint", "good", "fair", "parts"];
  
  // Яки реални снимки от Unsplash, отговарящи на категориите
  const images = {
    "Deck": "https://media.istockphoto.com/id/667969950/photo/cassette-player-stereo-in-retro-style.jpg?s=612x612&w=0&k=20&c=3qOGQaD0BzW6Yx6i_AZnt_HcxqUuGunzdiYaqsW3amc=",
    "Cassette": "https://plus.unsplash.com/premium_photo-1682125848355-4fb0e6da7647?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "Walkman": "https://media.istockphoto.com/id/1013208258/photo/retro-cassette-tape-with-headphones.jpg?s=612x612&w=0&k=20&c=TMYUbBLWOQbZo_aXL_9XVhsFQxiWz2a_vHoa7g5Bmz4=",
    "Accessory": "https://thumbs.dreamstime.com/b/retro-music-still-life-high-angle-shot-style-accessories-items-include-vinyl-lp-rpm-single-headphones-guitar-case-41667398.jpg"
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