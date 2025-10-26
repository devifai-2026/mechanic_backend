import { Op } from "sequelize";
import { models } from "../../models/index.js";
const {
    DailyProgressReport,
    DailyProgressReportForm,
    Employee,
    Shift,
    ProjectMaster,
    RevenueMaster,
    
} = models;

// ✅ Approve or Reject DPR
export const approveOrRejectDPR = async (req, res) => {
    const { dpr_id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Status must be either 'approved' or 'rejected'" });
    }

    try {
        const dpr = await DailyProgressReport.findByPk(dpr_id);
        if (!dpr) {
            return res.status(404).json({ message: "DPR not found" });
        }

        dpr.is_approve_pm = status;
        await dpr.save();

        return res.json({ message: `DPR successfully ${status}`, data: dpr });
    } catch (error) {
        console.error("Error approving/rejecting DPR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ✅ Get all DPRs (optionally filtered by project_id)
export const getAllDPRs = async (req, res) => {
    const { project_id } = req.query;

    try {
        const whereClause = project_id ? { project_id } : {};

        const reports = await DailyProgressReport.findAll({
            where: whereClause,
            include: [
                { model: Employee, as: "incharge" },
                { model: Employee, as: "mechanic" },
                { model: Shift, as: "shift" },
                { model: ProjectMaster, as: "project" },
                {
                    model: DailyProgressReportForm,
                    as: "forms",
                    include: [{ model: RevenueMaster, as: "revenue" }],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const sanitized = reports.map((report) => {
            const r = report.toJSON();
            delete r.shift_code;
            delete r.shift_incharge;
            delete r.shift_mechanic;
            delete r.project_id;
            r.forms = r.forms.map((f) => {
                delete f.dpr_id;
                delete f.revenue_code;
                return f;
            });
            return r;
        });

        return res.json(sanitized);
    } catch (error) {
        console.error("Error fetching all DPRs:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ✅ Get DPRs by status (pending / approved / rejected)
export const getDPRsByStatus = async (req, res) => {
    const { status } = req.params;
    const { project_id } = req.query;

    if (!["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const whereClause = {
            is_approve_pm: status,
            ...(project_id && { project_id }),
        };

        const reports = await DailyProgressReport.findAll({
            where: whereClause,
            include: [
                { model: Employee, as: "incharge" },
                { model: Employee, as: "mechanic" },
                { model: Shift, as: "shift" },
                { model: ProjectMaster, as: "project" },
                {
                    model: DailyProgressReportForm,
                    as: "forms",
                    include: [{ model: RevenueMaster, as: "revenue" }],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const sanitized = reports.map((report) => {
            const r = report.toJSON();
            delete r.shift_code;
            delete r.shift_incharge;
            delete r.shift_mechanic;
            delete r.project_id;
            r.forms = r.forms.map((f) => {
                delete f.dpr_id;
                delete f.revenue_code;
                return f;
            });
            return r;
        });

        return res.json(sanitized);
    } catch (error) {
        console.error("Error fetching DPRs by status:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
