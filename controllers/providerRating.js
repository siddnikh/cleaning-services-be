const ProviderRating = require('../models/ProviderRating');
const Profile = require('../models/Profile');

// Ratings for providers

const createRating = async (req, res) => {
  try {
    const { score, comment, providerProfileId } = req.body;
    const userProfileId = req.user.profileId;

    const providerProfile = await Profile.findByPk(providerProfileId);
    if (!providerProfile || providerProfile.type !== 'Provider') {
      const err = new Error('Provider not found');
      err.statusCode = 404;
      throw err;
    }

    const rating = await ProviderRating.create({
      score,
      comment,
      userProfileId,
      providerProfileId
    });

    res.status(201).json(rating);
  } catch (error) {
    const err = new Error('Error creating rating');
    err.statusCode = 500;
    throw err;
  }
};

const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userProfileId = req.user.profileId;

    const rating = await ProviderRating.findByPk(id);
    if (!rating) {
      const err = new Error('Rating not found');
      err.statusCode = 404;
      throw err;
    }

    if (rating.userProfileId !== userProfileId) {
      const err = new Error('You are not authorized to delete this rating');
      err.statusCode = 403;
      throw err;
    }

    await rating.destroy();
    res.status(204).end();
  } catch (error) {
    const err = new Error('Error deleting rating');
    err.statusCode = 500;
    throw err;
  }
};

module.exports = {
  createRating,
  deleteRating,
};
