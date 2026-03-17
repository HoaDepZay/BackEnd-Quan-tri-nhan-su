import express from "express";
const router = express.Router();
import authController from "../controllers/authController";

router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOtp);
router.post("/login", authController.login);
router.put("/change-password", authController.changePassword);
router.put("/update-profile", authController.updateProfile);

export default router;
