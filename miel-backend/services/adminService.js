// services/adminService.js
const pool = require('../db/pool');

// Usuarios
const getAllUsers = async () => {
    const [rows] = await pool.query('CALL SP_Admin_GetAllUsers()');
    return rows[0];
};

const updateUserRole = async (userId, newRole) => {
    const [result] = await pool.query('CALL SP_Admin_UpdateUserRole(?, ?)', [userId, newRole]);
    return { message: result[0][0]?.message || 'Rol actualizado' };
};

// Pedidos
const getAllOrders = async () => {
    const [rows] = await pool.query('CALL SP_Admin_GetAllOrders()');
    return rows[0];
};

const updateOrderStatus = async (orderId, status) => {
    const [result] = await pool.query('CALL SP_Admin_UpdateOrderStatus(?, ?)', [orderId, status]);
    return { message: result[0][0]?.message || 'Estado actualizado' };
};

// Fechas de recojo
const getAllDates = async () => {
    const [rows] = await pool.query('CALL SP_Admin_GetAllDates()');
    return rows[0];
};

const upsertDate = async (fecha, disponible = true) => {
    const [result] = await pool.query('CALL SP_Admin_UpsertDate(?, ?)', [fecha, disponible]);
    return { message: result[0][0]?.message || 'Fecha procesada' };
};

const deleteDate = async (fecha) => {
    const [result] = await pool.query('CALL SP_Admin_DeleteDate(?)', [fecha]);
    return { message: result[0][0]?.message || 'Fecha eliminada lógicamente' };
};

// Productos
const getAllProducts = async () => {
    const [rows] = await pool.query('CALL SP_Admin_GetAllProducts()');
    return rows[0];
};

const createProduct = async (productData) => {
    const { variedad, presentacion, precio_normal, precio_mayor, stock } = productData;
    const [result] = await pool.query(
        'CALL SP_Admin_CreateProduct(?, ?, ?, ?, ?)',
        [variedad, presentacion, precio_normal, precio_mayor, stock]
    );
    const newId = result[0][0]?.new_id;
    return { id: newId, message: 'Producto creado' };
};

const updateProduct = async (id, productData) => {
    const { variedad, presentacion, precio_normal, precio_mayor, stock } = productData;
    const [result] = await pool.query(
        'CALL SP_Admin_UpdateProduct(?, ?, ?, ?, ?, ?)',
        [id, variedad, presentacion, precio_normal, precio_mayor, stock]
    );
    const affected = result[0][0]?.affected_rows;
    if (affected === 0) throw new Error('Producto no encontrado o ya eliminado');
    return { message: result[0][0]?.message || 'Producto actualizado' };
};

const deleteProduct = async (id) => {
    const [result] = await pool.query('CALL SP_Admin_DeleteProduct(?)', [id]);
    return { message: result[0][0]?.message || 'Producto eliminado lógicamente' };
};

const getStats = async () => {
    const [results] = await pool.query('CALL SP_Admin_GetStats()');
    const stats = {
        resumen: results[0][0] || { total_ventas: 0, total_pedidos: 0 },
        pedidos_por_estado: results[1] || [],
        ventas_por_producto: results[2] || [],
        ventas_por_distrito: results[3] || [],
        ventas_por_tipo_entrega: results[4] || [],
        top_productos: results[5] || []
    };
    
    return stats;
};

const updatePaymentStatus = async (orderId, status) => {
    const [result] = await pool.query('CALL SP_Admin_UpdatePaymentStatus(?, ?)', [orderId, status]);
    return { message: result[0][0]?.message || 'Estado de pago actualizado' };
};

module.exports = {
    getAllUsers,
    updateUserRole,
    getAllOrders,
    updateOrderStatus,
    getAllDates,
    upsertDate,
    deleteDate,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getStats,
    updatePaymentStatus
};