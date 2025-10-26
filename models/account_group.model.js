import { DataTypes } from "sequelize";

export const AccountGroupModel = (sequelize) => {
  const AccountGroup = sequelize.define(
    "account_group",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      account_group_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      account_group_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  AccountGroup.associate = (models) => {
    AccountGroup.hasMany(models.Account, {
      foreignKey: "account_group",
      as: "accounts",
    });
  };

  return AccountGroup;
};
