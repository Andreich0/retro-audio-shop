const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authorization = require("./middleware/authorization"); 
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());
// Позволяваме достъп до снимките през браузъра
app.use("/uploads", express.static("uploads"));

// ==========================================
//              1. ТЕСТ И AUTH
// ==========================================

// Тестов маршрут
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Retro Audio API is connected!",
      server_time: result.rows[0].now,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Database connection failed");
  }
});

// РЕГИСТРАЦИЯ
app.post("/auth/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(401).json({ message: "Този имейл вече е регистриран!" });
    }

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, 'user') RETURNING *",
      [first_name, last_name, email, bcryptPassword]
    );

    const token = jwt.sign(
        { user_id: newUser.rows[0].user_id }, 
        process.env.JWT_SECRET || "secret_key", 
        { expiresIn: "1h" }
    );

    res.json({ token, role: "user" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ВХОД (LOGIN)
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Грешен имейл или парола!" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ message: "Грешен имейл или парола!" });
    }

    const token = jwt.sign(
      { user_id: user.rows[0].user_id },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.rows[0].role });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ПРОВЕРКА НА ТОКЕН (VERIFY)
app.get("/auth/verify", authorization, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT first_name, last_name, email, role FROM users WHERE user_id = $1",
      [req.user.user_id]
    );
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- СМЯНА НА ПАРОЛА (НОВО) ---
app.put("/auth/change-password", authorization, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    // 1. Намираме потребителя
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [userId]);
    
    if (user.rows.length === 0) {
      return res.status(404).json("Потребителят не съществува!");
    }

    // 2. Проверяваме дали старата парола е вярна
    const validPassword = await bcrypt.compare(oldPassword, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json("Грешна стара парола!");
    }

    // 3. Криптираме новата парола
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(newPassword, salt);

    // 4. Обновяваме в базата
    await pool.query("UPDATE users SET password = $1 WHERE user_id = $2", [bcryptPassword, userId]);

    res.json("Паролата е променена успешно!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// ==========================================
//              2. ПРОДУКТИ
// ==========================================

// ВЗИМАНЕ НА ВСИЧКИ ПРОДУКТИ
app.get("/products", async (req, res) => {
  try {
    const allProducts = await pool.query("SELECT * FROM products ORDER BY product_id ASC");
    res.json(allProducts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ВЗИМАНЕ НА ЕДИНИЧЕН ПРОДУКТ
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await pool.query("SELECT * FROM products WHERE product_id = $1", [id]);

    if (product.rows.length === 0) {
      return res.status(404).json({ message: "Продуктът не е намерен!" });
    }
    res.json(product.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==========================================
//              3. ПОРЪЧКИ (ORDERS)
// ==========================================

// --- СЪЗДАВАНЕ НА НОВА ПОРЪЧКА ---
app.post("/orders", async (req, res) => {
  try {
    const { customer, items, total } = req.body;
    const token = req.header("token") || (req.header("Authorization") ? req.header("Authorization").split(" ")[1] : null);
    
    let userId = null;

    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
        userId = payload.user_id;
      } catch (err) {
        console.log("Invalid token, processing as guest order.");
      }
    }

    await pool.query("BEGIN");

    const newOrder = await pool.query(
      `INSERT INTO orders (
        customer_first_name, 
        customer_last_name, 
        customer_phone, 
        customer_city, 
        customer_address, 
        total_price,
        payment_method,
        user_id 
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING order_id`,
      [
        customer.firstName,
        customer.lastName,
        customer.phone,
        customer.city,
        customer.address,
        total,
        customer.paymentMethod || 'cod',
        userId 
      ]
    );

    const orderId = newOrder.rows[0].order_id;

    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      );

      await pool.query(
        "UPDATE products SET stock = stock - $1 WHERE product_id = $2",
        [item.quantity, item.product_id]
      );
    }

    await pool.query("COMMIT");

    res.json({ message: "Успешна поръчка!", orderId });
    
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Грешка при поръчка:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// ВЗИМАНЕ НА МОИТЕ ПОРЪЧКИ
app.get("/orders/mine", authorization, async (req, res) => {
  try {
    const myOrders = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", 
      [req.user.user_id]
    );
    
    res.json(myOrders.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ВЗИМАНЕ НА ПРОДУКТИТЕ ЗА КОНКРЕТНА ПОРЪЧКА
app.get("/orders/:id/items", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    
    const items = await pool.query(
      `SELECT p.name, p.image_url, oi.quantity, oi.price_at_purchase 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.product_id 
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json(items.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==========================================
//              4. АДМИН ПАНЕЛ & СНИМКИ
// ==========================================

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});
const upload = multer({ storage: storage });

// КАЧВАНЕ НА СНИМКА
app.post("/upload", upload.single("image"), (req, res) => {
  try {
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("Грешка при качване");
  }
});

// ДОБАВЯНЕ НА ПРОДУКТ (САМО АДМИН)
app.post("/products", authorization, async (req, res) => {
  try {
    // Взимаме condition от body
    const { name, description, price, category, image_url, stock, condition } = req.body;
    
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (user.rows[0].role !== 'admin') {
      return res.status(403).json("Нямате права!");
    }

    // Добавяме condition в INSERT заявката
    const newProduct = await pool.query(
      "INSERT INTO products (name, description, price, category, image_url, stock, condition) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, description, price, category, image_url, stock, condition || 'good']
    );

    res.json(newProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// РЕДАКТИРАНЕ НА ПРОДУКТ (САМО АДМИН)
app.put("/products/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    // 1. Взимаме condition от req.body
    const { name, description, price, category, image_url, stock, condition } = req.body;

    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (user.rows[0].role !== 'admin') {
      return res.status(403).json("Нямате права!");
    }

    // 2. ВАЖНО: Добавихме 'condition = $7' и сменихме id на '$8'
    const updateProduct = await pool.query(
      "UPDATE products SET name = $1, description = $2, price = $3, category = $4, image_url = $5, stock = $6, condition = $7 WHERE product_id = $8 RETURNING *",
      [
        name, 
        description, 
        price, 
        category, 
        image_url, 
        stock, 
        condition || 'good', // <--- Добавяме condition тук
        id                   // <--- id отива най-накрая
      ]
    );

    res.json(updateProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ИЗТРИВАНЕ НА ПРОДУКТ (САМО АДМИН)
app.delete("/products/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (user.rows[0].role !== 'admin') {
      return res.status(403).json("Нямате права!");
    }

    await pool.query("DELETE FROM products WHERE product_id = $1", [id]);
    res.json("Продуктът беше изтрит!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- АДМИН: ВЗИМАНЕ НА ВСИЧКИ ПОРЪЧКИ ---
app.get("/admin/orders", authorization, async (req, res) => {
  try {
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (user.rows[0].role !== 'admin') {
      return res.status(403).json("Нямате права!");
    }

    const allOrders = await pool.query(`
      SELECT o.*, u.email as user_email 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      ORDER BY o.created_at DESC
    `);

    res.json(allOrders.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- АДМИН: ПРОМЯНА НА СТАТУС ---
app.put("/admin/orders/:id/status", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (user.rows[0].role !== 'admin') {
      return res.status(403).json("Нямате права!");
    }

    await pool.query("UPDATE orders SET status = $1 WHERE order_id = $2", [status, id]);

    res.json("Статусът е обновен успешно!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==========================================
//              START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});