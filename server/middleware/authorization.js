const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    // 1. Взимаме токена от хедъра на заявката (token: "...")
    const jwtToken = req.header("token");

    if (!jwtToken) {
      return res.status(403).json("Нямате разрешение (Липсва токен)!");
    }

    // 2. Проверяваме дали токенът е валиден (с тайната дума)
    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);

    // 3. Ако е валиден, закачаме ID-то на потребителя към заявката
    req.user = payload;
    
    // 4. Продължаваме напред към същинската функция
    next();
  } catch (err) {
    console.error(err.message);
    return res.status(403).json("Невалиден токен!");
  }
};