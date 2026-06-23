// routes/adminRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Todas las rutas requieren autenticación y rol admin
router.use(authMiddleware, adminMiddleware);

// Gestión de usuarios
router.get('/usuarios', adminController.getUsers);
router.put('/usuarios/:id/rol', adminController.updateRole);

// Gestión de pedidos
router.get('/pedidos', adminController.getOrders);
router.put('/pedidos/:id/estado', adminController.updateOrderStatus);

// Gestión de fechas de recojo
router.get('/fechas-recojo', adminController.getPickupDates);
router.post('/fechas-recojo', adminController.upsertPickupDate);
router.delete('/fechas-recojo/:fecha', adminController.deletePickupDate);

// CRUD de productos (admin puede hacer todo, pero también hay rutas públicas para listar)
router.get('/productos', adminController.getProducts);
router.post('/productos', adminController.createProduct);
router.put('/productos/:id', adminController.updateProduct);
router.delete('/productos/:id', adminController.deleteProduct);
router.get('/stats', adminController.getStats);
router.put('/pedidos/:id/pagar', adminController.updatePaymentStatus);

module.exports = router;