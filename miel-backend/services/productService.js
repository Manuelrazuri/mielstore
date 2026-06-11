const pool = require('../db/pool');

const UMBRAL_MAYORISTA = 6;

const getAll = async () => {
    const [products] = await pool.query(
        'SELECT * FROM Productos WHERE activo = 1 AND stock > 0'
    );
    return products;
};

const calcularPrecio = async ({ tipo, cantidad }) => {
    let precio;
    if (cantidad >= UMBRAL_MAYORISTA) {
        precio = tipo === '1kg' ? 35.00 : 25.00;
    } else {
        precio = tipo === '1kg' ? 40.00 : 28.00;
    }
    return precio;
};

const resolverPrecioUnitario = (product, cantidadTotal) => {
    const esMayorista = cantidadTotal >= UMBRAL_MAYORISTA;
    return esMayorista ? product.precio_mayor : product.precio_normal;
};

module.exports = { getAll, calcularPrecio, resolverPrecioUnitario, UMBRAL_MAYORISTA };