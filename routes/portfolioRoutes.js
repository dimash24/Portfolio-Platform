const express = require('express');
const Portfolio = require('../models/Portfolio');
const multer = require('multer');
const { roleMiddleware } = require('../utils/roleMiddleware');
const router = express.Router();
const path = require('path');

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

router.get('/admin', roleMiddleware('admin'), async (req, res) => {
  const items = await Portfolio.find();
  res.render('portfolio/admin', { items });
});

router.post('/create', roleMiddleware('editor'), upload.array('images', 3), async (req, res) => {
  const { title, description } = req.body;
  const images = req.files.map(file => file.path);
  await Portfolio.create({ title, description, images });
  res.redirect('/portfolio/admin');
});

router.post('/update/:id', roleMiddleware('admin'), async (req, res) => {
  const { title, description } = req.body;
  await Portfolio.findByIdAndUpdate(req.params.id, { title, description, updatedAt: new Date() });
  res.redirect('/portfolio/admin');
});

router.post('/delete/:id', roleMiddleware('admin'), async (req, res) => {
  await Portfolio.findByIdAndDelete(req.params.id);
  res.redirect('/portfolio/admin');
});

router.get('/editor', roleMiddleware('editor'), async (req, res) => {
  res.render('portfolio/editor');
});

module.exports = router;
