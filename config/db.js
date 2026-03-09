const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
};

// Hàm kết nối DB
const connectDB = async () => {
  try {
    await sql.connect(config);
    console.log("✅ Đã kết nối SQL Server thành công (Global Pool)");
  } catch (err) {
    console.error("❌ Lỗi kết nối SQL Server:", err.message);
    process.exit(1); // Dừng server nếu không kết nối được DB
  }
};

module.exports = { connectDB, sql };
