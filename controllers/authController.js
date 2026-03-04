const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const newUser = await authService.register(req.body);
    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.",
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi đăng ký: " + error.message,
    });
  }
};

// src/controllers/authController.js
const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    const result = await authService.verifyOTP(email, otpCode);

    // Debug: Xem thực tế Service trả về cái gì
    console.log("Kết quả từ Service:", result);

    // Trả về trực tiếp đối tượng result (đã có success và message)
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi tại Controller:", error.message);
    return res.status(400).json({
      success: false, // Ở đây dùng viết thường cho đồng bộ với Frontend
      message: error.message,
    });
  }
};
module.exports = { register, verifyOtp };
