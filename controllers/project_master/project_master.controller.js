import { Op } from "sequelize";
import { models } from "../../models/index.js"; // Correct import
import XLSX from "xlsx";
import { processProjectRow } from "../../utils/HelperFunctions/processProjectRow.js";
const {
  Partner,
  Project_Master,
  RevenueMaster,
  Equipment,
  Employee,
  Store,
  EquipmentProject,
  ProjectEmployees,
  ProjectRevenue,
  StoreProject,
  Role,
  MaterialTransaction,
  EquipmentTransaction,
} = models; // Extract Partner model

// Create Project

export const createProject = async (req, res) => {
  const {
    projectNo,
    customer,
    orderNo,
    contractStartDate,
    contractTenure,
    contractEndDate, // ✅ New field
    revenueMaster = [],
    // equipments = [],
    // staff = [],
    storeLocations = [],
  } = req.body;

  try {
    // Validate required relationships
    // if (!equipments.length) {
    //   return res.status(400).json({ message: "At least one equipment is required." });
    // }
    // if (staff.length < 6) {
    //   return res.status(400).json({ message: "Minimum 6 staff members are required." });
    // }
    if (!storeLocations.length) {
      return res
        .status(400)
        .json({ message: "At least one store location is required." });
    }
    if (!revenueMaster.length) {
      return res
        .status(400)
        .json({ message: "At least one revenue master is required." });
    }

    // Check if project number already exists
    const existingProject = await Project_Master.findOne({
      where: { project_no: projectNo },
    });

    if (existingProject) {
      return res
        .status(400)
        .json({ message: "Project number already exists." });
    }

    // Validate customer_id
    const customerExists = await Partner.findByPk(customer);
    if (!customerExists) {
      return res.status(400).json({ message: "Invalid customer ID." });
    }

    // Required roles
    // const requiredRoles = [
    //   'mechanic',
    //   'mechanicIncharge',
    //   'siteIncharge',
    //   'storeManager',
    //   'accountManager',
    //   'ProjectManager'
    // ];

    // const staffDetails = await Employee.findAll({
    //   where: { id: { [Op.in]: staff } },
    //   include: [{
    //     model: Role,
    //     as: 'role',
    //     attributes: ['name']
    //   }]
    // });

    // if (staffDetails.length !== staff.length) {
    //   return res.status(400).json({ message: "Invalid employee/staff ID(s)." });
    // }

    // const presentRoles = [...new Set(staffDetails.map(emp => emp.role?.name))];
    // const missingRoles = requiredRoles.filter(role => !presentRoles.includes(role));

    // if (missingRoles.length > 0) {
    //   return res.status(400).json({
    //     message: `Missing required staff roles: ${missingRoles.join(', ')}. Each of these roles must have at least one staff member assigned.`
    //   });
    // }

    // Validate related entities
    const validRevenueCount = await RevenueMaster.count({
      where: { id: { [Op.in]: revenueMaster } },
    });
    if (validRevenueCount !== revenueMaster.length) {
      return res.status(400).json({ message: "Invalid revenue master ID(s)." });
    }

    // const validEquipmentCount = await Equipment.count({ where: { id: { [Op.in]: equipments } } });
    // if (validEquipmentCount !== equipments.length) {
    //   return res.status(400).json({ message: "Invalid equipment ID(s)." });
    // }

    const validStoreCount = await Store.count({
      where: { id: { [Op.in]: storeLocations } },
    });
    if (validStoreCount !== storeLocations.length) {
      return res.status(400).json({ message: "Invalid store location ID(s)." });
    }

    // ✅ Default today's date if not provided
    const endDate = contractEndDate ? new Date(contractEndDate) : new Date();

    // Create project
    const project = await Project_Master.create({
      project_no: projectNo,
      customer_id: customer,
      order_no: orderNo,
      contract_start_date: contractStartDate,
      contract_end_date: endDate, // ✅ Added here
      // contract_tenure: contractTenure,
    });

    const project_id = project.id;

    // await EquipmentProject.bulkCreate(
    //   equipments.map((equipment_id) => ({ project_id, equipment_id }))
    // );

    await ProjectRevenue.bulkCreate(
      revenueMaster.map((revenue_master_id) => ({
        project_id,
        revenue_master_id,
      }))
    );

    // await ProjectEmployees.bulkCreate(
    //   staff.map((emp_id) => ({ project_id, emp_id }))
    // );

    await StoreProject.bulkCreate(
      storeLocations.map((store_id) => ({ project_id, store_id }))
    );

    return res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Error in createProject:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all Projects with all associated data
export const getProjects = async (req, res) => {
  try {
    const projects = await Project_Master.findAll({
      include: [
        {
          association: "customer",
          attributes: ["id", "partner_name"],
        },
        {
          association: "equipments",
          attributes: ["id", "equipment_name"],
          through: { attributes: [] },
        },
        {
          association: "staff",
          attributes: ["id", "emp_name"],
          through: { attributes: [] },
        },
        {
          association: "revenues",
          attributes: ["id", "revenue_code", "revenue_description"],
          through: { attributes: [] },
        },
        {
          association: "store_locations",
          attributes: ["id", "store_code", "store_name"],
          through: { attributes: [] },
        },
      ],
    });

    const projectsWithDuration = projects.map((project) => {
      const start = new Date(project.contract_start_date);
      const end = new Date(project.contract_end_date);
      const duration = `${Math.ceil(
        (end - start) / (1000 * 60 * 60 * 24)
      )} Days`; // in days

      return {
        ...project.toJSON(),
        contract_end_date: project.contract_end_date,
        duration,
      };
    });

    return res.status(200).json(projectsWithDuration);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Project by ID (with all associations)
export const getProjectById = async (req, res) => {
  const { id } = req.body;

  try {
    const project = await Project_Master.findByPk(id, {
      include: [
        {
          association: "customer",
          attributes: ["id", "partner_name"],
        },
        {
          association: "equipments",
          attributes: ["id", "equipment_name"],
          through: { attributes: [] },
        },
        {
          association: "staff",
          attributes: ["id", "emp_name", "role_id"],
          through: { attributes: [] },
          include: [
            {
              association: "role",
              attributes: ["name"],
            },
          ],
        },
        {
          association: "revenues",
          attributes: ["id", "revenue_code", "revenue_description"],
          through: { attributes: [] },
        },
        {
          association: "store_locations",
          attributes: ["id", "store_code", "store_name"],
          through: { attributes: [] },
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const start = new Date(project.contract_start_date);
    const end = new Date(project.contract_end_date);
    const duration = `${Math.ceil((end - start) / (1000 * 60 * 60 * 24))} days`; // duration in days

    return res.status(200).json({
      ...project.toJSON(),
      contract_end_date: project.contract_end_date,
      duration, // number of days between start and end
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get Project by Store ID (with all associations)
export const getProjectByStoreId = async (req, res) => {
  const { id } = req.body; // Using params instead of body for GET request

  console.log({ id });

  try {
    // Find projects that have this store in their store_locations
    const projects = await Project_Master.findAll({
      include: [
        {
          association: "customer",
          attributes: ["id", "partner_name"],
        },
        {
          association: "equipments",
          attributes: ["id", "equipment_name"],
          through: { attributes: [] },
        },
        {
          association: "staff",
          attributes: ["id", "emp_name", "role_id"],
          through: { attributes: [] },
          include: [
            {
              association: "role",
              attributes: ["name"],
            },
          ],
        },
        {
          association: "revenues",
          attributes: ["id", "revenue_code", "revenue_description"],
          through: { attributes: [] },
        },
        {
          association: "store_locations",
          attributes: ["id", "store_code", "store_name"],
          through: { attributes: [] },
          where: { id }, // Filter to only include this store
        },
      ],
    });

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        message: "No projects found for this store",
        storeId: id,
      });
    }

    // Format each project with duration
    const formattedProjects = projects.map((project) => {
      const start = new Date(project.contract_start_date);
      const end = new Date(project.contract_end_date);
      const duration = `${Math.ceil(
        (end - start) / (1000 * 60 * 60 * 24)
      )} days`;

      return {
        ...project.toJSON(),
        contract_end_date: project.contract_end_date,
        duration,
      };
    });

    return res.status(200).json({
      message: "Projects retrieved successfully",
      count: formattedProjects.length,
      storeId: id,
      projects: formattedProjects,
    });
  } catch (error) {
    console.error("Error fetching projects by store ID:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      storeId: id,
    });
  }
};

// Update Project
export const updateProject = async (req, res) => {
  const {
    projectNo,
    customer,
    orderNo,
    contractStartDate,
    contractEndDate, // ← added
    contractTenure,
    revenueMaster = [],
    equipments = [],
    // staff = [],
    storeLocations = [],
  } = req.body;

  try {
    const { id } = req.params;
    const project = await Project_Master.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // if (!equipments.length) {
    //   return res
    //     .status(400)
    //     .json({ message: "At least one equipment is required." });
    // }
    // if (!staff.length) {
    //   return res.status(400).json({ message: "At least one staff member is required." });
    // }
    if (!storeLocations.length) {
      return res
        .status(400)
        .json({ message: "At least one store location is required." });
    }
    if (!revenueMaster.length) {
      return res
        .status(400)
        .json({ message: "At least one revenue master is required." });
    }

    if (project.project_no !== projectNo) {
      const existingProject = await Project_Master.findOne({
        where: { project_no: projectNo },
      });
      if (existingProject) {
        return res
          .status(400)
          .json({ message: "Project number already exists." });
      }
    }

    const customerExists = await Partner.findByPk(customer);
    if (!customerExists) {
      return res.status(400).json({ message: "Invalid customer ID." });
    }

    const [
      validRevenueCount,
      validEquipmentCount,
      // validStaffCount,
      validStoreCount,
    ] = await Promise.all([
      RevenueMaster.count({ where: { id: { [Op.in]: revenueMaster } } }),
      Equipment.count({ where: { id: { [Op.in]: equipments } } }),
      // Employee.count({ where: { id: { [Op.in]: staff } } }),
      Store.count({ where: { id: { [Op.in]: storeLocations } } }),
    ]);

    if (validRevenueCount !== revenueMaster.length) {
      return res.status(400).json({ message: "Invalid revenue master ID(s)." });
    }
    if (validEquipmentCount !== equipments.length) {
      return res.status(400).json({ message: "Invalid equipment ID(s)." });
    }
    // if (validStaffCount !== staff.length) {
    //   return res.status(400).json({ message: "Invalid employee/staff ID(s)." });
    // }
    if (validStoreCount !== storeLocations.length) {
      return res.status(400).json({ message: "Invalid store location ID(s)." });
    }

    await project.update({
      project_no: projectNo,
      customer_id: customer,
      order_no: orderNo,
      contract_start_date: contractStartDate,
      contract_end_date: contractEndDate, // ← update field
      contract_tenure: contractTenure,
    });

    const project_id = project.id;

    await Promise.all([
      EquipmentProject.destroy({ where: { project_id } }),
      ProjectRevenue.destroy({ where: { project_id } }),
      // ProjectEmployees.destroy({ where: { project_id } }),
      StoreProject.destroy({ where: { project_id } }),
    ]);

    await Promise.all([
      EquipmentProject.bulkCreate(
        equipments.map((equipment_id) => ({ project_id, equipment_id }))
      ),
      ProjectRevenue.bulkCreate(
        revenueMaster.map((revenue_master_id) => ({
          project_id,
          revenue_master_id,
        }))
      ),
      // ProjectEmployees.bulkCreate(
      //   staff.map((emp_id) => ({ project_id, emp_id }))
      // ),
      StoreProject.bulkCreate(
        storeLocations.map((store_id) => ({ project_id, store_id }))
      ),
    ]);

    return res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Error in updateProject:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Project
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project_Master.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Use transaction to ensure all deletions are atomic
    const transaction = await Project_Master.sequelize.transaction();
    try {
      // Delete all junction table entries first
      await Promise.all([
        EquipmentProject.destroy({ where: { project_id: id }, transaction }),
        ProjectRevenue.destroy({ where: { project_id: id }, transaction }),
        ProjectEmployees.destroy({ where: { project_id: id }, transaction }),
        StoreProject.destroy({ where: { project_id: id }, transaction }),
        MaterialTransaction.destroy({
          where: { project_id: id },
          transaction,
        }),
        EquipmentTransaction.destroy({
          where: { project_id: id },
          transaction,
        }),
      ]);

      // Then delete the project itself
      await project.destroy({ transaction });

      await transaction.commit();
      return res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//Bulk upload
export const bulkUploadProjects = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Use sheet_to_json with header to get proper object structure
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    console.log("Excel headers:", Object.keys(rows[0]));
    console.log("First row sample:", rows[0]);

    // Fetch reference data and map for lookup
    const stores = await Store.findAll();
    const storeMap = new Map(stores.map((s) => [s.store_code.trim(), s.id]));

    const revenues = await RevenueMaster.findAll();
    const revenueMap = new Map(
      revenues.map((r) => [r.revenue_code.trim(), r.id])
    );

    const equipments = await Equipment.findAll();
    const equipmentMap = new Map(
      equipments.map((e) => [e.equipment_name.trim(), e.id])
    );

    const customers = await Partner.findAll();
    const customerMap = new Map(
      customers.map((c) => [c.partner_name.trim(), c.id])
    );

    const results = [];

    for (const [index, row] of rows.entries()) {
      const {
        projectNo,
        customer,
        orderNo,
        contractStartDate,
        contractEndDate,
        revenueMaster,
        equipments: equipmentStr,
        storeLocations,
      } = row;

      console.log(`Processing row ${index + 2}:`, {
        projectNo,
        customer,
        orderNo,
        contractStartDate,
        contractEndDate,
        revenueMaster,
        equipmentStr,
        storeLocations,
      });

      if (!projectNo) {
        results.push({
          row: index + 2,
          projectNo: "MISSING",
          status: "failed",
          message: "Project number is required",
        });
        continue;
      }

      // Convert revenue codes to IDs
      const revenue_master_ids = revenueMaster
        ? revenueMaster
            .split(",")
            .map((code) => {
              const trimmedCode = code.trim();
              const revenueId = revenueMap.get(trimmedCode);
              console.log(`Revenue code: "${trimmedCode}" -> ${revenueId}`);
              return revenueId;
            })
            .filter(Boolean)
        : [];

      // Convert store locations to IDs
      const store_location_ids = storeLocations
        ? storeLocations
            .split(",")
            .map((code) => {
              const trimmedCode = code.trim();
              const storeId = storeMap.get(trimmedCode);
              console.log(`Store code: "${trimmedCode}" -> ${storeId}`);
              return storeId;
            })
            .filter(Boolean)
        : [];

      // Convert equipment names to IDs (if you need this for equipment relationships)
      const equipment_ids = equipmentStr
        ? equipmentStr
            .split(",")
            .map((name) => {
              const trimmedName = name.trim();
              const equipmentId = equipmentMap.get(trimmedName);
              console.log(`Equipment: "${trimmedName}" -> ${equipmentId}`);
              return equipmentId;
            })
            .filter(Boolean)
        : [];

      console.log(
        `Parsed IDs - Revenue: ${revenue_master_ids.length}, Store: ${store_location_ids.length}, Equipment: ${equipment_ids.length}`
      );

      // Validations
      if (!customer || !customerMap.has(customer.trim())) {
        results.push({
          row: index + 2,
          projectNo,
          status: "failed",
          message: `Invalid or missing customer name: "${customer}"`,
        });
        continue;
      }

      if (revenue_master_ids.length === 0) {
        results.push({
          row: index + 2,
          projectNo,
          status: "failed",
          message: `Invalid or missing revenue code(s): "${revenueMaster}"`,
        });
        continue;
      }

      if (store_location_ids.length === 0) {
        results.push({
          row: index + 2,
          projectNo,
          status: "failed",
          message: `Invalid or missing store code(s): "${storeLocations}"`,
        });
        continue;
      }

      // Parse dates
      const parseDate = (dateValue) => {
        if (!dateValue) return null;

        // Handle Excel serial numbers
        if (typeof dateValue === "number") {
          const excelEpoch = new Date(1900, 0, 1);
          const date = new Date(
            excelEpoch.getTime() + (dateValue - 1) * 24 * 60 * 60 * 1000
          );
          if (dateValue > 60) date.setDate(date.getDate() - 1);
          return date.toISOString().split("T")[0];
        }

        // Handle string dates (YYYY-MM-DD format)
        if (typeof dateValue === "string") {
          const trimmedValue = dateValue.trim();
          // Try YYYY-MM-DD format
          const yyyyMmDdRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
          const match = trimmedValue.match(yyyyMmDdRegex);

          if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1;
            const day = parseInt(match[3], 10);

            if (
              day >= 1 &&
              day <= 31 &&
              month >= 0 &&
              month <= 11 &&
              year >= 1900
            ) {
              const date = new Date(year, month, day);
              if (
                date.getDate() === day &&
                date.getMonth() === month &&
                date.getFullYear() === year
              ) {
                return date.toISOString().split("T")[0];
              }
            }
          }

          // Try other formats
          const parsedDate = new Date(trimmedValue);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split("T")[0];
          }
        }

        return null;
      };

      const contract_start_date = parseDate(contractStartDate);
      const contract_end_date = parseDate(contractEndDate);

      if (!contract_start_date || !contract_end_date) {
        results.push({
          row: index + 2,
          projectNo,
          status: "failed",
          message: `Invalid date format. contractStartDate: "${contractStartDate}", contractEndDate: "${contractEndDate}". Use YYYY-MM-DD format.`,
        });
        continue;
      }

      // Process and save the project
      try {
        const result = await processProjectRow({
          projectNo: projectNo.trim(),
          customer: customer.trim(),
          orderNo: orderNo ? orderNo.toString().trim() : "",
          contract_start_date,
          contract_end_date,
          revenue_master_ids,
          store_location_ids,
          equipment_ids, // Pass equipment IDs if needed
        });

        results.push({
          row: index + 2,
          ...result,
        });
      } catch (error) {
        console.error(`Error processing project ${projectNo}:`, error);
        results.push({
          row: index + 2,
          projectNo,
          status: "failed",
          message: error.message,
        });
      }
    }

    return res.status(201).json({
      message: "Bulk upload completed",
      results,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Handles both string dd-mm-yyyy and Excel serial number
