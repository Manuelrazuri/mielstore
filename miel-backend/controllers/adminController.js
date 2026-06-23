// controllers/adminController.js
const adminService = require('../services/adminService');

const getUsers = async (req, res, next) => {
    try {
        const users = await adminService.getAllUsers();
        res.json(users);
    } catch (error) { next(error); }
};

const updateRole = async (req, res, next) => {
    const { id } = req.params;
    const { rol } = req.body;
    try {
        const result = await adminService.updateUserRole(id, rol);
        res.json(result);
    } catch (error) { next(error); }
};

const getOrders = async (req, res, next) => {
    try {
        const orders = await adminService.getAllOrders();
        res.json(orders);
    } catch (error) { next(error); }
};

const updateOrderStatus = async (req, res, next) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const result = await adminService.updateOrderStatus(id, estado);
        res.json(result);
    } catch (error) { next(error); }
};

const getPickupDates = async (req, res, next) => {
    try {
        const dates = await adminService.getAllPickupDates();
        res.json(dates);
    } catch (error) { next(error); }
};

const upsertPickupDate = async (req, res, next) => {
    const { fecha, disponible } = req.body;
    try {
        const result = await adminService.upsertPickupDate(fecha, disponible);
        res.status(201).json(result);
    } catch (error) { next(error); }
};

const deletePickupDate = async (req, res, next) => {
    const { fecha } = req.params;
    try {
        const result = await adminService.deletePickupDate(fecha);
        res.json(result);
    } catch (error) { next(error); }
};

const getProducts = async (req, res, next) => {
    try {
        const products = await adminService.getAllProducts();
        res.json(products);
    } catch (error) { next(error); }
};

const createProduct = async (req, res, next) => {
    try {
        const result = await adminService.createProduct(req.body);
        res.status(201).json(result);
    } catch (error) { next(error); }
};

const updateProduct = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await adminService.updateProduct(id, req.body);
        res.json(result);
    } catch (error) { next(error); }
};

const deleteProduct = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await adminService.deleteProduct(id);
        res.json(result);
    } catch (error) { next(error); }
};

const getStats = async (req, res, next) => {
    try {
        const stats = await adminService.getStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

const updatePaymentStatus = async (req, res, next) => {
    const { id } = req.params;
    const { estado_pago } = req.body;
    try {
        const result = await adminService.updatePaymentStatus(id, estado_pago);
        res.json(result);
    } catch (error) { next(error); }
};
module.exports = {
    getUsers,
    updateRole,
    getOrders,
    updateOrderStatus,
    getPickupDates,
    upsertPickupDate,
    deletePickupDate,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getStats,
    updatePaymentStatus
};