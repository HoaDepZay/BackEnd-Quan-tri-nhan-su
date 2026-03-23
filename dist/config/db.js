"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = exports.appPool = exports.connectDB = void 0;
const mssql_1 = __importDefault(require("mssql"));
exports.sql = mssql_1.default;
require("dotenv/config");
// 1. Cấu hình cơ sở (Base Config)
const baseConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER || "",
    port: parseInt(process.env.DB_PORT || "1433"),
    options: {
        encrypt: true, // Bắt buộc cho Azure SQL
        trustServerCertificate: true,
        connectTimeout: 30000,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};
// 2. Cấu hình cho Database Nghiệp vụ (QuanTriNhanSu)
const appConfig = {
    ...baseConfig,
    database: process.env.DB_NAME,
};
// Tạo các Pool kết nối
const appPool = new mssql_1.default.ConnectionPool(appConfig);
exports.appPool = appPool;
/**
 * Hàm khởi tạo toàn bộ kết nối
 */
const connectDB = async () => {
    try {
        // Kết nối vào DB chính
        await appPool.connect();
        console.log(`✅ Kết nối thành công Database: ${process.env.DB_NAME}`);
    }
    catch (err) {
        console.error("❌ Lỗi kết nối SQL Server:", err.message);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
