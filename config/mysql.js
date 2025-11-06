// config/mysql.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
const sequelize = new Sequelize(
  "maco_mechanic",
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: "65.20.75.88",
    port:  3306,
    dialect: "mysql",
    logging: false,
  }
);

const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL database connected successfully.");
  } catch (error) {
    console.error("Unable to connect to MySQL:", error.message);
  }
};

export { sequelize, connection };