const express = require('express');
const { logger } = require('../config/logger');
const { signup, login, requestOTP, verifyOTP } = require('../controllers/auth');

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
    try {
        await signup(req, res);
    } catch (error) {
        logger.error(`Error in /signup: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

authRouter.post('/login', async (req, res) => {
    try {
        await login(req, res);
    } catch (error) {
        logger.error(`Error in /login: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

authRouter.post('/request-otp', async (req, res) => {
    try {
        const otp = await generateOTP(req, res);
        await sendOTP(req, res, otp);
    } catch (error) {
        logger.error(`Error generating OTP: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

authRouter.post('/verify-otp', async (req, res) => {
    try {
        await verifyOTP(req, res);
    } catch (error) {
        logger.error(`Error in verifying OTP: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
})

authRouter.post('/is-otp-verified', async (req, res) => {
    try {
        await isUserOTPVerified(req, res);
    } catch (error) {
        logger.error(`Error in checking OTP verification: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

module.exports = authRouter;
