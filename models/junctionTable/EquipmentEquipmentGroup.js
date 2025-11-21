// models/junctionTable/EquipmentEquipmentGroup.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EquipmentEquipmentGroup = sequelize.define(
    "EquipmentEquipmentGroup",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      equipment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "equipment",
          key: "id",
        },
      },
      equipment_group_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "equipment_group",
          key: "id",
        },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return EquipmentEquipmentGroup;
};