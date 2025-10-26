import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EquipmentTransactionModel = sequelize.define(
    "equipment_transaction",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "project_master",
          key: "id",
        },
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      data_type: {
        type: DataTypes.ENUM("equipment_in", "equipment_out"),
        allowNull: false,
      },

      type: {
        type: DataTypes.ENUM(
          "New",
          "Transfer",
          "Repair",
          "Site Return",
          "Rent"
        ),
        allowNull: false,
      },

      partner: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "partner", key: "id" },
      },
      is_approve_pm: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      is_invoiced: {
        type: DataTypes.ENUM("draft", "invoiced", "rejected"),
        defaultValue: "draft",
      },
    },
    {
      timestamps: true,
      freezeTableName: true,

      hooks: {
        beforeCreate: async (transaction) => {
          // If type is not Repair or Site Return, partner should be null
          if (!["Repair", "Site Return", "Rent"].includes(transaction.type)) {
            transaction.partner = null;
          }
        },
      },
    }
  );

  EquipmentTransactionModel.associate = (models) => {
    EquipmentTransactionModel.belongsTo(models.Partner, {
      foreignKey: "partner",
      as: "partnerDetails",
    });
    EquipmentTransactionModel.hasMany(models.EquipmentTransactionsForm, {
      foreignKey: "equipment_transaction_id",
      as: "formItems",
    });

    EquipmentTransactionModel.hasMany(models.Employee, {
      foreignKey: "createdBy",
      as: "createdByUser",
    });

    EquipmentTransactionModel.belongsTo(models.Project_Master, {
      foreignKey: "project_id",
      as: "project",
    });
  };

  return EquipmentTransactionModel;
};
