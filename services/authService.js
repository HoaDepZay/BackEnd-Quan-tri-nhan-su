const crypto = require("crypto");
const userRepository = require("../repositories/userRepository");
const { sendOTPMail } = require("../utils/mailHelper");

const authService = {
  register: async (userData) => {
    // 1. Tạo mã OTP 6 số ngẫu nhiên
    const otpCode = crypto.randomInt(100000, 999999).toString();
    // 2. Thiết lập thời gian hết hạn (ví dụ: 10 phút kể từ bây giờ)
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 10);

    // 3. Chuẩn bị dữ liệu đầy đủ để gửi xuống Repository
    const finalData = {
      ...userData,
      otpCode,
      expiredAt,
    };

    // 4. Gọi Repository để thực thi Procedure sp_DangKyUserMoi
    const result = await userRepository.registerUser(finalData);

    // 5. Gửi email chứa mã OTP (Chạy ngầm, không bắt User đợi lâu)
    sendOTPMail(userData.email, otpCode).catch((err) => {
      console.error("Lỗi gửi mail OTP:", err);
    });

    // Trả về kết quả từ DB (MANV, HOTEN...) cho Controller
    return result.recordset[0];
  },

  verifyOTP: async (email, otpCode) => {
    // Gọi Repository để chạy Procedure sp_VerifyOTP (đã tạo ở bước trước)
    const result = await userRepository.verifyOTP(email, otpCode);
    return result.recordset[0];
  },
};

module.exports = authService;
