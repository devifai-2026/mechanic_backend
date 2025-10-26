import { DataTypes } from "sequelize";

export default (sequelize) => {
  const MaterialTransactionsFormModel = sequelize.define(
    "material_transactions_form",
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
          model: "material_transaction",
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

  MaterialTransactionsFormModel.associate = (models) => {
    MaterialTransactionsFormModel.belongsTo(models.MaterialTransaction, {
      foreignKey: "material_transaction_id",
      as: "transaction",
    });

    MaterialTransactionsFormModel.belongsTo(models.ConsumableItem, {
      foreignKey: "item",
      as: "consumableItem",
    });

    MaterialTransactionsFormModel.belongsTo(models.UOM, {
      foreignKey: "uom",
      as: "unitOfMeasure",
    });
  };

  return MaterialTransactionsFormModel;
};
