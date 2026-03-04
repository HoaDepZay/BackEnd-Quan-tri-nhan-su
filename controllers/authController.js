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

const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    const result = await authService.verifyOTP(email, otpCode);

    if (result.Success) {
      return res.status(200).json({ success: true, message: result.Message });
    } else {
      return res.status(400).json({ success: false, message: result.Message });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, verifyOtp };
