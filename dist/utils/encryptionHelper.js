"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.ENCRYPTION_KEY.padEnd(32)).slice(0, 32);
const iv = crypto_1.default.randomBytes(16);
// Mã hóa mật khẩu để lưu vào bảng tạm
const encrypt = (text) => {
    let cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
};
exports.encrypt = encrypt;
// Giải mã mật khẩu khi verify thành công để tạo Login SQL
const decrypt = (text) => {
    let textParts = text.split(":");
    let ivPart = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto_1.default.createDecipheriv(algorithm, key, ivPart);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};
exports.decrypt = decrypt;
