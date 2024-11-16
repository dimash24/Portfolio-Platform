const express = require('express');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const router = express.Router();

router.get('/register', (req, res) => res.render('auth/register'));


router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body; // Destructure role from the body

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).send('Username or email already exists.');
    }

    // Generate 2FA secret
    const secret = speakeasy.generateSecret({ length: 20 });

    // Create new user with role fallback to 'editor' if not provided
    const newUser = new User({
      username,
      email,
      password,
      role: role || 'editor', // Default role is 'editor'
      twoFactorSecret: secret.base32,
      is2FAEnabled: true,
    });

    await newUser.save();

    // Generate QR Code for 2FA
    const dataUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Render 2FA setup page with the QR code
    res.render('auth/2fa-setup', { qrCodeImage: dataUrl });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Error during registration. Please try again.');
  }
});


router.get('/login', (req, res) => res.render('auth/login'));

router.post('/login', async (req, res) => {
  const { username, password, token } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Invalid credentials');
  }

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

  req.session.user = { id: user._id, role: user.role };
  console.log('User session set:', req.session.user); 
  res.redirect('/');
});


router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Error logging out.');
    res.redirect('/auth/login');
  });
});

module.exports = router;
