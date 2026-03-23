import payrollRepository from "../repositories/payrollRepository";
import { appPool, sql } from "../config/db";

const payrollService = {
  getPayrollByMonth: async (month, year) => {
    try {
      const data = await payrollRepository.getPayrollByMonth(month, year);
      return { success: true, data };
    } catch (error) {
      throw new Error("Lỗi truy xuất bảng lương: " + error.message);
    }
  },

  getEmployeePayslip: async (maNv, month, year) => {
    try {
      const data = await payrollRepository.getEmployeePayslip(
        maNv,
        month,
        year,
      );
      if (!data)
        throw new Error("Tháng này chưa có phiếu lương hoặc NV không tồn tại.");
      return { success: true, data };
    } catch (error) {
      throw new Error("Lỗi lấy phiếu lương cá nhân: " + error.message);
    }
  },

  generatePayroll: async (month, year) => {
    try {
      // 1. Logic chốt lương tự động
      // Mặc định ngày công chuẩn là 22 ngày (hoặc 26 tùy HR)
      const NGAY_CONG_CHUAN = 22;

      // Xóa dữ liệu cũ nếu chốt lại bảng lương tháng này
      await payrollRepository.deletePayrollByMonth(month, year);

      // Lấy data công chuẩn và lương của tất cả NV
      const rawData = await payrollRepository.getRawDataForPayroll(month, year);

      let results = [];
      const transaction = appPool.transaction();
      await transaction.begin();

      try {
        for (const r of rawData) {
          // Tính lương: Lương cơ bản * (Ngày công thực tế / Ngày công chuẩn) + Phụ cấp + Thưởng - Khấu trừ
          let SoNgayCong = r.SoNgayCong;
          let LuongCoBan = r.LuongCoBan || 0;
          let PhuCap = r.PhuCap || 0;
          let Thuong = 0; // Thay bằng API thưởng nhân sự (để trống hiện tại)
          let KhauTruBHXH = LuongCoBan * 0.105; // Giả sử đóng BHXH 10.5% lương cơ bản

          let LuongTheoCong = (LuongCoBan / NGAY_CONG_CHUAN) * SoNgayCong;
          let ThucLanh = LuongTheoCong + PhuCap + Thuong - KhauTruBHXH;

          if (ThucLanh < 0) ThucLanh = 0; // Không nhận lương âm

          const recordData = {
            manv: r.MANV,
            thang: month,
            nam: year,
            songaycong: SoNgayCong,
            luongcoban: LuongCoBan,
            phucap: PhuCap,
            thuong: Thuong,
            khautru: KhauTruBHXH,
            thuclanh: ThucLanh,
          };

          const request = new sql.Request(transaction);
          await payrollRepository.createPayrollRecord(recordData, request);
          results.push(recordData);
        }
        await transaction.commit();
        return {
          success: true,
          message: "Sinh bảng lương tự động thành công",
          counts: results.length,
        };
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (error) {
      throw new Error("Lỗi chốt lương: " + error.message);
    }
  },

  updatePayrollRecord: async (maBl, data) => {
    try {
      await payrollRepository.updatePayrollRecord(maBl, data);
      return { success: true, message: "Cập nhật dòng lương thành công" };
    } catch (error) {
      throw new Error("Lỗi cập nhật dòng lương: " + error.message);
    }
  },
};

export default payrollService;
