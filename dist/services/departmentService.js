"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const departmentRepository_1 = __importDefault(require("../repositories/departmentRepository"));
const departmentService = {
    // Lấy chi tiết phòng ban bao gồm danh sách nhân viên
    getDepartmentWithEmployees: async (maPhg) => {
        try {
            const department = await departmentRepository_1.default.getDepartmentById(maPhg);
            if (!department) {
                throw new Error("Phòng ban không tồn tại");
            }
            const employees = await departmentRepository_1.default.getEmployeesByDepartment(maPhg);
            return {
                success: true,
                message: "Lấy thông tin phòng ban thành công",
                data: {
                    ...department,
                    nhanVien: employees
                }
            };
        }
        catch (error) {
            throw new Error("Lỗi lấy thông tin phòng ban: " + error.message);
        }
    },
    getAllDepartments: async () => {
        try {
            const data = await departmentRepository_1.default.getAllDepartments();
            return { success: true, data };
        }
        catch (error) {
            throw new Error("Lỗi lấy danh sách: " + error.message);
        }
    },
    createDepartment: async (data) => {
        try {
            if (!data.maphg || !data.tenpb) {
                throw new Error("Mã phòng ban và tên phòng ban là bắt buộc.");
            }
            const existing = await departmentRepository_1.default.getDepartmentById(data.maphg);
            if (existing) {
                throw new Error("Mã phòng ban đã tồn tại.");
            }
            await departmentRepository_1.default.createDepartment(data);
            return { success: true, message: "Tạo phòng ban thành công", maPhg: data.maphg };
        }
        catch (error) {
            throw new Error("Lỗi tạo phòng ban: " + error.message);
        }
    },
    updateDepartment: async (maPhg, data) => {
        try {
            const existing = await departmentRepository_1.default.getDepartmentById(maPhg);
            if (!existing) {
                throw new Error("Phòng ban không tồn tại.");
            }
            const updateData = {
                tenpb: data.tenpb,
                matruongphg: data.matruongphg
            };
            Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);
            await departmentRepository_1.default.updateDepartment(maPhg, updateData);
            return { success: true, message: "Cập nhật thành công" };
        }
        catch (error) {
            throw new Error("Lỗi cập nhật phòng ban: " + error.message);
        }
    },
    deleteDepartment: async (maPhg) => {
        try {
            const existing = await departmentRepository_1.default.getDepartmentById(maPhg);
            if (!existing) {
                throw new Error("Phòng ban không tồn tại.");
            }
            const employees = await departmentRepository_1.default.getEmployeesByDepartment(maPhg);
            if (employees.length > 0) {
                throw new Error("Không thể xóa do phòng ban vẫn còn nhân sự.");
            }
            await departmentRepository_1.default.deleteDepartment(maPhg);
            return { success: true, message: "Xóa thành công" };
        }
        catch (error) {
            throw new Error("Lỗi xóa phòng ban: " + error.message);
        }
    }
};
exports.default = departmentService;
