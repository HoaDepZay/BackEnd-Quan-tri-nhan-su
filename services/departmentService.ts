import departmentRepository from "../repositories/departmentRepository";
import chatService from "./chatService";

const departmentService = {
  // Lấy chi tiết phòng ban bao gồm danh sách nhân viên
  getDepartmentWithEmployees: async (maPhg) => {
    try {
      const department = await departmentRepository.getDepartmentById(maPhg);
      if (!department) {
        throw new Error("Phòng ban không tồn tại");
      }

      const employees =
        await departmentRepository.getEmployeesByDepartment(maPhg);

      return {
        success: true,
        message: "Lấy thông tin phòng ban thành công",
        data: {
          ...department,
          nhanVien: employees,
        },
      };
    } catch (error) {
      throw new Error("Lỗi lấy thông tin phòng ban: " + error.message);
    }
  },

  getAllDepartments: async () => {
    try {
      const data = await departmentRepository.getAllDepartments();
      return { success: true, data };
    } catch (error) {
      throw new Error("Lỗi lấy danh sách: " + error.message);
    }
  },

  createDepartment: async (data) => {
    try {
      if (!data.maphg || !data.tenpb) {
        throw new Error("Mã phòng ban và tên phòng ban là bắt buộc.");
      }

      const existing = await departmentRepository.getDepartmentById(data.maphg);
      if (existing) {
        throw new Error("Mã phòng ban đã tồn tại.");
      }

      await departmentRepository.createDepartment(data);

      // Tạo phòng chat phòng ban ngay khi tạo phòng ban mới.
      await chatService.ensureDepartmentRoomCreated(data.maphg, data.tenpb);

      return {
        success: true,
        message: "Tạo phòng ban thành công",
        maPhg: data.maphg,
      };
    } catch (error) {
      throw new Error("Lỗi tạo phòng ban: " + error.message);
    }
  },

  updateDepartment: async (maPhg, data) => {
    try {
      const existing = await departmentRepository.getDepartmentById(maPhg);
      if (!existing) {
        throw new Error("Phòng ban không tồn tại.");
      }

      const updateData = {
        tenpb: data.tenpb,
        matruongphg: data.matruongphg,
      };
      Object.keys(updateData).forEach(
        (k) => updateData[k] === undefined && delete updateData[k],
      );

      await departmentRepository.updateDepartment(maPhg, updateData);
      return { success: true, message: "Cập nhật thành công" };
    } catch (error) {
      throw new Error("Lỗi cập nhật phòng ban: " + error.message);
    }
  },

  deleteDepartment: async (maPhg) => {
    try {
      const existing = await departmentRepository.getDepartmentById(maPhg);
      if (!existing) {
        throw new Error("Phòng ban không tồn tại.");
      }

      const employees =
        await departmentRepository.getEmployeesByDepartment(maPhg);
      if (employees.length > 0) {
        throw new Error("Không thể xóa do phòng ban vẫn còn nhân sự.");
      }

      await departmentRepository.deleteDepartment(maPhg);
      return { success: true, message: "Xóa thành công" };
    } catch (error) {
      throw new Error("Lỗi xóa phòng ban: " + error.message);
    }
  },

  getEmployeeDepartments: async (maNv, requesterMaNv, requesterRole) => {
    try {
      if (!maNv || String(maNv).trim() === "") {
        throw new Error("Mã nhân viên không hợp lệ.");
      }

      // Check authorization
      const normalizeRole = (role) =>
        String(role || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/\s+/g, "")
          .trim();

      const isAdmin = normalizeRole(requesterRole) === "admin";
      const isSelf = String(requesterMaNv || "").trim() === String(maNv).trim();

      if (!isAdmin && !isSelf) {
        throw new Error(
          "Bạn không có quyền xem danh sách phòng ban của nhân viên khác.",
        );
      }

      const data = await departmentRepository.getDepartmentsByEmployee(maNv);
      return {
        success: true,
        message: "Lấy danh sách phòng ban thành công",
        data,
      };
    } catch (error) {
      throw new Error("Lỗi lấy danh sách phòng ban: " + error.message);
    }
  },

  getEmployeeDepartmentWithMembers: async (
    maNv,
    requesterMaNv,
    requesterRole,
  ) => {
    try {
      if (!maNv || String(maNv).trim() === "") {
        throw new Error("Mã nhân viên không hợp lệ.");
      }

      // Check authorization
      const normalizeRole = (role) =>
        String(role || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/\s+/g, "")
          .trim();

      const isAdmin = normalizeRole(requesterRole) === "admin";

      // Get department of the employee
      const departmentData =
        await departmentRepository.getDepartmentDetailsByEmployee(maNv);
      if (!departmentData) {
        throw new Error(
          "Nhân viên không tìm thấy hoặc không thuộc phòng ban nào.",
        );
      }

      // Check if requester is in the same department or is admin
      if (!isAdmin) {
        const isInDepartment =
          await departmentRepository.isEmployeeInDepartment(
            requesterMaNv,
            departmentData.MAPHG,
          );

        if (!isInDepartment) {
          throw new Error(
            "Bạn không có quyền xem danh sách nhân viên của phòng ban này. Bạn phải là thành viên của phòng ban.",
          );
        }
      }

      return {
        success: true,
        message: "Lấy thông tin phòng ban thành công",
        data: {
          MAPHG: departmentData.MAPHG,
          TENPB: departmentData.TENPB,
          NG_THANHLAP: departmentData.NG_THANHLAP,
          MaTruongPhg: departmentData.MaTruongPhg,
          TenTruongPhong: departmentData.TenTruongPhong,
          EmailTruongPhong: departmentData.EmailTruongPhong,
          nhanVien: departmentData.nhanVien,
        },
      };
    } catch (error) {
      throw new Error("Lỗi lấy thông tin phòng ban: " + error.message);
    }
  },
};

export default departmentService;
