import { Op } from "sequelize";
import { models } from "../../models/index.js";

const {
  DailyProgressReport,
  DailyProgressReportForm,
  Shift,
  Project_Master,
  Employee,
  RevenueMaster,
} = models;

export const createDailyProgressReport = async (req, res) => {
  try {
    const {
      date,
      dpr_no,
      project_id,
      customer_representative,
      shift_code,
      shift_incharge,
      shift_mechanic,
      createdBy,
      forms = [],
    } = req.body;

    const report = await DailyProgressReport.create({
      date,
      dpr_no,
      project_id,
      customer_representative,
      shift_code,
      shift_incharge,
      shift_mechanic,
      createdBy,
    });

    if (forms.length > 0) {
      const formRecords = forms.map((form) => ({
        ...form,
        dpr_id: report.id,
      }));
      await DailyProgressReportForm.bulkCreate(formRecords);
    }

    res.status(201).json({
      message: "DPR created successfully",
      reportId: report.id,
    });
  } catch (error) {
    console.error("Create DPR error:", error);
    res.status(500).json({ message: "Failed to create DPR", error });
  }
};

// Get all DPRs
export const getAllDailyProgressReports = async (req, res) => {
  try {
    const reports = await DailyProgressReport.findAll({
      include: [
        {
          model: Project_Master,
          as: "project",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Shift,
          as: "shift",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Employee,
          as: "incharge",
          attributes: ["id", "emp_id", "emp_name"],
        },
        {
          model: Employee,
          as: "mechanic",
          attributes: ["id", "emp_id", "emp_name"],
        },
        {
          model: DailyProgressReportForm,
          as: "forms",
          attributes: { exclude: ["id", "dpr_id", "createdAt", "updatedAt"] },
          include: [
            {
              model: RevenueMaster,
              as: "revenue",
              attributes: ["id", "revenue_code", "revenue_description"],
            },
          ],
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Get all DPRs error:", error);
    res.status(500).json({ message: "Failed to fetch DPRs", error });
  }
};

//get all dpr by createDailyProgressReport
export const getAllDailyProgressReportsByCreator = async (req, res) => {
  try {
    const { project_id, createdBy } = req.body;

    const whereClause = {};

    if (project_id) whereClause.project_id = project_id;
    if (createdBy) whereClause.createdBy = createdBy;

    const reports = await DailyProgressReport.findAll({
      where: whereClause, // ✅ Apply filter here
      include: [
        {
          model: Project_Master,
          as: "project",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Shift,
          as: "shift",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Employee,
          as: "incharge",
          attributes: ["id", "emp_id", "emp_name"],
        },
        {
          model: Employee,
          as: "mechanic",
          attributes: ["id", "emp_id", "emp_name"],
        },
        {
          model: DailyProgressReportForm,
          as: "forms",
          attributes: { exclude: ["id", "dpr_id", "createdAt", "updatedAt"] },
          include: [
            {
              model: RevenueMaster,
              as: "revenue",
              attributes: ["id", "revenue_code", "revenue_description"],
            },
          ],
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Get all DPRs error:", error);
    res.status(500).json({ message: "Failed to fetch DPRs", error });
  }
};

// Get single DPR by ID
export const getDailyProgressReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await DailyProgressReport.findByPk(id, {
      include: [
        {
          model: DailyProgressReportForm,
          as: "forms",
        },
      ],
    });

    if (!report) return res.status(404).json({ message: "DPR not found" });

    res.status(200).json(report);
  } catch (error) {
    console.error("Get DPR by ID error:", error);
    res.status(500).json({ message: "Failed to fetch DPR", error });
  }
};

// Update DPR with new forms
export const updateDailyProgressReport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      dpr_no,
      project_id,
      customer_representative,
      shift_code,
      shift_incharge,
      shift_mechanic,
      forms = [],
    } = req.body;

    const report = await DailyProgressReport.findByPk(id);
    if (!report) return res.status(404).json({ message: "DPR not found" });

    await report.update({
      date,
      dpr_no,
      project_id,
      customer_representative,
      shift_code,
      shift_incharge,
      shift_mechanic,
    });

    // Replace forms
    await DailyProgressReportForm.destroy({ where: { dpr_id: id } });

    if (forms.length > 0) {
      const formRecords = forms.map((form) => ({
        ...form,
        dpr_id: id,
      }));
      await DailyProgressReportForm.bulkCreate(formRecords);
    }

    res.status(200).json({ message: "DPR updated successfully" });
  } catch (error) {
    console.error("Update DPR error:", error);
    res.status(500).json({ message: "Failed to update DPR", error });
  }
};

// Delete DPR and its forms
export const deleteAllDailyProgressReports = async (req, res) => {
  try {
    // Step 1: Delete all associated forms
    await DailyProgressReportForm.destroy({ where: {} });

    // Step 2: Delete all DPR records
    await DailyProgressReport.destroy({ where: {} });

    res
      .status(200)
      .json({ message: "All DPRs and associated forms deleted successfully" });
  } catch (error) {
    console.error("Delete all DPRs error:", error);
    res.status(500).json({ message: "Failed to delete all DPRs", error });
  }
};
