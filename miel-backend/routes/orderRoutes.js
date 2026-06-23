const express = require('express');
const authMiddleware = require('../middleware/auth');
const orderController = require('../controllers/orderController');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', authMiddleware, upload.single('evidencia'), orderController.crearPedido);
router.get('/mis-pedidos', authMiddleware, orderController.getMisPedidos);
router.put('/:id/cancelar', authMiddleware, orderController.cancelarPedido);

module.exports = router;