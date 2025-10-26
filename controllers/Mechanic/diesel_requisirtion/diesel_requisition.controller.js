import { models } from "../../../models/index.js";
import { sendLoginNotification } from "../../../utils/pushNotifications/pushNotifications.js";
const {
  DieselRequisitions,
  DieselRequisitionItems,
  ConsumableItem,
  UOM,
  OEM,
  Employee,
  Organisations,
  ProjectEmployees,
} = models;

// Create a new diesel requisition
export const createDieselRequisition = async (req, res) => {
  try {
    const {
      date,
      items,
      createdBy,
      is_approve_mic = "pending",
      is_approve_sic = "pending",
      is_approve_pm = "pending",
      org_id,
      project_id,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required." });
    }

    // ✅ Step 1: Create requisition
    const requisition = await DieselRequisitions.create({
      date,
      createdBy,
      is_approve_mic,
      is_approve_sic,
      is_approve_pm,
      org_id,
      project_id,
    });

    // ✅ Step 2: Create items
    const createdItems = await Promise.all(
      items.map((item) =>
        DieselRequisitionItems.create({
          requisition_id: requisition.id,
          item: item.item,
          quantity: item.quantity,
          UOM: item.UOM,
          Notes: item.Notes || "",
        })
      )
    );

    // ✅ Step 3: Find all employees linked to the project
    const projectEmployees = await ProjectEmployees.findAll({
      where: { project_id },
      include: [
        {
          model: Employee,
          as: "employeeDetails",
          attributes: ["id", "emp_name", "player_id"],
        },
      ],
    });

    // ✅ Step 4: Send notifications to each player_id
    await Promise.all(
      projectEmployees.map(async (pe) => {
        const empName = pe.employeeDetails?.emp_name;
        const playerId = pe.employeeDetails?.player_id;

        if (playerId) {
          await sendLoginNotification(
            empName || "User",
            "Diesel Module", // deviceName (optional)
            playerId,
            "A new diesel requisition has been created for your project",
            "Requisition"
          );
        }
      })
    );

    return res.status(201).json({
      message: "Diesel requisition created and notifications sent successfully",
      requisition,
      items: createdItems,
    });
  } catch (error) {
    console.error("Error in createDieselRequisition:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        message: "Foreign key constraint error",
        detail: error.parent?.detail || "Invalid foreign key reference.",
        constraint: error?.constraint,
        table: error?.table,
        field: error?.index || error?.fields,
      });
    }

    res.status(500).json({ message: "Internal server error", error });
  }
};
// Get all diesel requisitions
export const getAllDieselRequisitions = async (req, res) => {
  try {
    const requisitions = await DieselRequisitions.findAll({
      include: [
        {
          model: DieselRequisitionItems,
          as: "items",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name", "item_description"],
            },
            {
              model: UOM,
              as: "unitOfMeasurement",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
        {
          model: Employee,
          as: "createdByEmployee",
          attributes: ["id", "emp_name"],
        },
        {
          model: Organisations,
          as: "organisation",
          attributes: ["id", "org_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(requisitions);
  } catch (error) {
    console.error("Error retrieving diesel requisitions:", error);
    return res.status(500).json({
      message: "Failed to retrieve requisitions",
      error: error.message,
    });
  }
};

export const getAllDieselRequisitionsByCreator = async (req, res) => {
  try {
    const { org_id, createdBy, project_id } = req.body; // or req.query depending on your frontend

    // Defensive checks
    if (!org_id) {
      return res.status(400).json({ message: "Missing org_id parameter" });
    }
    if (!createdBy) {
      return res.status(400).json({ message: "Missing createdBy parameter" });
    }
    if (!project_id) {
      return res.status(400).json({ message: "Missing project id parameter" });
    }

    const requisitions = await DieselRequisitions.findAll({
      where: {
        org_id,
        createdBy,
        project_id,
      },
      include: [
        {
          model: DieselRequisitionItems,
          as: "items",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name", "item_description"],
            },
            {
              model: UOM,
              as: "unitOfMeasurement",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
        {
          model: Employee,
          as: "createdByEmployee",
          attributes: ["id", "emp_name"],
        },
        {
          model: Organisations,
          as: "organisation",
          attributes: ["id", "org_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(requisitions);
  } catch (error) {
    console.error("Error retrieving diesel requisitions:", error);
    return res.status(500).json({
      message: "Failed to retrieve requisitions",
      error: error.message,
    });
  }
};

// Get a single diesel requisition by ID
export const getDieselRequisitionById = async (req, res) => {
  try {
    const requisition = await DieselRequisitions.findByPk(req.params.id, {
      include: [
        {
          model: DieselRequisitionItems,
          as: "items",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name", "item_description"],
            },
            {
              model: UOM,
              as: "unitOfMeasurement",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
        {
          model: Employee,
          as: "createdByEmployee",
          attributes: ["id", "emp_name"],
        },
        {
          model: Organisations,
          as: "organisation",
          attributes: ["id", "org_name"],
        },
      ],
    });

    if (!requisition) {
      return res.status(404).json({ message: "Requisition not found" });
    }

    return res.status(200).json(requisition);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve requisition",
      error: error.message,
    });
  }
};

// Update a diesel requisition (optionally update items too)
export const updateDieselRequisition = async (req, res) => {
  try {
    const { items, ...updateData } = req.body;

    const [updated] = await DieselRequisitions.update(updateData, {
      where: { id: req.params.id },
    });

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Requisition not found or no changes made" });
    }

    if (items && Array.isArray(items)) {
      await DieselRequisitionItems.destroy({
        where: { requisition_id: req.params.id },
      });

      await Promise.all(
        items.map((item) =>
          DieselRequisitionItems.create({
            requisition_id: req.params.id,
            item: item.item,
            quantity: item.quantity,
            UOM: item.UOM,
            Notes: item.Notes || "",
          })
        )
      );
    }

    const updatedRequisition = await DieselRequisitions.findByPk(
      req.params.id,
      {
        include: [
          {
            model: DieselRequisitionItems,
            as: "items",
          },
        ],
      }
    );

    return res.status(200).json(updatedRequisition);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update requisition",
      error: error.message,
    });
  }
};

// Delete a diesel requisition (and its items)
export const deleteDieselRequisition = async (req, res) => {
  try {
    const requisition = await DieselRequisitions.findByPk(req.params.id);

    if (!requisition) {
      return res.status(404).json({ message: "Requisition not found" });
    }

    await DieselRequisitionItems.destroy({
      where: { requisition_id: req.params.id },
    });

    await requisition.destroy();

    return res
      .status(200)
      .json({ message: "Requisition and its items deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete requisition",
      error: error.message,
    });
  }
};
