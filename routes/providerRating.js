const express = require('express');
const { logger } = require('../config/logger');
const { createRating, deleteRating } = require('../controllers/providerRating');
const { verifyUser } = require('../utils/jwtUtils');

const providerRatingRouter = express.Router();

providerRatingRouter.post('/', verifyUser, async (req, res) => {
    try {
        await createRating(req, res);
    } catch (error) {
        logger.error(`Error in creating rating: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

providerRatingRouter.delete('/:id', verifyUser, async (req, res) => {
    try {
        await deleteRating(req, res);
    } catch (error) {
        logger.error(`Error in deleting rating: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

module.exports = providerRatingRouter;
