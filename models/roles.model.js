// models/Role.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Role = sequelize.define(
    "role",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // You can add more fields like permissions if needed
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return Role;
};