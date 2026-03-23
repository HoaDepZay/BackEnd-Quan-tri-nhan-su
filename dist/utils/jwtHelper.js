"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECRET_KEY = exports.decryptPasswordFromToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_js_1 = __importDefault(require("crypto-js"));
// Nên đưa SECRET_KEY vào biến môi trường (.env)
const SECRET_KEY = process.env.SECRET_KEY || "DoAn_BaoMat_RatCao";
exports.SECRET_KEY = SECRET_KEY;
// Hàm tạo Token (Sign)
const generateToken = (userData, password) => {
    // userData có thể là string (email) hoặc object với thông tin user
    if (typeof userData === "string") {
        userData = { email: userData };
    }
    // Logic mã hóa password của bạn
    const encryptedPass = crypto_js_1.default.AES.encrypt(password, SECRET_KEY).toString();
    // Tạo và trả về token
    return jsonwebtoken_1.default.sign({
        userEmail: userData.email,
        userInfo: {
            manv: userData.manv || "",
            hoten: userData.hoten || "",
            email: userData.email || "",
            role: userData.role || "",
        },
        sqlPassEncrypted: encryptedPass,
    }, SECRET_KEY, { expiresIn: "3h" });
};
exports.generateToken = generateToken;
// Hàm xác thực Token (Verifysfrgsr) - dùng cho Middleware
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, SECRET_KEY);
};
exports.verifyToken = verifyToken;
// Hàm giải mã password từ token (để dùng tạo connection string)
const decryptPasswordFromToken = (encryptedPass) => {
    const decryptedBytes = crypto_js_1.default.AES.decrypt(encryptedPass, SECRET_KEY);
    return decryptedBytes.toString(crypto_js_1.default.enc.Utf8);
};
exports.decryptPasswordFromToken = decryptPasswordFromToken;
