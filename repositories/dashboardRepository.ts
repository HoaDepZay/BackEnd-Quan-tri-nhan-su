import { appPool, sql } from "../config/db";

const dashboardRepository = {
  // 1. Lấy tóm tắt Dashboard
  getDashboardSummary: async () => {
    const request = appPool.request();
    const result = await request.query(`
      SELECT 
        TieuChi,
        SoLuong,
        IconType
      FROM VW_DASHBOARD_SUMMARY
      ORDER BY 
        CASE 
          WHEN TieuChi = N'Tổng nhân viên' THEN 1
          WHEN TieuChi = N'Nhân viên tạm' THEN 2
          WHEN TieuChi = N'Tổng phòng ban' THEN 3
          WHEN TieuChi = N'Tổng dự án' THEN 4
          WHEN TieuChi = N'Dự án đang chạy' THEN 5
          ELSE 6
        END ASC
    `);
    return result.recordset;
  },

  // 2. Lấy thống kê nhân viên theo phòng ban
  getEmployeeByDepartment: async () => {
    const request = appPool.request();
    const result = await request.query(`
      SELECT 
        MAPHG,
        TENPB,
        TongNhanVien,
        NhanVienChinhThuc,
        NhanVienTam,
        ROUND(LuongTrungBinh, 2) AS LuongTrungBinh,
        ROUND(TongLuong, 0) AS TongLuong,
        TenTruongPhong
      FROM VW_NHANVIEN_THEO_PHONGBAN
      ORDER BY TongNhanVien DESC
    `);
    return result.recordset;
  },

  // 3. Lấy thống kê dự án
  getProjectStatistics: async () => {
    const request = appPool.request();
    const result = await request.query(`
      SELECT 
        MADA,
        TENDA,
        TrangThai,
        NgayBatDau,
        NgayKetThuc,
        SoThanhVien,
        CASE 
          WHEN TrangThaiThangHan = 1 THEN N'Quá hạn'
          WHEN TrangThaiThangHan = 0 THEN N'Còn thời hạn'
          ELSE N'Không có hạn'
        END AS TrangThaiThangHan
      FROM VW_DUAN_THONGKE
      ORDER BY 
        CASE 
          WHEN TrangThai = N'Đang thực hiện' THEN 1
          WHEN TrangThai = N'Hoàn thành' THEN 2
          ELSE 3
        END,
        MADA DESC
    `);
    return result.recordset;
  },

  // 4. Lấy top dự án gần deadline
  getProjectsNearDeadline: async () => {
    const request = appPool.request();
    const result = await request.query(`
      SELECT 
        MADA,
        TENDA,
        NgayKetThuc,
        SoNgayConLai,
        TrangThai,
        CASE 
          WHEN SoNgayConLai < 0 THEN N'Quá hạn'
          WHEN SoNgayConLai <= 7 THEN N'Cảnh báo'
          WHEN SoNgayConLai <= 30 THEN N'Sắp hết hạn'
          ELSE N'Bình thường'
        END AS MucDoDoUuTien
      FROM VW_DUAN_GANNHAT_DEADLINE
      ORDER BY SoNgayConLai ASC
    `);
    return result.recordset;
  },

  // 5. Lấy thống kê lương theo tháng
  getPayrollStatistics: async (thang = null, nam = null) => {
    const request = appPool.request();

    let query = `
      SELECT 
        Thang,
        Nam,
        SoNhanVienTinhLuong,
        ROUND(TongLuongCoBan, 0) AS TongLuongCoBan,
        ROUND(TongPhuCap, 0) AS TongPhuCap,
        ROUND(TongThuong, 0) AS TongThuong,
        ROUND(TongKhauTruBHXH, 0) AS TongKhauTruBHXH,
        ROUND(TongThucLanh, 0) AS TongThucLanh,
        ROUND(LuongTrungBinh, 0) AS LuongTrungBinh
      FROM VW_THONGKE_LUONG_THANG
      WHERE 1=1
    `;

    if (thang && nam) {
      query += ` AND Thang = @Thang AND Nam = @Nam`;
      request.input("Thang", sql.Int, thang);
      request.input("Nam", sql.Int, nam);
    }

    query += ` ORDER BY Nam DESC, Thang DESC`;

    const result = await request.query(query);
    return result.recordset;
  },

  // 6. Lấy thống kê nhân viên theo chức danh
  getEmployeeByPosition: async () => {
    const request = appPool.request();
    const result = await request.query(`
      SELECT 
        MaChucDanh,
        TenChucDanh,
        SoNhanVien,
        ROUND(LuongTrungBinh, 0) AS LuongTrungBinh
      FROM VW_NHANVIEN_THEO_CHUCDANH
      ORDER BY SoNhanVien DESC
    `);
    return result.recordset;
  },

  // 7. Lấy hoạt động gần đây (Top 10)
  getRecentActivities: async () => {
    const request = appPool.request();
    const result = await request.query(`
      SELECT TOP 10
        DoUuTien,
        LoaiHoatDong,
        MaDoiTuong,
        TenDoiTuong,
        ThoiGian,
        Loai
      FROM VW_HOATDONG_GANDDAY
      ORDER BY ThoiGian DESC
    `);
    return result.recordset;
  },

  // 8. Lấy thống kê tổng quát nhanh (Dashboard chính)
  getQuickStats: async () => {
    const request = appPool.request();
    const result = await request.query(`
      SELECT 
        (SELECT COUNT(*) FROM NHAN_VIEN WHERE TrangThaiLamViec = N'Chính thức') AS TongNhanVien,
        (SELECT COUNT(*) FROM DUAN WHERE TrangThai = N'Đang thực hiện') AS DuAnDangChay,
        (SELECT COUNT(*) FROM DUAN WHERE TrangThai = N'Hoàn thành') AS DuAnHoanThanh,
        (SELECT COUNT(*) FROM PHONGBAN) AS TongPhongBan,
        (SELECT AVG(CAST(LUONG AS FLOAT)) FROM NHAN_VIEN) AS LuongTrungBinh,
        (SELECT SUM(LUONG) FROM NHAN_VIEN) AS TongLuongThang
    `);
    return result.recordset[0] || {};
  },

  // 9. Lấy trendline lương 6 tháng gần nhất
  getPayrollTrendline: async () => {
    const request = appPool.request();
    const result = await request.query(`
      SELECT TOP 6
        Thang,
        Nam,
        ROUND(TongThucLanh, 0) AS TongThucLanh,
        ROUND(LuongTrungBinh, 0) AS LuongTrungBinh,
        SoNhanVienTinhLuong
      FROM VW_THONGKE_LUONG_THANG
      ORDER BY Nam DESC, Thang DESC
    `);
    return result.recordset.reverse(); // Sắp xếp từ cũ đến mới
  },

  // 10. Lấy trendline dự án (Số dự án từng trạng thái qua các tháng)
  getProjectTrendline: async () => {
    const request = appPool.request();
    const result = await request.query(`
      SELECT 
        TrangThai,
        COUNT(*) AS SoDuAn,
        CASE 
          WHEN TrangThai = N'Đang thực hiện' THEN 1
          WHEN TrangThai = N'Hoàn thành' THEN 2
          WHEN TrangThai = N'Đang lên kế hoạch' THEN 3
          ELSE 4
        END AS DoUuTien
      FROM VW_DUAN_THONGKE
      GROUP BY TrangThai
      ORDER BY DoUuTien ASC
    `);
    return result.recordset;
  },
};

export default dashboardRepository;
