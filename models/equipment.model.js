// models/equipment.model.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EquipmentModel = sequelize.define(
    "equipment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      equipment_name: { type: DataTypes.STRING, allowNull: false },
      equipment_sr_no: { type: DataTypes.STRING, allowNull: false },
      additional_id: { type: DataTypes.STRING, allowNull: false },
      purchase_date: { type: DataTypes.DATE, allowNull: false },
      oem: { type: DataTypes.STRING, allowNull: false },
      purchase_cost: { type: DataTypes.INTEGER, allowNull: false },
      equipment_manual: { type: DataTypes.TEXT, allowNull: true },
      maintenance_log: { type: DataTypes.JSON, allowNull: true },
      other_log: { type: DataTypes.JSON, allowNull: true },
      hsn_number: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      // Remove equipment_group_id field for many-to-many
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  EquipmentModel.associate = (models) => {
    EquipmentModel.belongsToMany(models.Project_Master, {
      through: models.EquipmentProject,
      foreignKey: "equipment_id",
      as: "projects",
    });
    EquipmentModel.belongsToMany(models.EquipmentGroup, {
      through: "EquipmentEquipmentGroup",
      foreignKey: "equipment_id",
      as: "equipmentGroup",
    });
    EquipmentModel.belongsTo(models.OEM, {
      foreignKey: "oem",
      as: "oemDetails", 
    });
  };

  return EquipmentModel;
};