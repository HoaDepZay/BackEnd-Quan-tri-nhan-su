/*
===================================================================================
DASHBOARD SQL VIEWS
Database Engine: SQL Server
Description: Các view để hỗ trợ tính năng Dashboard
===================================================================================
*/

USE [QuanTriNhanSu];
GO

-- ===================================================================================
-- 1. VIEW DASHBOARD SUMMARY - Tổng hợp dữ liệu chính
-- ===================================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_DASHBOARD_SUMMARY')
    DROP VIEW VW_DASHBOARD_SUMMARY;
GO

CREATE VIEW VW_DASHBOARD_SUMMARY AS
SELECT 
  'Tổng nhân viên' AS TieuChi,
  COUNT(DISTINCT MANV) AS SoLuong,
  'employee' AS IconType
FROM NHAN_VIEN
WHERE TrangThaiLamViec = N'Chính thức'
UNION ALL
SELECT 
  'Nhân viên tạm',
  COUNT(DISTINCT MANV),
  'employee'
FROM NHAN_VIEN
WHERE TrangThaiLamViec != N'Chính thức'
UNION ALL
SELECT 
  'Tổng phòng ban',
  COUNT(DISTINCT MAPHG),
  'department'
FROM PHONGBAN
UNION ALL
SELECT 
  'Tổng dự án',
  COUNT(DISTINCT MADA),
  'project'
FROM DUAN
UNION ALL
SELECT 
  'Dự án đang chạy',
  COUNT(DISTINCT MADA),
  'project'
FROM DUAN
WHERE TrangThai = N'Đang thực hiện'
UNION ALL
SELECT 
  'Dự án hoàn thành',
  COUNT(DISTINCT MADA),
  'project'
FROM DUAN
WHERE TrangThai = N'Hoàn thành';
GO

-- ===================================================================================
-- 2. VIEW HRD - Thống kê nhân viên theo phòng ban
-- ===================================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_NHANVIEN_THEO_PHONGBAN')
    DROP VIEW VW_NHANVIEN_THEO_PHONGBAN;
GO

CREATE VIEW VW_NHANVIEN_THEO_PHONGBAN AS
SELECT 
  pb.MAPHG,
  pb.TENPB,
  COUNT(nv.MANV) AS TongNhanVien,
  SUM(CASE WHEN nv.TrangThaiLamViec = N'Chính thức' THEN 1 ELSE 0 END) AS NhanVienChinhThuc,
  SUM(CASE WHEN nv.TrangThaiLamViec != N'Chính thức' THEN 1 ELSE 0 END) AS NhanVienTam,
  AVG(CAST(nv.LUONG AS FLOAT)) AS LuongTrungBinh,
  SUM(nv.LUONG) AS TongLuong,
  nv2.HOTEN AS TenTruongPhong
FROM PHONGBAN pb
LEFT JOIN NHAN_VIEN nv ON pb.MAPHG = nv.MAPHG
LEFT JOIN NHAN_VIEN nv2 ON pb.MaTruongPhg = nv2.MANV
GROUP BY pb.MAPHG, pb.TENPB, nv2.HOTEN;
GO

-- ===================================================================================
-- 3. VIEW HRD - Thống kê dự án
-- ===================================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_DUAN_THONGKE')
    DROP VIEW VW_DUAN_THONGKE;
GO

CREATE VIEW VW_DUAN_THONGKE AS
SELECT 
  da.MADA,
  da.TENDA,
  da.TrangThai,
  da.NgayBatDau,
  da.NgayKetThuc,
  COUNT(DISTINCT pc.MaNV) AS SoThanhVien,
  CASE 
    WHEN da.NgayKetThuc IS NULL THEN -1
    WHEN da.NgayKetThuc < CAST(GETDATE() AS DATE) THEN 1 -- Quá hạn
    ELSE 0 -- Còn thời hạn
  END AS TrangThaiThangHan
