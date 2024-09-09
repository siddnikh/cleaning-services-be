const express = require('express');
const { logger } = require('../config/logger');
const { getServiceById, getNearestServices, getHighestRatedServices } = require('../controllers/service');
const { verifyUser } = require('../utils/jwtUtils');

const serviceRouter = express.Router();

serviceRouter.get('/:id', verifyUser, async (req, res) => {
    try {
        await getServiceById(req, res);
    } catch (error) {
        logger.error(`Error in getting service, ${req.params.id}: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

serviceRouter.get('/nearest', verifyUser, async (req, res) => {
    try {
        await getNearestServices(req, res);
    } catch (error) {
        logger.error(`Error in getting nearest services, ${req.user.email}: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

serviceRouter.get('/highest-rated', verifyUser, async (req, res) => {
    try {
        await getHighestRatedServices(req, res);
    } catch (error) {
        logger.error(`Error in getting highest rated services, ${req.user.email}: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

module.exports = serviceRouter;
