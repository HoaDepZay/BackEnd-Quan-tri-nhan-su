"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_SECRET_KEY = exports.SECRET_KEY = exports.decryptPasswordFromToken = exports.verifyRefreshToken = exports.verifyToken = exports.rotateTokens = exports.generateRefreshToken = exports.generateToken = exports.createAccessPayload = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_js_1 = __importDefault(require("crypto-js"));
// Nên đưa SECRET_KEY vào biến môi trường (.env)
const SECRET_KEY = process.env.SECRET_KEY || "DoAn_BaoMat_RatCao";
exports.SECRET_KEY = SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || `${SECRET_KEY}_refresh`;
exports.REFRESH_SECRET_KEY = REFRESH_SECRET_KEY;
const ACCESS_TOKEN_EXPIRES_IN = (process.env.ACCESS_TOKEN_EXPIRES_IN ||
    "3h");
const REFRESH_TOKEN_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRES_IN ||
    "7d");
const createAccessPayload = (userData, password) => {
    const encryptedPass = crypto_js_1.default.AES.encrypt(password, SECRET_KEY).toString();
    return {
        userEmail: userData.email,
        userInfo: {
            manv: userData.manv || "",
            hoten: userData.hoten || "",
            email: userData.email || "",
            role: userData.role || "",
        },
        sqlPassEncrypted: encryptedPass,
    };
};
exports.createAccessPayload = createAccessPayload;
const signAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
};
// Hàm tạo Token (Sign)
const generateToken = (userData, password) => {
    // userData có thể là string (email) hoặc object với thông tin user
    if (typeof userData === "string") {
        userData = { email: userData };
    }
    const accessPayload = createAccessPayload(userData, password);
    return signAccessToken(accessPayload);
};
exports.generateToken = generateToken;
const generateRefreshToken = (accessPayload) => {
    return jsonwebtoken_1.default.sign({
        tokenType: "refresh",
        session: accessPayload,
    }, REFRESH_SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};
exports.generateRefreshToken = generateRefreshToken;
const rotateTokens = (refreshToken) => {
    const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET_KEY);
    if (decoded?.tokenType !== "refresh" || !decoded?.session?.userEmail) {
        throw new Error("Refresh token không hợp lệ");
    }
    const newAccessToken = signAccessToken(decoded.session);
    const newRefreshToken = generateRefreshToken(decoded.session);
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};
exports.rotateTokens = rotateTokens;
// Hàm xác thực Token (Verifysfrgsr) - dùng cho Middleware
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, SECRET_KEY);
};
exports.verifyToken = verifyToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, REFRESH_SECRET_KEY);
};
exports.verifyRefreshToken = verifyRefreshToken;
// Hàm giải mã password từ token (để dùng tạo connection string)
const decryptPasswordFromToken = (encryptedPass) => {
    const decryptedBytes = crypto_js_1.default.AES.decrypt(encryptedPass, SECRET_KEY);
    return decryptedBytes.toString(crypto_js_1.default.enc.Utf8);
};
exports.decryptPasswordFromToken = decryptPasswordFromToken;
