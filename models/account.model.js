import { DataTypes } from "sequelize";

export const AccountModel = (sequelize) => {
  const Account = sequelize.define(
    "account",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      account_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      account_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      account_group: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "account_group", // table name
          key: "id",
        },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  Account.associate = (models) => {
    Account.belongsTo(models.AccountGroup, {
      foreignKey: "account_group",
      as: "group",
    });

    Account.hasMany(models.ConsumableItem, {
      foreignKey: "inventory_account_code",
      as: "inventoryItems",
    });

    Account.hasMany(models.ConsumableItem, {
      foreignKey: "expense_account_code",
      as: "expenseItems",
    });
  };

  return Account;
};
