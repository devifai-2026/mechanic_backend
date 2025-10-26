export const JobTagModel = (sequelize) => {
  const JobTagModel = sequelize.define(
    "job_tag",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      job_tag: { type: DataTypes.STRING, allowNull: false },
      job_desc: { type: DataTypes.STRING, allowNull: false },
      unit_code: { type: DataTypes.STRING, allowNull: false },
      unit_name: { type: DataTypes.STRING, allowNull: false },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  return JobTagModel;
};