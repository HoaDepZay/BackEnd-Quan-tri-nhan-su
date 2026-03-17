import projectRepository from "../repositories/projectRepository";

const projectService = {
  getAllProjects: async () => {
    try {
      const data = await projectRepository.getAllProjects();
      return { success: true, data };
    } catch (error) {
      throw new Error("Lỗi lấy danh sách dự án: " + error.message);
    }
  },

  getProjectById: async (maDa) => {
    try {
      const project = await projectRepository.getProjectById(maDa);
      if (!project) throw new Error("Dự án không tồn tại");

      const members = await projectRepository.getProjectMembers(maDa);

      return {
        success: true,
        data: {
          ...project,
          thanhVien: members
        }
      };
    } catch (error) {
      throw new Error("Lỗi lấy thông tin dự án: " + error.message);
    }
  },

  getEmployeeProjects: async (maNv) => {
    try {
      const data = await projectRepository.getEmployeeProjects(maNv);
      return { success: true, data };
    } catch (error) {
      throw new Error("Lỗi lấy danh sách dự án của nhân viên: " + error.message);
    }
  },

  createProject: async (data) => {
    try {
      if (!data.tenda) throw new Error("Tên dự án là bắt buộc.");
      
      await projectRepository.createProject(data);
      return { success: true, message: "Tạo dự án thành công" };
    } catch (error) {
      throw new Error("Lỗi tạo dự án: " + error.message);
    }
  },

  updateProject: async (maDa, data) => {
    try {
      const existing = await projectRepository.getProjectById(maDa);
      if (!existing) throw new Error("Dự án không tồn tại.");

      const updateData = {
        tenda: data.tenda,
        mota: data.mota,
        ngaybatdau: data.ngaybatdau,
        ngayketthuc: data.ngayketthuc,
        trangthai: data.trangthai
      };
      
      Object.keys(updateData).forEach(
        k => updateData[k] === undefined && delete updateData[k]
      );

      await projectRepository.updateProject(maDa, updateData);
      return { success: true, message: "Cập nhật dự án thành công" };
    } catch (error) {
      throw new Error("Lỗi cập nhật dự án: " + error.message);
    }
  },

  deleteProject: async (maDa) => {
    try {
      const existing = await projectRepository.getProjectById(maDa);
      if (!existing) throw new Error("Dự án không tồn tại.");

      const members = await projectRepository.getProjectMembers(maDa);
      if (members.length > 0) {
        throw new Error("Không thể xóa do dự án đang có thành viên.");
      }

      await projectRepository.deleteProject(maDa);
      return { success: true, message: "Xóa dự án thành công" };
    } catch (error) {
      throw new Error("Lỗi xóa dự án: " + error.message);
    }
  },

  addProjectMember: async (maDa, maNv, vaiTro) => {
    try {
      if (!vaiTro) throw new Error("Vai trò dự án là bắt buộc.");
      
      const existing = await projectRepository.getProjectById(maDa);
      if (!existing) throw new Error("Dự án không tồn tại.");

      await projectRepository.addProjectMember(maDa, maNv, vaiTro);
      return { success: true, message: "Thêm thành viên vào dự án thành công" };
    } catch (error) {
       // Catch foreign key error / duplicate member
      if (error.message.includes("Violation of PRIMARY KEY")) {
        throw new Error("Nhân viên này đã ở trong dự án.");
      }
      throw new Error("Lỗi thêm thành viên: " + error.message);
    }
  },

  removeProjectMember: async (maDa, maNv) => {
    try {
      await projectRepository.removeProjectMember(maDa, maNv);
      return { success: true, message: "Xóa thành viên khỏi dự án thành công" };
    } catch (error) {
      throw new Error("Lỗi xóa thành viên: " + error.message);
    }
  }
};

export default projectService;
