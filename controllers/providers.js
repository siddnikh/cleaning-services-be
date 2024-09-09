const { Op } = require('sequelize');
const { Profile } = require('../models/User');

const getNearestProviders = async (req, res) => {
  try {
    const nearbyProviders = await Profile.findAll({
      where: {
        type: 'Provider',
        location: {
          [Op.ne]: null
        }
      },
      attributes: [
        'id',
        'name',
        'services',
        'rating',
        [
          Profile.sequelize.fn(
            'ST_Distance',
            Profile.sequelize.col('location'),
            req.user.profile.location
          ),
          'distance'
        ]
      ],
      order: [
        [
          Profile.sequelize.fn('ST_Distance', Profile.sequelize.col('location'), req.user.profile.location),
          'ASC'
        ]
      ],
      limit: 10
    });

    res.json(nearbyProviders);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }
};

const getHighestRatedProviders = async (req, res) => {
  try {
    const highestRatedProviders = await Profile.findAll({
      where: {
        type: 'Provider',
        rating: {
          [Op.ne]: null
        }
      },
      attributes: [
        'id',
        'name',
        'services',
        'rating',
        [
          Profile.sequelize.fn(
            'ST_Distance',
            Profile.sequelize.col('location'),
            req.user.profile.location
          ),
          'distance'
        ]
      ],
      having: Profile.sequelize.literal('distance <= 50000'), // within a 50km radius
      order: [
        ['rating', 'DESC']
      ],
      limit: 20
    });

    res.json(highestRatedProviders);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }
};

module.exports = {
  getNearestProviders,
  getHighestRatedProviders
};
