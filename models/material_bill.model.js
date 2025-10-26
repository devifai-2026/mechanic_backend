import { DataTypes } from "sequelize";

export default (sequelize) => {
  const MaterialBillTransactionModel = sequelize.define(
    "material_bill_transaction",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      materialTransactionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "material_transaction",
          key: "id",
        },
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
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      partner: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "partner", key: "id" },
      },

      partner_inv_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      inv_basic_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      inv_tax: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      total_invoice_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  MaterialBillTransactionModel.associate = (models) => {
    MaterialBillTransactionModel.belongsTo(models.Partner, {
      foreignKey: "partner",
      as: "partnerDetails",
    });
    MaterialBillTransactionModel.hasMany(models.Employee, {
      foreignKey: "createdBy",
      as: "createdByUser",
    });

    MaterialBillTransactionModel.belongsTo(models.Project_Master, {
      foreignKey: "project_id",
      as: "project",
    });
    MaterialBillTransactionModel.belongsTo(models.MaterialTransaction, {
      foreignKey: "materialTransactionId",
      as: "material",
    });
    MaterialBillTransactionModel.hasMany(models.MaterialBillTransactionForm, {
      foreignKey: "material_transaction_id", // must match in form model
      as: "formItems", // use this alias in include
    });
  };

  return MaterialBillTransactionModel;
};
