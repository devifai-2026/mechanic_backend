import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EquipmentTransactionsFormModel = sequelize.define(
    "equipment_transactions_form",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      equipment_transaction_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "equipment_transaction",
          key: "id",
        },
      },

      equipment: {
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

  EquipmentTransactionsFormModel.associate = (models) => {
    EquipmentTransactionsFormModel.belongsTo(models.EquipmentTransaction, {
      foreignKey: "equipment_transaction_id",
      as: "transaction",
    });

    // 🛠 Changed alias from 'equipment' → 'equipmentDetails'
    EquipmentTransactionsFormModel.belongsTo(models.ConsumableItem, {
      foreignKey: "equipment",
      as: "consumableItem",
    });

    EquipmentTransactionsFormModel.belongsTo(models.UOM, {
      foreignKey: "uom",
      as: "unitOfMeasure",
    });
  };

  return EquipmentTransactionsFormModel;
};
