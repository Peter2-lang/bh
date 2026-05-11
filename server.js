import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT) || 3306,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true, // Prevents the connection from dropping
  keepAliveInitialDelay: 10000
});

// New Route to view the records (to prove they exist)
app.get("/api/logs", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM class_logs ORDER BY created_at DESC LIMIT 100");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/log-classes", async (req, res) => {
  const { classes } = req.body;
  if (!classes) return res.status(400).json({ error: "Empty string" });

  try {
    // We use 'IGNORE' or a check if you want to avoid massive duplicates
    await pool.query("INSERT INTO class_logs (classes) VALUES (?)", [classes]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Failed to save" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;

// Test connection before listening
async function startServer() {
  try {
    await pool.getConnection();
    console.log("✅ Database connection established.");
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
  } catch (err) {
    console.error("❌ Could not connect to DB. Check your .env file!");
    console.error(err);
    process.exit(1); 
  }
}

startServer();
