import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EquipmentGroupModel = sequelize.define(
    "equipment_group",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      equip_grp_code: { type: DataTypes.STRING },
      equipment_group: { type: DataTypes.STRING },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  EquipmentGroupModel.associate = (models) => {
    EquipmentGroupModel.hasMany(models.Equipment, {
      foreignKey: "equipment_group_id",
      as: "equipments",
    });
  };

  return EquipmentGroupModel;
};
