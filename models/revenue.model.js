import { DataTypes } from "sequelize";

export default (sequelize) => {
  const RevenueMaster = sequelize.define(
    "revenue_master",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      revenue_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensure revenue_code is unique
      },
      revenue_description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      revenue_value: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  RevenueMaster.associate = (models) => {
    RevenueMaster.belongsToMany(models.Project_Master, {
      through: models.ProjectRevenue, // Ensure this model is defined
      foreignKey: "revenue_master_id",
      otherKey: "project_id",
      as: "projects",
    });

    // If consumable items reference revenue_master

  };

  return RevenueMaster;
};
