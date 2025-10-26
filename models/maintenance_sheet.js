import { DataTypes } from "sequelize";

export const MaintenanceSheetModel = (sequelize) => {
  const MaintenanceSheet = sequelize.define(
    "maintenance_sheet",
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
      equipment: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      notes: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      next_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      action_planned: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      is_approved_mic: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      is_approved_sic: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      is_approved_pm: {
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

  MaintenanceSheet.associate = (models) => {
    MaintenanceSheet.belongsTo(models.Equipment, {
      foreignKey: "equipment",
      as: "equipmentData",
    });

    MaintenanceSheet.belongsTo(models.Employee, {
      foreignKey: "createdBy",
      as: "createdByUser",
    });

    MaintenanceSheet.belongsTo(models.Organisations, {
      foreignKey: "org_id",
      as: "organisation",
    });

    MaintenanceSheet.hasMany(models.MaintenanceSheetItem, {
      foreignKey: "maintenance_sheet_id",
      as: "items",
      onDelete: "CASCADE",
    });
  };

  return MaintenanceSheet;
};
