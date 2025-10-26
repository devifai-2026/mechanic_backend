import { DataTypes } from "sequelize";

export default (sequelize) => {
  const DieselInvoiceModel = sequelize.define(
    "diesel_invoice",
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
      dieselReceiptId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "diesel_receipt", // ✅ Corrected
          key: "id",
        },
      },
      is_invoiced: {
        type: DataTypes.ENUM("draft", "invoiced", "rejected"),
        defaultValue: "draft",
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  // ✅ Associations
  DieselInvoiceModel.associate = (models) => {
    DieselInvoiceModel.belongsTo(models.Project_Master, {
      foreignKey: "project_id",
      as: "project",
    });

    DieselInvoiceModel.belongsTo(models.DieselReceipt, {
      foreignKey: "dieselReceiptId", // ✅ Corrected to match field name
      as: "receipt", // Optional alias
    });

    DieselInvoiceModel.hasMany(models.DieselInvoiceSubform, {
      foreignKey: "diesel_invoice_id",
      as: "formItems",
    });
  };

  return DieselInvoiceModel;
};
