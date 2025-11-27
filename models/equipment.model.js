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

    // Function to handle Excel date serial numbers and various date formats
    const parsePurchaseDate = (dateValue) => {
      if (!dateValue) return null;
      
      console.log(`Parsing date value: ${dateValue}, Type: ${typeof dateValue}`);
      
      // Handle Excel serial numbers (like 45520)
      if (typeof dateValue === 'number') {
        console.log(`Detected Excel serial number: ${dateValue}`);
        // Excel date serial number (number of days since January 1, 1900)
        const excelEpoch = new Date(1900, 0, 1);
        const date = new Date(excelEpoch.getTime() + (dateValue - 1) * 24 * 60 * 60 * 1000);
        
        // Adjust for Excel's leap year bug (Excel considers 1900 as a leap year)
        if (dateValue > 60) date.setDate(date.getDate() - 1);
        
        const isoDate = date.toISOString().split('T')[0];
        console.log(`Excel serial ${dateValue} converted to: ${isoDate}`);
        return isoDate;
      }
      
      // If it's already a Date object
      if (dateValue instanceof Date) {
        const isoDate = dateValue.toISOString().split('T')[0];
        console.log(`Date object converted to: ${isoDate}`);
        return isoDate;
      }
      
      // If it's a string, try various formats
      if (typeof dateValue === 'string') {
        const trimmedValue = dateValue.trim();
        
        // Try dd-mm-yyyy format
        const ddMmYyyyRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
        const match = trimmedValue.match(ddMmYyyyRegex);
        
        if (match) {
          const day = parseInt(match[1], 10);
          const month = parseInt(match[2], 10) - 1;
          const year = parseInt(match[3], 10);
          
          console.log(`Parsed dd-mm-yyyy: Day=${day}, Month=${month + 1}, Year=${year}`);
          
          if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
            const date = new Date(year, month, day);
            if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
              const isoDate = date.toISOString().split('T')[0];
              console.log(`Valid dd-mm-yyyy date converted to: ${isoDate}`);
              return isoDate;
            }
          }
        }
        
        // Try other common date formats
        console.log(`Trying to parse as generic date: ${trimmedValue}`);
        const parsedDate = new Date(trimmedValue);
        if (!isNaN(parsedDate.getTime())) {
          const isoDate = parsedDate.toISOString().split('T')[0];
          console.log(`Generic date parsed to: ${isoDate}`);
          return isoDate;
        }
      }
      
      console.log(`Invalid date format: ${dateValue}`);
      return null;
    };

    for (const [index, row] of rows.entries()) {
      const {
        equipment_name,
        equipment_sr_no,
        additional_id,
        hsn,
        purchase_date,
        oem,
        purchase_cost,
        equipment_manual,
        maintenance_log,
        other_log,
        equipment_group,
        project_tag,
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
        // Parse and validate purchase date
        console.log(`Processing row ${index + 2}, purchase_date raw value:`, purchase_date);
        const parsedPurchaseDate = parsePurchaseDate(purchase_date);
        
        if (!parsedPurchaseDate) {
          results.push({
            row: index + 2,
            status: "failed",
            message: `Invalid purchase date format: "${purchase_date}". Expected date in dd-mm-yyyy format or Excel date format`,
          });
          continue;
        }

        console.log(`Successfully parsed date: ${purchase_date} -> ${parsedPurchaseDate}`);

        // Find OEM by oem_code
        const oemRecord = await OEM.findOne({
          where: { oem_code: oem.trim() },
        });

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

        // Clean log fields - set to null if they contain invalid patterns
        const cleanLogField = (field) => {
          if (!field || typeof field !== 'string') return null;
          
          const trimmedField = field.trim();
          if (trimmedField === '') return null;
          
          // Check for invalid patterns (escaped backslashes, quotes, etc.)
          const invalidPatterns = [
            /^"+$/, // Only quotes
            /^\\+$/, // Only backslashes
            /^["\\\s]*$/, // Only quotes, backslashes, or whitespace
            /^\"\\\"\\\\\\\"/, // Starts with escaped backslash patterns
            /^\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\/, // Multiple backslashes
          ];
          
          const hasInvalidPattern = invalidPatterns.some(pattern => pattern.test(trimmedField));
          const isPdfUrl = trimmedField.includes('.pdf') && trimmedField.startsWith('http');
          
          return hasInvalidPattern || !isPdfUrl ? null : trimmedField;
        };

        // Create equipment
        const newEquipment = await Equipment.create({
          equipment_name: equipment_name.trim(),
          equipment_sr_no: equipment_sr_no.trim(),
          additional_id: additional_id ? additional_id.trim() : "",
          purchase_date: parsedPurchaseDate, // This will be in yyyy-mm-dd format
          oem: oemRecord.id,
          purchase_cost: purchase_cost || 0,
          equipment_manual: cleanLogField(equipment_manual),
          maintenance_log: cleanLogField(maintenance_log),
          other_log: cleanLogField(other_log),
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
          message: `Created with ${groups.length} group(s) and ${projects.length} project(s). Purchase date: ${parsedPurchaseDate}`,
        });
      } catch (error) {
        console.error(`Error in row ${index + 2}:`, error);
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