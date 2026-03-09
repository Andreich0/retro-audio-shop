const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authorization = require("./middleware/authorization"); 
const multer = require("multer");
const fs = require("fs");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сървърът работи на порт ${PORT}`);
});

// === MIDDLEWARE ===
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "https://retro-audio-shop.vercel.app" // Твоят точен линк от Vercel!
  ],
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ==========================================
//              ГЛОБАЛЕН ИМЕЙЛ (NODEMAILER)
// ==========================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ПОМОЩНА ФУНКЦИЯ ЗА ИМЕЙЛ ПРИ ПОРЪЧКА
const sendOrderConfirmationEmails = async (orderId) => {
  try {
    const orderRes = await pool.query("SELECT * FROM orders WHERE order_id = $1", [orderId]);
    const order = orderRes.rows[0];

    const itemsRes = await pool.query(
      "SELECT p.name, oi.quantity, oi.price_at_purchase FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = $1",
      [orderId]
    );
    const items = itemsRes.rows;

    const itemsHtml = items.map(item => 
      `<li><b>${item.name}</b> - ${item.quantity} бр. x ${item.price_at_purchase} €</li>`
    ).join("");

    const emailHtml = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; background: #111; color: #fff; border-radius: 10px;">
        <h1 style="color: #ff6b00; text-transform: uppercase;">Retro Audio Shop</h1>
        <h2 style="border-bottom: 1px solid #333; padding-bottom: 10px;">Поръчка #${orderId} е приета!</h2>
        <p>Здравейте, <b>${order.customer_first_name} ${order.customer_last_name}</b>,</p>
        <p>Благодарим ви за поръчката! Ето детайлите:</p>
        <ul style="background: #222; padding: 15px 30px; border-radius: 5px;">
          ${itemsHtml}
        </ul>
        <h3 style="color: #ff6b00;">Общо: ${order.total_price} €</h3>
        <p style="color: #aaa; font-size: 12px;">Ще се свържем с вас скоро за потвърждение на доставката.</p>
      </div>
    `;

    // 1. ИМЕЙЛ ДО КЛИЕНТА
    let customerEmail = null;
    if (order.user_id) {
        const userRes = await pool.query("SELECT email FROM users WHERE user_id = $1", [order.user_id]);
        if (userRes.rows.length > 0) customerEmail = userRes.rows[0].email;
    }

    if (customerEmail) {
        await transporter.sendMail({
            from: `"Retro Audio" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Потвърждение на поръчка #${orderId}`,
            html: emailHtml
        });
    }

    // 2. ИМЕЙЛ ДО ТЕБ (АДМИНА)
    await transporter.sendMail({
        from: `"Retro Audio System" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `🛒 НОВА ПОРЪЧКА #${orderId} - ${order.total_price} €`,
        html: `<p>Имаш нова поръчка от <b>${order.customer_first_name} ${order.customer_last_name}</b>.</p>
               <p>Телефон: ${order.customer_phone}</p>
               <p>Стойност: ${order.total_price} €</p>
               <p>Влез в Админ панела за повече детайли.</p>`
    });

  } catch (err) {
    console.error("Грешка при изпращане на имейли за поръчка:", err);
  }
};

// ==========================================
//              1. ТЕСТ И AUTH
// ==========================================

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

