const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.ENCRYPTION_KEY.padEnd(32)).slice(0, 32);
const iv = crypto.randomBytes(16);

// Mã hóa mật khẩu để lưu vào bảng tạm
const encrypt = (text) => {
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

// Giải mã mật khẩu khi verify thành công để tạo Login SQL
const decrypt = (text) => {
  let textParts = text.split(":");
  let ivPart = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(algorithm, key, ivPart);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

module.exports = { encrypt, decrypt };
