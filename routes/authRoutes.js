const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');
const User = require('../models/User');
const { authMiddleware } = require('../utils/authMiddleware');
const router = express.Router();
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Render the registration page
router.get('/register', (req, res) => res.render('auth/register'));

// Handle user registration
router.post('/register', async (req, res) => {
  console.log('Register POST request received with data:', req.body);
  try {
    const { username, email, password, firstName, lastName, age, gender } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).send('Username or email already exists. Please choose another.');
    }

    // Generate 2FA secret
    const secret = speakeasy.generateSecret({ length: 20 });

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      age,
      gender,
      twoFactorSecret: secret.base32,
      is2FAEnabled: true,
      role: 'admin', // Default role
    });

    await newUser.save();
    console.log('User successfully registered:', username);

    // Generate QR Code for 2FA
    const otpauthURL = secret.otpauth_url;
    const dataUrl = await qrcode.toDataURL(otpauthURL);

    // Send welcome email
    await sendEmail(email, 'Welcome to Portfolio Platform', 'Thank you for registering!');

    // Render the 2FA setup page with QR code
    res.render('auth/2fa-setup', { qrCodeImage: dataUrl });
  } catch (error) {
    console.error('Error during registration:', error);

    // Handle duplicate username or email error
    if (error.code === 11000) {
      return res.status(400).send('Username or email already exists. Please choose another.');
    }

    res.status(500).send('Registration failed. Please try again.');
  }
});

// Render the login page
router.get('/login', (req, res) => res.render('auth/login'));

// Handle user login
router.post('/login', async (req, res) => {
  const { username, password, token } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Invalid credentials');
  }

  // Verify 2FA token if enabled
  if (user.is2FAEnabled) {
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });
    if (!verified) {
      return res.status(401).send('Invalid 2FA token');
    }
  }

  // Set the session for the logged-in user
  req.session.user = { id: user._id, role: user.role };
  res.redirect('/');
});

// Handle user logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).send('Error logging out.');
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;
