import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ProjectMasterModel = sequelize.define(
    "project_master",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Generates a unique ID like MongoDB's ObjectId
        primaryKey: true,
      },
      project_no: { type: DataTypes.STRING, allowNull: false },
      customer_id: { type: DataTypes.UUID, allowNull: false },
      order_no: { type: DataTypes.STRING, allowNull: false },
      // contract_tenure: { type: DataTypes.STRING, allowNull: false },
      contract_start_date: { type: DataTypes.DATE, allowNull: false },
      contract_end_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW, // 👈 Default to current date
      },

      // store_location_ids: { type: DataTypes.UUID }, // Use UUID
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  ProjectMasterModel.associate = (models) => {
    // Customer association (Partner where isCustomer is true)
    ProjectMasterModel.belongsTo(models.Partner, {
      foreignKey: "customer_id",
      as: "customer",
    });
    ProjectMasterModel.belongsToMany(models.Equipment, {
      through: models.EquipmentProject, // Join table
      foreignKey: "project_id",
      as: "equipments", // Optional alias
    });

    // Staff relationship through ProjectStaff
    ProjectMasterModel.belongsToMany(models.Employee, {
      through: models.ProjectEmployees,
      foreignKey: "project_id",
      otherKey: "emp_id", // 👈 This is the fix
      as: "staff",
    });
    // New revenue association
    ProjectMasterModel.belongsToMany(models.RevenueMaster, {
      through: models.ProjectRevenue,
      foreignKey: "project_id",
      as: "revenues",
    });
    ProjectMasterModel.belongsToMany(models.Store, {
      through: models.StoreProject,
      foreignKey: "project_id",
      otherKey: "store_id",
      as: "store_locations",
    });
  };

  return ProjectMasterModel;
};
