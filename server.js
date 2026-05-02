import express from "express";
import mysql from "mysql2";

const app = express();

// Database Configuration
const dbConfig = {
    host: process.env.MYSQL_HOST || "pg-6854f7b-mysqllabproject.h.aivencloud.com", 
    user: process.env.MYSQL_USER || "avnadmin",
    password: process.env.MYSQL_PASSWORD || "AVNS_8YdQCbT_NTgO9cgycp5",
    database: process.env.MYSQL_DATABASE || "defaultdb",
    port: process.env.MYSQL_PORT || 26147,
    ssl: {
        rejectUnauthorized: false // REQUIRED for Aiven
    }
};

const db = mysql.createConnection(dbConfig);

// Connect to Database
db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("MySQL connected successfully");
});

// Routes
app.get("/", (req, res) => {
    db.query("SELECT NOW()", (err, result) => {
        if (err) {
            return res.status(500).send("Database query failed: " + err.message);
        }
        res.send("Database Connected Successfully: " + result[0]["NOW()"]);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
