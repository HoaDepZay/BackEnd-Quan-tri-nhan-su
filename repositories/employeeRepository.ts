import sql from "mssql";

const employeeRepository = {
  // 1. Lấy danh sách nhâ n viên (có phân trang + tìm kiếm)
  getAllEmployees: async (pageNum = 1, pageSize = 10, searchKeyword = "") => {
    const request = new sql.Request();
    const offset = (pageNum - 1) * pageSize;

    let query = `
      SELECT 
        nv.MANV, 
        nv.HOTEN, 
        nv.EMAIL, 
        nv.CHUCVU, 
        nv.LUONG,
        pb.TENPB,
        nv.MAPHG,
        nv.NgaySinh AS NGAYSINH,
        nv.GioiTinh AS GIOITINH,
        nv.DiaChi AS DIACHINHAN,
        nv.NgayTuyenDung AS NGAYVAOLAM
      FROM NHAN_VIEN nv
      LEFT JOIN PHONG_BAN pb ON nv.MAPHG = pb.MAPHG
    `;

    if (searchKeyword && searchKeyword.trim() !== "") {
      query += ` WHERE nv.HOTEN LIKE @searchKeyword OR nv.MANV LIKE @searchKeyword OR nv.EMAIL LIKE @searchKeyword`;
      request.input("searchKeyword", sql.NVarChar, `%${searchKeyword}%`);
    }

    query += ` ORDER BY nv.MANV OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`;

    request.input("offset", sql.Int, offset);
    request.input("pageSize", sql.Int, pageSize);

    const result = await request.query(query);

    // Lấy tổng số nhân viên để tính total pages
    const countRequest = new sql.Request();
    if (searchKeyword && searchKeyword.trim() !== "") {
      countRequest.input("searchKeyword", sql.NVarChar, `%${searchKeyword}%`);
    }
    const countQuery = searchKeyword?.trim()
      ? `SELECT COUNT(*) as total FROM NHAN_VIEN WHERE HOTEN LIKE @searchKeyword OR MANV LIKE @searchKeyword OR EMAIL LIKE @searchKeyword`
      : `SELECT COUNT(*) as total FROM NHAN_VIEN`;

    const countResult = await countRequest.query(countQuery);
    const totalRecords = countResult.recordset[0].total;

    return {
      data: result.recordset,
      pagination: {
        pageNum,
        pageSize,
        totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize),
      },
    };
  },

  // 2. Lấy chi tiết 1 nhân viên
  getEmployeeById: async (manv) => {
    const request = new sql.Request();
    const result = await request.input("MaNV", sql.NVarChar, manv).query(`
        SELECT 
          nv.MANV, 
          nv.HOTEN, 
          nv.EMAIL, 
          nv.CHUCVU, 
          nv.LUONG,
          nv.MAPHG,
          pb.TENPB,
          nv.NgaySinh AS NGAYSINH,
          nv.GioiTinh AS GIOITINH,
          nv.DiaChi AS DIACHINHAN,
          nv.NgayTuyenDung AS NGAYVAOLAM,
          hs.SO_CCCD,
          hs.NGAYCAP,
        FROM NHAN_VIEN nv
        LEFT JOIN PHONG_BAN pb ON nv.MAPHG = pb.MAPHG
        LEFT JOIN HO_SO_BM hs ON nv.MANV = hs.MANV
        WHERE nv.MANV = @MaNV
      `);
    return result.recordset[0] || null;
  },

  // 3. Thêm nhân viên mới (Admin dùng)
  createEmployee: async (data) => {
    const request = new sql.Request();
    return await request
      .input("MaNV", sql.NVarChar, data.manv)
      .input("HoTen", sql.NVarChar, data.hoten)
      .input("Email", sql.NVarChar, data.email)
      .input("ChucVu", sql.NVarChar, data.chucvu)
      .input("Luong", sql.Decimal(18, 2), data.luong)
      .input("MaPhg", sql.Int, data.maphg)
      .input("NgaySinh", sql.Date, data.ngaysinh || null)
      .input("GioiTinh", sql.NVarChar, data.gioitinh || null)
      .input("DiaChiNhan", sql.NVarChar, data.diachinhan || null)
      .input("NgayVaoLam", sql.Date, data.ngayvaolam || new Date()).query(`
        INSERT INTO NHAN_VIEN 
        (MANV, HOTEN, EMAIL, CHUCVU, LUONG, MAPHG, NgaySinh, GioiTinh, DiaChi, NgayTuyenDung)
        VALUES 
        (@MaNV, @HoTen, @Email, @ChucVu, @Luong, @MaPhg, @NgaySinh, @GioiTinh, @DiaChiNhan, @NgayVaoLam)
      `);
  },

  // 4. Cập nhật thông tin nhân viên
  updateEmployee: async (manv, data) => {
    const request = new sql.Request();
    let updateFields = [];
    let params = { MaNV: manv };

    if (data.hoten !== undefined) {
      updateFields.push("HOTEN = @HoTen");
      request.input("HoTen", sql.NVarChar, data.hoten);
    }
    if (data.email !== undefined) {
      updateFields.push("EMAIL = @Email");
      request.input("Email", sql.NVarChar, data.email);
    }
    if (data.chucvu !== undefined) {
      updateFields.push("CHUCVU = @ChucVu");
      request.input("ChucVu", sql.NVarChar, data.chucvu);
    }
    if (data.luong !== undefined) {
      updateFields.push("LUONG = @Luong");
      request.input("Luong", sql.Decimal(18, 2), data.luong);
    }
    if (data.maphg !== undefined) {
      updateFields.push("MAPHG = @MaPhg");
      request.input("MaPhg", sql.Int, data.maphg);
    }
    if (data.ngaysinh !== undefined) {
      updateFields.push("NgaySinh = @NgaySinh");
      request.input("NgaySinh", sql.Date, data.ngaysinh);
    }
    if (data.gioitinh !== undefined) {
      updateFields.push("GioiTinh = @GioiTinh");
      request.input("GioiTinh", sql.NVarChar, data.gioitinh);
    }
    if (data.diachinhan !== undefined) {
      updateFields.push("DiaChi = @DiaChiNhan");
      request.input("DiaChiNhan", sql.NVarChar, data.diachinhan);
    }

    if (updateFields.length === 0) {
      throw new Error("Không có trường nào để cập nhật");
    }

    request.input("MaNV", sql.NVarChar, manv);
    const query = `UPDATE NHAN_VIEN SET ${updateFields.join(", ")} WHERE MANV = @MaNV`;

    return await request.query(query);
  },

  // 5. Xóa/Khóa nhân viên (cập nhật status)
  deleteEmployee: async (manv) => {
    const request = new sql.Request();
    // Có thể xóa login hoặc chỉ cập nhật status (tùy DB design)
    // Variant 1: Xóa login (khóa user login)
    return await request
      .input("MaNV", sql.NVarChar, manv)
      .query(`DELETE FROM NHAN_VIEN WHERE MANV = @MaNV`);
  },

  // 6. Đổi mật khẩu nhân viên
  changePassword: async (email, newPassword) => {
    const request = new sql.Request();
    return await request
      .input("Email", sql.NVarChar, email)
      .input("NewPassword", sql.NVarChar, newPassword)
      .query(
        `UPDATE NHAN_VIEN SET PASSWORD = @NewPassword WHERE EMAIL = @Email`,
      );
  },

  // 7. Cập nhật profile nhân viên
  updateProfile: async (email, data) => {
    const request = new sql.Request();
    let updateFields = [];

    if (data.hoten !== undefined) {
      updateFields.push("HOTEN = @HoTen");
      request.input("HoTen", sql.NVarChar, data.hoten);
    }
    if (data.ngaysinh !== undefined) {
      updateFields.push("NgaySinh = @NgaySinh");
      request.input("NgaySinh", sql.Date, data.ngaysinh);
    }
    if (data.gioitinh !== undefined) {
      updateFields.push("GioiTinh = @GioiTinh");
      request.input("GioiTinh", sql.NVarChar, data.gioitinh);
    }
    if (data.diachinhan !== undefined) {
      updateFields.push("DiaChi = @DiaChiNhan");
      request.input("DiaChiNhan", sql.NVarChar, data.diachinhan);
    }

    if (updateFields.length === 0) {
      throw new Error("Không có trường nào để cập nhật");
    }

    request.input("Email", sql.NVarChar, email);
    const query = `UPDATE NHAN_VIEN SET ${updateFields.join(", ")} WHERE EMAIL = @Email`;

    return await request.query(query);
  },
};

export default employeeRepository;
