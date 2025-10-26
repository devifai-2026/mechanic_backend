// models/DieselReceiptItem.js
import { DataTypes } from 'sequelize';

export const DieselReceiptItemModel = (sequelize) => {
  const DieselReceiptItem = sequelize.define(
    'diesel_receipt_item',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      receipt_id: {
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
      UOM: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      Notes: {
        type: DataTypes.STRING(255),
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  DieselReceiptItem.associate = (models) => {
    DieselReceiptItem.belongsTo(models.DieselReceipt, {
      foreignKey: 'receipt_id',
      as: 'receipt',
    });

    DieselReceiptItem.belongsTo(models.ConsumableItem, {
      foreignKey: 'item',
      as: 'consumableItem',
    });

    DieselReceiptItem.belongsTo(models.UOM, {
      foreignKey: 'UOM',
      as: 'unitOfMeasurement',
    });
  };

  return DieselReceiptItem;
};
