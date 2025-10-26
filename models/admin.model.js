import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";

export default (sequelize) => {
  const AdminModel = sequelize.define(
    "admin",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      admin_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      active_jwt_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      hooks: {
        beforeCreate: async (admin) => {
          // Auto-generate admin_id from email if not provided
          if (!admin.admin_id) {
            if (admin.email && admin.email.includes("@")) {
              admin.admin_id = admin.email.split("@")[0].trim().toLowerCase();
            } else {
              const randomId = Math.floor(1000 + Math.random() * 9000);
              admin.admin_id = `admin${randomId}`;
            }
          }

          // Hash password
          if (admin.password) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(admin.password, salt);
          }
        },
        beforeUpdate: async (admin) => {
          if (admin.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(admin.password, salt);
          }
        },
      },
    }
  );

  return AdminModel;
};