const orderService = require('../services/orderService');

const crearPedido = async (req, res, next) => {
    const userId = req.user.id;
    const { items, direccion_entrega, tipo_entrega, fecha_entrega, lugar_recojo, metodo_pago, numero_operacion } = req.body;
    const evidencia_pago = req.file ? `/uploads/comprobantes/${req.file.filename}` : null;

    // Validaciones
    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Carrito vacío' });
    }
    if (tipo_entrega === 'recojo') {
        if (!lugar_recojo || lugar_recojo !== 'Plaza San Miguel') {
            return res.status(400).json({ message: 'El recojo solo es en Plaza San Miguel' });
        }
        if (!fecha_entrega) return res.status(400).json({ message: 'Se requiere fecha para recojo' });
        if (metodo_pago && metodo_pago !== 'contraentrega') {
            return res.status(400).json({ message: 'Para recojo solo se permite contraentrega' });
        }
    } else if (tipo_entrega === 'delivery') {
        if (!direccion_entrega) return res.status(400).json({ message: 'Dirección requerida para delivery' });
        const hoy = new Date();
        const manana = new Date(hoy.setDate(hoy.getDate() + 1)).toISOString().split('T')[0];
        if (!fecha_entrega || fecha_entrega < manana) {
            return res.status(400).json({ message: 'La fecha de envío debe ser a partir de mañana' });
        }
        if (!metodo_pago || !['yape', 'plin'].includes(metodo_pago)) {
            return res.status(400).json({ message: 'Selecciona Yape o Plin como método de pago' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Debes subir la captura del comprobante de pago' });
        }
        if (!numero_operacion) {
            return res.status(400).json({ message: 'Ingresa el número de operación' });
        }
    } else {
        return res.status(400).json({ message: 'Tipo de entrega inválido' });
    }

    try {
        const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
        const result = await orderService.crearPedido(
            userId,
            parsedItems,
            direccion_entrega,
            tipo_entrega,
            fecha_entrega,
            lugar_recojo,
            metodo_pago,
            evidencia_pago,
            numero_operacion
        );
        res.status(201).json({
            message: 'Pedido creado',
            id_pedido: result.id_pedido,
            subtotal: result.subtotal,
            costo_envio: result.costo_envio,
            total: result.total
        });
    } catch (error) {
        next(error);
    }
};

const getMisPedidos = async (req, res, next) => {
    try {
        const pedidos = await orderService.getMisPedidos(req.user.id);
        res.json(pedidos);
    } catch (error) {
        next(error);
    }
};

const cancelarPedido = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const result = await orderService.cancelarPedido(id, userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = { crearPedido, getMisPedidos, cancelarPedido };