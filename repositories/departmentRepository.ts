import { appPool, sql } from "../config/db";

const departmentRepository = {
  // 1. Lấy danh sách phòng ban
  getAllDepartments: async () => {
    const request = appPool.request();
    const result = await request.query(`
      SELECT 
        pb.MAPHG, 
        pb.TENPB, 
        pb.NG_THANHLAP, 
        pb.MaTruongPhg,
        nv.HOTEN AS TenTruongPhong
      FROM PHONG_BAN pb
      LEFT JOIN NHAN_VIEN nv ON pb.MaTruongPhg = nv.MANV
      ORDER BY pb.MAPHG ASC
    `);
    return result.recordset;
  },

  // 2. Lấy chi tiết 1 phòng ban
  getDepartmentById: async (maPhg) => {
    const request = appPool.request();
    const result = await request.input("MaPhg", sql.Int, maPhg).query(`
        SELECT 
          pb.MAPHG, 
          pb.TENPB, 
          pb.NG_THANHLAP, 
          pb.MaTruongPhg,
          nv.HOTEN AS TenTruongPhong
        FROM PHONG_BAN pb
        LEFT JOIN NHAN_VIEN nv ON pb.MaTruongPhg = nv.MANV
        WHERE pb.MAPHG = @MaPhg
      `);
    return result.recordset[0] || null;
  },

  // 3. Lấy ds nhân viên trong 1 phòng
  getEmployeesByDepartment: async (maPhg) => {
    const request = appPool.request();
    const result = await request.input("MaPhg", sql.Int, maPhg).query(`
        SELECT MANV, HOTEN, EMAIL, CHUCVU 
        FROM NHAN_VIEN 
        WHERE MAPHG = @MaPhg
      `);
    return result.recordset;
  },

  // 4. Tạo phòng ban mới
  createDepartment: async (data) => {
    const request = appPool.request();
    await request
      .input("MaPhg", sql.Int, data.maphg)
      .input("TenPb", sql.NVarChar, data.tenpb)
      .input("MaTruongPhg", sql.VarChar, data.matruongphg || null)
      .input("NgThanhLap", sql.DateTime, data.ng_thanhlap || new Date()).query(`
        INSERT INTO PHONG_BAN (MAPHG, TENPB, MaTruongPhg, NG_THANHLAP)
        VALUES (@MaPhg, @TenPb, @MaTruongPhg, @NgThanhLap)
      `);
  },

  // 5. Cập nhật phòng ban
  updateDepartment: async (maPhg, data) => {
    const request = appPool.request();
    let updateFields = [];

    if (data.tenpb !== undefined) {
      updateFields.push("TENPB = @TenPb");
      request.input("TenPb", sql.NVarChar, data.tenpb);
    }
    if (data.matruongphg !== undefined) {
      updateFields.push("MaTruongPhg = @MaTruongPhg");
      request.input("MaTruongPhg", sql.VarChar, data.matruongphg);
    }

    if (updateFields.length === 0) return;

    request.input("MaPhg", sql.Int, maPhg);
    const query = `UPDATE PHONG_BAN SET ${updateFields.join(", ")} WHERE MAPHG = @MaPhg`;
    await request.query(query);
  },

  // 6. Xóa phòng ban
  deleteDepartment: async (maPhg) => {
    const request = appPool.request();
    await request
      .input("MaPhg", sql.Int, maPhg)
      .query(`DELETE FROM PHONG_BAN WHERE MAPHG = @MaPhg`);
  },
};

export default departmentRepository;
