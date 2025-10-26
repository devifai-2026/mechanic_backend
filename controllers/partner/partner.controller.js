import { models } from "../../models/index.js";
const { Partner } = models;
import XLSX from "xlsx";

// Create Partner
export const createPartner = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  const {
    partner_name,
    partner_address,
    partner_gst,
    partner_geo_id,
    isCustomer,
    state,
    city,
    pincode,
  } = req.body;

  if (
    !partner_name ||
    !partner_address ||
    !partner_gst ||
    !partner_geo_id ||
    !state ||
    !city ||
    !pincode
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const partner = await Partner.create({
      partner_name,
      partner_address,
      partner_gst,
      partner_geo_id,
      isCustomer,
      state,
      city,
      pincode,
    });

    return res.status(201).json(partner);
  } catch (error) {
    console.error("Error creating partner:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Partners
export const getPartners = async (req, res) => {
  try {
    const partners = await Partner.findAll();
    return res.status(200).json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Partner by ID
export const getPartnerById = async (req, res) => {
  const { id } = req.params;

  try {
    const partner = await Partner.findByPk(id);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    return res.status(200).json(partner);
  } catch (error) {
    console.error("Error fetching partner:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Partner
export const updatePartner = async (req, res) => {
  const { id } = req.params;
  const {
    partner_name,
    partner_address,
    partner_gst,
    partner_geo_id,
    isCustomer,
    state,
    city,
    pincode,
  } = req.body;

  try {
    const partner = await Partner.findByPk(id);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    await partner.update({
      partner_name,
      partner_address,
      partner_gst,
      partner_geo_id,
      isCustomer,
      state,
      city,
      pincode,
    });

    return res.status(200).json(partner);
  } catch (error) {
    console.error("Error updating partner:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Partner
export const deletePartner = async (req, res) => {
  const { id } = req.params;

  try {
    const partner = await Partner.findByPk(id);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    await partner.destroy();
    return res.status(200).json({ message: "Partner deleted successfully" });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Bulk Upload Partners
export const bulkUploadPartners = async (req, res) => {
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
        partner_name,
        partner_gst,
        partner_geo_id,
        partner_address,
        state,
        city,
        pincode,
        isCustomer,
      } = row;

      // Validate required fields
      if (
        !partner_name ||
        !partner_gst ||
        !partner_geo_id ||
        !partner_address ||
        !state ||
        !city ||
        !pincode
      ) {
        results.push({
          row: index + 2, // Excel rows are 1-indexed, +1 for header
          status: "failed",
          message: "Missing required fields",
        });
        continue;
      }

      try {
        const partner = await Partner.create({
          partner_name: String(partner_name).trim(),
          partner_gst: String(partner_gst).trim(),
          partner_geo_id: parseInt(partner_geo_id, 10),
          partner_address: String(partner_address).trim(),
          state: String(state).trim(),
          city: String(city).trim(),
          pincode: String(pincode).trim(),
          isCustomer:
            typeof isCustomer === "string"
              ? isCustomer.toLowerCase() === "true"
              : Boolean(isCustomer),
        });

        results.push({
          row: index + 2,
          status: "success",
          partnerId: partner.id,
        });
      } catch (error) {
        results.push({
          row: index + 2,
          status: "failed",
          message: error?.message || "Unknown error",
        });
      }
    }

    return res.status(201).json({
      message: "Bulk partner upload completed",
      results,
    });
  } catch (error) {
    console.error("Bulk upload partners error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
