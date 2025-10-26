// models/junctionTable/EquipmentProject.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EquipmentProject = sequelize.define(
    "EquipmentProject",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      equipment_id: {
        type: DataTypes.UUID,
        references: {
          model: "equipment",
          key: "id",
        },
      },
      project_id: {
        type: DataTypes.UUID,
        references: {
          model: "project_master",
          key: "id",
        },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return EquipmentProject;
};
