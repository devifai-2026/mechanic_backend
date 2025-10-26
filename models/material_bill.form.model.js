import { DataTypes } from "sequelize";

export default (sequelize) => {
  const MaterialBillTransactionsFormModel = sequelize.define(
    "material_bill_transactions_form",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      material_transaction_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "material_bill_transaction",
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
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      unit_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      totalValue: {
        type: DataTypes.INTEGER,
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

  MaterialBillTransactionsFormModel.associate = (models) => {
    MaterialBillTransactionsFormModel.belongsTo(
      models.MaterialBillTransaction,
      {
        foreignKey: "material_transaction_id",
        as: "transaction",
      }
    );

    MaterialBillTransactionsFormModel.belongsTo(models.ConsumableItem, {
      foreignKey: "item",
      as: "consumableItem",
    });

    MaterialBillTransactionsFormModel.belongsTo(models.UOM, {
      foreignKey: "uom",
      as: "unitOfMeasure",
    });
  };

  return MaterialBillTransactionsFormModel;
};
