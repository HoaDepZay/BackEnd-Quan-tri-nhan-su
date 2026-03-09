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

// ĐẢM BẢO Body Parser được setup đúng
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// Middleware để debug request body
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  console.log("   Body:", JSON.stringify(req.body, null, 2));
  next();
});

// PHÂN LOẠI Endpoint
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/admin", adminRoutes);

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
