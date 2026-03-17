import payrollService from "../services/payrollService";

const payrollController = {
  // Lấy chi tiết bảng lương 1 công ty trong tháng
  getPayrollByMonth: async (req, res) => {
    try {
      const { month, year } = req.params;
      const result = await payrollService.getPayrollByMonth(parseInt(month), parseInt(year));
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Phiếu lương nhân viên
  getEmployeePayslip: async (req, res) => {
    try {
      // Assuming JWT middleware adds `req.user.MaNV` or user calls GET /api/payroll/my-payslip/:year/:month
      // Using `req.params.id` as employeeId
      const { id, month, year } = req.params;
      const result = await payrollService.getEmployeePayslip(id, parseInt(month), parseInt(year));
      return res.status(200).json(result);
    } catch (error) {
       return res.status(404).json({ success: false, message: error.message });
    }
  },

  // Sinh bảng lương tự động cho tháng 
  generatePayroll: async (req, res) => {
    try {
      const { month, year } = req.body;
      const result = await payrollService.generatePayroll(parseInt(month), parseInt(year));
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  // Chỉnh sửa thêm giờ, thưởng v.v. bằng tay (HR thực hiện)
  updatePayrollRecord: async (req, res) => {
    try {
      const { maBl } = req.params;
      const result = await payrollService.updatePayrollRecord(parseInt(maBl), req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
};

export default payrollController;
