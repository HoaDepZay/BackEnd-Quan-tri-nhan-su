import sql from "mssql";
import "dotenv/config";

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER, 
  port: parseInt(process.env.DB_PORT || "1433"),
  database: process.env.DB_NAME,
  options: {
    // instanceName: process.env.DB_INSTANCE, // <--- TẠM THỜI COMMENT DÒNG NÀY LẠI
    encrypt: false, 
    trustServerCertificate: true,
    connectTimeout: 30000,
  },
  // ... phần còn lại giữ nguyên
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
export { connectDB, sql };
