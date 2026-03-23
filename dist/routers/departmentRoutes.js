"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const departmentController_1 = __importDefault(require("../controllers/departmentController"));
const router = express_1.default.Router();
// Lấy danh sách phòng ban
router.get("/", departmentController_1.default.getAllDepartments);
// Lấy chi tiết phòng ban theo ID
router.get("/:id", departmentController_1.default.getDepartmentById);
// Thêm mới phòng ban
router.post("/", departmentController_1.default.createDepartment);
// Cập nhật phòng ban
router.put("/:id", departmentController_1.default.updateDepartment);
// Xóa phòng ban
router.delete("/:id", departmentController_1.default.deleteDepartment);
exports.default = router;
