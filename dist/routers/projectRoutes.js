"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projectController_1 = __importDefault(require("../controllers/projectController"));
const router = express_1.default.Router();
// Lấy danh sách dự án
router.get("/", projectController_1.default.getAllProjects);
// Lấy chi tiết dự án & thành viên
router.get("/:id", projectController_1.default.getProjectById);
// Thêm dự án mới
router.post("/", projectController_1.default.createProject);
// Xem dự án của 1 nhân viên
router.get("/employee/:id", projectController_1.default.getEmployeeProjects);
// Cập nhật dự án
router.put("/:id", projectController_1.default.updateProject);
// Xóa dự án
router.delete("/:id", projectController_1.default.deleteProject);
// Thành viên dự án
router.post("/:id/members", projectController_1.default.addProjectMember);
router.delete("/:id/members/:employeeId", projectController_1.default.removeProjectMember);
exports.default = router;
