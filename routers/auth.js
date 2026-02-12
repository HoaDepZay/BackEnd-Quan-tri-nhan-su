const express = require("express");
const router = express.Router();
const sql = require("msnodesqlv8");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const bcrypt = require("bcryptjs");
const { adminConnectionString, connectionString } = require("../config/db");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "DoAn_BaoMat_RatCao";

// 1. Đăng nhập
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Tạo chuỗi kết nối tạm để test login
  const tempConnStr = `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || "127.0.0.1,14333"};Database=${process.env.DB_NAME || "QuanTriNhanSu"};UID=${username};PWD=${password};TrustServerCertificate=yes;Connection Timeout=5;`;

  sql.open(tempConnStr, (err, conn) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "Sai tài khoản/mật khẩu SQL" });
    }

    // Login thành công -> Mã hóa pass để lưu vào token
    const encryptedPass = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();

    const token = jwt.sign(
      { sqlUser: username, sqlPassEncrypted: encryptedPass },
      SECRET_KEY,
      { expiresIn: "2h" },
    );

    // Lấy thông tin profile
    const queryProfile = `SELECT MANV, HOTEN, CHUCVU, MAPHG, EMAIL FROM NHANVIEN WHERE TEN_DANG_NHAP = SUSER_NAME()`;
    conn.query(queryProfile, (qErr, rows) => {
      conn.close();
      if (qErr || rows.length === 0)
        return res.status(500).json({ message: "Lỗi profile" });

      res.json({
        success: true,
        message: "Đăng nhập thành công",
        token: token,
        user: rows[0],
      });
    });
  });
});

router.post("/register", (req, res) => {
  const { username, password, maphg, email, hoten, luong, chucvu } = req.body;

  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ error: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
  }

  const query = `EXEC sp_DangKyUserMoi @Username=?, @Password=?, @HoTen=?, @Email=?, @MaPhg=?, @Luong=?, @ChucVu=?`;
  const params = [
    username,
    password,
    hoten || username,
    email,
    maphg || null,
    luong || 0,
    chucvu || null,
  ];

  sql.query(adminConnectionString, query, params, (err, rows) => {
    if (res.headersSent) return;

    if (err) {
      console.error("❌ Lỗi SQL:", err);

      // Check lỗi trùng lặp
      if (
        err.number === 2627 ||
        err.number === 2601 ||
        err.message.includes("CREATE LOGIN")
      ) {
        return res.status(400).json({
          // 👈 BẮT BUỘC CÓ RETURN
          success: false,
          error: "Tên đăng nhập này đã tồn tại!",
        });
      }

      // Các lỗi còn lại
      return res.status(500).json({
        // 👈 BẮT BUỘC CÓ RETURN
        success: false,
        error: "Lỗi hệ thống: " + err.message,
      });
    }

    // 2. XỬ LÝ THÀNH CÔNG (Chỉ chạy khi không có err)
    // Kiểm tra xem SP có trả về dữ liệu không
    if (!rows || rows.length === 0) {
      // Trường hợp hiếm: SP chạy xong nhưng không trả về gì cả
      return res
        .status(500)
        .json({ error: "Đăng ký thành công nhưng không lấy được ID." });
    }

    const result = rows[0];

    return res.status(201).json({
      // 👈 Thêm return cho chắc ăn
      success: true,
      message: `Tài khoản cho nhân viên ${result.HOTEN} đã được tạo thành công!`,
      data: {
        manv: result.MANV,
        username: result.HOTEN,
      },
    });
  });
});

// 3. Đổi mật khẩu (Fix logic update cả SQL Login lẫn Table)
router.put("/change-password", async (req, res) => {
  const { manv, oldPassword, newPassword } = req.body;

  // Bước 1: Lấy Username và Hash cũ từ DB
  // Cần lấy thêm TEN_DANG_NHAP để tí nữa chạy lệnh ALTER LOGIN
  const queryFind = `
    SELECT tk.MAT_KHAU_HASH, nv.TEN_DANG_NHAP 
    FROM TAIKHOAN tk
    JOIN NHANVIEN nv ON tk.MANV = nv.MANV 
    WHERE tk.MANV = ?`;

  sql.query(adminConnectionString, queryFind, [manv], async (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy user!" });
    }

    const user = rows[0];

    // Bước 2: Verify mật khẩu cũ (So sánh với Hash trong DB)
    const isMatch = await bcrypt.compare(oldPassword, user.MAT_KHAU_HASH);
    if (!isMatch) {
      return res.status(401).json({ error: "Mật khẩu cũ không đúng!" });
    }

    // Bước 3: Tạo Hash mới
    const newHash = await bcrypt.hash(newPassword, 10);

    // Bước 4: Transaction "kép" (Sửa SQL Login + Sửa Bảng)
    // Lưu ý: Cú pháp ALTER LOGIN cần quyền Admin (SA) -> OK vì bạn đang dùng connectionString (SA)

    // ⚠️ QUAN TRỌNG: Không thể dùng tham số (?) cho câu lệnh DDL (ALTER LOGIN)
    // Phải nối chuỗi cẩn thận. Vì Username lấy từ DB ra nên an toàn, không lo Injection.
    const queryUpdateLogin = `ALTER LOGIN [${user.TEN_DANG_NHAP}] WITH PASSWORD = '${newPassword}'`;

    const queryUpdateTable = `UPDATE TAIKHOAN SET MAT_KHAU_HASH = ? WHERE MANV = ?`;

    // Thực thi tuần tự
    sql.query(adminConnectionString, queryUpdateLogin, (err1) => {
      if (err1) {
        console.error("Lỗi đổi pass SQL Login:", err1);
        return res
          .status(500)
          .json({ error: "Lỗi hệ thống khi cập nhật Login SQL" });
      }

      // Nếu sửa Login SQL thành công thì mới sửa bảng
      sql.query(
        adminConnectionString,
        queryUpdateTable,
        [newHash, manv],
        (err2) => {
          if (err2) {
            console.error("Lỗi update bảng TAIKHOAN:", err2);
            // Ở đây có thể cân nhắc rollback thủ công nếu cần thiết
            return res.status(500).json({ error: "Lỗi đồng bộ dữ liệu" });
          }

          res.json({
            success: true,
            message: "Đổi mật khẩu thành công hoàn toàn!",
          });
        },
      );
    });
  });
});

module.exports = router;
