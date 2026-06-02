const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.getAll);
router.post('/calcular-precio', productController.calcularPrecio);

module.exports = router;