const express = require("express");
const morgan = require("morgan");
const { logger, dbLogger } = require("./config/logger");
const sequelize = require("./config/db");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("combined", { stream: logger.stream }));

// For server check
app.get('/ping', (req, res) => {
    logger.info('Ping request received');
    res.send('PONG!');
});

app.listen(PORT, async () => {
    logger.info(`Server is running on port ${PORT} 🚀`);
    try {
        await sequelize.authenticate();
        dbLogger.info('Database connection has been established successfully 💾');
    } catch (error) {
        dbLogger.error('Unable to connect to the database:', error);
    }

    await sequelize.sync();
    dbLogger.info('Database synced successfully 📚');
});