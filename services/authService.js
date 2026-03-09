// HÀM LOGIN XỬ LÝ API
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
  login: async (email, password) => {
    // DEBUG: Log chi tiết
    console.log("=== LOGIN DEBUG ===");
    console.log("Time:", new Date().toISOString());
    console.log("Email received:", { type: typeof email, value: email });
    console.log("Password received:", { type: typeof password, value: "***" });

    // Kiểm tra xem email và password có phải string không
    if (typeof email !== "string" || typeof password !== "string") {
      console.error("❌ LỖILỖI: Email hoặc Password không phải string!");
      console.error("   Email:", email);
      console.error("   Password:", password);
      throw new Error(
        "Dữ liệu không hợp lệ - Email/Password phải là chuỗi text",
      );
    }

    // Xóa khoảng trắng thừa
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    console.log("After trim:", { email: trimmedEmail, password: "***" });

    // 1. Kiểm tra thông tin nhân viên trong bảng chính
    console.log("📋 Searching for user with email:", trimmedEmail);
    const userResult = await userRepository.getUserByEmail(trimmedEmail);
    const user = userResult.recordset[0];

    if (!user) {
      console.warn("⚠️ User not found with email:", trimmedEmail);
      throw new Error("Email không tồn tại trong hệ thống!");
    }

    console.log("✅ User found:", user.EMAIL);

    // 2. THỬ KẾT NỐI TRỰC TIẾP VÀO SQL SERVER ĐỂ XÁC THỰC MẬT KHẨU
    const loginConfig = {
      user: trimmedEmail,
      password: trimmedPassword,
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        connectionTimeout: 30000,
        requestTimeout: 30000,
      },
    };

    console.log("📤 Attempting SQL Server connection with:");
    console.log({
      user: loginConfig.user,
      password: "***",
      server: loginConfig.server,
      database: loginConfig.database,
    });

    try {
      const tempConn = new sql.ConnectionPool(loginConfig);
      await tempConn.connect();
      console.log("✅ SQL Server authentication successful!");
      await tempConn.close();
    } catch (err) {
      console.error("❌ SQL Server login failed:", err.message);
      throw new Error("Mật khẩu không chính xác!");
    }

    // 3. TẠO JWT TOKEN (Dữ liệu lấy từ bảng NHANVIEN)
    // generateToken cần 2 param: userData (object chứa email) và password (plaintext)
    const token = generateToken(
      {
        manv: user.MANV,
        hoten: user.HOTEN,
        email: user.EMAIL,
        role: user.CHUCVU,
      },
      trimmedPassword, // Pass mật khẩu plaintext để mã hóa vào token
    );

    console.log("✅ Login successful for user:", user.EMAIL);
    console.log("=== END LOGIN DEBUG ===\n");

    return {
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: {
        manv: user.MANV,
        hoten: user.HOTEN,
        email: user.EMAIL,
        role: user.CHUCVU,
      },
    };
  },

  // 8. Đổi mật khẩu
  changePassword: async (email, oldPassword, newPassword) => {
    console.log("🔄 Changing password for:", email);

    if (!oldPassword || !newPassword) {
      throw new Error("Vui lòng nhập đầy đủ mật khẩu cũ và mới!");
    }

    if (newPassword.length < 6) {
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự!");
    }

    if (oldPassword === newPassword) {
      throw new Error("Mật khẩu mới phải khác mật khẩu cũ!");
    }

    // 1. Lấy user info
    const userResult = await userRepository.getUserByEmail(email);
    const user = userResult.recordset[0];

    if (!user) {
      throw new Error("Email không tồn tại trong hệ thống!");
    }

    // 2. Xác thực mật khẩu cũ bằng cách thử kết nối SQL Server
    const verifyConfig = {
      user: email,
      password: oldPassword,
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        connectionTimeout: 30000,
        requestTimeout: 30000,
      },
    };

    try {
      const tempConn = new sql.ConnectionPool(verifyConfig);
      await tempConn.connect();
      await tempConn.close();
    } catch (err) {
      console.error("❌ Old password verification failed:", err.message);
      throw new Error("Mật khẩu cũ không chính xác!");
    }

    // 3. Thay đổi mật khẩu trên SQL Server
    // TODO: Thêm stored procedure sp_DoiMatKhau hoặc cập nhật login credentials
    const request = new sql.Request();
    try {
      await request
        .input("Email", sql.NVarChar, email)
        .input("NewPassword", sql.NVarChar, newPassword)
        .query(
          "UPDATE NHANVIEN SET PASSWORD_HASH = @NewPassword WHERE EMAIL = @Email",
        );
    } catch (err) {
      throw new Error("Lỗi cập nhật mật khẩu: " + err.message);
    }

    console.log("✅ Password changed successfully for:", email);

    return {
      success: true,
      message: "Đổi mật khẩu thành công!",
    };
  },

  // 9. Cập nhật profile cá nhân
  updateProfile: async (email, data) => {
    console.log("📝 Updating profile for:", email);

    if (!data || Object.keys(data).length === 0) {
      throw new Error("Không có dữ liệu để cập nhật!");
    }

    // 1. Lấy user info
    const userResult = await userRepository.getUserByEmail(email);
    const user = userResult.recordset[0];

    if (!user) {
      throw new Error("Email không tồn tại trong hệ thống!");
    }

    // 2. Chuẩn bị dữ liệu cập nhật
    const updateData = {
      hoten: data.hoten,
      ngaysinh: data.ngaysinh,
      gioitinh: data.gioitinh,
      diachinhan: data.diachinhan,
      sdt: data.sdt,
    };

    // Lọc các trường undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    if (Object.keys(updateData).length === 0) {
      throw new Error("Không có dữ liệu hợp lệ để cập nhật!");
    }

    // 3. Cập nhật vào DB
    try {
      const request = new sql.Request();
      let updateFields = [];
      let queryInput = { Email: email };

      for (let key in updateData) {
        if (updateData[key] !== undefined) {
          if (key === "hoten") updateFields.push("HOTEN = @HoTen");
          if (key === "ngaysinh") updateFields.push("NGAYSINH = @NgaySinh");
          if (key === "gioitinh") updateFields.push("GIOITINH = @GioiTinh");
          if (key === "diachinhan")
            updateFields.push("DIACHINHAN = @DiaChiNhan");
          if (key === "sdt") updateFields.push("SDT = @SDT");

          request.input(
            key === "hoten"
              ? "HoTen"
              : key === "ngaysinh"
                ? "NgaySinh"
                : key === "gioitinh"
                  ? "GioiTinh"
                  : key === "diachinhan"
                    ? "DiaChiNhan"
                    : "SDT",
            sql.NVarChar,
            updateData[key],
          );
        }
      }

      request.input("Email", sql.NVarChar, email);
      const query = `UPDATE NHANVIEN SET ${updateFields.join(", ")} WHERE EMAIL = @Email`;

      await request.query(query);
    } catch (err) {
      throw new Error("Lỗi cập nhật profile: " + err.message);
    }

    console.log("✅ Profile updated successfully for:", email);

    return {
      success: true,
      message: "Cập nhật profile thành công!",
    };
  },
};
module.exports = authService;
