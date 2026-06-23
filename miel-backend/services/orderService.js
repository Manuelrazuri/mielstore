const pool = require('../db/pool');

const crearPedido = async (userId, items, direccion_entrega, tipo_entrega, fecha_entrega, lugar_recojo, metodo_pago, evidencia_pago, numero_operacion) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let totalProductos = 0;
        let subtotal = 0;
        const detalles = [];

        for (const item of items) {
            const [products] = await connection.query(
                'SELECT * FROM Productos WHERE id_producto = ? AND activo = 1 FOR UPDATE',
                [item.id_producto]
            );
            if (products.length === 0) throw new Error('Producto no encontrado o inactivo');
            const product = products[0];
            if (product.stock < item.cantidad) {
                throw new Error(`Stock insuficiente para ${product.variedad} (${product.presentacion})`);
            }
            const cantidad = item.cantidad;
            totalProductos += cantidad;
            const precioUnitario = cantidad >= 6 ? product.precio_mayor : product.precio_normal;
            const subtotalItem = precioUnitario * cantidad;
            subtotal += subtotalItem;
            detalles.push({
                id_producto: item.id_producto,
                cantidad,
                precio_unitario: precioUnitario,
                subtotal: subtotalItem
            });

            await connection.query(
                'UPDATE Productos SET stock = stock - ? WHERE id_producto = ?',
                [cantidad, item.id_producto]
            );
        }

        let costo_envio = 0;
        if (tipo_entrega === 'delivery') {
            costo_envio = totalProductos >= 6 ? 6 : 8;
        }

        const total = subtotal + costo_envio;

        const [orderResult] = await connection.query(
            `INSERT INTO Pedidos 
            (id_usuario, total, direccion_entrega, tipo_entrega, costo_envio, fecha_entrega, lugar_recojo, estado, metodo_pago, evidencia_pago, numero_operacion, estado_pago)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?, ?, 'pendiente')`,
            [userId, total, direccion_entrega || null, tipo_entrega, costo_envio, fecha_entrega, lugar_recojo || null, metodo_pago, evidencia_pago || null, numero_operacion || null]
        );

        const id_pedido = orderResult.insertId;

        for (const detalle of detalles) {
            await connection.query(
                `INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
                 VALUES (?, ?, ?, ?, ?)`,
                [id_pedido, detalle.id_producto, detalle.cantidad, detalle.precio_unitario, detalle.subtotal]
            );
        }

        await connection.commit();
        return { id_pedido, subtotal, costo_envio, total };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getMisPedidos = async (userId) => {
    const [rows] = await pool.query('CALL SP_GetMisPedidos(?)', [userId]);
    return rows[0];
};

const cancelarPedido = async (orderId, userId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [pedidos] = await connection.query(
            'SELECT id_pedido, estado, estado_pago FROM Pedidos WHERE id_pedido = ? AND id_usuario = ?',
            [orderId, userId]
        );
        if (pedidos.length === 0) {
            throw new Error('Pedido no encontrado o no te pertenece');
        }
        const pedido = pedidos[0];
        if (pedido.estado !== 'pendiente') {
            throw new Error('Solo se pueden cancelar pedidos en estado pendiente');
        }
        if (pedido.estado_pago === 'pagado') {
            throw new Error('No se puede cancelar un pedido ya pagado');
        }

        const [detalles] = await connection.query(
            'SELECT id_producto, cantidad FROM DetallePedido WHERE id_pedido = ?',
            [orderId]
        );
        for (const detalle of detalles) {
            await connection.query(
                'UPDATE Productos SET stock = stock + ? WHERE id_producto = ?',
                [detalle.cantidad, detalle.id_producto]
            );
        }

        await connection.query('UPDATE Pedidos SET estado = "cancelado" WHERE id_pedido = ?', [orderId]);

        await connection.commit();
        return { message: 'Pedido cancelado y stock restaurado' };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = { crearPedido, getMisPedidos, cancelarPedido };