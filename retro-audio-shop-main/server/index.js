const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require('bcrypt');
const authorization = require("./middleware/authorization");
const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Импортираме връзката с базата
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// Позволяваме достъп до снимките през браузъра
app.use("/uploads", express.static("uploads"));

// ТЕСТОВ МАРШРУТ С БАЗА ДАННИ
app.get('/', async (req, res) => {
  try {
    // Питаме базата за текущото време
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Retro Audio API is connected to Database!', 
      server_time: result.rows[0].now 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error: Database connection failed');
  }
});

// РЕГИСТРАЦИЯ НА ПОТРЕБИТЕЛ
app.post('/auth/register', async (req, res) => {
  try {
    // 1. Взимаме данните от заявката (от Frontend-а)
    const { first_name, last_name, email, password } = req.body;

    // 2. Проверяваме дали такъв потребител вече съществува
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (userCheck.rows.length > 0) {
      return res.status(401).json({ message: "Този имейл вече е регистриран!" });
    }

    // 3. Криптираме паролата (сила на солта: 10)
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // 4. Вкарваме новия потребител в базата
    const newUser = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [first_name, last_name, email, bcryptPassword]
    );

    // 5. Връщаме отговор, че всичко е точно (връщаме и генерирания токен по-късно, засега само данните)
    res.json(newUser.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ВХОД (LOGIN)
app.post('/auth/login', async (req, res) => {
  try {
    // 1. Взимаме данните от Frontend-а
    const { email, password } = req.body;

    // 2. Търсим потребителя по имейл
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    // Ако няма такъв потребител
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Грешен имейл или парола!" });
    }

    // 3. Проверяваме паролата (Сравняваме въведената с криптираната)
    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(401).json({ message: "Грешен имейл или парола!" });
    }

    // 4. Генерираме Токен (Печата)
    // В него слагаме ID-то на потребителя, за да знаем кой е той
    const token = jwt.sign(
      { user_id: user.rows[0].user_id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' } // Токенът важи 1 час
    );

    // 5. Връщаме токена на клиента
    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ЗАЩИТЕН МАРШРУТ: Взимане на данни за профила
// Виж как добавихме 'authorization' като втори аргумент. Това пуска охранителя.
app.get("/auth/verify", authorization, async (req, res) => {
  try {
    // req.user.user_id идва от middleware-а, който написахме горе
    const user = await pool.query(
      "SELECT first_name, last_name, email FROM users WHERE user_id = $1", 
      [req.user.user_id]
    ); 
    
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ВЗИМАНЕ НА ВСИЧКИ ПРОДУКТИ
// Този маршрут е публичен (няма 'authorization'), защото всеки трябва да може да разглежда магазина
app.get("/products", async (req, res) => {
  try {
    const allProducts = await pool.query("SELECT * FROM products ORDER BY product_id ASC");
    res.json(allProducts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// СЪЗДАВАНЕ НА ПОРЪЧКА
app.post("/orders", authorization, async (req, res) => {
  try {
    const { items, total_price, address } = req.body;
    const user_id = req.user.user_id;

    await pool.query("BEGIN");

    // --- НОВО: ПРОВЕРКА НА НАЛИЧНОСТИТЕ ПРЕДИ ПОРЪЧКА ---
    for (let item of items) {
      const productRes = await pool.query("SELECT stock, name FROM products WHERE product_id = $1", [item.product_id]);
      const currentStock = productRes.rows[0].stock;

      if (currentStock < item.quantity) {
        // Ако искаме 2, а има 1 -> Хвърляме грешка и спираме всичко
        await pool.query("ROLLBACK");
        return res.status(400).json({ message: `Няма достатъчно наличност за: ${productRes.rows[0].name}. Налични: ${currentStock}` });
      }
    }
    // ----------------------------------------------------

    const newOrder = await pool.query(
      "INSERT INTO orders (user_id, total_price, address) VALUES ($1, $2, $3) RETURNING order_id",
      [user_id, total_price, address]
    );

    const orderId = newOrder.rows[0].order_id;

    for (let item of items) {
      await pool.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)",
        [orderId, item.product_id, item.quantity, item.price]
      );
      
      await pool.query(
        "UPDATE products SET stock = stock - $1 WHERE product_id = $2",
        [item.quantity, item.product_id]
      );
    }

    await pool.query("COMMIT");
    res.json({ message: "Поръчката е приета успешно!", orderId });

  } catch (err) {
    await pool.query("ROLLBACK");
    
    // Ако базата данни върне грешката от Поправка 1
    if (err.constraint === 'stock_cannot_be_negative') {
        return res.status(400).json({ message: "Някой изкупи стоката преди вас!" });
    }

    console.error(err.message);
    res.status(500).send("Грешка при поръчката.");
  }
});

// ВЗИМАНЕ НА МОИТЕ ПОРЪЧКИ
app.get("/orders/mine", authorization, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Взимаме поръчките, подредени от най-новата към най-старата
    const orders = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [user_id]
    );

    res.json(orders.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ДОБАВЯНЕ НА ПРОДУКТ (САМО ЗА АДМИНИ)
app.post("/products", authorization, async (req, res) => {
  try {
    const { name, description, price, category, image_url, stock } = req.body;
    
    // 1. Първо проверяваме дали потребителят е Админ
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    
    if (user.rows[0].role !== 'admin') {
      return res.status(403).json("Нямате права да добавяте продукти!");
    }

    // 2. Ако е админ, добавяме продукта
    const newProduct = await pool.query(
      "INSERT INTO products (name, description, price, category, image_url, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, description, price, category, image_url, stock]
    );

    res.json(newProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- КОНФИГУРАЦИЯ ЗА КАЧВАНЕ НА СНИМКИ ---

// 1. Проверяваме дали папката съществува, ако не - я създаваме
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Сега вече сме сигурни, че папката я има
  },
  filename: (req, file, cb) => {
    // Правим уникално име и махаме интервалите, за да няма проблеми с линка
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

const upload = multer({ storage: storage });

// 2. Маршрут за качване
// Този маршрут приема файл с име "image" и връща линка към него
app.post("/upload", upload.single("image"), (req, res) => {
  try {
    // Връщаме пълния адрес на снимката
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("Грешка при качване");
  }
});

// 1. РЕДАКТИРАНЕ НА ПРОДУКТ (PUT)
app.put("/products/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url, stock } = req.body;

    // Проверка дали е админ
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (user.rows[0].role !== 'admin') {
      return res.status(403).json("Нямате права!");
    }

    // Обновяване
    const updateProduct = await pool.query(
      "UPDATE products SET name = $1, description = $2, price = $3, category = $4, image_url = $5, stock = $6 WHERE product_id = $7 RETURNING *",
      [name, description, price, category, image_url, stock, id]
    );

    res.json(updateProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. ИЗТРИВАНЕ НА ПРОДУКТ (DELETE)
app.delete("/products/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;

    // Проверка дали е админ
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (user.rows[0].role !== 'admin') {
      return res.status(403).json("Нямате права!");
    }

    // Изтриване
    await pool.query("DELETE FROM products WHERE product_id = $1", [id]);
    res.json("Продуктът беше изтрит!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

