import { DataTypes } from "sequelize";

export default (sequelize) => {
  const DieselInvoiceForm = sequelize.define(
    "diesel_invoice_subform",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      diesel_invoice_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "diesel_invoice",
          key: "id",
        },
      },

      item: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "consumable_items",
          key: "id",
        },
      },

      qty: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      uom: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "uom",
          key: "id",
        },
      },

      unit_rate: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      total_value: {
        type: DataTypes.FLOAT,
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

  DieselInvoiceForm.associate = (models) => {
    DieselInvoiceForm.belongsTo(models.DieselInvoice, {
      foreignKey: "diesel_invoice_id",
      as: "invoice",
    });

    DieselInvoiceForm.belongsTo(models.ConsumableItem, {
      foreignKey: "item",
      as: "consumableItem",
    });

    DieselInvoiceForm.belongsTo(models.UOM, {
      foreignKey: "uom",
      as: "unitOfMeasure",
    });
  };

  return DieselInvoiceForm;
};
