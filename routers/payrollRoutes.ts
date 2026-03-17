import express from "express";
import payrollController from "../controllers/payrollController";

const router = express.Router();

// Lấy danh sách NV nhận lương theo tháng/năm
router.get("/:year/:month", payrollController.getPayrollByMonth);

// Lấy phiếu lương của cá nhân theo tháng
router.get("/employee/:id/:year/:month", payrollController.getEmployeePayslip);

// Sinh bảng lương tự động cho tháng (nhận vào body: { "month": 3, "year": 2026 })
router.post("/generate", payrollController.generatePayroll);

// Cập nhật thông tin dòng tính lương bổ sung (Thưởng/Khấu trừ)
router.put("/:maBl", payrollController.updatePayrollRecord);

export default router;
