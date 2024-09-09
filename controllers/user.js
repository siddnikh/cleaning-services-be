const { User } = require('../models');
const { logger } = require('../config/logger');

const getUser = async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({
      where: { email: email },
      attributes: { exclude: ['password', 'pin'] }
    });
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json(user);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({
      where: { email: email },
      attributes: { exclude: ['password', 'pin'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Couldn\'t find user profile', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const email = req.user.email;
    const updateData = req.body;
    
    delete updateData.password;
    delete updateData.pin;
    delete updateData.email;
    
    const [updated] = await User.update(updateData, {
      where: { email: email },
      returning: true,
      individualHooks: true // This ensures that the beforeUpdate hook is run
    });
    
    if (updated) {
      const updatedUser = await User.findOne({
        where: { email: email },
        attributes: { exclude: ['password', 'pin'] }
      });
      res.status(200).json(updatedUser);
    } else {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
};

const deleteUser = async (req, res) => {
  try {
    const email = req.user.email;
    
    const [updated] = await User.update(
      { deleted: true },
      { where: { email: email } }
    );
    
    if (updated) {
      res.status(200).json({ message: 'User profile deleted successfully' });
    } else {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }
};

const checkIfUserExists = async (email) => {
  try {
    const user = await User.findOne({ where: { email: email } });
    if (user) return user;
    else return null;
  } catch (error) {
    logger.error(`Error checking if user exists: ${email}`, error);
  }
};

const verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const email = req.user.email;

    if (!pin) {
      const err = new Error('PIN is required');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.pin !== pin) {
      const err = new Error('Invalid PIN');
      err.statusCode = 400;
      throw err;
    }

    res.status(200).json({ message: 'PIN verified successfully' });
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = error.statusCode || 500;
    throw err;
  }
};

const getUserBookmarks = async (req, res) => {
  try {
    const user = req.user;
    const bookmarks = await user.getBookmarkedServices();
    res.status(200).json(bookmarks);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }
};

module.exports = {
  getUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  checkIfUserExists,
  verifyPin,
  getUserBookmarks
};
