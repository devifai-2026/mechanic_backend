import { DataTypes } from "sequelize";

export const OEMModel = (sequelize) => {
  const OEM = sequelize.define(
    "oem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      oem_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      oem_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Enforces uniqueness of code
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  OEM.associate = (models) => {
    OEM.hasMany(models.ConsumableItem, {
      foreignKey: "item_make",
      as: "items",
    });
  };

  return OEM;
};
