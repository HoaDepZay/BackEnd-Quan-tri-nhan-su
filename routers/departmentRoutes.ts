import express from "express";
import departmentController from "../controllers/departmentController";
import withUserConnection, { requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Lấy danh sách phòng ban
router.get(
  "/",
  withUserConnection,
  requireAdmin,
  departmentController.getAllDepartments,
);

// Lấy chi tiết phòng ban theo ID
router.get(
  "/:id",
  withUserConnection,
  requireAdmin,
  departmentController.getDepartmentById,
);

// Thêm mới phòng ban
router.post(
  "/",
  withUserConnection,
  requireAdmin,
  departmentController.createDepartment,
);

// Cập nhật phòng ban
router.put(
  "/:id",
  withUserConnection,
  requireAdmin,
  departmentController.updateDepartment,
);

// Xóa phòng ban
router.delete(
  "/:id",
  withUserConnection,
  requireAdmin,
  departmentController.deleteDepartment,
);

export default router;
