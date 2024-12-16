const express = require('express');
const router = express.Router();
const { searchProducts } = require('../controllers/product.controller');

// Search products with filters
router.get('/search', searchProducts);

module.exports = router;
