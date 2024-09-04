const { User } = require('../models');

async function signup(req, res) {
  try {
    const userData = req.body;
    const user = await User.signup(userData);
    res.status(201).json({
      message: 'User created successfully',
      userId: user.id
    });
  } catch (error) {
    throw new Error(error.message, { status: 400 });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.login(email, password);
    res.status(200).json({
      message: 'Login successful',
      userId: user.id
    });
  } catch (error) {
    throw new Error(error.message, { status: 401 });
  }
}

module.exports = { signup, login };
