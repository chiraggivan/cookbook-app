const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
const useSSL = process.env.DB_SSL === "true";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: useSSL
    ? {
        ca: fs.readFileSync(path.join(__dirname, "../../ca.pem")),
      }
    : undefined,
  connectionLimit: 10,
});

// console.log("Database Connected Successfully");

module.exports = pool.promise();
