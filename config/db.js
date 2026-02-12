// config/db.js
require("dotenv").config();

// Kiểm tra xem biến môi trường có lấy được không (quan trọng)
const server = process.env.DB_SERVER;
const dbName = process.env.DB_NAME;
const user = process.env.DB_USER;
const pass = process.env.DB_PASS;

const connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=${server};Database=${dbName};UID=${user};PWD=${pass};TrustServerCertificate=yes;Connection Timeout=30;`;

// 👇👇 QUAN TRỌNG: Phải xuất ra dưới dạng Object
module.exports = {
  connectionString,
  adminConnectionString: connectionString,
};
