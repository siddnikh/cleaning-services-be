const express = require('express');
const authRouter = require('./auth');
const userRouter = require('./user');
const providerRatingRouter = require('./providerRating');
const providersRouter = require('./providers');
const servicesRouter = require('./service');
const serviceRatingRouter = require('./serviceRating');
const bookingRouter = require('./booking');
const { logger } = require('../config/logger');

// For every router that we add to apiRouter, we need to set each route such that we catch errors in the route itself.
// This is because we are using async/await in the routes, and if we don't catch the error, it will be thrown to the next middleware.

const apiRouter = express.Router();

// Middleware to log incoming API requests
apiRouter.use((req, res, next) => {
    logger.info(`Incoming API request at ${req.originalUrl}`);
    next();
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/provider-ratings', providerRatingRouter);
apiRouter.use('/providers', providersRouter); // querying providers
apiRouter.use('/services', servicesRouter); // querying services
apiRouter.use('/service-ratings', serviceRatingRouter);
apiRouter.use('/bookings', bookingRouter);

module.exports = apiRouter;