import { DataTypes } from "sequelize";

const JobMasterModel = (sequelize) => {
  return sequelize.define(
    "job_master",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      job_code: { type: DataTypes.STRING },
      job_description: { type: DataTypes.STRING },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
};

export default JobMasterModel; // ✅ This fixes the import error
