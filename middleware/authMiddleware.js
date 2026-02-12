// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const withUserConnection = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Chưa đăng nhập!" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // Giải mã pass SQL từ token
    const decryptedBytes = CryptoJS.AES.decrypt(
      decoded.sqlPassEncrypted,
      SECRET_KEY,
    );
    const originalPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);

    // Tạo chuỗi kết nối động
    const userConnStr = `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};UID=${decoded.sqlUser};PWD=${originalPassword};TrustServerCertificate=yes;Connection Timeout=10;`;

    req.userConnectionString = userConnStr;
    req.user = decoded; // Lưu thêm info user để dùng nếu cần
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res
      .status(403)
      .json({ error: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

module.exports = withUserConnection;
