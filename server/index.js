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
const path = require("path");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// === MIDDLEWARE ===
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://retro-audio-shop.vercel.app",
    /\.vercel\.app$/ 
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "token", "Authorization"]
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ==========================================
//              BREVO API (ИМЕЙЛИ)
// ==========================================

const sendBrevoEmail = async (toEmail, subject, htmlContent, replyToEmail = null) => {
  try {
    const bodyData = {
      sender: { name: "Retro Audio Shop", email: "retroaudio.sales@gmail.com" },
      to: [{ email: toEmail }],
      subject: subject,
      htmlContent: htmlContent
    };

    if (replyToEmail) {
      bodyData.replyTo = { email: replyToEmail };
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(bodyData)
    });

    if (response.ok) {
      console.log(`✅ Имейл до ${toEmail} е изпратен успешно!`);
    } else {
      const errorData = await response.json();
      console.error("❌ Грешка от Brevo API:", errorData);
    }
  } catch (err) {
    console.error("❌ Сървърна грешка при връзка с Brevo:", err);
  }
};

const sendWelcomeEmail = async (userEmail, firstName) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0a0a0a; padding: 40px 15px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #333; border-top: 4px solid #ff6b00; border-radius: 12px; overflow: hidden;">
        <div style="text-align: center; padding: 30px 20px; border-bottom: 1px solid #333;">
           <h1 style="color: #ff6b00; margin: 0; font-size: 28px; font-style: italic; letter-spacing: -1px; text-transform: uppercase;">RETRO <span style="color: #fff;">AUDIO</span></h1>
        </div>
        <div style="padding: 30px 20px;">
           <h2 style="color: #fff; margin-top: 0;">Добре дошли, ${firstName}! 🎧</h2>
           <p style="color: #ccc; line-height: 1.6;">Радваме се, че се присъединихте към нашата общност от аудиофили и ценители на истинския, аналогов звук.</p>
           <p style="color: #ccc; line-height: 1.6;">Вече имате достъп до пълните функции на платформата:</p>
           <ul style="color: #aaa; line-height: 1.8; margin: 20px 0; font-size: 14px;">
             <li>❤️ Запазване на продукти в <strong>Любими</strong></li>
             <li>📦 Бързо плащане с предварително запазени данни</li>
             <li>📊 Пълна история и проследяване на поръчките</li>
           </ul>
           <div style="text-align: center; margin-top: 40px;">
             <a href="https://retro-audio-shop.vercel.app/shop" style="background-color: #ff6b00; color: #000; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; text-transform: uppercase; font-size: 12px; display: inline-block;">Разгледай Каталога</a>
           </div>
        </div>
      </div>
      <p style="text-align: center; color: #666; font-size: 10px; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px;">© 2026 Retro Audio Shop. Всички права запазени.</p>
    </div>
  `;

  await sendBrevoEmail(userEmail, "Добре дошли в Retro Audio Shop! 🎵", htmlContent);
};

const sendOrderConfirmationEmails = async (orderId) => {
  try {
    const orderRes = await pool.query("SELECT * FROM orders WHERE order_id = $1", [orderId]);
    const order = orderRes.rows[0];

    const itemsRes = await pool.query(
      "SELECT p.product_id, p.name, p.image_url, oi.quantity, oi.price_at_purchase FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = $1",
      [orderId]
    );
    const items = itemsRes.rows;

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 15px 0; border-bottom: 1px solid #333;" width="70">
          <img src="${item.image_url}" alt="${item.name}" width="60" height="60" style="border-radius: 4px; object-fit: contain; background: #fff; padding: 2px; display: block;" />
        </td>
        <td style="padding: 15px 10px; border-bottom: 1px solid #333;">
          <a href="https://retro-audio-shop.vercel.app/shop/${item.product_id}" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px;">${item.name}</a>
          <br/>
          <span style="color: #888888; font-size: 12px;">Количество: ${item.quantity} бр.</span>
        </td>
        <td style="padding: 15px 0; border-bottom: 1px solid #333; text-align: right; color: #ff6b00; font-weight: bold; font-size: 16px;">
          ${item.price_at_purchase} €
        </td>
      </tr>
    `).join("");

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #0a0a0a; padding: 40px 15px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #333; border-top: 4px solid #ff6b00; border-radius: 12px; overflow: hidden;">
          <div style="text-align: center; padding: 30px 20px; border-bottom: 1px solid #333;">
             <h1 style="color: #ff6b00; margin: 0; font-size: 28px; font-style: italic; letter-spacing: -1px; text-transform: uppercase;">RETRO <span style="color: #fff;">AUDIO</span></h1>
          </div>
          <div style="padding: 30px 20px;">
             <h2 style="color: #fff; margin-top: 0;">Здравейте, ${order.customer_first_name}!</h2>
             <p style="color: #ccc; line-height: 1.6;">Благодарим ви за поръчката. Тя беше успешно приета и вече се обработва от нашия екип.</p>
             
             <h3 style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 30px;">Детайли за Поръчка #${orderId}</h3>
             
             <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
               ${itemsHtml}
             </table>
             
             <div style="text-align: right; padding-top: 15px;">
               <p style="margin: 0; font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold;">Общо за плащане</p>
               <p style="margin: 0; font-size: 24px; font-weight: bold; color: #ff6b00;">${order.total_price} €</p>
             </div>
             
             <div style="margin-top: 40px; background: #0f0f13; padding: 25px 20px; border-radius: 8px; text-align: center; border: 1px solid #333;">
               <p style="color: #aaa; font-size: 14px; margin-bottom: 15px;">Имате въпроси или желаете промяна?</p>
               <a href="https://retro-audio-shop.vercel.app/contact" style="background-color: #ff6b00; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 4px; font-size: 12px; text-transform: uppercase;">Свържете се с нас</a>
               <p style="color: #666; font-size: 12px; margin-top: 15px;">или директно върнете отговор на този имейл.</p>
             </div>
          </div>
        </div>
        <p style="text-align: center; color: #666; font-size: 10px; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px;">© 2026 Retro Audio Shop. Всички права запазени.</p>
      </div>
    `;

    // --- ПРОМЯНАТА Е ТУК: ВЗИМАМЕ ИМЕЙЛА ДИРЕКТНО ОТ ПОРЪЧКАТА ---
    let customerEmail = order.customer_email;
    
    // Ако е стара поръчка без имейл, търсим го в users таблицата
    if (!customerEmail && order.user_id) {
        const userRes = await pool.query("SELECT email FROM users WHERE user_id = $1", [order.user_id]);
        if (userRes.rows.length > 0) customerEmail = userRes.rows[0].email;
    }

    if (customerEmail) {
        await sendBrevoEmail(customerEmail, `Потвърждение на поръчка #${orderId} от Retro Audio Shop`, emailHtml);
    }

    const adminHtml = `
      <p>Имаш нова поръчка от <b>${order.customer_first_name} ${order.customer_last_name}</b>.</p>
      <p>Имейл: ${customerEmail || "Няма"}</p>
      <p>Телефон: ${order.customer_phone}</p>
      <p>Стойност: ${order.total_price} €</p>
      <p>Влез в Админ панела за повече детайли.</p>
    `;
    await sendBrevoEmail("retroaudio.sales@gmail.com", `🛒 НОВА ПОРЪЧКА #${orderId} - ${order.total_price} €`, adminHtml);

  } catch (err) {
    console.error("Грешка при генериране на имейли за поръчка:", err);
  }
};

