import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Create MySQL Pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT) || 3306,
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
});

// ✅ Test DB connection on startup
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL");

    // ✅ Create table automatically if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS class_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        classes TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Table 'class_logs' is ready");

    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
}

initDatabase();


// ✅ Save class names
app.post("/api/log-classes", async (req, res) => {
  const { classes } = req.body;

  if (!classes) {
    return res.status(400).json({
      success: false,
      error: "No classes sent",
    });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO class_logs (classes) VALUES (?)",
      [classes]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
    });
  } catch (err) {
    console.error("Database Insert Error:", err.message);
    res.status(500).json({
      success: false,
      error: "Database error",
    });
  }
});


// ✅ Test route
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    res.json({
      success: true,
      message: "Database connected successfully",
      time: rows[0].now,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});


// ✅ Serve React build
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});  }
});

// Serve React/Vite website
app.use(express.static(path.join(__dirname, "dist")));

// React fallback route (Always at the end)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000; 

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
