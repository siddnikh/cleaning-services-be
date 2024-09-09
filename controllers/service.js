const { Op } = require('sequelize');
const { Service } = require('../models/Service');
// TODO: Get the user's location from profile object of the user
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
            req.user.location
          ),
          'distance'
        ]
      ],
      order: [
        [
          Service.sequelize.fn('ST_Distance', Service.sequelize.col('location'), req.user.location),
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
            req.user.location
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
}

// TODO CUD functions left
module.exports = {
  getNearestServices,
  getHighestRatedServices,
  getServiceById
};

