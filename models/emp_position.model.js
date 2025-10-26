// emp_position.model.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EmpPositionsModel = sequelize.define(
    "emp_positions",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      designation: { type: DataTypes.STRING },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  

  return EmpPositionsModel;
};
