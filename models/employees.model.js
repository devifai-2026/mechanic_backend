import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";

export default (sequelize) => {
  const EmployeeModel = sequelize.define(
    "employee",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      emp_id: { type: DataTypes.STRING, allowNull: false, unique: true },
      emp_name: { type: DataTypes.STRING, allowNull: false },
      blood_group: { type: DataTypes.STRING, allowNull: false },
      age: { type: DataTypes.INTEGER, allowNull: false },
      adress: { type: DataTypes.TEXT, allowNull: false },

      state: { type: DataTypes.STRING, allowNull: false },
      city: { type: DataTypes.STRING, allowNull: false },
      pincode: { type: DataTypes.STRING, allowNull: false },

      acc_holder_name: { type: DataTypes.STRING, allowNull: true },
      bank_name: { type: DataTypes.STRING, allowNull: true },
      acc_no: { type: DataTypes.STRING, allowNull: true },
      ifsc_code: { type: DataTypes.STRING, allowNull: true },

      is_active: { type: DataTypes.BOOLEAN, allowNull: false },
      shiftcode: { type: DataTypes.STRING, allowNull: true },
      active_jwt_token: { type: DataTypes.STRING, allowNull: true },

      role_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "role", key: "id" },
      },
      player_id: { type: DataTypes.STRING, allowNull: true },
      org_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "organisation", key: "id" },
      },
      password: { type: DataTypes.STRING, allowNull: false },
      aadhar_number: { type: DataTypes.STRING, allowNull: false },
      dob: { type: DataTypes.STRING, allowNull: false },

      app_access_role: {
        type: DataTypes.ENUM(
          "mechanic",
          "mechanicIncharge",
          "siteIncharge",
          "storeManager",
          "accountManager",
          "projectManager",
          "admin"
        ),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      hooks: {
        beforeCreate: async (employee) => {
          if (employee.password) {
            const salt = await bcrypt.genSalt(10);
            employee.password = await bcrypt.hash(employee.password, salt);
          }
        },
        beforeUpdate: async (employee) => {
          if (employee.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            employee.password = await bcrypt.hash(employee.password, salt);
          }
          if (employee.changed("emp_id")) {
            const salt = await bcrypt.genSalt(10);
            employee.password = await bcrypt.hash(employee.emp_id, salt);
            console.log("Password updated due to emp_id change");
          }
        },
      },
    }
  );

  EmployeeModel.associate = (models) => {
    EmployeeModel.belongsTo(models.Role, { foreignKey: "role_id", as: "role" });
    EmployeeModel.belongsToMany(models.Project_Master, {
      through: models.ProjectEmployees,
      foreignKey: "emp_id",
      otherKey: "project_id",
      as: "projects",
    });
    EmployeeModel.belongsTo(models.Shift, {
      foreignKey: "shiftcode",
      targetKey: "shift_code",
      as: "shift",
    });
    EmployeeModel.belongsTo(models.Organisations, {
      foreignKey: "org_id",
      as: "organisation",
    });
  };

  return EmployeeModel;
};
