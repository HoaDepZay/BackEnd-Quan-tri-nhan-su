const express = require("express");
const router = express.Router();
const sql = require("msnodesqlv8");
const withUserConnection = require("../middleware/authMiddleware");
const { connectionString } = require("../config/db");

// 1. Xem Profile (Dùng connection string động của User)
router.get("/profile/:manv", withUserConnection, (req, res) => {
  const query = `
    SELECT nv.MANV, nv.HOTEN, nv.LUONG, nv.CHUCVU, nv.EMAIL, pb.TENPB, hs.SO_CCCD
    FROM NHANVIEN nv
    LEFT JOIN PHONGBAN pb ON nv.MAPHG = pb.MAPHG
    LEFT JOIN HOSOBM hs ON nv.MANV = hs.MANV
    WHERE nv.MANV = ?`;

  sql.query(req.userConnectionString, query, [req.params.manv], (err, rows) => {
    if (err) {
      console.error("Lỗi quyền hạn:", err.message);
      return res
        .status(403)
        .json({ error: "Bạn không có quyền xem dữ liệu này (SQL Denied)" });
    }
    rows.length > 0
      ? res.json(rows[0])
      : res.status(404).json({ message: "404" });
  });
});

// 2. Xem dự án của tôi (Dùng connection string động)
router.get("/my-projects/:manv", withUserConnection, (req, res) => {
  const query = `SELECT da.TENDA, pc.THOIGIAN FROM PHANCONG pc JOIN DUAN da ON pc.MADA = da.MADA WHERE pc.MANV = ?`;
  sql.query(req.userConnectionString, query, [req.params.manv], (err, rows) => {
    if (err)
      return res.status(500).json({ error: "Lỗi truy vấn hoặc quyền hạn!" });
    res.json(rows);
  });
});

// 3. Xem đồng nghiệp cùng phòng (Dùng connection string động)
router.get("/coworkers/:maphg", withUserConnection, (req, res) => {
  sql.query(
    req.userConnectionString,
    "SELECT MANV, HOTEN, CHUCVU FROM NHANVIEN WHERE MAPHG = ?",
    [req.params.maphg],
    (err, rows) => {
      if (err) return res.status(403).json({ error: "Access Denied" });
      res.json(rows);
    },
  );
});

// 4. Cập nhật thông tin cá nhân (Email) - Logic cũ dùng connectionString (SA)
router.put("/update-info", (req, res) => {
  const { manv, email } = req.body;
  sql.query(
    connectionString,
    "UPDATE NHANVIEN SET EMAIL = ? WHERE MANV = ?",
    [email, manv],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "OK" });
    },
  );
});

module.exports = router;
