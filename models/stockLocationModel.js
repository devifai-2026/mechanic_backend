import { DataTypes } from "sequelize";

export const StockLocationModel = (sequelize) => {
  const StockLocation = sequelize.define(
    "stock_location",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      consumable_item_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      store_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      opening_stock: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        allowNull: false,
      },
      closing_stock: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        allowNull: false,
      },
      last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true, // This enables createdAt and updatedAt
      createdAt: 'created_at', // Tell Sequelize to use created_at column
      updatedAt: 'updated_at', // Tell Sequelize to use updated_at column
      freezeTableName: true,
      underscored: true, // This converts field names to snake_case
      indexes: [
        {
          unique: true,
          fields: ['consumable_item_id', 'store_id', 'project_id']
        }
      ],
    }
  );

  StockLocation.associate = (models) => {
    StockLocation.belongsTo(models.ConsumableItem, {
      foreignKey: "consumable_item_id",
      as: "item",
    });
    
    StockLocation.belongsTo(models.Store, {
      foreignKey: "store_id",
      as: "store",
    });
    
    StockLocation.belongsTo(models.Project_Master, {
      foreignKey: "project_id",
      as: "project",
    });
    
    StockLocation.hasMany(models.StockEntry, {
      foreignKey: "stock_location_id",
      as: "entries",
      onDelete: "CASCADE",
    });
  };

  return StockLocation;
};