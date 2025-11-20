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
      equipment_manual: { type: DataTypes.TEXT, allowNull: false },
      maintenance_log: { type: DataTypes.JSON, allowNull: false },
      other_log: { type: DataTypes.JSON, allowNull: false },
      hsn_number: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      equipment_group_id: {
        type: DataTypes.UUID,
        allowNull: true,
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

  EquipmentModel.associate = (models) => {
    EquipmentModel.belongsToMany(models.Project_Master, {
      through: models.EquipmentProject,
      foreignKey: "equipment_id",
      as: "projects",
    });
    EquipmentModel.belongsTo(models.EquipmentGroup, {
      foreignKey: "equipment_group_id",
      as: "equipmentGroup",
    });
    EquipmentModel.belongsTo(models.OEM, {
      foreignKey: "oem",
      as: "oemDetails", 
    });
  };

  return EquipmentModel;
};
