import { DataTypes } from "sequelize";

export default (sequelize) => {
  const PartnerModel = sequelize.define(
    "partner",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      partner_name: { type: DataTypes.STRING, allowNull: false },
      partner_address: { type: DataTypes.TEXT, allowNull: false },
      partner_gst: { type: DataTypes.STRING, allowNull: false },
      partner_geo_id: { type: DataTypes.BIGINT, allowNull: false },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "West Bengal",
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Durgapur",
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "713212",
      },
      isCustomer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "partners", 
      timestamps: true,
      freezeTableName: true,
    }
  );

  PartnerModel.associate = (models) => {
    PartnerModel.hasMany(models.Project_Master, {
      foreignKey: "customer_id",
      as: "projects",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return PartnerModel;
};
