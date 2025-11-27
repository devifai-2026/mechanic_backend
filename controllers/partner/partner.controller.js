import { models } from "../../models/index.js";
const { Partner } = models;
import XLSX from "xlsx";
import { Op } from 'sequelize';
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

    // Debug: Log the first row to see all column names
    console.log('First row columns:', Object.keys(rows[0]));
    console.log('First row data:', rows[0]);

    const results = [];
    const processedPartners = new Set(); // Track duplicates within the same file

    for (const [index, row] of rows.entries()) {
      // Debug each row
      console.log(`Row ${index + 2} full data:`, row);
      
      // FIX: Handle the column name with trailing space
      const isCustomerValue = 
        row.isCustomer !== undefined ? row.isCustomer : // without space
        row['isCustomer '] !== undefined ? row['isCustomer '] : // with trailing space
        row.iscustomer !== undefined ? row.iscustomer :
        row['Is Customer'] !== undefined ? row['Is Customer'] :
        row['is customer'] !== undefined ? row['is customer'] :
        row['IsCustomer'] !== undefined ? row['IsCustomer'] :
        false; // default if not found

      console.log(`Row ${index + 2} - isCustomer extracted:`, isCustomerValue, typeof isCustomerValue);

      const {
        partner_name,
        partner_gst,
        partner_geo_id,
        partner_address,
        state,
        city,
        pincode,
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
          row: index + 2,
          status: "failed",
          message: "Missing required fields",
        });
        continue;
      }

      // Clean the data
      const cleanPartnerName = String(partner_name).trim();
      const cleanPartnerGST = String(partner_gst).trim();

      // Check for duplicates within the same file
      const partnerKey = `${cleanPartnerName}-${cleanPartnerGST}`;
      if (processedPartners.has(partnerKey)) {
        results.push({
          row: index + 2,
          status: "skipped",
          message: `Duplicate partner in file: "${cleanPartnerName}" with GST "${cleanPartnerGST}"`,
        });
        continue;
      }
      processedPartners.add(partnerKey);

      try {
        // Parse isCustomer with better handling
        const parseIsCustomer = (value) => {
          console.log(`Raw isCustomer value:`, value, typeof value);
          
          if (value === undefined || value === null || value === '') {
            console.log(`isCustomer is undefined/null/empty, defaulting to false`);
            return false;
          }
          
          // If it's already a boolean, return it directly
          if (typeof value === 'boolean') {
            console.log(`Already boolean: ${value}`);
            return value;
          }
          
          const stringValue = String(value).trim().toLowerCase();
          console.log(`Parsing isCustomer: "${value}" -> "${stringValue}"`);
          
          const trueValues = ['true', 'yes', '1', 'y', 't'];
          const falseValues = ['false', 'no', '0', 'n', 'f', ''];
          
          if (trueValues.includes(stringValue)) {
            console.log(`-> Parsed as TRUE`);
            return true;
          }
          if (falseValues.includes(stringValue)) {
            console.log(`-> Parsed as FALSE`);
            return false;
          }
          
          // If it's a number, treat 1 as true, others as false
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            const result = numValue === 1;
            console.log(`-> Numeric value ${numValue} parsed as ${result}`);
            return result;
          }
          
          console.log(`-> Unknown value "${value}", defaulting to false`);
          return false;
        };

        const parsedIsCustomer = parseIsCustomer(isCustomerValue);
        console.log(`Final isCustomer value:`, parsedIsCustomer);

        // Check if partner already exists in database (by name or GST)
        const existingPartner = await Partner.findOne({
          where: {
            [Op.or]: [
              { partner_name: cleanPartnerName },
              { partner_gst: cleanPartnerGST }
            ]
          }
        });

        if (existingPartner) {
          results.push({
            row: index + 2,
            status: "skipped",
            message: `Partner already exists: "${cleanPartnerName}" (GST: ${cleanPartnerGST})`,
            partnerId: existingPartner.id
          });
          continue;
        }

        const partner = await Partner.create({
          partner_name: cleanPartnerName,
          partner_gst: cleanPartnerGST,
          partner_geo_id: parseInt(partner_geo_id, 10),
          partner_address: String(partner_address).trim(),
          state: String(state).trim(),
          city: String(city).trim(),
          pincode: String(pincode).trim(),
          isCustomer: parsedIsCustomer,
        });

        results.push({
          row: index + 2,
          status: "success",
          partnerId: partner.id,
          message: "Partner created successfully",
          isCustomer: parsedIsCustomer,
        });
      } catch (error) {
        console.error(`Error in row ${index + 2}:`, error);
        
        // Handle unique constraint errors (double safety)
        if (error.name === 'SequelizeUniqueConstraintError') {
          results.push({
            row: index + 2,
            status: "skipped",
            message: "Partner with same name or GST already exists in database",
          });
        } else {
          results.push({
            row: index + 2,
            status: "failed",
            message: error?.message || "Unknown error",
          });
        }
      }
    }

    // Calculate summary statistics
    const successCount = results.filter(r => r.status === "success").length;
    const skippedCount = results.filter(r => r.status === "skipped").length;
    const failedCount = results.filter(r => r.status === "failed").length;

    return res.status(201).json({
      message: `Bulk upload completed: ${successCount} created, ${skippedCount} skipped, ${failedCount} failed`,
      summary: {
        total: results.length,
        success: successCount,
        skipped: skippedCount,
        failed: failedCount
      },
      results,
    });
  } catch (error) {
    console.error("Bulk upload partners error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
