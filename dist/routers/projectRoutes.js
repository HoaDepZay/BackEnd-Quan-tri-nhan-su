"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projectController_1 = __importDefault(require("../controllers/projectController"));
const authMiddleware_1 = __importStar(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
// Lấy danh sách dự án
router.get("/", authMiddleware_1.default, authMiddleware_1.requireAdmin, projectController_1.default.getAllProjects);
// Lấy chi tiết dự án & thành viên
router.get("/:id", authMiddleware_1.default, authMiddleware_1.requireAdmin, projectController_1.default.getProjectById);
// Thêm dự án mới
router.post("/", authMiddleware_1.default, authMiddleware_1.requireAdmin, projectController_1.default.createProject);
// Xem dự án của 1 nhân viên
router.get("/employee/:id", authMiddleware_1.default, authMiddleware_1.requireAdmin, projectController_1.default.getEmployeeProjects);
// Cập nhật dự án
router.put("/:id", authMiddleware_1.default, authMiddleware_1.requireAdmin, projectController_1.default.updateProject);
// Xóa dự án
router.delete("/:id", authMiddleware_1.default, authMiddleware_1.requireAdmin, projectController_1.default.deleteProject);
// Thành viên dự án
router.post("/:id/members", authMiddleware_1.default, authMiddleware_1.requireAdmin, projectController_1.default.addProjectMember);
router.delete("/:id/members/:employeeId", authMiddleware_1.default, authMiddleware_1.requireAdmin, projectController_1.default.removeProjectMember);
exports.default = router;