app.get("/auth/verify", authorization, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT first_name, last_name, email, role, phone, city, address FROM users WHERE user_id = $1",
      [req.user.user_id]
    );
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.put("/auth/change-password", authorization, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [userId]);
    
    if (user.rows.length === 0) {
      return res.status(404).json("Потребителят не съществува!");
    }

    const validPassword = await bcrypt.compare(oldPassword, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json("Грешна стара парола!");
    }

    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(newPassword, salt);

    await pool.query("UPDATE users SET password = $1 WHERE user_id = $2", [bcryptPassword, userId]);

    res.json("Паролата е променена успешно!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.put("/auth/profile", authorization, async (req, res) => {
  try {
    const { first_name, last_name, phone, city, address } = req.body;
    const userId = req.user.user_id;

    await pool.query(
      "UPDATE users SET first_name = $1, last_name = $2, phone = $3, city = $4, address = $5 WHERE user_id = $6",
      [first_name, last_name, phone, city, address, userId]
    );

    res.json("Профилът е обновен успешно!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- ЗАБРАВЕНА ПАРОЛА ---
app.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(404).json("Ако този имейл съществува, сме изпратили линк.");
    }

    const resetToken = jwt.sign({ user_id: user.rows[0].user_id }, process.env.JWT_SECRET || "secret_key", { expiresIn: "15m" });
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Retro Audio Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Възстановяване на парола",
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #111; color: #fff; border-radius: 10px;">
          <h2 style="color: #ff6b00;">Заявка за нова парола</h2>
          <p>Цъкнете на бутона по-долу, за да създадете нова парола. Този линк е валиден 15 минути.</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #ff6b00; color: #000; text-decoration: none; font-weight: bold; border-radius: 5px; margin-top: 10px;">Възстанови Парола</a>
        </div>
      `
    });

    res.json("Ако този имейл съществува, сме изпратили линк.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// --- СМЯНА НА ПАРОЛАТА ЧРЕЗ ТОКЕН ---
// --- СМЯНА НА ПАРОЛАТА ЧРЕЗ ТОКЕН ---
app.put("/auth/reset-password", async (req, res) => {
  console.log("\n---- НОВА ЗАЯВКА ЗА СМЯНА НА ПАРОЛА ----");
  
  try {
    const { token, newPassword } = req.body;

    if (!token) {
        console.log("❌ Грешка: Фронтендът не е изпратил токен!");
        return res.status(400).json("Липсва токен за сигурност!");
    }

    console.log("1. Токенът е получен. Опит за декодиране...");
    // Опитваме да разчетем токена
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    console.log("✅ Токенът е валиден! User ID:", payload.user_id);

    console.log("2. Криптиране на новата парола...");
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const bcryptPassword = await bcrypt.hash(newPassword, salt);
    console.log("✅ Паролата е криптирана.");

    console.log("3. Опит за запис в базата данни...");
    const updateQuery = await pool.query(
        "UPDATE users SET password = $1 WHERE user_id = $2 RETURNING *", 
        [bcryptPassword, payload.user_id]
    );

    if (updateQuery.rows.length === 0) {
        console.log("❌ Грешка: Такъв потребител не съществува в базата!");
        return res.status(404).json("Потребителят вече не съществува.");
    }

    console.log("✅ БАЗАТА Е ОБНОВЕНА УСПЕШНО!");
    res.json("Паролата е променена успешно!");

  } catch (err) {
    console.log("❌ СЪРВЪРНА ГРЕШКА УЛОВЕНА В CATCH БЛОКА:");
    console.error(err);

    if (err.name === "TokenExpiredError") {
        res.status(401).json("Линкът е изтекъл (изминали са повече от 15 минути).");
    } else if (err.name === "JsonWebTokenError") {
        res.status(401).json("Линкът е невалиден, счупен или копиран грешно.");
    } else {
        res.status(500).json("Сървърна грешка при запазване в базата данни.");
    }
  }
});

// ==========================================
//              2. ПРОДУКТИ
// ==========================================

app.get("/products", async (req, res) => {
  try {
    const allProducts = await pool.query("SELECT * FROM products ORDER BY product_id ASC");
    res.json(allProducts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

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

    // Ако е с карта статуса е "awaiting_payment", ако е с наложен платеж (cod) е "new"
    const initialStatus = customer.paymentMethod === 'card' ? 'awaiting_payment' : 'new';

    const newOrder = await pool.query(
      `INSERT INTO orders (
        customer_first_name, customer_last_name, customer_phone, customer_city, customer_address, total_price, payment_method, user_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING order_id`,
      [
        customer.firstName, customer.lastName, customer.phone, customer.city, customer.address, total, customer.paymentMethod || 'cod', userId, initialStatus
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

    // Ако поръчката е с наложен платеж, пращаме имейла веднага
    if (initialStatus === 'new') {
        sendOrderConfirmationEmails(orderId);
    }

    res.json({ message: "Успешна поръчка!", orderId });
    
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Грешка при поръчка:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// ПОТВЪРЖДАВАНЕ НА ПЛАЩАНЕ ОТ STRIPE
app.put("/orders/:id/success", async (req, res) => {
    try {
      const { id } = req.params;

      // 1. Първо проверяваме какъв е текущият статус на поръчката
      const orderCheck = await pool.query("SELECT status FROM orders WHERE order_id = $1", [id]);
      
      if (orderCheck.rows.length === 0) {
          return res.status(404).json("Поръчката не е намерена.");
      }

      // 2. АКО ПОРЪЧКАТА ВЕЧЕ НЕ Е 'awaiting_payment', ЗНАЧИ Е ПЛАТЕНА!
      // Спираме дотук и НЕ пращаме втори имейл.
      if (orderCheck.rows[0].status !== 'awaiting_payment') {
          return res.json("Поръчката вече е потвърдена. Няма да пращаме нов имейл.");
      }

      // 3. Ако всичко е точно, обновяваме статуса на 'new' (нова платена поръчка)
      await pool.query("UPDATE orders SET status = 'new' WHERE order_id = $1", [id]);
      
      // 4. Пращаме имейла САМО ВЕДНЪЖ!
      sendOrderConfirmationEmails(id);
  
      res.json("Плащането е успешно отразено и имейлът е изпратен!");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
});

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

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, orderId } = req.body;

    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency: "eur",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100), 
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      client_reference_id: orderId.toString(), 
      success_url: `http://localhost:3000/checkout/success?orderId=${orderId}`, 
      cancel_url: `http://localhost:3000/checkout?canceled=true&orderId=${orderId}`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err.message);
    res.status(500).json({ error: "Грешка при Stripe плащане" });
  }
});

