import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ProjectStoreLocation = sequelize.define(
    "project_store_location",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      store_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true, // Optional, depending on whether you want createdAt/updatedAt
      freezeTableName: true,
    }
  );

  return ProjectStoreLocation;
};
