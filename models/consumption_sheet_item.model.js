import { DataTypes } from 'sequelize';

export const ConsumptionSheetItemModel = (sequelize) => {
  const ConsumptionSheetItem = sequelize.define(
    'consumption_sheet_item',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      consumption_sheet_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      equipment: {
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
      reading_meter_uom: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reading_meter_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  ConsumptionSheetItem.associate = (models) => {
    ConsumptionSheetItem.belongsTo(models.ConsumptionSheet, {
      foreignKey: 'consumption_sheet_id',
      as: 'sheet',
    });

    ConsumptionSheetItem.belongsTo(models.Equipment, {
      foreignKey: 'equipment',
      as: 'equipmentData',
    });

    ConsumptionSheetItem.belongsTo(models.ConsumableItem, {
      foreignKey: 'item',
      as: 'itemData',
    });

    ConsumptionSheetItem.belongsTo(models.UOM, {
      foreignKey: 'uom_id',
      as: 'uomData',
    });
  };

  return ConsumptionSheetItem;
};
