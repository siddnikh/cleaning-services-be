const express = require('express');
const { logger } = require('../config/logger');
const { createRating, deleteRating, likeRating } = require('../controllers/rating');
const { verifyUser } = require('../utils/jwtUtils');

const ratingRouter = express.Router();

ratingRouter.post('/', verifyUser, async (req, res) => {
    try {
        await createRating(req, res);
    } catch (error) {
        logger.error(`Error in creating rating: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

ratingRouter.delete('/:id', verifyUser, async (req, res) => {
    try {
        await deleteRating(req, res);
    } catch (error) {
        logger.error(`Error in deleting rating: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

ratingRouter.post('/:id/like', verifyUser, async (req, res) => {
    try {
        await likeRating(req, res);
    } catch (error) {
        logger.error(`Error in liking rating: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

module.exports = ratingRouter;
