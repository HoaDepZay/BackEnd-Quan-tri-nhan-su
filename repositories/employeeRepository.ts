import { appPool, sql } from "../config/db";

const employeeRepository = {
  // 1. Lấy danh sách nhâ n viên (có phân trang + tìm kiếm)
  getAllEmployees: async (pageNum = 1, pageSize = 10, searchKeyword = "") => {
    const request = appPool.request();
    request.input("PageNum", sql.Int, pageNum);
    request.input("PageSize", sql.Int, pageSize);

    if (searchKeyword && searchKeyword.trim() !== "") {
      request.input("SearchKeyword", sql.NVarChar(100), searchKeyword.trim());
    }

    const result = await request.execute("sp_getAllEmployees");
    const totalRecords = result.recordsets?.[1]?.[0]?.TotalRecords || 0;

    return {
      data: result.recordsets?.[0] || [],
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
    const request = appPool.request();
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
          nv.SDT,
          nv.DiaChi AS DIACHINHAN,
          nv.DiaChi AS DIACHI,
          nv.MaChucDanh AS MACHUCDANH,
          nv.NgayTuyenDung AS NGAYVAOLAM,
          nv.NgayTuyenDung AS NGAYTUYENDUNG,
          nv.TrangThaiLamViec AS TRANGTHAILAMVIEC,
          hs.SO_CCCD
        FROM NHAN_VIEN nv
        LEFT JOIN PHONG_BAN pb ON nv.MAPHG = pb.MAPHG
        LEFT JOIN HO_SO_BM hs ON nv.MANV = hs.MANV
        WHERE nv.MANV = @MaNV
      `);
    return result.recordset[0] || null;
  },

  // 3. Thêm nhân viên mới (Admin dùng)
  createEmployee: async (data) => {
    const request = appPool.request();
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
    const request = appPool.request();
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
    const transaction = appPool.transaction();
    await transaction.begin();

    try {
      const employeeResult = await new sql.Request(transaction).input(
        "MaNV",
        sql.NVarChar,
        manv,
      ).query(`
          SELECT TOP 1 MANV, EMAIL
          FROM NHAN_VIEN
          WHERE MANV = @MaNV
        `);

      const employee = employeeResult.recordset[0];
      if (!employee) {
        await transaction.rollback();
        throw new Error("Nhân viên không tồn tại");
      }

      await new sql.Request(transaction)
        .input("MaNV", sql.NVarChar, manv)
        .execute("sp_deleteEmployee");

      if (employee.EMAIL) {
        const safeIdentifier = `[${String(employee.EMAIL).replace(/]/g, "]]")}]`;
        const safeEmailLiteral = String(employee.EMAIL).replace(/'/g, "''");

        await new sql.Request(transaction).query(`
          IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'${safeEmailLiteral}')
          BEGIN
            DROP USER ${safeIdentifier};
          END
        `);
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback().catch(() => undefined);
      throw error;
    }
  },

  // 6. Đổi mật khẩu nhân viên
  changePassword: async (email, newPassword) => {
    const request = appPool.request();
    return await request
      .input("Email", sql.NVarChar, email)
      .input("NewPassword", sql.NVarChar, newPassword)
      .query(
        `UPDATE NHAN_VIEN SET PASSWORD = @NewPassword WHERE EMAIL = @Email`,
      );
  },

  // 7. Cập nhật profile nhân viên
  updateProfile: async (email, data) => {
    const request = appPool.request();
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
    const diaChiValue = data.diachinhan || data.diachi; // Support both naming conventions
    if (diaChiValue !== undefined) {
      updateFields.push("DiaChi = @DiaChiNhan");
      request.input("DiaChiNhan", sql.NVarChar, diaChiValue);
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
