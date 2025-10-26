// models/employeeLoginLog.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EmployeeLoginLogModel = sequelize.define(
    "employee_login_log",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      employee_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "employee", key: "id" },
      },
      device_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      device_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      login_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      logout_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      jwt_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  EmployeeLoginLogModel.associate = (models) => {
    EmployeeLoginLogModel.belongsTo(models.Employee, {
      foreignKey: "employee_id",
      as: "employee",
    });
  };

  return EmployeeLoginLogModel;
};
