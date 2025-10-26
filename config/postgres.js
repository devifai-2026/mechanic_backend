import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const useConnectionString = process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0;

const sequelize = useConnectionString
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Render uses self-signed certs
        },
      },
    })
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      dialect: "postgres",
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    });

const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message
    );
  }
};

export { sequelize, connection };
