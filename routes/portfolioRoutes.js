const express = require('express');
const Portfolio = require('../models/Portfolio');
const multer = require('multer');
const router = express.Router();
const path = require('path');

// Настройка хранилища для загрузки файлов
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Админ-панель
router.get('/admin', async (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    const items = await Portfolio.find();
    res.render('portfolio/admin', { items });
  } else {
    res.status(403).send('Access denied');
  }
});

// Создание нового элемента портфолио
router.post(
  '/create',
  upload.array('images', 3),
  async (req, res) => {
    if (req.session.user && (req.session.user.role === 'editor' || req.session.user.role === 'admin')) {
      const { title, description } = req.body;
      const images = req.files.map(file => `uploads/${file.filename}`); // Формируем путь к файлам
      try {
        await Portfolio.create({ title, description, images });
        res.redirect('/portfolio/admin');
      } catch (err) {
        console.error('Ошибка при создании элемента:', err);
        res.status(500).send('Ошибка при создании элемента.');
      }
    } else {
      res.status(403).send('Access denied');
    }
  }
);

// Обновление элемента
router.post('/update/:id', async (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    const { title, description } = req.body;
    try {
      await Portfolio.findByIdAndUpdate(req.params.id, { title, description, updatedAt: new Date() });
      res.redirect('/portfolio/admin');
    } catch (err) {
      console.error('Ошибка при обновлении элемента:', err);
      res.status(500).send('Ошибка при обновлении.');
    }
  } else {
    res.status(403).send('Access denied');
  }
});

// Удаление элемента
router.post('/delete/:id', async (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    try {
      await Portfolio.findByIdAndDelete(req.params.id);
      res.redirect('/portfolio/admin');
    } catch (err) {
      console.error('Ошибка при удалении элемента:', err);
      res.status(500).send('Ошибка при удалении.');
    }
  } else {
    res.status(403).send('Access denied');
  }
});

module.exports = router;
