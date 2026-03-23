// Điểm NHẬN - GỌI SERVICE XỬ LÝ  - TRẢ dữ liệu và kết quả
import authService from "../services/authService";

const register = async (req, res) => {
  try {
    const newUser = await authService.register(req.body);
    console.log(newUser);
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
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ Email và Mật khẩu!",
      });
    }

    const result = await authService.login(email, password);

    // Trả về Token và thông tin User cho Frontend lưu vào LocalStorage
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
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

    const result = await authService.changePassword(
      email,
      oldPassword,
      newPassword,
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email không được để trống!",
      });
    }

    const result = await authService.updateProfile(email, req.body);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getPendingApprovals = async (req, res) => {
  try {
    const result = await authService.getPendingApprovals();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const acceptPendingRegistration = async (req, res) => {
  try {
    const result = await authService.acceptPendingRegistration(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectPendingRegistration = async (req, res) => {
  try {
    const { email, reason, rejectedBy } = req.body;
    const result = await authService.rejectPendingRegistration(
      email,
      reason,
      rejectedBy,
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  register,
  verifyOtp,
  login,
  changePassword,
  updateProfile,
  getPendingApprovals,
  acceptPendingRegistration,
  rejectPendingRegistration,
};
