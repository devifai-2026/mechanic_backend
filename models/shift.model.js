import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ShiftModel = sequelize.define(
    "shift",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      shift_code: { type: DataTypes.STRING, allowNull: false, unique: true },

      shift_from_time: { type: DataTypes.TIME, allowNull: false },
      shift_to_time: { type: DataTypes.TIME, allowNull: false },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  ShiftModel.associate = function (models) {
    ShiftModel.hasMany(models.Employee, {
      foreignKey: "shiftcode",
      sourceKey: "shift_code",
      as: "employees",
    });
  };

  return ShiftModel;
};
