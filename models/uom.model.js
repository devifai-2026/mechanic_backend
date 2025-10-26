import { DataTypes } from "sequelize";
export const UOMModel = (sequelize) => {
  const UOMModel = sequelize.define(
    "uom",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      unit_code: { type: DataTypes.STRING },
      unit_name: { type: DataTypes.STRING },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  

  return UOMModel;
};