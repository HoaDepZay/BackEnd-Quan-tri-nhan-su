import express from "express";
import projectController from "../controllers/projectController";
import withUserConnection, { requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Nhân viên xem danh sách dự án mình tham gia (kèm đầy đủ thành viên của từng dự án)
router.get(
  "/my-projects/full",
  withUserConnection,
  projectController.getMyJoinedProjectsWithMembers,
);

// Lấy danh sách dự án
router.get(
  "/",
  withUserConnection,
  requireAdmin,
  projectController.getAllProjects,
);

// Task theo dự án (chỉ nhân viên thuộc dự án mới truy cập được)
router.get(
  "/:id/tasks",
  withUserConnection,
  projectController.getProjectTasksForMember,
);

router.post(
  "/:id/tasks",
  withUserConnection,
  projectController.createTaskForMember,
);

router.put(
  "/:id/tasks/:taskId",
  withUserConnection,
  projectController.updateTaskForMember,
);

// Lấy chi tiết dự án & thành viên
router.get(
  "/:id",
  withUserConnection,
  requireAdmin,
  projectController.getProjectById,
);

// Thêm dự án mới
router.post(
  "/",
  withUserConnection,
  requireAdmin,
  projectController.createProject,
);

// Xem dự án của 1 nhân viên
router.get(
  "/employee/:id",
  withUserConnection,
  requireAdmin,
  projectController.getEmployeeProjects,
);

// Cập nhật dự án
router.put(
  "/:id",
  withUserConnection,
  requireAdmin,
  projectController.updateProject,
);

// Xóa dự án
router.delete(
  "/:id",
  withUserConnection,
  requireAdmin,
  projectController.deleteProject,
);

// Thành viên dự án
router.post(
  "/:id/members",
  withUserConnection,
  requireAdmin,
  projectController.addProjectMember,
);
router.delete(
  "/:id/members/:employeeId",
  withUserConnection,
  requireAdmin,
  projectController.removeProjectMember,
);

export default router;
