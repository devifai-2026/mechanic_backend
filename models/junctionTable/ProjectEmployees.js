import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ProjectEmployees = sequelize.define(
    "ProjectEmployees",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "project_master", key: "id" },
      },
      emp_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "employee", key: "id" },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  // ✅ Define associations here
  ProjectEmployees.associate = (models) => {
    ProjectEmployees.belongsTo(models.Employee, {
      foreignKey: "emp_id",
      as: "employeeDetails", // Alias used in your include query
    });

    ProjectEmployees.belongsTo(models.Project_Master, {
      foreignKey: "project_id",
      as: "project",
    });
  };

  return ProjectEmployees;
};
