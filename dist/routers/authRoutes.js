"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authController_1 = __importDefault(require("../controllers/authController"));
router.post("/register", authController_1.default.register);
router.post("/verify-otp", authController_1.default.verifyOtp);
router.post("/login", authController_1.default.login);
router.put("/change-password", authController_1.default.changePassword);
router.put("/update-profile", authController_1.default.updateProfile);
exports.default = router;
