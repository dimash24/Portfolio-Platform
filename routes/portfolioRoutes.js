const express = require('express');
const Portfolio = require('../models/Portfolio');
const multer = require('multer');
const router = express.Router();
const path = require('path');

const storage = multer.diskStorage({
  destination: 'public/uploads/', // Каталог для хранения файлов
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Панель администратора
router.get('/admin', async (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    const items = await Portfolio.find();
    res.render('portfolio/admin', { items });
  } else {
    res.status(403).send('Access denied');
  }
});

// Создание нового элемента
router.post(
  '/create',
  upload.array('images', 3),
  async (req, res) => {
    if (req.session.user && (req.session.user.role === 'editor' || req.session.user.role === 'admin')) {
      const { title, description } = req.body;
      const images = req.files.map(file => `uploads/${file.filename}`); // Формируем относительный путь для хранения
      await Portfolio.create({ title, description, images });
      return res.redirect('/portfolio/admin');
    }
    res.status(403).send('Access denied');
  }
);

// Обновление элемента
router.post('/update/:id', async (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    const { title, description } = req.body;
    await Portfolio.findByIdAndUpdate(req.params.id, { title, description, updatedAt: new Date() });
    res.redirect('/portfolio/admin');
  } else {
    res.status(403).send('Access denied');
  }
});

// Удаление элемента
router.post('/delete/:id', async (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    await Portfolio.findByIdAndDelete(req.params.id);
    res.redirect('/portfolio/admin');
  } else {
    res.status(403).send('Access denied');
  }
});

module.exports = router;
