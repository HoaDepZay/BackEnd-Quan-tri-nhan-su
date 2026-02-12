const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");

// Nên đưa SECRET_KEY vào biến môi trường (.env)
const SECRET_KEY = process.env.SECRET_KEY || "DoAn_BaoMat_RatCao";

// Hàm tạo Token (Sign)
const generateToken = (username, password) => {
  // Logic mã hóa password của bạn
  const encryptedPass = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();

  // Tạo và trả về token
  return jwt.sign(
    {
      sqlUser: username,
      sqlPassEncrypted: encryptedPass,
    },
    SECRET_KEY,
    { expiresIn: "3h" },
  );
};

// Hàm xác thực Token (Verifysfrgsr) - dùng cho Middleware
const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

// Hàm giải mã password từ token (để dùng tạo connection string)
const decryptPasswordFromToken = (encryptedPass) => {
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedPass, SECRET_KEY);
  return decryptedBytes.toString(CryptoJS.enc.Utf8);
};

module.exports = {
  generateToken,
  verifyToken,
  decryptPasswordFromToken,
  SECRET_KEY, // Xuất ra nếu cần dùng ở middleware
};
