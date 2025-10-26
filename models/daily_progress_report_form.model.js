import { DataTypes } from "sequelize";
export default (sequelize) => {
  const DailyProgressReportFormModel = sequelize.define(
    "daily_progress_report_form",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      dpr_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "daily_progress_report",
          key: "id",
        },
      },
      time_from: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      time_to: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      time_total: {
        type: DataTypes.STRING, // or INTERVAL if you prefer exact duration
        allowNull: false,
      },
      job_done: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    //   job_tag_id: {
    //     type: DataTypes.UUID,
    //     allowNull: false,
    //     references: {
    //       model: "job_tag", // Replace with your actual job tag table
    //       key: "id",
    //     },
    //   },
      revenue_code: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "revenue_master", // Replace with your actual revenue table
          key: "id",
        },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  DailyProgressReportFormModel.associate = function (models) {
    DailyProgressReportFormModel.belongsTo(models.DailyProgressReport, {
      foreignKey: "dpr_id",
      as: "report",
    });

    // DailyProgressReportFormModel.belongsTo(models.JobTag, {
    //   foreignKey: "job_tag_id",
    //   as: "job_tag",
    // });

    DailyProgressReportFormModel.belongsTo(models.RevenueMaster, {
      foreignKey: "revenue_code",
      as: "revenue",
    });
  };

  return DailyProgressReportFormModel;
};
