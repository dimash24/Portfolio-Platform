const express = require('express');
const Portfolio = require('../models/Portfolio');
const multer = require('multer');
const router = express.Router();
const path = require('path');

// Storage setup for file uploads
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Admin route (full CRUD: create, read, update, delete)
router.get('/admin', async (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    const items = await Portfolio.find();
    res.render('portfolio/admin', { items });
  } else {
    res.status(403).send('Access denied');
  }
});

// Editor route (only add items)
router.get('/editor', async (req, res) => {
  if (req.session.user && req.session.user.role === 'editor') {
    const items = await Portfolio.find(); // Editors can also view items
    res.render('portfolio/editor', { items });
  } else {
    res.status(403).send('Access denied');
  }
});

// Create new item (accessible to both admin and editor)
router.post('/create', upload.array('images', 3), async (req, res) => {
  if (
    req.session.user &&
    (req.session.user.role === 'editor' || req.session.user.role === 'admin')
  ) {
    const { title, description } = req.body;
    const images = req.files.map((file) => `uploads/${file.filename}`);
    await Portfolio.create({ title, description, images });
    return req.session.user.role === 'admin'
      ? res.redirect('/portfolio/admin')
      : res.redirect('/portfolio/editor');
  }
  res.status(403).send('Access denied');
});

// Update item (only for admin)
router.post('/update/:id', async (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    const { title, description } = req.body;
    await Portfolio.findByIdAndUpdate(req.params.id, {
      title,
      description,
      updatedAt: new Date(),
    });
    res.redirect('/portfolio/admin');
  } else {
    res.status(403).send('Access denied');
  }
});

// Delete item (only for admin)
router.post('/delete/:id', async (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    await Portfolio.findByIdAndDelete(req.params.id);
    res.redirect('/portfolio/admin');
  } else {
    res.status(403).send('Access denied');
  }
});

module.exports = router;
