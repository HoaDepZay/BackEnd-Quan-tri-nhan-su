import express from "express";
import departmentController from "../controllers/departmentController";

const router = express.Router();

// Lấy danh sách phòng ban
router.get("/", departmentController.getAllDepartments);

// Lấy chi tiết phòng ban theo ID
router.get("/:id", departmentController.getDepartmentById);

// Thêm mới phòng ban
router.post("/", departmentController.createDepartment);

// Cập nhật phòng ban
router.put("/:id", departmentController.updateDepartment);

// Xóa phòng ban
router.delete("/:id", departmentController.deleteDepartment);

export default router;
