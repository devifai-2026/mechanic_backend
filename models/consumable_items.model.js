import { DataTypes } from "sequelize";

export const ConsumableItemsModel = (sequelize) => {
  const ConsumableItem = sequelize.define(
    "consumable_items",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      item_code: { type: DataTypes.STRING, allowNull: false },
      item_name: { type: DataTypes.STRING, allowNull: false },
      item_description: { type: DataTypes.TEXT, allowNull: false },

      product_type: {
        type: DataTypes.ENUM("Goods", "Services"),
        allowNull: false,
      },

      item_group_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "item_group", // table name
          key: "id",
        },
      },

      item_make: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "oem", // table name
          key: "id",
        },
      },

      unit_of_measurement: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "uom", // table name
          key: "id",
        },
      },

      item_qty_in_hand: { type: DataTypes.INTEGER, allowNull: false },
      hsn_number: { type: DataTypes.STRING, allowNull: true },

      item_avg_cost: { type: DataTypes.FLOAT, allowNull: false },

      inventory_account_code: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "account", // table name
          key: "id",
        },
      },

      expense_account_code: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "account", // table name
          key: "id",
        },
      },

      revenue_account_code: {
        type: DataTypes.UUID,
        allowNull: false,
         references: {
          model: "account", // table name
          key: "id",
        },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  ConsumableItem.associate = (models) => {
    // Item group relation
    ConsumableItem.belongsTo(models.ItemGroup, {
      foreignKey: "item_group_id",
      as: "itemGroup",
    });

    // OEM relation
    ConsumableItem.belongsTo(models.OEM, {
      foreignKey: "item_make",
      as: "oem",
    });

    // UOM relation
    ConsumableItem.belongsTo(models.UOM, {
      foreignKey: "unit_of_measurement",
      as: "uom",
    });

    // Account code relations
    ConsumableItem.belongsTo(models.Account, {
      foreignKey: "inventory_account_code",
      as: "inventoryAccount",
    });

    ConsumableItem.belongsTo(models.Account, {
      foreignKey: "expense_account_code",
      as: "expenseAccount",
    });

    // Revenue master relation
    ConsumableItem.belongsTo(models.Account, {
      foreignKey: "revenue_account_code",
      as: "revenueAccount",
    });
  };

  return ConsumableItem;
};
