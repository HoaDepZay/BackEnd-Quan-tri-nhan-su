const crypto = require("crypto");
const sql = require("mssql"); // Cần mssql để thử kết nối lúc Login
const userRepository = require("../repositories/userRepository");
const { sendOTPMail } = require("../utils/mailHelper");
const { generateToken } = require("../utils/jwtHelper");
const { decrypt, encrypt } = require("../utils/encryptionHelper");

const generateEmployeeId = () => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomChars = "";
  for (let i = 0; i < 4; i++) {
    randomChars += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return `NV${randomChars}`;
};

const authService = {
  // 1. ĐĂNG KÝ: Lưu vào vùng đệm
  register: async (userData) => {
    // Kiểm tra xem Email đã tồn tại chính thức chưa
    const existing = await userRepository.getUserByEmail(userData.email);
    if (existing.recordset.length > 0) {
      throw new Error("Email này đã được đăng ký trong hệ thống!");
    }

    const manv = generateEmployeeId();
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000);

    const encryptedPass = encrypt(userData.password);

    await userRepository.savePendingRegistration({
      ...userData,
      manv,
      encryptedPass,
      otpCode,
      expiredAt,
    });

    sendOTPMail(userData.email, otpCode).catch((err) =>
      console.error("Lỗi gửi mail:", err),
    );

    return {
      success: true,
      message: "Vui lòng kiểm tra mã OTP trong email của bạn.",
    };
  },

  // 2. XÁC THỰC: Giải mã và tạo Login thật
  verifyOTP: async (email, otpCode) => {
    const pending = await userRepository.getPendingAccount(email);

    if (!pending) throw new Error("Không tìm thấy yêu cầu đăng ký!");
    if (pending.OtpCode !== otpCode) throw new Error("Mã OTP không chính xác!");
    if (new Date() > new Date(pending.ExpiredAt))
      throw new Error("Mã OTP đã hết hạn!");

    const originalPassword = decrypt(pending.PasswordMaHoa);

    // Kích hoạt trên SQL Server
    await userRepository.activateAccount({
      MaNV: pending.MaNV,
      Email: pending.Email,
      HoTen: pending.HoTen,
      MaPhg: pending.MaPhg,
      Luong: pending.Luong,
      ChucVu: pending.ChucVu,
      originalPassword: originalPassword,
    });

    await userRepository.deletePendingAccount(email);

    return {
      success: true,
      message: "Tài khoản đã được kích hoạt thành công!",
    };
  },

  // 3. ĐĂNG NHẬP: Xác thực bằng tài khoản hệ thống SQL Server
  login: async (email, password) => {
    // Bước A: Kiểm tra thông tin nhân viên trong bảng chính
    const userResult = await userRepository.getUserByEmail(email);
    const user = userResult.recordset[0];

    if (!user) throw new Error("Email không tồn tại!");
    if (!user.IsVerified) throw new Error("Tài khoản chưa được kích hoạt OTP!");

    // Bước B: THỬ KẾT NỐI TRỰC TIẾP VÀO SQL SERVER ĐỂ CHECK PASS
    const loginConfig = {
      user: email, // Dùng email làm username đăng nhập DB
      password: password, // Dùng mật khẩu người dùng nhập
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };

    try {
      const tempConn = new sql.ConnectionPool(loginConfig);
      await tempConn.connect(); // Nếu kết nối thành công -> Pass đúng
      await tempConn.close(); // Đóng kết nối tạm ngay lập tức
    } catch (err) {
      throw new Error(
        "Mật khẩu không chính xác hoặc bạn không có quyền truy cập!",
      );
    }

    // Bước C: Tạo mã JWT Token như bình thường
    const token = generateToken(user);

    return {
      success: true,
      token,
      user: {
        manv: user.MANV,
        hoten: user.HOTEN,
        email: user.EMAIL,
        role: user.CHUCVU,
      },
    };
  },
};

module.exports = authService;
