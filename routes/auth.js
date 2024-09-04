const express = require('express');
const { logger } = require('../config/logger');
const { signup, login } = require('../controllers/auth');

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
    try {
        await signup(req, res);
    } catch (error) {
        logger.error(`Error in /signup: ${error.message}`);
        const status = error.status || 500;
        res.status(status).json({ error: error.message });
    }
});

authRouter.post('/login', async (req, res) => {
    try {
        await login(req, res);
    } catch (error) {
        logger.error(`Error in /login: ${error.message}`);
        const status = error.status || 500;
        res.status(status).json({ error: error.message });
    }
});

module.exports = authRouter;
