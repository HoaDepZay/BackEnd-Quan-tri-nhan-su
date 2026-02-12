const express = require("express");
const cors = require("cors");
const sql = require("msnodesqlv8");
require("dotenv").config();
const { connectionString } = require("./config/db");
const authRoutes = require("./routers/auth");
const employeeRoutes = require("./routers/employee");
const adminRoutes = require("./routers/admin");
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
app.use("/api", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/nhan-vien", employeeRoutes);
app.use("/api", employeeRoutes);
app.use("/api/nv", employeeRoutes);

// 3. Nhóm Admin: /api/admin/...
app.use("/api/admin", adminRoutes);

// --- TEST KẾT NỐI & CHẠY SERVER ---
console.log("🔍 Đang kết nối Database...");
sql.query(connectionString, "SELECT TOP 1 MANV FROM NHANVIEN", (err) => {
  if (err) {
    console.error("❌ Lỗi kết nối SQL Server:", err.message);
  } else {
    app.listen(PORT, () =>
      console.log(`✅ HUIT ERP RUNNING AT http://localhost:${PORT}`),
    );
  }
});
