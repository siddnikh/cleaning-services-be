const twilio = require('twilio');
const { User } = require('../models');
const { sendOTPEmail } = require('../utils/email');

async function signup(req, res) {
  try {
    const userData = req.body;
    const user = await User.create(userData);
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      userId: user.id,
      token: token
    });
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
}

async function login(req, res) {
  try {
    const { email, phoneNumber, password } = req.body;
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { phoneNumber }
        ]
      }
    });
    
    if (!user || !(await user.comparePassword(password))) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      userId: user.id,
      token: token
    });
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 401;
    throw err;
  }
}

async function requestOTP(req, res) {
  try {
    const { phoneNumber, email } = req.body;
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { phoneNumber },
          { email }
        ]
      }
    });
    
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    user.otpExpiration = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes
    await user.save();

    // Send OTP via SMS
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    // Send OTP via Email
    await sendOTPEmail(email, otp);
    
    res.status(200).json({ message: 'OTPs sent successfully' });

  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
}

async function verifyOTP(req, res) {
  try {
    const { phoneNumber, email, otp } = req.body;
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { phoneNumber },
          { email }
        ]
      }
    });

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.otp !== otp || Date.now() > user.otpExpiration) {
      const err = new Error('Invalid or expired OTP');
      err.statusCode = 400;
      throw err;
    }

    user.otp = null;
    user.otpExpiration = null;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully', userId: user.id });
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
}

const isUserOTPVerified = async (req, res) => {
  try {
    const { phoneNumber, email } = req.body;
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { phoneNumber },
          { email }
        ]
      }
    });

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({ isVerified: user.verifiedOTP });
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
};

module.exports = { signup, login, requestOTP, verifyOTP, isUserOTPVerified };
