import payrollService from "../services/payrollService";

const payrollController = {
  // Lấy chi tiết bảng lương 1 công ty trong tháng
  getPayrollByMonth: async (req, res) => {
    try {
      const { month, year } = req.params;
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (!Number.isInteger(monthNum) || !Number.isInteger(yearNum)) {
        return res.status(400).json({
          success: false,
          message: "Tham số year/month không hợp lệ",
        });
      }

      const result = await payrollService.getPayrollByMonth(monthNum, yearNum);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Phiếu lương nhân viên
  getEmployeePayslip: async (req, res) => {
    try {
      const now = new Date();
      const { id } = req.params;
      const month = req.params.month || req.query.month || now.getMonth() + 1;
      const year = req.params.year || req.query.year || now.getFullYear();
      const monthNum = parseInt(String(month));
      const yearNum = parseInt(String(year));

      if (!Number.isInteger(monthNum) || !Number.isInteger(yearNum)) {
        return res.status(400).json({
          success: false,
          message: "Query month/year không hợp lệ",
        });
      }

      const result = await payrollService.getEmployeePayslip(
        id,
        monthNum,
        yearNum,
      );
      return res.status(200).json(result);
    } catch (error) {
      return res.status(404).json({ success: false, message: error.message });
    }
  },

  // Sinh bảng lương tự động cho tháng
  generatePayroll: async (req, res) => {
    try {
      const { month, year } = req.body;
      const result = await payrollService.generatePayroll(
        parseInt(month),
        parseInt(year),
      );
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  // Chỉnh sửa thêm giờ, thưởng v.v. bằng tay (HR thực hiện)
  updatePayrollRecord: async (req, res) => {
    try {
      const { maBl } = req.params;
      const result = await payrollService.updatePayrollRecord(
        parseInt(maBl),
        req.body,
      );
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },
};

export default payrollController;
