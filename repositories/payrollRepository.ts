import sql from "mssql";

const payrollRepository = {
  // Lấy danh sách lương tháng
  getPayrollByMonth: async (month, year) => {
    const request = new sql.Request();
    const result = await request
      .input("Thang", sql.Int, month)
      .input("Nam", sql.Int, year)
      .query(`
        SELECT bl.MaBL, bl.MaNV, nv.HOTEN, bl.Thang, bl.Nam,
               bl.SoNgayCongThucTe, bl.LuongCoBan, bl.PhuCap, 
               bl.Thuong, bl.KhauTruBHXH, bl.ThucLanh
        FROM BANG_LUONG bl
        JOIN NHAN_VIEN nv ON bl.MaNV = nv.MANV
        WHERE bl.Thang = @Thang AND bl.Nam = @Nam
      `);
    return result.recordset;
  },

  // Lấy chi tiết lương của NV
  getEmployeePayslip: async (maNv, month, year) => {
    const request = new sql.Request();
    const result = await request
      .input("MaNV", sql.VarChar, maNv)
      .input("Thang", sql.Int, month)
      .input("Nam", sql.Int, year)
      .query(`
        SELECT bl.MaBL, bl.Thang, bl.Nam, bl.SoNgayCongThucTe, bl.LuongCoBan,
               bl.PhuCap, bl.Thuong, bl.KhauTruBHXH, bl.ThucLanh
        FROM BANG_LUONG bl
        WHERE bl.MaNV = @MaNV AND bl.Thang = @Thang AND bl.Nam = @Nam
      `);
    return result.recordset[0] || null;
  },

  // Xóa bảng lương tháng cũ nếu chạy lại generator
  deletePayrollByMonth: async (month, year) => {
    const request = new sql.Request();
    await request
      .input("Thang", sql.Int, month)
      .input("Nam", sql.Int, year)
      .query(`DELETE FROM BANG_LUONG WHERE Thang = @Thang AND Nam = @Nam`);
  },

  // Chèn một dòng lương mới
  createPayrollRecord: async (data, transactionRequest) => {
    const request = transactionRequest || new sql.Request();
    await request
      .input("MaNV", sql.VarChar, data.manv)
      .input("Thang", sql.Int, data.thang)
      .input("Nam", sql.Int, data.nam)
      .input("SoNgayCong", sql.Float, data.songaycong)
      .input("LuongCoBan", sql.Decimal(18, 2), data.luongcoban)
      .input("PhuCap", sql.Decimal(18, 2), data.phucap)
      .input("Thuong", sql.Decimal(18, 2), data.thuong || 0)
      .input("KhauTruBHXH", sql.Decimal(18, 2), data.khautru || 0)
      .input("ThucLanh", sql.Decimal(18, 2), data.thuclanh)
      .query(`
        INSERT INTO BANG_LUONG 
        (MaNV, Thang, Nam, SoNgayCongThucTe, LuongCoBan, PhuCap, Thuong, KhauTruBHXH, ThucLanh)
        VALUES 
        (@MaNV, @Thang, @Nam, @SoNgayCong, @LuongCoBan, @PhuCap, @Thuong, @KhauTruBHXH, @ThucLanh)
      `);
  },

  updatePayrollRecord: async (maBl, data) => {
    const request = new sql.Request();
    let updateFields = [];

    if (data.thuong !== undefined) {
      updateFields.push("Thuong = @Thuong");
      request.input("Thuong", sql.Decimal(18, 2), data.thuong);
    }
    if (data.khautrubhxh !== undefined) {
      updateFields.push("KhauTruBHXH = @KhauTru");
      request.input("KhauTru", sql.Decimal(18, 2), data.khautrubhxh);
    }
    if (data.thuclanh !== undefined) {
      updateFields.push("ThucLanh = @ThucLanh");
      request.input("ThucLanh", sql.Decimal(18, 2), data.thuclanh);
    }

    if (updateFields.length === 0) return;

    request.input("MaBL", sql.Int, maBl);
    const query = `UPDATE BANG_LUONG SET ${updateFields.join(", ")} WHERE MaBL = @MaBL`;
    await request.query(query);
  },

  // (Helper) Lấy dữ liệu công nền cho việc tính lương
  getRawDataForPayroll: async (month, year) => {
    // Truy xuất Lương cơ bản và Số ngày công
    // Thực tế sẽ phải join HOPDONG và BAN_CHAM_CONG. Vì table HOPDONG mới tạo, giả dụ dùng LUONG trong NHAN_VIEN.
    const request = new sql.Request();
    const result = await request
      .input("Thang", sql.Int, month)
      .input("Nam", sql.Int, year)
      .query(`
        SELECT 
           nv.MANV, 
           nv.LUONG AS LuongCoBan, 
           ISNULL(cd.PhuCapChucVu, 0) AS PhuCap,
           (SELECT COUNT(*) FROM BAN_CHAM_CONG cc 
            WHERE cc.MaNV = nv.MANV AND MONTH(cc.Ngay) = @Thang AND YEAR(cc.Ngay) = @Nam) AS SoNgayCong
        FROM NHAN_VIEN nv
        LEFT JOIN CHUCDANH cd ON nv.MaChucDanh = cd.MaChucDanh
      `);
    return result.recordset;
  }
};

export default payrollRepository;
