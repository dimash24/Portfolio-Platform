const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  images: [String], // Array of image paths
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);

