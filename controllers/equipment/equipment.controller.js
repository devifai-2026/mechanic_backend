// controllers/equipment/equipment.controller.js
import XLSX from "xlsx";
import { models } from "../../models/index.js";
const { 
  Equipment, 
  EquipmentGroup, 
  EquipmentProject, 
  OEM, 
  Project_Master,
  EquipmentEquipmentGroup 
} = models;

// Create Equipment
export const createEquipment = async (req, res) => {
  const {
    equipment_name,
    equipment_sr_no,
    additional_id,
    purchase_date,
    oem,
    purchase_cost,
    equipment_manual,
    maintenance_log,
    other_log,
    project_tag,
    equipment_group_id, // Array of group IDs
    hsn_number,
  } = req.body;

  try {
    if (
      !equipment_name ||
      !equipment_sr_no ||
      !purchase_date ||
      !oem ||
      !equipment_group_id ||
      !hsn_number
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate equipment groups
    let groupIds = [];
    if (Array.isArray(equipment_group_id)) {
      groupIds = equipment_group_id;
    } else if (typeof equipment_group_id === "string") {
      try {
        groupIds = JSON.parse(equipment_group_id);
      } catch {
        groupIds = equipment_group_id.split(",").map((id) => id.trim());
      }
    }

    // Check if groups exist
    const groups = await EquipmentGroup.findAll({
      where: { id: groupIds }
    });

    if (groups.length !== groupIds.length) {
      return res.status(404).json({ message: "One or more equipment groups not found" });
    }

    // Create equipment
    const newEquipment = await Equipment.create({
      equipment_name,
      equipment_sr_no,
      additional_id,
      purchase_date,
      oem,
      purchase_cost,
      equipment_manual,
      maintenance_log,
      other_log,
      hsn_number,
    });

    // Handle projects
    let projectIds = [];
    if (project_tag) {
      if (Array.isArray(project_tag)) {
        projectIds = project_tag;
      } else if (typeof project_tag === "string") {
        try {
          projectIds = JSON.parse(project_tag);
        } catch {
          projectIds = project_tag.split(",").map((id) => id.trim());
        }
      }

      if (projectIds.length) {
        await EquipmentProject.bulkCreate(
          projectIds.map((project_id) => ({
            equipment_id: newEquipment.id,
            project_id,
          }))
        );
      }
    }

    // Handle equipment groups
    if (groupIds.length) {
      await EquipmentEquipmentGroup.bulkCreate(
        groupIds.map((group_id) => ({
          equipment_id: newEquipment.id,
          equipment_group_id: group_id,
        }))
      );
    }

    // Fetch with associations
    const createdEquipment = await Equipment.findByPk(newEquipment.id, {
      include: [
        { model: Project_Master, as: "projects" },
        { model: EquipmentGroup, as: "equipmentGroup" },
        { model: OEM, as: "oemDetails" }
      ]
    });

    return res.status(201).json(createdEquipment);
  } catch (error) {
    console.error("Error creating equipment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Equipment
export const getAllEquipment = async (req, res) => {
  try {
    const equipments = await Equipment.findAll({
      include: [
        {
          model: EquipmentGroup,
          as: "equipmentGroup",
        },
        {
          model: Project_Master,
          as: "projects",
          through: { attributes: [] },
        },
        {
          model: OEM,
          as: "oemDetails",
          attributes: ["id", "oem_name", "oem_code"],
        },
      ],
    });

    return res.status(200).json(equipments);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Equipment by ID
export const getEquipmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const equipment = await Equipment.findByPk(id, {
      include: [
        { model: EquipmentGroup, as: "equipmentGroup" },
        { model: Project_Master, as: "projects", through: { attributes: [] } },
        { model: OEM, as: "oemDetails" }
      ],
    });

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    return res.status(200).json(equipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Equipment
export const updateEquipment = async (req, res) => {
  const { id } = req.params;
  const {
    equipment_name,
    equipment_sr_no,
    additional_id,
    purchase_date,
    oem,
    purchase_cost,
    equipment_manual,
    maintenance_log,
    other_log,
    project_tag,
    equipment_group_id,
  } = req.body;

  try {
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    // Update basic fields
    await equipment.update({
      equipment_name,
      equipment_sr_no,
      additional_id,
      purchase_date,
      oem,
      purchase_cost,
      equipment_manual,
      maintenance_log,
      other_log,
    });

    // Handle equipment groups update
    if (equipment_group_id !== undefined) {
      let groupIds = [];
      if (Array.isArray(equipment_group_id)) {
        groupIds = equipment_group_id;
      } else if (typeof equipment_group_id === "string") {
        try {
          groupIds = JSON.parse(equipment_group_id);
        } catch {
          groupIds = equipment_group_id.split(",").map((id) => id.trim());
        }
      }

      // Validate groups
      if (groupIds.length > 0) {
        const groups = await EquipmentGroup.findAll({
          where: { id: groupIds }
        });

        if (groups.length !== groupIds.length) {
          return res.status(404).json({ message: "One or more equipment groups not found" });
        }
      }

      // Update groups
      await EquipmentEquipmentGroup.destroy({ where: { equipment_id: id } });
      
      if (groupIds.length > 0) {
        await EquipmentEquipmentGroup.bulkCreate(
          groupIds.map((group_id) => ({
            equipment_id: id,
            equipment_group_id: group_id,
          }))
        );
      }
    }

    // Handle projects update
    if (project_tag !== undefined) {
      let projectIds = [];
      if (Array.isArray(project_tag)) {
        projectIds = project_tag;
      } else if (typeof project_tag === "string") {
        try {
          projectIds = JSON.parse(project_tag);
        } catch {
          projectIds = project_tag.split(",").map((id) => id.trim());
        }
      }

      await EquipmentProject.destroy({ where: { equipment_id: id } });
      
      if (projectIds.length > 0) {
        await EquipmentProject.bulkCreate(
          projectIds.map((project_id) => ({
            equipment_id: id,
            project_id,
          }))
        );
      }
    }

    // Fetch updated equipment
    const updatedEquipment = await Equipment.findByPk(id, {
      include: [
        { model: EquipmentGroup, as: "equipmentGroup" },
        { model: Project_Master, as: "projects", through: { attributes: [] } },
        { model: OEM, as: "oemDetails" }
      ]
    });

    return res.status(200).json(updatedEquipment);
  } catch (error) {
    console.error("Error updating equipment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Equipment
export const deleteEquipment = async (req, res) => {
  const { id } = req.params;

  try {
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    // Clean up junction tables
    await EquipmentProject.destroy({ where: { equipment_id: id } });
    await EquipmentEquipmentGroup.destroy({ where: { equipment_id: id } });

    await equipment.destroy();
    return res.status(200).json({ message: "Equipment deleted successfully" });
  } catch (error) {
    console.error("Error deleting equipment:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Bulk Upload Equipment
export const bulkUploadEquipment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    const results = [];

    for (const [index, row] of rows.entries()) {
      const {
        equipment_name,
        equipment_sr_no,
        additional_id,
        purchase_date,
        oem, // This will be OEM code like "M-011"
        purchase_cost,
        equipment_manual,
        maintenance_log,
        other_log,
        equipment_group, // This will be equipment group codes like "G-001,G-002"
        project_tag, // This will be project numbers like "MC-0001,MC-0002"
      } = row;

      // Validate required fields
      if (!equipment_name || !equipment_sr_no || !purchase_date || !oem || !equipment_group) {
        results.push({
          row: index + 2,
          status: "failed",
          message: "Missing required fields",
        });
        continue;
      }

      try {
        // Find OEM by oem_code
        console.log(oem.trim())
        const oemRecord = await OEM.findOne({
          where: { oem_code: oem.trim() },
        });
        console.log({oemRecord})

        if (!oemRecord) {
          results.push({
            row: index + 2,
            status: "failed",
            message: `OEM with code '${oem}' not found`,
          });
          continue;
        }

        // Parse equipment group codes (comma-separated)
        const groupCodes = equipment_group
          .split(',')
          .map(code => code.trim())
          .filter(code => code !== '');

        if (groupCodes.length === 0) {
          results.push({
            row: index + 2,
            status: "failed",
            message: "No valid equipment group codes provided",
          });
          continue;
        }

        // Find equipment groups by codes
        const groups = await EquipmentGroup.findAll({
          where: { equip_grp_code: groupCodes },
        });

        // Check if all groups were found
        if (groups.length !== groupCodes.length) {
          const foundCodes = groups.map(g => g.equip_grp_code);
          const missingCodes = groupCodes.filter(code => !foundCodes.includes(code));
          results.push({
            row: index + 2,
            status: "failed",
            message: `Equipment groups not found: ${missingCodes.join(', ')}`,
          });
          continue;
        }

        // Parse project tags (comma-separated, optional)
        let projectNumbers = [];
        if (project_tag) {
          projectNumbers = project_tag
            .split(',')
            .map(projectNo => projectNo.trim())
            .filter(projectNo => projectNo !== '');
        }

        // Find projects by project numbers
        let projects = [];
        if (projectNumbers.length > 0) {
          projects = await Project_Master.findAll({
            where: { project_no: projectNumbers },
          });

          // Check if all projects were found (if any were specified)
          if (projects.length !== projectNumbers.length) {
            const foundProjects = projects.map(p => p.project_no);
            const missingProjects = projectNumbers.filter(projectNo => !foundProjects.includes(projectNo));
            results.push({
              row: index + 2,
              status: "failed",
              message: `Projects not found: ${missingProjects.join(', ')}`,
            });
            continue;
          }
        }

        // Create equipment
        const newEquipment = await Equipment.create({
          equipment_name: equipment_name.trim(),
          equipment_sr_no: equipment_sr_no.trim(),
          additional_id: additional_id ? additional_id.trim() : "",
          purchase_date,
          oem: oemRecord.id, // Store the OEM UUID
          purchase_cost: purchase_cost || 0,
          equipment_manual: equipment_manual || null,
          maintenance_log: maintenance_log || null,
          other_log: other_log || null,
          hsn_number: 0,
        });

        // Create equipment-group relationships
        if (groups.length > 0) {
          await EquipmentEquipmentGroup.bulkCreate(
            groups.map((group) => ({
              equipment_id: newEquipment.id,
              equipment_group_id: group.id,
            }))
          );
        }

        // Create project relationships
        if (projects.length > 0) {
          await EquipmentProject.bulkCreate(
            projects.map((project) => ({
              equipment_id: newEquipment.id,
              project_id: project.id,
            }))
          );
        }

        results.push({
          row: index + 2,
          status: "success",
          equipmentId: newEquipment.id,
          message: `Created with ${groups.length} group(s) and ${projects.length} project(s)`,
        });
      } catch (error) {
        results.push({
          row: index + 2,
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
    console.error("Bulk upload equipment error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};