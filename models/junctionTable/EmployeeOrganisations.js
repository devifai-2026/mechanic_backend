import { DataTypes } from "sequelize";

export const EmployeeOrganisationsModel = (sequelize) => {
  const EmployeeOrganisation = sequelize.define(
    "EmployeeOrganisation",
    {
      employee_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "employee",
          key: "id",
        },
      },
      organisation_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "organisation",
          key: "id",
        },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return EmployeeOrganisation;
};
