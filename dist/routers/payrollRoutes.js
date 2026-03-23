"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payrollController_1 = __importDefault(require("../controllers/payrollController"));
const router = express_1.default.Router();
// Lấy phiếu lương của cá nhân (id: MaNV). Có thể truyền thêm query ?year=...&month=...
router.get("/employee/:id", payrollController_1.default.getEmployeePayslip);
// Lấy danh sách NV nhận lương theo tháng/năm
router.get("/:year/:month", payrollController_1.default.getPayrollByMonth);
// Sinh bảng lương tự động cho tháng (nhận vào body: { "month": 3, "year": 2026 })
router.post("/generate", payrollController_1.default.generatePayroll);
// Cập nhật thông tin dòng tính lương bổ sung (Thưởng/Khấu trừ)
router.put("/:maBl", payrollController_1.default.updatePayrollRecord);
exports.default = router;
