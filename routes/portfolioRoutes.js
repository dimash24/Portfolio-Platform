const express = require('express');
const Portfolio = require('../models/Portfolio');
const multer = require('multer');
const roleMiddleware = require('../utils/roleMiddleware'); // Ensure this import is correct
const router = express.Router();
const path = require('path');

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

router.get('/admin', roleMiddleware('admin'), async (req, res) => {
  const items = await Portfolio.find();
  res.render('portfolio/admin', { items });
});

router.post(
  '/create',
  (req, res, next) => {
    if (req.session.user && ['admin', 'editor'].includes(req.session.user.role)) {
      return next();
    }
    res.status(403).send('Access denied');
  },
  upload.array('images', 3),
  async (req, res) => {
    const { title, description } = req.body;
    const images = req.files.map((file) => `uploads/${file.filename}`);
    await Portfolio.create({ title, description, images });
    res.redirect('/portfolio/editor'); 
  }
);


router.post('/update/:id', roleMiddleware('admin'), async (req, res) => {
  const { title, description } = req.body;
  await Portfolio.findByIdAndUpdate(req.params.id, { title, description, updatedAt: new Date() });
  res.redirect('/portfolio/admin');
});

router.post('/delete/:id', roleMiddleware('admin'), async (req, res) => {
  await Portfolio.findByIdAndDelete(req.params.id);
  res.redirect('/portfolio/admin');
});

router.get('/editor', roleMiddleware('admin','editor'), async (req, res) => {
  const items = await Portfolio.find();
  res.render('portfolio/editor, , { items }');
});

module.exports = router;
