const pool = require('../db/pool');

// Obtener todos los productos
const getAll = async (req, res, next) => {
    try {
        const [products] = await pool.query('SELECT * FROM Productos WHERE stock > 0');
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// Calcular precio por cantidad (usando SP o lógica directa)
const calcularPrecio = async (req, res, next) => {
    const { tipo, cantidad } = req.body;
    let precio;
    if (cantidad >= 6) {
        precio = tipo === '1kg' ? 40.00 : 25.00;
    } else {
        precio = tipo === '1kg' ? 45.00 : 30.00;
    }
    res.json({ precio });
};

module.exports = { getAll, calcularPrecio };