import { DataTypes } from "sequelize";

export const ItemGroupModel = (sequelize) => {
  const ItemGroup = sequelize.define(
    "item_group",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      group_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      group_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensures uniqueness
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  ItemGroup.associate = (models) => {
    ItemGroup.hasMany(models.ConsumableItem, {
      foreignKey: "item_group_id",
      as: "consumableItems",
    });
  };

  return ItemGroup;
};
