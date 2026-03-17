import express from "express";
const router = express.Router();
import sql from "msnodesqlv8";
const connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};UID=${process.env.DB_USER};PWD=${process.env.DB_PASS};TrustServerCertificate=yes;`;
import withUserConnection from "../middleware/authMiddleware";

// --- QUẢN LÝ NHÂN VIÊN ---

// 1. Sửa nhân viên
router.put("/nhan-vien/edit", (req, res) => {
  const { manv, hoten } = req.body;
  const maphg = req.body.maphg === null ? null : Number(req.body.maphg);
  const luong = Number(req.body.luong || 0);
  const chucvu = req.body.chucvu || "Nhân viên";

  if (!manv) return res.status(400).json({ error: "Thiếu mã nhân viên!" });

  const query =
    "UPDATE NHAN_VIEN SET HOTEN = ?, MAPHG = ?, LUONG = ?, CHUCVU = ? WHERE MANV = ?";
  sql.query(
    connectionString,
    query,
    [hoten, maphg, luong, chucvu, manv],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: "Cập nhật nhân sự thành công!" });
    },
  );
});

// 2. Xóa nhân viên
router.delete("/nhan-vien/:manv", (req, res) => {
  sql.query(
    connectionString,
    "DELETE FROM TAIKHOAN WHERE MANV = ?",
    [req.params.manv],
    () => {
      sql.query(
        connectionString,
        "DELETE FROM NHAN_VIEN WHERE MANV = ?",
        [req.params.manv],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "Deleted" });
        },
      );
    },
  );
});

// --- QUẢN LÝ PHÒNG BAN ---

// 3. Lấy danh sách phòng ban (Logic cũ dùng withUserConnection để check quyền admin qua SQL)
router.get("/phong-ban", withUserConnection, (req, res) => {
  sql.query(
    req.userConnectionString,
    "SELECT MAPHG, TENPB, NG_THANHLAP FROM PHONG_BAN",
    (err, rows) => {
      if (err)
        return res.status(403).json({ error: "Bạn không có quyền Admin" });
      res.json(rows);
    },
  );
});

// 4. Tạo phòng ban
router.post("/phong-ban/create", (req, res) => {
  const { tenpb } = req.body;
  if (!tenpb)
    return res.status(400).json({ error: "Vui lòng nhập tên phòng ban!" });

  const maPhongBan = Math.floor(1000 + Math.random() * 9000); // generateNumericCode inline
  const query =
    "INSERT INTO PHONG_BAN (MAPHG, TENPB, NG_THANHLAP) VALUES (?, ?, GETDATE())";

  sql.query(connectionString, query, [maPhongBan, tenpb], (err) => {
    if (err) {
      if (err.message.includes("PRIMARY KEY"))
        return res.status(500).json({ error: "Trùng ID, thử lại!" });
      return res.status(500).json({ error: err.message });
    }
    res
      .status(201)
      .json({
        success: true,
        message: `Tạo phòng ${tenpb} thành công!`,
        id: maPhongBan,
      });
  });
});

// 5. Sửa phòng ban
router.put("/phong-ban/edit", (req, res) => {
  const maphg = Number(req.body.maphg);
  const { tenpb } = req.body;
  if (!maphg || !tenpb)
    return res.status(400).json({ error: "Thiếu thông tin!" });

  sql.query(
    connectionString,
    "UPDATE PHONG_BAN SET TENPB = ? WHERE MAPHG = ?",
    [tenpb, maphg],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: "Cập nhật thành công!" });
    },
  );
});

// 6. Xóa phòng ban
router.delete("/phong-ban/:maphg", (req, res) => {
  const { maphg } = req.params;
  sql.query(
    connectionString,
    "SELECT COUNT(*) as count FROM NHAN_VIEN WHERE MAPHG = ?",
    [maphg],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (rows[0].count > 0)
        return res
          .status(400)
          .json({ error: "Không thể xóa phòng có nhân viên!" });

      sql.query(
        connectionString,
        "DELETE FROM PHONG_BAN WHERE MAPHG = ?",
        [maphg],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, message: "Xóa thành công!" });
        },
      );
    },
  );
});

export default router;
