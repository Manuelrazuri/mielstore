const pool = require('../db/pool');

// Regla de negocio central: >= 5 unidades = precio mayorista
const UMBRAL_MAYORISTA = 5;

const getAll = async () => {
    const [products] = await pool.query(
        'SELECT * FROM Productos WHERE stock > 0'
    );
    return products;
};

const calcularPrecio = async ({ tipo, cantidad }) => {
    const [result] = await pool.query(
        'CALL CalcularPrecioProducto(?, ?, @precio)',
        [tipo, cantidad]
    );
    const [precio] = await pool.query('SELECT @precio as precio');
    return precio[0].precio;
};

// Determina el precio correcto para un producto según la cantidad total del carrito
const resolverPrecioUnitario = (product, cantidadTotal) => {
    const esMayorista = cantidadTotal >= UMBRAL_MAYORISTA;
    return esMayorista ? product.precio_mayor : product.precio_normal;
};

module.exports = { getAll, calcularPrecio, resolverPrecioUnitario, UMBRAL_MAYORISTA };