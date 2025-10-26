// models/DieselRequisition.js
import { DataTypes } from 'sequelize';

export const DieselRequisitionModel = (sequelize) => {
  const DieselRequisition = sequelize.define(
    'diesel_requisition',
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
        references: {
          model: 'employee',
          key: 'id',
        },
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
        references: {
          model: 'organisation',
          key: 'id',
        },
        allowNull: true,
      },
      project_id: {
        type: DataTypes.STRING,
        allowNull: false,
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

  DieselRequisition.associate = (models) => {
    DieselRequisition.belongsTo(models.Employee, {
      foreignKey: 'createdBy',
      as: 'createdByEmployee',
    });

    DieselRequisition.belongsTo(models.Organisations, {
      foreignKey: 'org_id',
      as: 'organisation',
    });

    // 👇 Association with the items table
    DieselRequisition.hasMany(models.DieselRequisitionItems, {
      foreignKey: 'requisition_id',
      as: 'items',
    });
  };

  return DieselRequisition;
};
