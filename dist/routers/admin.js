"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const msnodesqlv8_1 = __importDefault(require("msnodesqlv8"));
const connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};UID=${process.env.DB_USER};PWD=${process.env.DB_PASS};TrustServerCertificate=yes;`;
const authMiddleware_1 = __importStar(require("../middleware/authMiddleware"));
const authController_1 = __importDefault(require("../controllers/authController"));
// --- QUẢN LÝ NHÂN VIÊN ---
// Danh sách hồ sơ đã xác thực OTP, chờ admin duyệt
router.get("/onboarding/pending", authMiddleware_1.default, authMiddleware_1.requireAdmin, authController_1.default.getPendingApprovals);
// Admin duyệt hồ sơ đăng ký và cấp thông tin nhân viên
router.post("/onboarding/accept", authMiddleware_1.default, authMiddleware_1.requireAdmin, authController_1.default.acceptPendingRegistration);
// Admin từ chối hồ sơ đăng ký
router.post("/onboarding/reject", authMiddleware_1.default, authMiddleware_1.requireAdmin, authController_1.default.rejectPendingRegistration);
// 1. Sửa nhân viên (Admin)
router.put("/nhan-vien/edit", authMiddleware_1.default, authMiddleware_1.requireAdmin, (req, res) => {
    const { manv, hoten } = req.body;
    const maphg = req.body.maphg === null ? null : Number(req.body.maphg);
    const luong = Number(req.body.luong || 0);
    const chucvu = req.body.chucvu || "Nhân viên";
    if (!manv)
        return res.status(400).json({ error: "Thiếu mã nhân viên!" });
    const query = "UPDATE NHAN_VIEN SET HOTEN = ?, MAPHG = ?, LUONG = ?, CHUCVU = ? WHERE MANV = ?";
    msnodesqlv8_1.default.query(connectionString, query, [hoten, maphg, luong, chucvu, manv], (err) => {
        if (err)
            return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Cập nhật nhân sự thành công!" });
    });
});
// 2. Xóa nhân viên (Admin)
router.delete("/nhan-vien/:manv", authMiddleware_1.default, authMiddleware_1.requireAdmin, (req, res) => {
    msnodesqlv8_1.default.query(connectionString, "DELETE FROM TAIKHOAN WHERE MANV = ?", [req.params.manv], () => {
        msnodesqlv8_1.default.query(connectionString, "DELETE FROM NHAN_VIEN WHERE MANV = ?", [req.params.manv], (err) => {
            if (err)
                return res.status(500).json({ error: err.message });
            res.json({ message: "Deleted" });
        });
    });
});
// --- QUẢN LÝ PHÒNG BAN ---
// 3. Lấy danh sách phòng ban (Admin)
router.get("/phong-ban", authMiddleware_1.default, authMiddleware_1.requireAdmin, (req, res) => {
    msnodesqlv8_1.default.query(req.userConnectionString, "SELECT MAPHG, TENPB, NG_THANHLAP FROM PHONG_BAN", (err, rows) => {
        if (err)
            return res.status(403).json({ error: "Bạn không có quyền Admin" });
        res.json(rows);
    });
});
// 4. Tạo phòng ban (Admin)
router.post("/phong-ban/create", authMiddleware_1.default, authMiddleware_1.requireAdmin, (req, res) => {
    const { tenpb } = req.body;
    if (!tenpb)
        return res.status(400).json({ error: "Vui lòng nhập tên phòng ban!" });
    const maPhongBan = Math.floor(1000 + Math.random() * 9000); // generateNumericCode inline
    const query = "INSERT INTO PHONG_BAN (MAPHG, TENPB, NG_THANHLAP) VALUES (?, ?, GETDATE())";
    msnodesqlv8_1.default.query(connectionString, query, [maPhongBan, tenpb], (err) => {
        if (err) {
            if (err.message.includes("PRIMARY KEY"))
                return res.status(500).json({ error: "Trùng ID, thử lại!" });
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            success: true,
            message: `Tạo phòng ${tenpb} thành công!`,
            id: maPhongBan,
        });
    });
});
// 5. Sửa phòng ban (Admin)
router.put("/phong-ban/edit", authMiddleware_1.default, authMiddleware_1.requireAdmin, (req, res) => {
    const maphg = Number(req.body.maphg);
    const { tenpb } = req.body;
    if (!maphg || !tenpb)
        return res.status(400).json({ error: "Thiếu thông tin!" });
    msnodesqlv8_1.default.query(connectionString, "UPDATE PHONG_BAN SET TENPB = ? WHERE MAPHG = ?", [tenpb, maphg], (err) => {
        if (err)
            return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Cập nhật thành công!" });
    });
});
// 6. Xóa phòng ban (Admin)
router.delete("/phong-ban/:maphg", authMiddleware_1.default, authMiddleware_1.requireAdmin, (req, res) => {
    const { maphg } = req.params;
    msnodesqlv8_1.default.query(connectionString, "SELECT COUNT(*) as count FROM NHAN_VIEN WHERE MAPHG = ?", [maphg], (err, rows) => {
        if (err)
            return res.status(500).json({ error: err.message });
        if (rows[0].count > 0)
            return res
                .status(400)
                .json({ error: "Không thể xóa phòng có nhân viên!" });
        msnodesqlv8_1.default.query(connectionString, "DELETE FROM PHONG_BAN WHERE MAPHG = ?", [maphg], (err) => {
            if (err)
                return res.status(500).json({ error: err.message });
            res.json({ success: true, message: "Xóa thành công!" });
        });
    });
});
exports.default = router;
