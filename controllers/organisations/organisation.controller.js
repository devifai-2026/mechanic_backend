import { models } from "../../models/index.js"; 
const { Organisations } = models;
import XLSX from "xlsx";
// Create an Organisation
export const createOrganisation = async (req, res) => {
  const { org_name, org_code, org_image } = req.body;

  try {
    const existingOrg = await Organisations.findOne({ where: { org_code } });

    if (existingOrg) {
      return res.status(400).json({ message: "Organisation with this org_code already exists" });
    }

    const organisation = await Organisations.create({
      org_name,
      org_code,
      org_image:
        org_image ||
        "https://bcassetcdn.com/public/blog/wp-content/uploads/2022/09/01203355/blue-building-circle-by-simplepixelsl-brandcrowd.png",
    });

    return res.status(201).json(organisation);
  } catch (error) {
    console.error("Error creating organisation:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Organisations
export const getOrganisations = async (req, res) => {
  try {
    const organisations = await Organisations.findAll();
    return res.status(200).json(organisations);
  } catch (error) {
    console.error("Error fetching organisations:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Organisation by ID
export const getOrganisationById = async (req, res) => {
  const { id } = req.params;

  try {
    const organisation = await Organisations.findByPk(id);

    if (!organisation) {
      return res.status(404).json({ message: "Organisation not found" });
    }

    return res.status(200).json(organisation);
  } catch (error) {
    console.error("Error fetching organisation:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Organisation
export const updateOrganisation = async (req, res) => {
  const { id } = req.params;
  const { org_name, org_code, org_image } = req.body;

  try {
    const organisation = await Organisations.findByPk(id);

    if (!organisation) {
      return res.status(404).json({ message: "Organisation not found" });
    }

    await organisation.update({
      org_name,
      org_code,
      org_image: org_image || organisation.org_image, // fallback to existing image
    });

    return res.status(200).json(organisation);
  } catch (error) {
    console.error("Error updating organisation:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Organisation
export const deleteOrganisation = async (req, res) => {
  const { id } = req.params;

  try {
    const organisation = await Organisations.findByPk(id);

    if (!organisation) {
      return res.status(404).json({ message: "Organisation not found" });
    }

    await organisation.destroy();
    return res.status(200).json({ message: "Organisation deleted successfully" });
  } catch (error) {
    console.error("Error deleting organisation:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const bulkUploadOrganisations = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Parse rows as JSON using first row as header
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    const results = [];

    for (const [index, row] of rows.entries()) {
      const { org_name, org_code } = row;

      // Validate required fields
      if (!org_name || !org_code) {
        results.push({
          row: index + 2,
          status: "failed",
          message: "Missing required fields (org_name or org_code)",
        });
        continue;
      }

      try {
        // Check duplicate org_code
        const existingOrg = await Organisations.findOne({ where: { org_code } });
        if (existingOrg) {
          results.push({
            row: index + 2,
            status: "failed",
            message: "Organisation with this org_code already exists",
          });
          continue;
        }

        // Create organisation with default image fallback
        const organisation = await Organisations.create({
          org_name,
          org_code,
        });

        results.push({
          row: index + 2,
          status: "success",
          organisationId: organisation.id,
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
    console.error("Bulk upload organisations error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
