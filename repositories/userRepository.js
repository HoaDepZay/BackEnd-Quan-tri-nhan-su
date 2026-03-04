const sql = require("mssql");

const userRepository = {
  /**
   * Gọi Procedure đăng ký nhân viên mới kèm mã OTP
   */
  registerUser: async (userData) => {
    // 1. Khởi tạo request từ connection pool (giả sử bạn đã config mssql)
    const request = new sql.Request();

    // 2. Map các tham số từ Node.js vào các biến @ của Procedure
    return await request
      .input("Username", sql.NVarChar, userData.username)
      .input("Password", sql.NVarChar, userData.password)
      .input("HoTen", sql.NVarChar, userData.hoten)
      .input("Email", sql.NVarChar, userData.email)
      .input("MaPhg", sql.Int, userData.maphg)
      .input("Luong", sql.Decimal(18, 2), userData.luong)
      .input("ChucVu", sql.NVarChar, userData.chucvu)
      .input("OtpCode", sql.NVarChar, userData.otpCode) // <--- Truyền mã OTP ngẫu nhiên vào đây
      .input("ExpiredAt", sql.DateTime, userData.expiredAt) // <--- Truyền thời gian hết hạn
      .execute("sp_DangKyUserMoi"); // <--- Tên Procedure bạn vừa tạo
  },

  /**
   * Gọi Procedure xác thực OTP (đã tạo ở bước trước)
   */
  verifyOTP: async (email, otpCode) => {
    const request = new sql.Request();
    return await request
      .input("Email", sql.NVarChar, email)
      .input("OtpCode", sql.NVarChar, otpCode)
      .execute("sp_VerifyOTP");
  },
};

module.exports = userRepository;