// --- ПОВТОРНО ПЛАЩАНЕ НА СЪЩЕСТВУВАЩА ПОРЪЧКА ---
app.post("/orders/:id/retry-payment", authorization, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Проверяваме поръчката
    const orderRes = await pool.query(
      "SELECT * FROM orders WHERE order_id = $1 AND user_id = $2",
      [id, req.user.user_id]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: "Поръчката не е намерена." });
    }

    // 2. Взимаме продуктите от поръчката
    const itemsRes = await pool.query(
      `SELECT p.name, oi.quantity, oi.price_at_purchase as price 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.product_id 
       WHERE oi.order_id = $1`,
      [id]
    );

    // 3. Подготвяме ги за Stripe
    const lineItems = itemsRes.rows.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // 4. Създаваме нова Stripe сесия
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      client_reference_id: id.toString(),
      success_url: `http://localhost:3000/checkout/success?orderId=${id}`, 
      cancel_url: `http://localhost:3000/dashboard`, // Връща го в Дашборда при отказ
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Грешка при повторно плащане:", err.message);
    res.status(500).json({ error: "Сървърна грешка при генериране на плащането." });
  }
});

app.delete("/orders/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const items = await pool.query("SELECT product_id, quantity FROM order_items WHERE order_id = $1", [id]);
    
    await pool.query("BEGIN");
    for (const item of items.rows) {
      await pool.query("UPDATE products SET stock = stock + $1 WHERE product_id = $2", [item.quantity, item.product_id]);
    }

    await pool.query("DELETE FROM order_items WHERE order_id = $1", [id]);
    await pool.query("DELETE FROM orders WHERE order_id = $1", [id]);

    await pool.query("COMMIT");
    res.json("Поръчката е анулирана успешно.");
  } catch (err) {
    await pool.query("ROLLBACK");
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

app.post("/upload", upload.single("image"), (req, res) => {
  try {
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("Грешка при качване");
  }
});

app.post("/products", authorization, async (req, res) => {
  try {
    const { name, description, price, category, image_url, stock, condition } = req.body;
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    
    if (user.rows[0].role !== 'admin' && user.rows[0].role !== 'superadmin') {
      return res.status(403).json("Нямате права!");
    }

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

app.put("/products/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url, stock, condition } = req.body;
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    
    if (user.rows[0].role !== 'admin' && user.rows[0].role !== 'superadmin') {
      return res.status(403).json("Нямате права!");
    }

    const updateProduct = await pool.query(
      "UPDATE products SET name = $1, description = $2, price = $3, category = $4, image_url = $5, stock = $6, condition = $7 WHERE product_id = $8 RETURNING *",
      [name, description, price, category, image_url, stock, condition || 'good', id]
    );

    res.json(updateProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.delete("/products/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    
    if (user.rows[0].role !== 'admin' && user.rows[0].role !== 'superadmin') {
      return res.status(403).json("Нямате права!");
    }

    await pool.query("DELETE FROM products WHERE product_id = $1", [id]);
    res.json("Продуктът беше изтрит!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.get("/admin/orders", authorization, async (req, res) => {
  try {
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    
    if (user.rows[0].role !== 'admin' && user.rows[0].role !== 'superadmin') {
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

app.put("/admin/orders/:id/status", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    
    if (user.rows[0].role !== 'admin' && user.rows[0].role !== 'superadmin') {
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
//              5. УПРАВЛЕНИЕ НА ПОТРЕБИТЕЛИ
// ==========================================

app.get("/admin/users", authorization, async (req, res) => {
  try {
    const requester = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    
    if (requester.rows[0].role !== 'admin' && requester.rows[0].role !== 'superadmin') {
      return res.status(403).json("Нямате права!");
    }

    const users = await pool.query("SELECT user_id, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC");
    res.json(users.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.delete("/admin/users/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const requester = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    
    if (requester.rows[0].role !== 'superadmin') {
      return res.status(403).json("Само Супер Администратор може да трие потребители!");
    }

    if (id === req.user.user_id) {
        return res.status(400).json("Не можете да изтриете собствения си акаунт!");
    }

    await pool.query("DELETE FROM users WHERE user_id = $1", [id]);
    res.json("Потребителят беше изтрит!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.put("/admin/users/:id/role", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const requester = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    
    if (requester.rows[0].role !== 'superadmin') {
      return res.status(403).json("Само Супер Администратор може да променя роли!");
    }

    if (id === req.user.user_id) {
        return res.status(400).json("Не можете да променяте собствената си роля!");
    }

    await pool.query("UPDATE users SET role = $1 WHERE user_id = $2", [role, id]);
    res.json("Ролята е обновена успешно!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.put("/admin/users/:id/password", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const requester = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    
    if (requester.rows[0].role !== 'admin' && requester.rows[0].role !== 'superadmin') {
      return res.status(403).json("Нямате права!");
    }

    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(newPassword, salt);

    await pool.query("UPDATE users SET password = $1 WHERE user_id = $2", [bcryptPassword, id]);
    
    res.json("Паролата е сменена успешно!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==========================================
//              6. КОНТАКТИ (ИМЕЙЛ)
// ==========================================
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: process.env.EMAIL_USER,   
      replyTo: email,               
      subject: `Ново запитване от сайта: ${name}`,
      text: `Имате ново съобщение от формата за контакти!\n\nИме: ${name}\nИмейл: ${email}\n\nСъобщение:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
            <h2 style="color: #ff6b00;">Ново запитване от сайта</h2>
            <p><strong>Име:</strong> ${name}</p>
            <p><strong>Имейл:</strong> ${email}</p>
            <div style="background-color: #fff; padding: 15px; border-left: 4px solid #ff6b00; margin-top: 15px;">
                <p style="white-space: pre-wrap;">${message}</p>
            </div>
        </div>
      `
    };

    // Използваме глобалния транспортер
    await transporter.sendMail(mailOptions);
    res.json("Съобщението е изпратено успешно!");

  } catch (err) {
    console.error("Грешка при изпращане на имейл:", err);
    res.status(500).json("Възникна грешка при изпращането.");
  }
});

// ==========================================
//              7. ЛЮБИМИ (WISHLIST)
// ==========================================

// ДОБАВЯНЕ ИЛИ ПРЕМАХВАНЕ (TOGGLE)
app.post("/wishlist/toggle", authorization, async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user.user_id;

    // Проверяваме дали вече е добавен
    const check = await pool.query(
        "SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2", 
        [user_id, product_id]
    );

    if (check.rows.length > 0) {
      // Ако го има -> Трием го (Махаме сърчицето)
      await pool.query("DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2", [user_id, product_id]);
      res.json({ message: "Премахнат от любими", isFavorite: false });
    } else {
      // Ако го няма -> Добавяме го (Слагаме сърчицето)
      await pool.query("INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)", [user_id, product_id]);
      res.json({ message: "Добавен в любими", isFavorite: true });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ВЗИМАНЕ НА ВСИЧКИ ЛЮБИМИ ПРОДУКТИ НА ПОТРЕБИТЕЛЯ
app.get("/wishlist", authorization, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    // Взимаме цялото инфо за продуктите, като ги свързваме с таблицата wishlist
    const wishlist = await pool.query(
      `SELECT p.* FROM wishlist w 
       JOIN products p ON w.product_id = p.product_id 
       WHERE w.user_id = $1
       ORDER BY w.wishlist_id DESC`,
      [user_id]
    );
    res.json(wishlist.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ПРОВЕРКА ДАЛИ ДАДЕН ПРОДУКТ Е ЛЮБИМ (За да оцветим сърчицето)
app.get("/wishlist/check/:id", authorization, async (req, res) => {
    try {
        const product_id = req.params.id;
        const user_id = req.user.user_id;
        
        const check = await pool.query(
            "SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2", 
            [user_id, product_id]
        );
        
        res.json({ isFavorite: check.rows.length > 0 });
    } catch(err) {
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