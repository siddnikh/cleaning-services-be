const express = require('express');
const { logger } = require('../config/logger');
const { getNearestProviders, getHighestRatedProviders } = require('../controllers/providers');
const { verifyUser } = require('../utils/jwtUtils');

const providersRouter = express.Router();

providersRouter.get('/nearest', verifyUser, async (req, res) => {
    try {
        await getNearestProviders(req, res);
    } catch (error) {
        logger.error(`Error in getting nearest providers, ${req.user.email}: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

providersRouter.get('/highest-rated', verifyUser, async (req, res) => {
    try {
        await getHighestRatedProviders(req, res);
    } catch (error) {
        logger.error(`Error in getting highest rated providers, ${req.user.email}: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

module.exports = providersRouter;
