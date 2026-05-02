
import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Database pool
const pool = mysql.createPool({
  host: process.env.pg-6854f7b-mysqllabproject.h.aivencloud.com,
  user: process.env.avnadmin,
  password: process.env.AVNS_8YdQCbT_NTgO9cgycp5,
  database: process.env.defaultdb,
  port: Number(process.env.MYSQL_PORT) || 26147,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database here, NOT on "/"
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    res.json({
      success: true,
      time: rows[0].now
    });
  } catch (err) {
    console.error("Database query failed:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Serve React/Vite website
app.use(express.static(path.join(__dirname, "dist")));

// React fallback route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
