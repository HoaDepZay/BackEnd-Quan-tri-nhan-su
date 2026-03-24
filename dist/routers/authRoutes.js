"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authController_1 = __importDefault(require("../controllers/authController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
router.post("/register", authController_1.default.register);
router.post("/verify-otp", authController_1.default.verifyOtp);
router.post("/login", authController_1.default.login);
router.post("/refresh-token", authController_1.default.refreshToken);
router.post("/logout", authController_1.default.logout);
router.put("/change-password", authMiddleware_1.default, authController_1.default.changePassword);
router.put("/update-profile", authMiddleware_1.default, authController_1.default.updateProfile);
exports.default = router;
