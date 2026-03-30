"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dashboardRepository_1 = __importDefault(require("../repositories/dashboardRepository"));
const dashboardService = {
    // 1. Lấy tóm tắt Dashboard
    getDashboardSummary: async () => {
        try {
            const summary = await dashboardRepository_1.default.getDashboardSummary();
            return {
                success: true,
                message: "Lấy tóm tắt dashboard thành công",
                data: summary,
            };
        }
        catch (error) {
            throw new Error("Lỗi lấy tóm tắt dashboard: " + error.message);
        }
    },
    // 2. Lấy thống kê nhân viên theo phòng ban
    getEmployeeByDepartment: async () => {
        try {
            const departmentStats = await dashboardRepository_1.default.getEmployeeByDepartment();
            return {
                success: true,
                message: "Lấy thống kê nhân viên theo phòng ban thành công",
                data: departmentStats,
            };
        }
        catch (error) {
            throw new Error("Lỗi lấy thống kê nhân viên theo phòng ban: " + error.message);
        }
    },
    // 3. Lấy thống kê dự án
    getProjectStatistics: async () => {
        try {
            const projectStats = await dashboardRepository_1.default.getProjectStatistics();
            return {
                success: true,
                message: "Lấy thống kê dự án thành công",
                data: projectStats,
            };
        }
        catch (error) {
            throw new Error("Lỗi lấy thống kê dự án: " + error.message);
        }
    },
    // 4. Lấy top dự án gần deadline
    getProjectsNearDeadline: async () => {
        try {
            const nearDeadline = await dashboardRepository_1.default.getProjectsNearDeadline();
            return {
                success: true,
                message: "Lấy danh sách dự án gần deadline thành công",
                data: nearDeadline,
            };
        }
        catch (error) {
            throw new Error("Lỗi lấy danh sách dự án gần deadline: " + error.message);
        }
    },
    // 5. Lấy thống kê lương theo tháng
    getPayrollStatistics: async (thang = null, nam = null) => {
        try {
            const payrollStats = await dashboardRepository_1.default.getPayrollStatistics(thang, nam);
            return {
                success: true,
                message: "Lấy thống kê lương thành công",
                data: payrollStats,
            };
        }
        catch (error) {
            throw new Error("Lỗi lấy thống kê lương: " + error.message);
        }
    },
    // 6. Lấy thống kê nhân viên theo chức danh
    getEmployeeByPosition: async () => {
        try {
            const positionStats = await dashboardRepository_1.default.getEmployeeByPosition();
            return {
                success: true,
                message: "Lấy thống kê nhân viên theo chức danh thành công",
                data: positionStats,
            };
        }
        catch (error) {
            throw new Error("Lỗi lấy thống kê nhân viên theo chức danh: " + error.message);
        }
    },
    // 7. Lấy hoạt động gần đây
    getRecentActivities: async () => {
        try {
            const activities = await dashboardRepository_1.default.getRecentActivities();
            return {
                success: true,
                message: "Lấy hoạt động gần đây thành công",
                data: activities,
            };
        }
        catch (error) {
            throw new Error("Lỗi lấy hoạt động gần đây: " + error.message);
        }
    },
    // 8. Lấy Dashboard chính (Quick Stats)
    getMainDashboard: async () => {
        try {
            const [quickStats, departmentStats, projectStats, recentActivities] = await Promise.all([
                dashboardRepository_1.default.getQuickStats(),
                dashboardRepository_1.default.getEmployeeByDepartment(),
                dashboardRepository_1.default.getProjectStatistics(),
                dashboardRepository_1.default.getRecentActivities(),
            ]);
            return {
                success: true,
                message: "Lấy dashboard chính thành công",
                data: {
                    quickStats,
                    departmentStats: departmentStats.slice(0, 5), // Top 5 phòng ban
                    projectStats,
                    recentActivities,
                },
            };
        }
        catch (error) {
            throw new Error("Lỗi lấy dashboard chính: " + error.message);
        }
    },
    // 9. Lấy trendline lương 6 tháng
    getPayrollTrendline: async () => {
        try {
            const trendline = await dashboardRepository_1.default.getPayrollTrendline();
            return {
                success: true,
                message: "Lấy trendline lương thành công",
                data: trendline,
            };
        }
        catch (error) {
            throw new Error("Lỗi lấy trendline lương: " + error.message);
        }
    },
    // 10. Lấy trendline dự án
    getProjectTrendline: async () => {
        try {
            const trendline = await dashboardRepository_1.default.getProjectTrendline();
            return {
                success: true,
                message: "Lấy trendline dự án thành công",
                data: trendline,
            };
        }
        catch (error) {
            throw new Error("Lỗi lấy trendline dự án: " + error.message);
        }
    },
    // 11. Lấy Report Dashboard (dành cho Admin)
    getDashboardReport: async () => {
        try {
            const [summary, departmentStats, projectStats, payrollStats, positionStats, projectTrendline,] = await Promise.all([
                dashboardRepository_1.default.getDashboardSummary(),
                dashboardRepository_1.default.getEmployeeByDepartment(),
                dashboardRepository_1.default.getProjectStatistics(),
                dashboardRepository_1.default.getPayrollStatistics(),
                dashboardRepository_1.default.getEmployeeByPosition(),
                dashboardRepository_1.default.getProjectTrendline(),
            ]);
            return {
                success: true,
                message: "Lấy báo cáo dashboard thành công",
                data: {
                    summary,
                    departmentStats,
                    projectStats,
                    payrollStats,
                    positionStats,
                    projectTrendline,
                    generatedAt: new Date(),
                },
            };
        }
        catch (error) {
            throw new Error("Lỗi lấy báo cáo dashboard: " + error.message);
        }
    },
};
exports.default = dashboardService;
