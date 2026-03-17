import express from "express";
import projectController from "../controllers/projectController";

const router = express.Router();

// Lấy danh sách dự án
router.get("/", projectController.getAllProjects);

// Lấy chi tiết dự án & thành viên
router.get("/:id", projectController.getProjectById);

// Thêm dự án mới
router.post("/", projectController.createProject);

// Xem dự án của 1 nhân viên
router.get("/employee/:id", projectController.getEmployeeProjects);

// Cập nhật dự án
router.put("/:id", projectController.updateProject);

// Xóa dự án
router.delete("/:id", projectController.deleteProject);

// Thành viên dự án
router.post("/:id/members", projectController.addProjectMember);
router.delete("/:id/members/:employeeId", projectController.removeProjectMember);

export default router;
