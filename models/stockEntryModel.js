import { DataTypes } from "sequelize";

export const StockEntryModel = (sequelize) => {
  const StockEntry = sequelize.define(
    "stock_entry",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      stock_location_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      entry_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      quantity: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      unit_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      opening_stock: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      closing_stock: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      remarks: {
        type: DataTypes.TEXT,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      timestamps: true, // This enables createdAt and updatedAt
      createdAt: 'created_at', // Tell Sequelize to use created_at column
      updatedAt: 'updated_at', // Tell Sequelize to use updated_at column
      freezeTableName: true,
      underscored: true, // This converts field names to snake_case
    }
  );

  StockEntry.associate = (models) => {
    StockEntry.belongsTo(models.StockLocation, {
      foreignKey: "stock_location_id",
      as: "location",
    });
    
    StockEntry.belongsTo(models.Employee, {
      foreignKey: "created_by",
      as: "creator",
    });
  };

  return StockEntry;
};