// ==========================================
//               1. AUTH МАРШРУТИ
// ==========================================

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Retro Audio API is connected!", server_time: result.rows[0].now });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Database connection failed");
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) return res.status(401).json({ message: "Този имейл вече е регистриран!" });

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, 'user') RETURNING *",
      [first_name, last_name, email, bcryptPassword]
    );

    const token = jwt.sign({ user_id: newUser.rows[0].user_id }, process.env.JWT_SECRET || "secret_key", { expiresIn: "1h" });
    
    console.log(`Изпращане на Welcome имейл до ${email}...`);
    sendWelcomeEmail(email, first_name).catch(console.error);

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

    if (user.rows.length === 0) return res.status(401).json({ message: "Грешен имейл или парола!" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(401).json({ message: "Грешен имейл или парола!" });

    const token = jwt.sign({ user_id: user.rows[0].user_id }, process.env.JWT_SECRET || "secret_key", { expiresIn: "1h" });
    res.json({ token, role: user.rows[0].role });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.get("/auth/verify", authorization, async (req, res) => {
  try {
    const user = await pool.query("SELECT first_name, last_name, email, role, phone, city, address FROM users WHERE user_id = $1", [req.user.user_id]);
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.put("/auth/change-password", authorization, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [req.user.user_id]);
    if (user.rows.length === 0) return res.status(404).json("Потребителят не съществува!");

    const validPassword = await bcrypt.compare(oldPassword, user.rows[0].password);
    if (!validPassword) return res.status(401).json("Грешна стара парола!");

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(newPassword, salt);
    await pool.query("UPDATE users SET password = $1 WHERE user_id = $2", [bcryptPassword, req.user.user_id]);
    res.json("Паролата е променена успешно!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.put("/auth/profile", authorization, async (req, res) => {
  try {
    const { first_name, last_name, phone, city, address } = req.body;
    await pool.query("UPDATE users SET first_name = $1, last_name = $2, phone = $3, city = $4, address = $5 WHERE user_id = $6", [first_name, last_name, phone, city, address, req.user.user_id]);
    res.json("Профилът е обновен успешно!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) return res.status(200).json("Ако този имейл съществува, сме изпратили линк.");

    const resetToken = jwt.sign({ user_id: user.rows[0].user_id }, process.env.JWT_SECRET || "secret_key", { expiresIn: "15m" });
    const resetLink = `https://retro-audio-shop.vercel.app/reset-password?token=${resetToken}`;

    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; background: #111; color: #fff; border-radius: 10px;">
        <h2 style="color: #ff6b00;">Заявка за нова парола</h2>
        <p>Цъкнете на бутона по-долу, за да създадете нова парола. Линкът важи 15 мин.</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #ff6b00; color: #000; text-decoration: none; font-weight: bold; border-radius: 5px;">Възстанови Парола</a>
      </div>
    `;

    await sendBrevoEmail(email, "Възстановяване на парола", htmlContent);

    res.json("Ако този имейл съществува, сме изпратили линк.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.put("/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(newPassword, salt);
    await pool.query("UPDATE users SET password = $1 WHERE user_id = $2", [bcryptPassword, payload.user_id]);
    res.json("Паролата е променена успешно!");
  } catch (err) {
    console.error(err);
    res.status(401).json("Линкът е невалиден или изтекъл.");
  }
});

// ==========================================
//               2. ПРОДУКТИ
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
    const product = await pool.query("SELECT * FROM products WHERE product_id = $1", [req.params.id]);
    if (product.rows.length === 0) return res.status(404).json({ message: "Продуктът не е намерен!" });
    res.json(product.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==========================================
//               3. ПОРЪЧКИ (ORDERS)
// ==========================================

app.post("/orders", async (req, res) => {
  try {
    const { customer, items } = req.body; 
    const token = req.header("token");
    let userId = null;

    // 1. Проверяваме дали потребителят е логнат (има валиден token)
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
        userId = payload.user_id;
      } catch (err) { console.log("Guest order."); }
    }

    // --- НОВАТА ЛОГИКА Е ТУК ---
    // 2. Ако не е логнат (userId е null), но е въвел имейл, 
    // проверяваме дали този имейл има регистрация в сайта.
    if (!userId && customer.email) {
        const userCheck = await pool.query("SELECT user_id FROM users WHERE email = $1", [customer.email]);
        if (userCheck.rows.length > 0) {
            userId = userCheck.rows[0].user_id; // Намерихме го! Вързваме поръчката към профила му.
        }
    }
    // ---------------------------

    await pool.query("BEGIN"); 

    let calculatedTotal = 0;
    const validItems = [];

    for (const item of items) {
      const productRes = await pool.query("SELECT price, stock FROM products WHERE product_id = $1 FOR UPDATE", [item.product_id]);
      
      if (productRes.rows.length === 0) {
        throw new Error(`Продуктът не е намерен.`);
      }

      const dbProduct = productRes.rows[0];

      if (dbProduct.stock < item.quantity) {
        throw new Error(`Няма достатъчно наличност за един или повече продукти.`);
      }

      calculatedTotal += Number(dbProduct.price) * item.quantity;
      
      validItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: dbProduct.price 
      });
    }

    const initialStatus = customer.paymentMethod === 'card' ? 'awaiting_payment' : 'new';
    
    const newOrder = await pool.query(
      `INSERT INTO orders (customer_first_name, customer_last_name, customer_email, customer_phone, customer_city, customer_address, total_price, payment_method, user_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING order_id`,
      [customer.firstName, customer.lastName, customer.email, customer.phone, customer.city, customer.address, calculatedTotal, customer.paymentMethod || 'cod', userId, initialStatus]
    );

    const orderId = newOrder.rows[0].order_id;
    
    for (const item of validItems) {
      await pool.query(`INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)`, [orderId, item.product_id, item.quantity, item.price]);
      await pool.query("UPDATE products SET stock = stock - $1 WHERE product_id = $2", [item.quantity, item.product_id]);
    }
    
    await pool.query("COMMIT"); 

    if (initialStatus === 'new') sendOrderConfirmationEmails(orderId);
    
    res.json({ message: "Успешна поръчка!", orderId });
  } catch (err) {
    await pool.query("ROLLBACK"); 
    console.error(err.message);
    res.status(400).json({ error: err.message || "Грешка при обработка на поръчката." });
  }
});

app.put("/orders/:id/success", async (req, res) => {
    try {
      const { id } = req.params;
      const orderCheck = await pool.query("SELECT status FROM orders WHERE order_id = $1", [id]);
      if (orderCheck.rows.length === 0) return res.status(404).json("Поръчката не е намерена.");
      if (orderCheck.rows[0].status !== 'awaiting_payment') return res.json("Поръчката вече е потвърдена.");
      
      await pool.query("UPDATE orders SET status = 'new' WHERE order_id = $1", [id]);
      sendOrderConfirmationEmails(id);
      res.json("Плащането е успешно отразено!");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
});

app.get("/orders/mine", authorization, async (req, res) => {
  try {
    const myOrders = await pool.query("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [req.user.user_id]);
    res.json(myOrders.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.get("/orders/:id/items", authorization, async (req, res) => {
  try {
    const items = await pool.query(`SELECT p.name, p.image_url, oi.quantity, oi.price_at_purchase FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = $1`, [req.params.id]);
    res.json(items.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, orderId } = req.body;
    const lineItems = items.map((item) => ({
      price_data: { currency: "eur", product_data: { name: item.name }, unit_amount: Math.round(item.price * 100) },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      client_reference_id: orderId.toString(), 
      success_url: `https://retro-audio-shop.vercel.app/checkout/success?orderId=${orderId}`, 
      cancel_url: `https://retro-audio-shop.vercel.app/checkout?canceled=true&orderId=${orderId}`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err.message);
    res.status(500).json({ error: "Грешка при Stripe плащане" });
  }
});

app.post("/orders/:id/retry-payment", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const itemsRes = await pool.query(`SELECT p.name, oi.quantity, oi.price_at_purchase as price FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = $1`, [id]);
    
    const lineItems = itemsRes.rows.map((item) => ({
      price_data: { currency: "eur", product_data: { name: item.name }, unit_amount: Math.round(item.price * 100) },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      client_reference_id: id.toString(),
      success_url: `https://retro-audio-shop.vercel.app/checkout/success?orderId=${id}`, 
      cancel_url: `https://retro-audio-shop.vercel.app/dashboard`, 
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.delete("/orders/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const items = await pool.query("SELECT product_id, quantity FROM order_items WHERE order_id = $1", [id]);
    await pool.query("BEGIN");
    for (const item of items.rows) await pool.query("UPDATE products SET stock = stock + $1 WHERE product_id = $2", [item.quantity, item.product_id]);
    await pool.query("DELETE FROM order_items WHERE order_id = $1", [id]);
    await pool.query("DELETE FROM orders WHERE order_id = $1", [id]);
    await pool.query("COMMIT");
    res.json("Поръчката е анулирана успешно.");
  } catch (err) {
    await pool.query("ROLLBACK");
    res.status(500).send("Server Error");
  }
});

// ==========================================
//               4. АДМИН ПАНЕЛ & СНИМКИ
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  try {
    res.json({ url: `https://retro-audio-api-o7it.onrender.com/uploads/${req.file.filename}` });
  } catch (err) { res.status(500).send("Грешка при качване"); }
});

app.post("/products", authorization, async (req, res) => {
  try {
    const { name, description, price, category, image_url, stock, condition } = req.body;
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (user.rows[0].role !== 'admin' && user.rows[0].role !== 'superadmin') return res.status(403).json("Нямате права!");
    
    await pool.query("INSERT INTO products (name, description, price, category, image_url, stock, condition) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [name, description, price, category, image_url, stock, condition || 'good']);
    res.json("Продуктът беше добавен успешно!");
  } catch (err) { res.status(500).send("Server Error"); }
});

app.put("/products/:id", authorization, async (req, res) => {
  try {
    const { name, description, price, category, image_url, stock, condition } = req.body;
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (user.rows[0].role !== 'admin' && user.rows[0].role !== 'superadmin') return res.status(403).json("Нямате права!");
    
    await pool.query("UPDATE products SET name = $1, description = $2, price = $3, category = $4, image_url = $5, stock = $6, condition = $7 WHERE product_id = $8", [name, description, price, category, image_url, stock, condition || 'good', req.params.id]);
    res.json("Продуктът беше обновен!");
  } catch (err) { res.status(500).send("Server Error"); }
});

app.delete("/products/:id", authorization, async (req, res) => {
  try {
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (user.rows[0].role !== 'admin' && user.rows[0].role !== 'superadmin') return res.status(403).json("Нямате права!");
    
    await pool.query("DELETE FROM products WHERE product_id = $1", [req.params.id]);
    res.json("Продуктът беше изтрит!");
  } catch (err) { res.status(500).send("Server Error"); }
});

app.get("/admin/orders", authorization, async (req, res) => {
  try {
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (user.rows[0].role !== 'admin' && user.rows[0].role !== 'superadmin') return res.status(403).json("Нямате права!");
    
    const allOrders = await pool.query(`SELECT o.*, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.user_id ORDER BY o.created_at DESC`);
    res.json(allOrders.rows);
  } catch (err) { res.status(500).send("Server Error"); }
});

app.put("/admin/orders/:id/status", authorization, async (req, res) => {
  try {
    const user = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (user.rows[0].role !== 'admin' && user.rows[0].role !== 'superadmin') return res.status(403).json("Нямате права!");
    
    await pool.query("UPDATE orders SET status = $1 WHERE order_id = $2", [req.body.status, req.params.id]);
    res.json("Статусът е обновен!");
  } catch (err) { res.status(500).send("Server Error"); }
});

// ==========================================
//               5. УПРАВЛЕНИЕ НА ПОТРЕБИТЕЛИ
// ==========================================

app.get("/admin/users", authorization, async (req, res) => {
  try {
    const requester = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (requester.rows[0].role !== 'admin' && requester.rows[0].role !== 'superadmin') return res.status(403).json("Нямате права!");
    
    const users = await pool.query("SELECT user_id, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC");
    res.json(users.rows);
  } catch (err) { res.status(500).send("Server Error"); }
});

app.delete("/admin/users/:id", authorization, async (req, res) => {
  try {
    const requester = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (requester.rows[0].role !== 'superadmin') return res.status(403).json("Нямате права!");
    
    await pool.query("DELETE FROM users WHERE user_id = $1", [req.params.id]);
    res.json("Потребителят е изтрит!");
  } catch (err) { res.status(500).send("Server Error"); }
});

app.put("/admin/users/:id/role", authorization, async (req, res) => {
  try {
    const requester = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
    if (requester.rows[0].role !== 'superadmin') return res.status(403).json("Нямате права!");
    
    await pool.query("UPDATE users SET role = $1 WHERE user_id = $2", [req.body.role, req.params.id]);
    res.json("Ролята е обновена!");
  } catch (err) { res.status(500).send("Server Error"); }
});

app.put("/admin/users/:id/password", authorization, async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(req.body.newPassword, salt);
    await pool.query("UPDATE users SET password = $1 WHERE user_id = $2", [bcryptPassword, req.params.id]);
    res.json("Паролата е променена!");
  } catch (err) { res.status(500).send("Server Error"); }
});

// ==========================================
//               6. КОНТАКТИ
// ==========================================
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
          <h2 style="color: #ff6b00;">Ново запитване от сайта</h2>
          <p><strong>Име:</strong> ${name}</p>
          <p><strong>Имейл:</strong> ${email}</p>
          <div style="background-color: #fff; padding: 15px; border-left: 4px solid #ff6b00; margin-top: 15px;">
              <p style="white-space: pre-wrap;">${message}</p>
          </div>
      </div>
    `;
    
    await sendBrevoEmail("retroaudio.sales@gmail.com", `Ново запитване от сайта: ${name}`, htmlContent, email);
    res.json("Съобщението е изпратено успешно!");
  } catch (err) { res.status(500).json("Възникна грешка при изпращането."); }
});

// ==========================================
//               7. ЛЮБИМИ (WISHLIST)
// ==========================================
app.post("/wishlist/toggle", authorization, async (req, res) => {
  try {
    const check = await pool.query("SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2", [req.user.user_id, req.body.product_id]);
    if (check.rows.length > 0) {
      await pool.query("DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2", [req.user.user_id, req.body.product_id]);
      res.json({ message: "Премахнат от любими", isFavorite: false });
    } else {
      await pool.query("INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)", [req.user.user_id, req.body.product_id]);
      res.json({ message: "Добавен в любими", isFavorite: true });
    }
  } catch (err) { res.status(500).send("Server Error"); }
});

app.get("/wishlist", authorization, async (req, res) => {
  try {
    const wishlist = await pool.query(`SELECT p.* FROM wishlist w JOIN products p ON w.product_id = p.product_id WHERE w.user_id = $1 ORDER BY w.wishlist_id DESC`, [req.user.user_id]);
    res.json(wishlist.rows);
  } catch (err) { res.status(500).send("Server Error"); }
});

app.get("/wishlist/check/:id", authorization, async (req, res) => {
    try {
        const check = await pool.query("SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2", [req.user.user_id, req.params.id]);
        res.json({ isFavorite: check.rows.length > 0 });
    } catch(err) { res.status(500).send("Server Error"); }
});

// ==========================================
//               START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});