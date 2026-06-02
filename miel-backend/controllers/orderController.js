const pool = require('../db/pool');

// Crear un pedido
const crearPedido = async (req, res, next) => {
    const { items, tipo_entrega, fecha_entrega, direccion_entrega, lugar_recojo } = req.body;
    const userId = req.user.id;

    // Validaciones básicas
    if (!items || items.length === 0) return res.status(400).json({ message: 'Carrito vacío' });
    if (tipo_entrega === 'recojo') {
        if (!lugar_recojo || lugar_recojo !== 'Plaza San Miguel') {
            return res.status(400).json({ message: 'El recojo solo es en Plaza San Miguel' });
        }
        if (!fecha_entrega) return res.status(400).json({ message: 'Se requiere fecha para recojo' });
        // Verificar que la fecha esté disponible
        const [fechas] = await pool.query(
            'SELECT disponible FROM FechasRecojo WHERE fecha = ? AND disponible = TRUE',
            [fecha_entrega]
        );
        if (fechas.length === 0) {
            return res.status(400).json({ message: 'Fecha no disponible para recojo' });
        }
    } else if (tipo_entrega === 'delivery') {
        if (!direccion_entrega) return res.status(400).json({ message: 'Dirección requerida para delivery' });
        // La fecha de envío debe ser a partir de mañana (no hoy)
        const hoy = new Date();
        const manana = new Date(hoy.setDate(hoy.getDate() + 1)).toISOString().split('T')[0];
        if (!fecha_entrega || fecha_entrega < manana) {
            return res.status(400).json({ message: 'La fecha de envío debe ser a partir de mañana' });
        }
    } else {
        return res.status(400).json({ message: 'Tipo de entrega inválido' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let totalProductos = 0;
        let subtotalProductos = 0;
        const detalles = [];

        for (const item of items) {
            const [products] = await connection.query(
                'SELECT * FROM Productos WHERE id_producto = ?',
                [item.id_producto]
            );
            if (products.length === 0) throw new Error('Producto no encontrado');
            const product = products[0];
            const cantidad = item.cantidad;
            totalProductos += cantidad;
            const precioUnitario = cantidad >= 6 ? product.precio_mayor : product.precio_normal;
            const subtotal = precioUnitario * cantidad;
            subtotalProductos += subtotal;
            detalles.push({
                id_producto: item.id_producto,
                cantidad,
                precio_unitario: precioUnitario,
                subtotal
            });
        }

        // Calcular costo de envío
        let costo_envio = 0;
        if (tipo_entrega === 'delivery') {
            costo_envio = totalProductos >= 6 ? 6 : 8;
        }

        const total = subtotalProductos + costo_envio;

        const [orderResult] = await connection.query(
            `INSERT INTO Pedidos 
            (id_usuario, total, direccion_entrega, tipo_entrega, costo_envio, fecha_entrega, lugar_recojo, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
            [userId, total, direccion_entrega || null, tipo_entrega, costo_envio, fecha_entrega, lugar_recojo || null]
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
        res.status(201).json({
            message: 'Pedido creado',
            id_pedido,
            subtotal: subtotalProductos,
            costo_envio,
            total
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// Obtener pedidos del usuario
const getMisPedidos = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const [pedidos] = await pool.query(
            `SELECT p.*, 
                    GROUP_CONCAT(CONCAT(d.cantidad, 'x ', pr.nombre) SEPARATOR ', ') as productos
             FROM Pedidos p
             JOIN DetallePedido d ON p.id_pedido = d.id_pedido
             JOIN Productos pr ON d.id_producto = pr.id_producto
             WHERE p.id_usuario = ?
             GROUP BY p.id_pedido
             ORDER BY p.fecha_pedido DESC`,
            [userId]
        );
        res.json(pedidos);
    } catch (error) {
        next(error);
    }
};

module.exports = { crearPedido, getMisPedidos };