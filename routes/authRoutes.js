const express = require('express');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const router = express.Router();

router.get('/register', (req, res) => res.render('auth/register'));

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).send('Username or email already exists.');

    const secret = speakeasy.generateSecret({ length: 20 });
    const newUser = new User({
      username,
      email,
      password,
      role: role || 'editor', // Default role
      twoFactorSecret: secret.base32,
      is2FAEnabled: true,
    });

    await newUser.save();
    const dataUrl = await qrcode.toDataURL(secret.otpauth_url);
    res.render('auth/2fa-setup', { qrCodeImage: dataUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during registration.');
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
  res.redirect('/');
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Error logging out.');
    res.redirect('/auth/login');
  });
});

module.exports = router;
