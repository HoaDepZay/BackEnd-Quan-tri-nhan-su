import express from "express";
const router = express.Router();
import authController from "../controllers/authController";
import withUserConnection from "../middleware/authMiddleware";

router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOtp);
router.post("/login", authController.login);
router.put(
  "/change-password",
  withUserConnection,
  authController.changePassword,
);
router.put("/update-profile", withUserConnection, authController.updateProfile);

export default router;
