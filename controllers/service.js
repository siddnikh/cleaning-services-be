const { Op } = require('sequelize');
const { Service } = require('../models/Service');

const getNearestServices = async (req, res) => {
  try {
    const nearbyServices = await Service.findAll({
      attributes: [
        'id',
        'description',
        'tiers',
        'areaName',
        'rating',
        [
          Service.sequelize.fn(
            'ST_Distance',
            Service.sequelize.col('location'),
            req.user.profile.location
          ),
          'distance'
        ]
      ],
      order: [
        [
          Service.sequelize.fn('ST_Distance', Service.sequelize.col('location'), req.user.profile.location),
          'ASC'
        ]
      ],
      limit: 10,
      include: [{
        model: Service.sequelize.models.Profile,
        as: 'providerProfile',
        attributes: ['id', 'name']
      }]
    });

    res.json(nearbyServices);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }
};

const getHighestRatedServices = async (req, res) => {
  try {
    const highestRatedServices = await Service.findAll({
      where: {
        rating: {
          [Op.ne]: null
        }
      },
      attributes: [
        'id',
        'description',
        'tiers',
        'areaName',
        'rating',
        [
          Service.sequelize.fn(
            'ST_Distance',
            Service.sequelize.col('location'),
            req.user.profile.location
          ),
          'distance'
        ]
      ],
      having: Service.sequelize.literal('distance <= 50000'), // within a 50km radius
      order: [
        ['rating', 'DESC']
      ],
      limit: 20,
      include: [{
        model: Service.sequelize.models.Profile,
        as: 'providerProfile',
        attributes: ['id', 'name']
      }]
    });

    res.json(highestRatedServices);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    res.json(service);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }
};

const createService = async (req, res) => {
  try {
    const profile = req.user.profile;
    
    if (profile.type !== 'Provider') {
      const err = new Error('Only providers can create services');
      err.statusCode = 403;
      throw err;
    }

    const serviceData = {
      ...req.body,
      providerProfileId: req.user.userProfileId
    };

    const newService = await Service.create(serviceData);
    res.status(201).json(newService);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = req.user.profile;
    
    if (profile.type !== 'Provider') {
      const err = new Error('Only providers can update services');
      err.statusCode = 403;
      throw err;
    }

    const service = await Service.findOne({ where: { id, providerProfileId: profile.id } });

    if (!service) {
      const err = new Error('Service not found or you do not have permission to update it');
      err.statusCode = 404;
      throw err;
    }

    await service.update(req.body);
    res.json(service);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = req.user.profile;
    
    if (profile.type !== 'Provider') {
      const err = new Error('Only providers can delete services');
      err.statusCode = 403;
      throw err;
    }

    const service = await Service.findOne({ where: { id, providerProfileId: profile.id } });

    if (!service) {
      const err = new Error('Service not found or you do not have permission to delete it');
      err.statusCode = 404;
      throw err;
    }

    await service.destroy();
    res.status(204).send();
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
};

const searchServices = async (req, res) => {
  try {
    const { city, type, minPrice, maxPrice } = req.query;

    if (!city || !type || !minPrice || !maxPrice) {
      const err = new Error('Missing required search parameters');
      err.statusCode = 400;
      throw err;
    }

    const services = await Service.findAll({
      where: {
        city: city,
        type: type,
      },
      attributes: [
        'id',
        'description',
        'tiers',
        'city',
        'rating',
        'photos',
      ],
      include: [{
        model: Service.sequelize.models.Profile,
        as: 'providerProfile',
        attributes: ['id', 'name']
      }],
      having: Service.sequelize.literal(`
        EXISTS (
          SELECT 1
          FROM jsonb_array_elements(tiers) AS tier
          WHERE (tier->>'price')::numeric >= ${minPrice}
            AND (tier->>'price')::numeric <= ${maxPrice}
        )
      `),
    });

    res.status(200).json(services);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = error.statusCode || 500;
    throw err;
  }
};

const addBookmark = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const user = req.user;

    await user.addBookmarkedService(serviceId);
    res.status(200).json({ message: 'Service bookmarked successfully' });
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
};

const removeBookmark = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const user = req.user;

    await user.removeBookmarkedService(serviceId);
    res.status(200).json({ message: 'Service unbookmarked successfully' });
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
};

module.exports = {
  getNearestServices,
  getHighestRatedServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  searchServices,
  addBookmark,
  removeBookmark
};
