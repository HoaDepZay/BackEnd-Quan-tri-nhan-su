// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import "dotenv/config";

const SECRET_KEY = process.env.SECRET_KEY;

const buildAzureSqlAuthUser = (loginName: string) => {
  const server = process.env.DB_SERVER || "";
  const azureServerShortName = server.split(".")[0];

  if (
    loginName.includes("@") &&
    azureServerShortName &&
    !loginName.toLowerCase().endsWith(`@${azureServerShortName.toLowerCase()}`)
  ) {
    return `${loginName}@${azureServerShortName}`;
  }

  return loginName;
};

const withUserConnection = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Chưa đăng nhập!" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, SECRET_KEY!);

    // DEBUG: Log toàn bộ decoded token để xem cấu trúc
    console.log(
      "🔍 Decoded token structure:",
      JSON.stringify(decoded, null, 2),
    );
    console.log("   - userEmail:", decoded.userEmail);
    console.log("   - userInfo:", decoded.userInfo);
    console.log(
      "   - sqlPassEncrypted:",
      decoded.sqlPassEncrypted ? "✅ exists" : "❌ missing",
    );

    // Kiểm tra tokenFormat - có thể token cũ không có userEmail
    if (!decoded.userEmail) {
      console.error(
        "❌ Token không chứa userEmail! Có thể token cũ hoặc sai format",
      );
      console.error("   Hãy đăng nhập lại để tạo token mới");
      throw new Error("Token format sai - hãy đăng nhập lại");
    }

    // Giải mã pass SQL từ token
    const decryptedBytes = CryptoJS.AES.decrypt(
      decoded.sqlPassEncrypted,
      SECRET_KEY,
    );
    const originalPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);
    const sqlAuthUser = buildAzureSqlAuthUser(decoded.userEmail);

    // Tạo chuỗi kết nối động
    // decoded.userEmail chứa email của user (SQL username)
    console.log("🔐 Creating connection string for user:", sqlAuthUser);
    const userConnStr = `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};UID=${sqlAuthUser};PWD=${originalPassword};Encrypt=yes;TrustServerCertificate=yes;Connection Timeout=10;`;
    req.userConnectionString = userConnStr;
    req.user = decoded; // Lưu thêm info user để dùng nếu cần
    next();
  } catch (err) {
    console.error("❌ Auth Error:", err.message);
    return res
      .status(403)
      .json({ error: "Token không hợp lệ hoặc đã hết hạn. " + err.message });
  }
};

export default withUserConnection;
