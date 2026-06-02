const pool = require('../db/pool');
const { resolverPrecioUnitario } = require('./productService');

const crearPedido = async ({ userId, items, direccion_entrega }) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Calcular total de unidades del carrito para aplicar precio mayorista
        const cantidadTotal = items.reduce((sum, item) => sum + item.cantidad, 0);

        let total = 0;
        const detalles = [];

        for (const item of items) {
            const [products] = await connection.query(
                'SELECT * FROM Productos WHERE id_producto = ?',
                [item.id_producto]
            );

            if (products.length === 0) {
                const error = new Error(`Producto ${item.id_producto} no encontrado`);
                error.statusCode = 404;
                throw error;
            }

            const product = products[0];
            const precioUnitario = resolverPrecioUnitario(product, cantidadTotal);
            const subtotal = precioUnitario * item.cantidad;
            total += subtotal;

            detalles.push({
                id_producto: item.id_producto,
                cantidad: item.cantidad,
                precio_unitario: precioUnitario,
                subtotal
            });
        }

        const [orderResult] = await connection.query(
            'INSERT INTO Pedidos (id_usuario, total, direccion_entrega) VALUES (?, ?, ?)',
            [userId, total, direccion_entrega]
        );

        const id_pedido = orderResult.insertId;

        for (const detalle of detalles) {
            await connection.query(
                'INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                [id_pedido, detalle.id_producto, detalle.cantidad, detalle.precio_unitario, detalle.subtotal]
            );
        }

        await connection.commit();

        return { id_pedido, total, estado: 'pendiente' };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getMisPedidos = async (userId) => {
    const [orders] = await pool.query(
        `SELECT p.*,
                GROUP_CONCAT(CONCAT(d.cantidad, 'x ', pr.nombre) SEPARATOR ', ') as productos
         FROM Pedidos p
         JOIN DetallePedido d  ON p.id_pedido  = d.id_pedido
         JOIN Productos pr     ON d.id_producto = pr.id_producto
         WHERE p.id_usuario = ?
         GROUP BY p.id_pedido
         ORDER BY p.fecha_pedido DESC`,
        [userId]
    );
    return orders;
};

module.exports = { crearPedido, getMisPedidos };