FROM DUAN da
LEFT JOIN PHANCONG_DUAN pc ON da.MADA = pc.MaDA
GROUP BY da.MADA, da.TENDA, da.TrangThai, da.NgayBatDau, da.NgayKetThuc;
GO

-- ===================================================================================
-- 4. VIEW - Top 5 Dự án gần deadline
-- ===================================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_DUAN_GANNHAT_DEADLINE')
    DROP VIEW VW_DUAN_GANNHAT_DEADLINE;
GO

CREATE VIEW VW_DUAN_GANNHAT_DEADLINE AS
SELECT TOP 5
  MADA,
  TENDA,
  NgayKetThuc,
  DATEDIFF(DAY, CAST(GETDATE() AS DATE), NgayKetThuc) AS SoNgayConLai,
  TrangThai
FROM DUAN
WHERE NgayKetThuc IS NOT NULL 
  AND TrangThai != N'Hoàn thành'
  AND TrangThai != N'Hủy bỏ'
ORDER BY NgayKetThuc ASC;
GO

-- ===================================================================================
-- 5. VIEW - Thống kê lương theo tháng
-- ===================================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_THONGKE_LUONG_THANG')
    DROP VIEW VW_THONGKE_LUONG_THANG;
GO

CREATE VIEW VW_THONGKE_LUONG_THANG AS
SELECT 
  bl.Thang,
  bl.Nam,
  COUNT(DISTINCT bl.MaNV) AS SoNhanVienTinhLuong,
  SUM(bl.LuongCoBan) AS TongLuongCoBan,
  SUM(bl.PhuCap) AS TongPhuCap,
  SUM(bl.Thuong) AS TongThuong,
  SUM(bl.KhauTruBHXH) AS TongKhauTruBHXH,
  SUM(bl.ThucLanh) AS TongThucLanh,
  AVG(bl.ThucLanh) AS LuongTrungBinh
FROM BANG_LUONG bl
GROUP BY bl.Thang, bl.Nam;
GO

-- ===================================================================================
-- 6. VIEW - Nhân viên theo chức danh
-- ===================================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_NHANVIEN_THEO_CHUCDANH')
    DROP VIEW VW_NHANVIEN_THEO_CHUCDANH;
GO

CREATE VIEW VW_NHANVIEN_THEO_CHUCDANH AS
SELECT 
  ISNULL(cd.MaChucDanh, 0) AS MaChucDanh,
  ISNULL(cd.TenChucDanh, N'Chưa xác định') AS TenChucDanh,
  COUNT(DISTINCT nv.MANV) AS SoNhanVien,
  AVG(CAST(nv.LUONG AS FLOAT)) AS LuongTrungBinh
FROM NHAN_VIEN nv
LEFT JOIN CHUCDANH cd ON nv.MaChucDanh = cd.MaChucDanh
GROUP BY cd.MaChucDanh, cd.TenChucDanh;
GO

-- ===================================================================================
-- 7. VIEW - Hoạt động gần đây (Nhân viên mới, dự án mới)
-- ===================================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_HOATDONG_GANDDAY')
    DROP VIEW VW_HOATDONG_GANDDAY;
GO

CREATE VIEW VW_HOATDONG_GANDDAY AS
SELECT TOP 10
  1 AS DoUuTien,
  N'Nhân viên mới' AS LoaiHoatDong,
  MANV AS MaDoiTuong,
  HOTEN AS TenDoiTuong,
  CAST(NgayTuyenDung AS DATETIME) AS ThoiGian,
  N'Nhân viên' AS Loai
FROM NHAN_VIEN
WHERE NgayTuyenDung IS NOT NULL
UNION ALL
SELECT 
  2,
  N'Dự án mới',
  CAST(MADA AS VARCHAR),
  TENDA,
  CAST(NgayBatDau AS DATETIME),
  N'Dự án'
FROM DUAN
WHERE NgayBatDau IS NOT NULL
ORDER BY ThoiGian DESC;
GO

PRINT N'✅ Tất cả Dashboard Views đã được tạo thành công!';
