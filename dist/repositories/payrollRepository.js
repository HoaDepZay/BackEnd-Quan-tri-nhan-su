"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const payrollRepository = {
    // Lấy danh sách lương tháng
    getPayrollByMonth: async (month, year) => {
        const request = db_1.appPool.request();
        const result = await request
            .input("Thang", db_1.sql.Int, month)
            .input("Nam", db_1.sql.Int, year).query(`
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
        const request = db_1.appPool.request();
        const result = await request
            .input("MaNV", db_1.sql.VarChar, maNv)
            .input("Thang", db_1.sql.Int, month)
            .input("Nam", db_1.sql.Int, year).query(`
        SELECT bl.MaBL, bl.Thang, bl.Nam, bl.SoNgayCongThucTe, bl.LuongCoBan,
               bl.PhuCap, bl.Thuong, bl.KhauTruBHXH, bl.ThucLanh
        FROM BANG_LUONG bl
        WHERE bl.MaNV = @MaNV AND bl.Thang = @Thang AND bl.Nam = @Nam
      `);
        return result.recordset[0] || null;
    },
    // Xóa bảng lương tháng cũ nếu chạy lại generator
    deletePayrollByMonth: async (month, year) => {
        const request = db_1.appPool.request();
        await request
            .input("Thang", db_1.sql.Int, month)
            .input("Nam", db_1.sql.Int, year)
            .query(`DELETE FROM BANG_LUONG WHERE Thang = @Thang AND Nam = @Nam`);
    },
    // Chèn một dòng lương mới
    createPayrollRecord: async (data, transactionRequest) => {
        const request = transactionRequest || db_1.appPool.request();
        await request
            .input("MaNV", db_1.sql.VarChar, data.manv)
            .input("Thang", db_1.sql.Int, data.thang)
            .input("Nam", db_1.sql.Int, data.nam)
            .input("SoNgayCong", db_1.sql.Float, data.songaycong)
            .input("LuongCoBan", db_1.sql.Decimal(18, 2), data.luongcoban)
            .input("PhuCap", db_1.sql.Decimal(18, 2), data.phucap)
            .input("Thuong", db_1.sql.Decimal(18, 2), data.thuong || 0)
            .input("KhauTruBHXH", db_1.sql.Decimal(18, 2), data.khautru || 0)
            .input("ThucLanh", db_1.sql.Decimal(18, 2), data.thuclanh).query(`
        INSERT INTO BANG_LUONG 
        (MaNV, Thang, Nam, SoNgayCongThucTe, LuongCoBan, PhuCap, Thuong, KhauTruBHXH, ThucLanh)
        VALUES 
        (@MaNV, @Thang, @Nam, @SoNgayCong, @LuongCoBan, @PhuCap, @Thuong, @KhauTruBHXH, @ThucLanh)
      `);
    },
    updatePayrollRecord: async (maBl, data) => {
        const request = db_1.appPool.request();
        let updateFields = [];
        if (data.thuong !== undefined) {
            updateFields.push("Thuong = @Thuong");
            request.input("Thuong", db_1.sql.Decimal(18, 2), data.thuong);
        }
        if (data.khautrubhxh !== undefined) {
            updateFields.push("KhauTruBHXH = @KhauTru");
            request.input("KhauTru", db_1.sql.Decimal(18, 2), data.khautrubhxh);
        }
        if (data.thuclanh !== undefined) {
            updateFields.push("ThucLanh = @ThucLanh");
            request.input("ThucLanh", db_1.sql.Decimal(18, 2), data.thuclanh);
        }
        if (updateFields.length === 0)
            return;
        request.input("MaBL", db_1.sql.Int, maBl);
        const query = `UPDATE BANG_LUONG SET ${updateFields.join(", ")} WHERE MaBL = @MaBL`;
        await request.query(query);
    },
    // (Helper) Lấy dữ liệu công nền cho việc tính lương
    getRawDataForPayroll: async (month, year) => {
        // Truy xuất Lương cơ bản và Số ngày công
        // Thực tế sẽ phải join HOPDONG và BAN_CHAM_CONG. Vì table HOPDONG mới tạo, giả dụ dùng LUONG trong NHAN_VIEN.
        const request = db_1.appPool.request();
        const result = await request
            .input("Thang", db_1.sql.Int, month)
            .input("Nam", db_1.sql.Int, year).query(`
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
    },
};
exports.default = payrollRepository;
