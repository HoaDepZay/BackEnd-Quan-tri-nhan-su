import "dotenv/config";
import sql from "mssql";

const checkLogin = async () => {
  try {
    const pool = new sql.ConnectionPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      server: process.env.DB_SERVER || "",
      port: parseInt(process.env.DB_PORT || "1433"),
      database: process.env.DB_NAME,
      options: {
        encrypt: true,
        trustServerCertificate: true,
        connectTimeout: 30000,
      },
    });

    await pool.connect();
    console.log("✅ Connected to DB\n");

    // Check principals (users) in database
    const r1 = await pool
      .request()
      .query(
        `SELECT name, type_desc FROM sys.database_principals WHERE name LIKE 'dangquanghoa206%' OR name LIKE '%209%' OR name LIKE '%@%';`,
      );
    console.log("🔍 Database principals:");
    console.table(r1.recordset);

    // Check employees
    const r2 = await pool
      .request()
      .query(
        `SELECT TOP 10 EMAIL, MANV, HOTEN FROM NHAN_VIEN WHERE EMAIL LIKE '%gmail%' OR EMAIL LIKE '%dangquanghoa%';`,
      );
    console.log("\n🔍 Employees in DB:");
    console.table(r2.recordset);

    // Check if azure server is being appended
    const serverName = process.env.DB_SERVER || "";
    const shortName = serverName.split(".")[0];
    console.log(`\n📊 Server info:`);
    console.log(`   Full: ${serverName}`);
    console.log(`   Short: ${shortName}`);

    const testEmail = "dangquanghoa206@gmail.com";
    console.log(`\n📊 Email: ${testEmail}`);
    console.log(`   Would become: ${testEmail}@${shortName}`);

    await pool.close();
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

checkLogin();
