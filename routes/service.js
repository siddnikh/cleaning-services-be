const express = require('express');
const { logger } = require('../config/logger');
const {
  createService,
  updateService,
  deleteService,
  searchServices,
  getServiceById,
  getNearestServices,
  getHighestRatedServices,
  addBookmark,
  removeBookmark
} = require('../controllers/service');
const { verifyUser } = require('../utils/jwtUtils');

const serviceRouter = express.Router();

// use query params to search services
serviceRouter.get('/search', verifyUser, async (req, res) => {
  try {
    await searchServices(req, res);
  } catch (error) {
    logger.error(`Error in searching services: ${error.message}`);
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

serviceRouter.post('/', verifyUser, async (req, res) => {
  try {
    await createService(req, res);
  } catch (error) {
    logger.error(`Error in creating service, ${req.user.email}: ${error.message}`);
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

serviceRouter.put('/:id', verifyUser, async (req, res) => {
  try {
    await updateService(req, res);
  } catch (error) {
    logger.error(`Error in updating service, ${req.user.email}: ${error.message}`);
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

serviceRouter.delete('/:id', verifyUser, async (req, res) => {
  try {
    await deleteService(req, res);
  } catch (error) {
    logger.error(`Error in deleting service, ${req.user.email}: ${error.message}`);
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

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

serviceRouter.post('/:id/bookmark', verifyUser, async (req, res) => {
  try {
    await addBookmark(req, res);
  } catch (error) {
    logger.error(`Error in bookmarking service, ${req.user.email}: ${error.message}`);
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

serviceRouter.delete('/:id/bookmark', verifyUser, async (req, res) => {
  try {
    await removeBookmark(req, res);
  } catch (error) {
    logger.error(`Error in unbookmarking service, ${req.user.email}: ${error.message}`);
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

module.exports = serviceRouter;
