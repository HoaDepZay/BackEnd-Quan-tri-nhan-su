"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
const checkTables = async () => {
    try {
        await (0, db_1.connectDB)();
        const result = await db_1.sql.query("SELECT OBJECT_DEFINITION(OBJECT_ID('sp_KichHoatTaiKhoanChinhThuc')) as Def");
        require('fs').writeFileSync('proc_def.txt', result.recordset[0].Def);
        process.exit(0);
    }
    catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
};
checkTables();
