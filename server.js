const express = require("express");
const morgan = require("morgan");
const { logger, dbLogger } = require("./config/logger");
const sequelize = require("./config/db");
const apiRouter = require("./routes");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("combined", { stream: logger.stream }));
app.use(express.json());

// For server check
app.get('/ping', (req, res) => {
    logger.info('Ping request received');
    res.send('PONG!');
});

app.use('/api', apiRouter);

app.listen(PORT, async () => {
    logger.info(`Server is running on port ${PORT} 🚀`);
    try {
        await sequelize.authenticate();
        dbLogger.info('Database connection has been established successfully 💾');
    } catch (error) {
        dbLogger.error('Unable to connect to the database:', error);
    }

    sequelize.sync({ alter: true })
    .then(() => {
        dbLogger.info('Database synced successfully 📚');
    })
    .catch(error => {
        dbLogger.error(`Error while trying to sync database ❗️❗️❗️ ${error}`);
    });
});