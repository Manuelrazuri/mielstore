const pool = require('../db/pool');

// Obtener solo productos activos y con stock
const getAll = async (req, res, next) => {
    try {
        const [products] = await pool.query(
            'SELECT * FROM Productos WHERE activo = 1 AND stock > 0'
        );
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// Calcular precio según cantidad (umbral 6)
const calcularPrecio = async (req, res, next) => {
    const { tipo, cantidad } = req.body;
    let precio;
    if (cantidad >= 6) {
        precio = tipo === '1kg' ? 35.00 : 25.00;
    } else {
        precio = tipo === '1kg' ? 40.00 : 28.00;
    }
    res.json({ precio });
};

module.exports = { getAll, calcularPrecio };