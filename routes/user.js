const express = require('express');
const { logger } = require('../config/logger');
const { getUserProfile, getUserProfileByEmail, updateUserProfile, deleteUserProfile, verifyPin } = require('../controllers/user');
const { verifyUser } = require("../utils/jwtUtils");

const userRouter = express.Router();

userRouter.get('/me', verifyUser, async (req, res) => {
    try {
        await getUserProfile(req, res);
    } catch (error) {
        logger.error(`Error in /me: ${error.message}`);
        const status = error.status || 500;
        res.status(status).json({ error: error.message });
    }
});

userRouter.get('/:email', verifyUser, async (req, res) => {
    try {
        await getUserProfileByEmail(req, res);
    } catch (error) {
        logger.error(`Error in getting profile by email: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

userRouter.post('/update', verifyUser, async (req, res) => {
    try {
        await updateUserProfile(req, res);
    } catch (error) {
        logger.error(`Error in /update: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

userRouter.delete('/delete', verifyUser, async (req, res) => {
    try {
        await deleteUserProfile(req, res);
    } catch (error) {
        logger.error(`Error in /delete: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

userRouter.post('/verify-pin', verifyUser, async (req, res) => {
    try {
        await verifyPin(req, res);
    } catch (error) {
        logger.error(`Error in /verify-pin: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

module.exports = userRouter;
