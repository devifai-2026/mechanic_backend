import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ExpenseInputModel = sequelize.define(
    "expense_input",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "project_master",
          key: "id",
        },
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      paid_to: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paid_by: {
        type: DataTypes.ENUM("Cash", "HO"),
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "employee",
          key: "id",
        },
      },
      expense_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expense_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      allocation: {
        type: DataTypes.ENUM("Site", "Base Camp", "Yard"),
        allowNull: false,
      },
      notes: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  ExpenseInputModel.associate = (models) => {
    ExpenseInputModel.belongsTo(models.Employee, {
      foreignKey: "createdBy",
      as: "creator",
    });

    ExpenseInputModel.belongsTo(models.Project_Master, {
      foreignKey: "project_id",
      as: "project",
    });
  };

  return ExpenseInputModel;
};
