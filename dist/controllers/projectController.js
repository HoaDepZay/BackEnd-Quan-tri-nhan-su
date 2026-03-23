"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const projectService_1 = __importDefault(require("../services/projectService"));
const projectController = {
    getAllProjects: async (req, res) => {
        try {
            const result = await projectService_1.default.getAllProjects();
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    getProjectById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await projectService_1.default.getProjectById(id);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(404).json({ success: false, message: error.message });
        }
    },
    getEmployeeProjects: async (req, res) => {
        try {
            const { id } = req.params; // Lấy employeeId
            const result = await projectService_1.default.getEmployeeProjects(id);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(404).json({ success: false, message: error.message });
        }
    },
    createProject: async (req, res) => {
        try {
            const result = await projectService_1.default.createProject(req.body);
            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },
    updateProject: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await projectService_1.default.updateProject(id, req.body);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },
    deleteProject: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await projectService_1.default.deleteProject(id);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },
    addProjectMember: async (req, res) => {
        try {
            const { id: maDa } = req.params;
            const { manv, vaitroduan } = req.body;
            const result = await projectService_1.default.addProjectMember(maDa, manv, vaitroduan);
            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },
    removeProjectMember: async (req, res) => {
        try {
            const { id: maDa, employeeId: maNv } = req.params;
            const result = await projectService_1.default.removeProjectMember(maDa, maNv);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
};
exports.default = projectController;
