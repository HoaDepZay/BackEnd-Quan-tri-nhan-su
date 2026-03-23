"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const passwordGo = "123";
const saltRounds = 10;
console.log("-----------------------------------------");
console.log("🔍 Đang băm mật khẩu: " + passwordGo);
bcryptjs_1.default.hash(passwordGo, saltRounds, (err, hash) => {
    if (err) {
        console.error("❌ Lỗi: ", err);
        return;
    }
    console.log("✅ Chuỗi Hash mới của bạn là:");
    console.log(hash);
    console.log("-----------------------------------------");
    console.log("💡 Hóa hãy copy chuỗi bắt đầu bằng $2b$ ở trên nhé!");
});
