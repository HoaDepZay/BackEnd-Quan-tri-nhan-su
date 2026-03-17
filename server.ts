import "dotenv/config";
import express from "express";
import cors from "cors";
// THAY ĐỔI Ở ĐÂY: Import connectDB thay vì msnodesqlv8
import { connectDB } from "./config/db";

import authRoutes from "./routers/authRoutes";
import employeeRoutes from "./routers/employee";
import adminRoutes from "./routers/admin";
import departmentRoutes from "./routers/departmentRoutes";
import projectRoutes from "./routers/projectRoutes";
import payrollRoutes from "./routers/payrollRoutes";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

// Set up Swagger
const swaggerDocument = YAML.load(path.join(__dirname, "docs/swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
app.use("/api/departments", departmentRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/payroll", payrollRoutes);

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
