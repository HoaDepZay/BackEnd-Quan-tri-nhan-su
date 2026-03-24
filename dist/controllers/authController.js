"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Điểm NHẬN - GỌI SERVICE XỬ LÝ  - TRẢ dữ liệu và kết quả
const authService_1 = __importDefault(require("../services/authService"));
const register = async (req, res) => {
    try {
        const newUser = await authService_1.default.register(req.body);
        console.log(newUser);
        return res.status(201).json({
            success: true,
            message: "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.",
            data: newUser,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi đăng ký: " + error.message,
        });
    }
};
const verifyOtp = async (req, res) => {
    try {
        const { email, otpCode } = req.body;
        const result = await authService_1.default.verifyOTP(email, otpCode);
        // Debug: Xem thực tế Service trả về cái gì
        console.log("Kết quả từ Service:", result);
        // Trả về trực tiếp đối tượng result (đã có success và message)
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Lỗi tại Controller:", error.message);
        return res.status(400).json({
            success: false, // Ở đây dùng viết thường cho đồng bộ với Frontend
            message: error.message,
        });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ Email và Mật khẩu!",
            });
        }
        const result = await authService_1.default.login(email, password);
        // Trả về Token và thông tin User cho Frontend lưu vào LocalStorage
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Thiếu refresh token!",
            });
        }
        const result = await authService_1.default.refreshSession(refreshToken);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};
const logout = async (_req, res) => {
    return res.status(200).json({
        success: true,
        message: "Đăng xuất thành công! Vui lòng xóa accessToken/refreshToken ở client.",
    });
};
const changePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        if (!email || !oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ email, mật khẩu cũ và mật khẩu mới!",
            });
        }
        const result = await authService_1.default.changePassword(email, oldPassword, newPassword);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
const updateProfile = async (req, res) => {
    try {
        // 🔐 Lấy email của user đang đăng nhập từ JWT token
        const currentUserEmail = req.user?.userEmail;
        if (!currentUserEmail) {
            return res.status(401).json({
                success: false,
                message: "Chưa đăng nhập!",
            });
        }
        // 📋 Email cần cập nhật - có thể từ body hoặc chính user hiện tại
        const targetEmail = req.body.email || currentUserEmail;
        // 🔒 KIỂM TRA QUYỀN: User chỉ có thể cập nhật profile của chính mình
        if (currentUserEmail.toLowerCase() !== targetEmail.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền cập nhật thông tin của người khác!",
            });
        }
        const result = await authService_1.default.updateProfile(targetEmail, req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
const getPendingApprovals = async (req, res) => {
    try {
        const result = await authService_1.default.getPendingApprovals();
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
const acceptPendingRegistration = async (req, res) => {
    try {
        const result = await authService_1.default.acceptPendingRegistration(req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
const rejectPendingRegistration = async (req, res) => {
    try {
        const { email, reason, rejectedBy } = req.body;
        const result = await authService_1.default.rejectPendingRegistration(email, reason, rejectedBy);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.default = {
    register,
    verifyOtp,
    login,
    refreshToken,
    logout,
    changePassword,
    updateProfile,
    getPendingApprovals,
    acceptPendingRegistration,
    rejectPendingRegistration,
};
