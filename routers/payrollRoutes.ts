import express from "express";
import payrollController from "../controllers/payrollController";

const router = express.Router();

// Lấy phiếu lương của cá nhân (id: MaNV). Có thể truyền thêm query ?year=...&month=...
router.get("/employee/:id", payrollController.getEmployeePayslip);

// Lấy danh sách NV nhận lương theo tháng/năm
router.get("/:year/:month", payrollController.getPayrollByMonth);

// Sinh bảng lương tự động cho tháng (nhận vào body: { "month": 3, "year": 2026 })
router.post("/generate", payrollController.generatePayroll);

// Cập nhật thông tin dòng tính lương bổ sung (Thưởng/Khấu trừ)
router.put("/:maBl", payrollController.updatePayrollRecord);

export default router;
