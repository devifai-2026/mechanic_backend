import { DataTypes } from "sequelize";

export default (sequelize) => {
  const RevenuenputModel = sequelize.define(
    "revenue_input",
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
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "employee",
          key: "id",
        },
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      ho_invoice: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      account_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      account_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount_basic: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      tax_value: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  RevenuenputModel.associate = (models) => {
    RevenuenputModel.belongsTo(models.Employee, {
      foreignKey: "createdBy",
      as: "creator",
    });

    RevenuenputModel.belongsTo(models.Project_Master, {
      foreignKey: "project_id",
      as: "project",
    });
  };

  return RevenuenputModel;
};
