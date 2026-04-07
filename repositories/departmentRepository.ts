import { appPool, sql } from "../config/db";

const departmentRepository = {
  // 1. Lấy danh sách phòng ban
  getAllDepartments: async () => {
    const result = await appPool.request().execute("sp_getAllDepartments");
    return result.recordset;
  },

  // 2. Lấy chi tiết 1 phòng ban
  getDepartmentById: async (maPhg) => {
    const result = await appPool
      .request()
      .input("MaPhg", sql.Int, maPhg)
      .execute("sp_getDepartmentById");
    return result.recordset[0] || null;
  },

  // 3. Lấy ds nhân viên trong 1 phòng
  getEmployeesByDepartment: async (maPhg) => {
    const result = await appPool
      .request()
      .input("MaPhg", sql.Int, maPhg)
      .execute("sp_getEmployeesByDepartment");
    return result.recordset;
  },

  // 4. Tạo phòng ban mới
  createDepartment: async (data) => {
    const request = appPool.request();
    await request
      .input("MaPhg", sql.Int, data.maphg)
      .input("TenPb", sql.NVarChar, data.tenpb)
      .input("MaTruongPhg", sql.VarChar, data.matruongphg || null)
      .input("NgThanhLap", sql.DateTime, data.ng_thanhlap || new Date())
      .execute("sp_createDepartment");
  },

  // 5. Cập nhật phòng ban
  updateDepartment: async (maPhg, data) => {
    const request = appPool.request();

    if (data.tenpb !== undefined) {
      request.input("TenPb", sql.NVarChar, data.tenpb);
    }
    if (data.matruongphg !== undefined) {
      request.input("MaTruongPhg", sql.VarChar, data.matruongphg);
    }

    request.input("MaPhg", sql.Int, maPhg);
    await request.execute("sp_updateDepartment");
  },

  // 6. Xóa phòng ban
  deleteDepartment: async (maPhg) => {
    await appPool
      .request()
      .input("MaPhg", sql.Int, maPhg)
      .execute("sp_deleteDepartment");
  },

  // 7. Lấy danh sách phòng ban mà nhân viên đang tham gia
  getDepartmentsByEmployee: async (maNv) => {
    const result = await appPool
      .request()
      .input("MaNV", sql.VarChar(20), maNv)
      .execute("sp_getDepartmentsByEmployee");
    return result.recordset;
  },

  // 8. Lấy chi tiết phòng ban của nhân viên cùng danh sách nhân viên
  getDepartmentDetailsByEmployee: async (maNv) => {
    try {
      const request = appPool.request();
      request.multiple = true;
      const result = await request
        .input("MaNV", sql.VarChar(20), maNv)
        .execute("sp_getDepartmentDetailsByEmployee");

      // Recordset 0: Thông tin phòng ban
      const departmentInfo = result.recordsets?.[0]?.[0];
      if (!departmentInfo) {
        throw new Error(
          `Nhân viên với mã "${maNv}" không tồn tại hoặc không có phòng ban.`,
        );
      }

      // Recordset 1: Danh sách nhân viên
      const employees = result.recordsets?.[1] || [];

      return {
        ...departmentInfo,
        nhanVien: employees,
      };
    } catch (error) {
      throw new Error(`Lỗi lấy thông tin phòng ban: ${error.message}`);
    }
  },

  // 9. Kiểm tra nhân viên có thuộc phòng ban không
  isEmployeeInDepartment: async (maNv, maPhg) => {
    try {
      const result = await appPool
        .request()
        .input("MaNV", sql.VarChar(20), maNv)
        .input("MaPhg", sql.Int, maPhg)
        .execute("sp_isEmployeeInDepartment");
      return result.recordset[0].count > 0;
    } catch (error) {
      throw new Error(`Lỗi kiểm tra thành viên phòng ban: ${error}`);
    }
  },
};

export default departmentRepository;
