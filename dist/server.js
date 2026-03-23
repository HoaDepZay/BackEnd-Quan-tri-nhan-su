"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// THAY ĐỔI Ở ĐÂY: Import connectDB thay vì msnodesqlv8
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routers/authRoutes"));
const employee_1 = __importDefault(require("./routers/employee"));
const admin_1 = __importDefault(require("./routers/admin"));
const departmentRoutes_1 = __importDefault(require("./routers/departmentRoutes"));
const projectRoutes_1 = __importDefault(require("./routers/projectRoutes"));
const payrollRoutes_1 = __importDefault(require("./routers/payrollRoutes"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Set up Swagger
const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, "docs/swagger.yaml"));
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// ĐẢM BẢO Body Parser được setup đúng
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use((0, cors_1.default)());
// Middleware để debug request body
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    console.log("   Body:", JSON.stringify(req.body, null, 2));
    next();
});
// PHÂN LOẠI Endpoint
app.use("/api/auth", authRoutes_1.default);
app.use("/api/employees", employee_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api/departments", departmentRoutes_1.default);
app.use("/api/projects", projectRoutes_1.default);
app.use("/api/payroll", payrollRoutes_1.default);
console.log("🔍 Đang kết nối Database...");
// Sử dụng hàm connectDB (async) đã viết ở db.js
(0, db_1.connectDB)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`✅ HUIT ERP RUNNING AT http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error("❌ Không thể khởi động server do lỗi kết nối DB.");
});
