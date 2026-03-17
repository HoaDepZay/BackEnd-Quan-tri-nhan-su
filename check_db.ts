import { sql, connectDB } from "./config/db";

const checkTables = async () => {
  try {
    await connectDB();
    const result = await sql.query("SELECT OBJECT_DEFINITION(OBJECT_ID('sp_KichHoatTaiKhoanChinhThuc')) as Def");
    require('fs').writeFileSync('proc_def.txt', result.recordset[0].Def);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

checkTables();
