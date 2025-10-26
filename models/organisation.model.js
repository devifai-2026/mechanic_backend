import { DataTypes } from 'sequelize';

export const OrganisationModel = (sequelize) => {
  const OrganisationModel = sequelize.define(
    'organisation',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      org_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      org_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return OrganisationModel;
};
