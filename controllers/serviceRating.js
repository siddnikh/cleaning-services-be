const ServiceRating = require('../models/ServiceRating');
const Service = require('../models/Service');

// Ratings for services

const createRating = async (req, res) => {
  try {
    const { score, comment, serviceId } = req.body;
    const userId = req.user.id;

    const service = await Service.findByPk(serviceId);
    if (!service) {
      const err = new Error("Service not found");
      err.statusCode = 404;
      throw err;
    }

    const rating = await ServiceRating.create({
      score,
      comment,
      userId,
      serviceId,
    });

    res.status(201).json(rating);
  } catch (error) {
    const err = new Error("Error creating rating");
    err.statusCode = 500;
    throw err;
  }
};

const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const rating = await ServiceRating.findByPk(id);
    if (!rating) {
      const err = new Error("Rating not found");
      err.statusCode = 404;
      throw err;
    }

    if (rating.userId !== userId) {
      const err = new Error("You are not authorized to delete this rating");
      err.statusCode = 403;
      throw err;
    }

    await rating.destroy();
    res.status(204).end();
  } catch (error) {
    const err = new Error("Error deleting rating");
    err.statusCode = 500;
    throw err;
  }
};

const likeRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const rating = await ServiceRating.findByPk(id);
    if (!rating) {
      const err = new Error("Rating not found");
      err.statusCode = 404;
      throw err;
    }

    if (rating.likedByUserIds.includes(userId)) {
      rating.likedByUserIds = rating.likedByUserIds.filter(
        (id) => id !== userId
      );
    } else {
      rating.likedByUserIds.push(userId);
    }

    await rating.save();

    res
      .status(200)
      .json({
        message: "Rating like status updated",
        likedByUserIds: rating.likedByUserIds,
      });
  } catch (error) {
    const err = new Error("Error updating rating like status");
    err.statusCode = 500;
    throw err;
  }
};

module.exports = {
  createRating,
  deleteRating,
  likeRating,
};
