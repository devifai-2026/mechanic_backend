// models/DieselReceipt.js
import { DataTypes } from 'sequelize';

export const DieselReceiptModel = (sequelize) => {
  const DieselReceipt = sequelize.define(
    'diesel_receipt',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      is_approve_mic: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      is_approve_sic: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      is_approve_pm: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      org_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      project_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
       reject_reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  DieselReceipt.associate = (models) => {
    DieselReceipt.belongsTo(models.Employee, {
      foreignKey: 'createdBy',
      as: 'createdByEmployee',
    });

    DieselReceipt.belongsTo(models.Organisations, {
      foreignKey: 'org_id',
      as: 'organisation',
    });

    DieselReceipt.hasMany(models.DieselReceiptItem, {
      foreignKey: 'receipt_id',
      as: 'items',
      onDelete: 'CASCADE',
    });
  };

  return DieselReceipt;
};
