// controllers/authController.js
const sql = require("msnodesqlv8");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const { adminConnectionString } = require("../config/db"); // Import config
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

// API Login
const login = (req, res) => {
  const { username, password } = req.body;

  // Tạo chuỗi kết nối test
  const tempConnStr = `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};UID=${username};PWD=${password};TrustServerCertificate=yes;Connection Timeout=5;`;

  sql.open(tempConnStr, (err, conn) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "Sai tài khoản/mật khẩu SQL" });
    }

    // Login OK -> Mã hóa pass
    const encryptedPass = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
    const token = jwt.sign(
      { sqlUser: username, sqlPassEncrypted: encryptedPass },
      SECRET_KEY,
      { expiresIn: "2h" },
    );

    // Lấy profile
    const queryProfile = `SELECT MANV, HOTEN, CHUCVU, MAPHG, EMAIL FROM NHANVIEN WHERE TEN_DANG_NHAP = SUSER_NAME()`;
    conn.query(queryProfile, (qErr, rows) => {
      conn.close();
      if (qErr || rows.length === 0)
        return res.status(500).json({ message: "Lỗi lấy profile" });

      res.json({
        success: true,
        message: "Đăng nhập thành công",
        token: token,
        user: rows[0],
      });
    });
  });
};

// API Register
const register = (req, res) => {
  // ... Copy logic register từ file cũ sang đây ...
  // Nhớ đổi connectionString thành adminConnectionString
};

module.exports = { login, register };
