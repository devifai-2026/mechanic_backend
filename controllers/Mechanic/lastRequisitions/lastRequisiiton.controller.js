import { models } from "../../../models/index.js";
const {
  DieselRequisitions,
  DieselRequisitionItems,
  ConsumableItem,
  UOM,
  OEM,
  Employee,
  Organisations,
} = models;

export const getRecentDieselRequisitionsByCreator = async (req, res) => {
  try {
    const { org_id, createdBy, project_id } = req.body; // or req.query depending on your frontend

    if (!org_id) {
      return res.status(400).json({ message: "Missing org_id parameter" });
    }
    if (!createdBy) {
      return res.status(400).json({ message: "Missing createdBy parameter" });
    }
    if (!project_id) {
      return res.status(400).json({ message: "Missing project id parameter" });
    }

    const requisition = await DieselRequisitions.findOne({
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

    return res.status(200).json(requisition);
  } catch (error) {
    console.error("Error retrieving diesel requisitions:", error);
    return res.status(500).json({
      message: "Failed to retrieve requisitions",
      error: error.message,
    });
  }
};
