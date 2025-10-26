import { DataTypes } from "sequelize";

export default (sequelize) => {
  const DailyProgressReportModel = sequelize.define(
    "daily_progress_report",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      dpr_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "project_master",
          key: "id",
        },
      },
      customer_representative: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shift_code: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "shift",
          key: "id",
        },
      },
      shift_incharge: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "employee",
          key: "id",
        },
      },
      shift_mechanic: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "employee",
          key: "id",
        },
      },
      is_approve_pm: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  DailyProgressReportModel.associate = function (models) {
    DailyProgressReportModel.belongsTo(models.Employee, {
      foreignKey: "shift_incharge",
      as: "incharge",
    });

    DailyProgressReportModel.belongsTo(models.Employee, {
      foreignKey: "shift_mechanic",
      as: "mechanic",
    });
    DailyProgressReportModel.belongsTo(models.Employee, {
      foreignKey: "createdBy",
      as: "createdByUser",
    });

    DailyProgressReportModel.belongsTo(models.Shift, {
      foreignKey: "shift_code",
      as: "shift",
    });

    DailyProgressReportModel.belongsTo(models.Project_Master, {
      foreignKey: "project_id",
      as: "project",
    });

    DailyProgressReportModel.hasMany(models.DailyProgressReportForm, {
      foreignKey: "dpr_id",
      as: "forms",
    });
  };

  return DailyProgressReportModel;
};
