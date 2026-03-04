require("dotenv").config();
const express = require("express");
const cors = require("cors");
// THAY ĐỔI Ở ĐÂY: Import connectDB thay vì msnodesqlv8
const { connectDB } = require("./config/db");

const authRoutes = require("./routers/authRoutes");
const employeeRoutes = require("./routers/employee");
const adminRoutes = require("./routers/admin");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/admin", adminRoutes);

// --- KẾT NỐI DB VÀ CHẠY SERVER ---
console.log("🔍 Đang kết nối Database...");

// Sử dụng hàm connectDB (async) đã viết ở db.js
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ HUIT ERP RUNNING AT http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Không thể khởi động server do lỗi kết nối DB.");
  });
