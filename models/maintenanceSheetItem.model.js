import { DataTypes } from "sequelize";

export const MaintenanceSheetItemModel = (sequelize) => {
  const MaintenanceSheetItem = sequelize.define(
    'maintenance_sheet_item',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      maintenance_sheet_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      item: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.NUMERIC,
        allowNull: false,
      },
      uom_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      notes: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  MaintenanceSheetItem.associate = (models) => {
    MaintenanceSheetItem.belongsTo(models.MaintenanceSheet, {
      foreignKey: 'maintenance_sheet_id',
      as: 'maintenanceSheet',
    });

    MaintenanceSheetItem.belongsTo(models.ConsumableItem, {
      foreignKey: 'item',
      as: 'itemData',
    });

    MaintenanceSheetItem.belongsTo(models.UOM, {
      foreignKey: 'uom_id',
      as: 'uomData',
    });
  };

  return MaintenanceSheetItem;
};
