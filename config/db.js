const { Sequelize } = require("sequelize");
const { dbLogger } = require("../config/logger");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: process.env.DATABASE_DIALECT,
    logging: (msg) => dbLogger.info(msg),
});

module.exports = sequelize; 