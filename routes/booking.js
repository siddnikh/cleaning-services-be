const express = require('express');
const {
    createBooking,
    cancelBookingByUser,
    cancelBookingByProvider,
    acceptBooking,
    completeBooking,
    getBookingsByUser,
    getBookingsByProvider,
    getFreeSlots,
} = require('../controllers/booking');
const { verifyUser } = require("../utils/jwtUtils");
const { logger } = require('../config/logger');

const bookingRouter = express.Router();

bookingRouter.post('/', verifyUser, async (req, res) => {
    try {
        const booking = await createBooking(req, res);
    } catch (error) {
        logger.error(`Error in creating booking: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

bookingRouter.post('/:bookingId/cancelUser', verifyUser, async (req, res) => {
    try {
        const booking = await cancelBookingByUser(req, res);
    } catch (error) {
        logger.error(`Error in cancelling booking by user: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

bookingRouter.post('/:bookingId/cancelProvider', verifyUser, async (req, res) => {
    try {
        const booking = await cancelBookingByProvider(req, res);
    } catch (error) {
        logger.error(`Error in cancelling booking by provider: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

bookingRouter.post('/:bookingId/accept', verifyUser, async (req, res) => {
    try {
        const booking = await acceptBooking(req, res);
    } catch (error) {
        logger.error(`Error in accepting booking: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

bookingRouter.post('/:bookingId/complete', verifyUser, async (req, res) => {
    try {
        const booking = await completeBooking(req, res);
    } catch (error) {
        logger.error(`Error in completing booking: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

bookingRouter.get('/user/:userId', verifyUser, async (req, res) => {
    try {
        const bookings = await getBookingsByUser(req, res);
    } catch (error) {
        logger.error(`Error in getting bookings by user: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

bookingRouter.get('/provider/:providerId', verifyUser, async (req, res) => {
    try {
        const bookings = await getBookingsByProvider(req, res);
    } catch (error) {
        logger.error(`Error in getting bookings by provider: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

bookingRouter.get('/free-slots/:serviceId', verifyUser, async (req, res) => {
    try {
        const slots = await getFreeSlots(req, res);
    } catch (error) {
        logger.error(`Error in getting free slots: ${error.message}`);
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
    }
});

module.exports = bookingRouter;