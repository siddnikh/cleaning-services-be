const express = require('express');
const authRouter = require('./auth');
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

module.exports = apiRouter;