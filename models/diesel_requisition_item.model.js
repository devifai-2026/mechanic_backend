// models/DieselRequisitionItem.js
import { DataTypes } from 'sequelize';

export const DieselRequisitionItemModel = (sequelize) => {
  const DieselRequisitionItem = sequelize.define(
    'diesel_requisition_item',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      requisition_id: {
        type: DataTypes.UUID,
        references: {
          model: 'diesel_requisition',
          key: 'id',
        },
        allowNull: false,
      },
      item: {
        type: DataTypes.UUID,
        references: {
          model: 'consumable_items',
          key: 'id',
        },
        allowNull: false,
      },
      quantity: {
        type: DataTypes.NUMERIC,
        allowNull: false,
      },
      UOM: {
        type: DataTypes.UUID,
        references: {
          model: 'uom',
          key: 'id',
        },
        allowNull: false,
      },
      Notes: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  DieselRequisitionItem.associate = (models) => {
    DieselRequisitionItem.belongsTo(models.DieselRequisitions, {
      foreignKey: 'requisition_id',
      as: 'requisition',
    });

    DieselRequisitionItem.belongsTo(models.ConsumableItem, {
      foreignKey: 'item',
      as: 'consumableItem',
    });

    DieselRequisitionItem.belongsTo(models.UOM, {
      foreignKey: 'UOM',
      as: 'unitOfMeasurement',
    });
  };

  return DieselRequisitionItem;
};
