const Pool = require('pg').Pool;
require('dotenv').config();

// Тук казваме: ако има DATABASE_URL, ползвай го.
// ssl: true е задължително за облачни бази данни (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;