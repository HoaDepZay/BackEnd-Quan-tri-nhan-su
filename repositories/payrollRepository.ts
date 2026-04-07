import { appPool, sql } from "../config/db";

const payrollRepository = {
  // Lấy danh sách lương tháng
  getPayrollByMonth: async (month, year) => {
    const result = await appPool
      .request()
      .input("Thang", sql.Int, month)
      .input("Nam", sql.Int, year)
      .execute("sp_getPayrollByMonth");
    return result.recordset;
  },

  // Lấy chi tiết lương của NV
  getEmployeePayslip: async (maNv, month, year) => {
    const result = await appPool
      .request()
      .input("MaNV", sql.VarChar, maNv)
      .input("Thang", sql.Int, month)
      .input("Nam", sql.Int, year)
      .execute("sp_getEmployeePayslip");
    return result.recordset[0] || null;
  },

  // Xóa bảng lương tháng cũ nếu chạy lại generator
  deletePayrollByMonth: async (month, year) => {
    await appPool
      .request()
      .input("Thang", sql.Int, month)
      .input("Nam", sql.Int, year)
      .execute("sp_deletePayrollByMonth");
  },

  // Chèn một dòng lương mới
  createPayrollRecord: async (data, transactionRequest) => {
    const request = transactionRequest || appPool.request();
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
      .execute("sp_createPayrollRecord");
  },

  updatePayrollRecord: async (maBl, data) => {
    const request = appPool.request();
    request.input("MaBL", sql.Int, maBl);

    if (data.thuong !== undefined) {
      request.input("Thuong", sql.Decimal(18, 2), data.thuong);
    }
    if (data.khautrubhxh !== undefined) {
      request.input("KhauTruBHXH", sql.Decimal(18, 2), data.khautrubhxh);
    }
    if (data.thuclanh !== undefined) {
      request.input("ThucLanh", sql.Decimal(18, 2), data.thuclanh);
    }

    await request.execute("sp_updatePayrollRecord");
  },

  // (Helper) Lấy dữ liệu công nền cho việc tính lương
  getRawDataForPayroll: async (month, year) => {
    const result = await appPool
      .request()
      .input("Thang", sql.Int, month)
      .input("Nam", sql.Int, year)
      .execute("sp_getRawDataForPayroll");
    return result.recordset;
  },
};

export default payrollRepository;
