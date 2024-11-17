const express = require('express');
const Portfolio = require('../models/Portfolio');
const multer = require('multer');
const router = express.Router();
const path = require('path');

// Storage for uploads
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Admin panel
router.get('/admin', async (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    const items = await Portfolio.find();
    res.render('portfolio/admin', { items });
  } else {
    res.status(403).send('Access denied');
  }
});

// Create a portfolio item
router.post('/create', upload.array('images', 3), async (req, res) => {
  if (req.session.user && (req.session.user.role === 'editor' || req.session.user.role === 'admin')) {
    const { title, description } = req.body;
    const images = req.files.map(file => `uploads/${file.filename}`);
    try {
      await Portfolio.create({ title, description, images });
      res.redirect('/portfolio/admin');
    } catch (err) {
      console.error('Error creating item:', err);
      res.status(500).send('Error creating item');
    }
  } else {
    res.status(403).send('Access denied');
  }
});

// Update a portfolio item
router.post('/update/:id', async (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    const { title, description } = req.body;
    try {
      await Portfolio.findByIdAndUpdate(req.params.id, { title, description, updatedAt: new Date() });
      res.redirect('/portfolio/admin');
    } catch (err) {
      console.error('Error updating item:', err);
      res.status(500).send('Error updating item');
    }
  } else {
    res.status(403).send('Access denied');
  }
});

// Delete a portfolio item
router.post('/delete/:id', async (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    try {
      await Portfolio.findByIdAndDelete(req.params.id);
      res.redirect('/portfolio/admin');
    } catch (err) {
      console.error('Error deleting item:', err);
      res.status(500).send('Error deleting item');
    }
  } else {
    res.status(403).send('Access denied');
  }
});

module.exports = router;
