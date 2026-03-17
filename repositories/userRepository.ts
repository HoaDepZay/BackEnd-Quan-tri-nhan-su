import sql from "mssql";

const userRepository = {
  // 1. Lưu thông tin vào bảng đệm DANG_KY_CHO
  savePendingRegistration: async (data) => {
    const request = new sql.Request();
   // userRepository.ts
return await request
    .input("MaNV", sql.NVarChar, data.manv)
    .input("Email", sql.NVarChar, data.email)
    .input("PassEnc", sql.NVarChar, data.encryptedPass)
    .input("HoTen", sql.NVarChar, data.hoten)
    .input("MaPhg", sql.Int, data.maphg)
  // Lưu ý: data.luong nếu để trống nên mặc định là 0 để tránh lỗi NULL
  
    .input("Luong", sql.Decimal(18, 2), data.luong ?? 0) 
    .input("ChucVu", sql.NVarChar, data.chucvu || 'Nhân viên') 
    .input("OtpCode", sql.NVarChar, data.otpCode)
    .input("ExpiredAt", sql.DateTime, data.expiredAt)
    .execute("sp_LuuDangKyTam");
  },

  // 2. Lấy thông tin từ bảng đệm để verify
  getPendingAccount: async (email) => {
    const request = new sql.Request();
    const result = await request
      .input("Email", sql.NVarChar, email)
      .query("SELECT * FROM DANG_KY_CHO WHERE Email = @Email");
    return result.recordset[0];
  },

  // 3. Chạy Procedure kích hoạt tài khoản thật trên SQL Server
// userRepository.ts
activateAccount: async (data: any) => {
  const request = new sql.Request();
  return await request
    .input("MaNV", sql.NVarChar, data.MaNV)
    .input("Email", sql.NVarChar, data.Email)
    .input("Password", sql.NVarChar, data.originalPassword) 
    .input("HoTen", sql.NVarChar, data.HoTen)
    .input("MaPhg", sql.Int, data.MaPhg)
    .input("Luong", sql.Decimal(18, 2), data.Luong ?? 0)
    .input("ChucVu", sql.NVarChar, data.ChucVu ?? 'Nhân viên')
    .execute("sp_KichHoatTaiKhoanChinhThuc");
},

  // 4. Xóa bảng đệm
  deletePendingAccount: async (email) => {
    const request = new sql.Request();
    return await request
      .input("Email", sql.NVarChar, email)
      .query("DELETE FROM DANG_KY_CHO WHERE Email = @Email");
  },

  // 5. Lấy thông tin nhân viên (không lấy mật khẩu)
  getUserByEmail: async (email) => {
    const request = new sql.Request();
    const result = await request
      .input("Email", sql.NVarChar, email)
      .query(
        "SELECT MANV, HOTEN, EMAIL, CHUCVU  FROM NHAN_VIEN WHERE EMAIL = @Email",
      );
    return result; // Trả về nguyên result để Service dùng recordset.length
  },
};

export default userRepository;
