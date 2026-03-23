import { appPool, sql } from "../config/db";

const projectRepository = {
  // 1. Lấy danh sách dự án
  getAllProjects: async () => {
    const request = appPool.request();
    const result = await request.query(`
      SELECT MADA, TENDA, MoTa, NgayBatDau, NgayKetThuc, TrangThai 
      FROM DU_AN
      ORDER BY MADA DESC
    `);
    return result.recordset;
  },

  // 2. Lấy chi tiết dự án
  getProjectById: async (maDa) => {
    const request = appPool.request();
    const result = await request.input("MaDA", sql.Int, maDa).query(`
        SELECT MADA, TENDA, MoTa, NgayBatDau, NgayKetThuc, TrangThai 
        FROM DU_AN
        WHERE MADA = @MaDA
      `);
    return result.recordset[0] || null;
  },

  // 3. Lấy ds thành viên trong dự án
  getProjectMembers: async (maDa) => {
    const request = appPool.request();
    const result = await request.input("MaDA", sql.Int, maDa).query(`
        SELECT pc.MaNV, nv.HOTEN, nv.EMAIL, nv.CHUCVU, pc.VaiTroDuAn, pc.NgayThamGia
        FROM PHAN_CONG_DU_AN pc
        JOIN NHAN_VIEN nv ON pc.MaNV = nv.MANV
        WHERE pc.MaDA = @MaDA
      `);
    return result.recordset;
  },

  // 4. Lấy ds dự án của 1 nhân viên
  getEmployeeProjects: async (maNv) => {
    const request = appPool.request();
    const result = await request.input("MaNV", sql.VarChar, maNv).query(`
        SELECT da.MADA, da.TENDA, da.TrangThai, pc.VaiTroDuAn, pc.NgayThamGia
          FROM PHAN_CONG_DU_AN pc
          JOIN DU_AN da ON pc.MaDA = da.MADA
        WHERE pc.MaNV = @MaNV
      `);
    return result.recordset;
  },

  // 5. Tạo dự án mới
  createProject: async (data) => {
    const request = appPool.request();
    await request
      .input("TenDA", sql.NVarChar, data.tenda)
      .input("MoTa", sql.NVarChar, data.mota || null)
      .input("NgayBatDau", sql.Date, data.ngaybatdau || new Date())
      .input("NgayKetThuc", sql.Date, data.ngayketthuc || null)
      .input("TrangThai", sql.NVarChar, data.trangthai || "Đang lên kế hoạch")
      .query(`
        INSERT INTO DU_AN (TENDA, MoTa, NgayBatDau, NgayKetThuc, TrangThai)
        VALUES (@TenDA, @MoTa, @NgayBatDau, @NgayKetThuc, @TrangThai)
      `);
  },

  // 6. Sửa dự án
  updateProject: async (maDa, data) => {
    const request = appPool.request();
    let updateFields = [];

    if (data.tenda !== undefined) {
      updateFields.push("TENDA = @TenDA");
      request.input("TenDA", sql.NVarChar, data.tenda);
    }
    if (data.mota !== undefined) {
      updateFields.push("MoTa = @MoTa");
      request.input("MoTa", sql.NVarChar, data.mota);
    }
    if (data.ngaybatdau !== undefined) {
      updateFields.push("NgayBatDau = @NgayBatDau");
      request.input("NgayBatDau", sql.Date, data.ngaybatdau);
    }
    if (data.ngayketthuc !== undefined) {
      updateFields.push("NgayKetThuc = @NgayKetThuc");
      request.input("NgayKetThuc", sql.Date, data.ngayketthuc);
    }
    if (data.trangthai !== undefined) {
      updateFields.push("TrangThai = @TrangThai");
      request.input("TrangThai", sql.NVarChar, data.trangthai);
    }

    if (updateFields.length === 0) return;

    request.input("MaDA", sql.Int, maDa);
    const query = `UPDATE DU_AN SET ${updateFields.join(", ")} WHERE MADA = @MaDA`;
    await request.query(query);
  },

  // 7. Xóa dự án
  deleteProject: async (maDa) => {
    const request = appPool.request();
    await request
      .input("MaDA", sql.Int, maDa)
      .query(`DELETE FROM DU_AN WHERE MADA = @MaDA`);
  },

  // 8. Thêm thành viên vào dự án
  addProjectMember: async (maDa, maNv, vaiTroDuAn) => {
    const request = appPool.request();
    await request
      .input("MaDA", sql.Int, maDa)
      .input("MaNV", sql.VarChar, maNv)
      .input("VaiTroDuAn", sql.NVarChar, vaiTroDuAn).query(`
        INSERT INTO PHAN_CONG_DU_AN (MaDA, MaNV, VaiTroDuAn, NgayThamGia)
        VALUES (@MaDA, @MaNV, @VaiTroDuAn, GETDATE())
      `);
  },

  // 9. Xóa thành viên khỏi dự án
  removeProjectMember: async (maDa, maNv) => {
    const request = appPool.request();
    await request
      .input("MaDA", sql.Int, maDa)
      .input("MaNV", sql.VarChar, maNv)
      .query(`DELETE FROM PHAN_CONG_DU_AN WHERE MaDA = @MaDA AND MaNV = @MaNV`);
  },
};

export default projectRepository;
