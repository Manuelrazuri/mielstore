import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import styles from './MyOrders.module.scss';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/mis-pedidos');
      setOrders(res.data);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('¿Estás seguro de cancelar este pedido?')) return;
    try {
      await api.put(`/orders/${orderId}/cancelar`);
      alert('Pedido cancelado exitosamente');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cancelar el pedido');
    }
  };

  if (loading) return <div className={styles.loading}>Cargando pedidos...</div>;

  return (
    <div className={styles.container}>
      <h2>Mis pedidos</h2>
      {orders.length === 0 ? (
        <p>No has realizado ningún pedido aún.</p>
      ) : (
        <div className={styles.list}>
          {orders.map(order => {
            const isPendientePago = order.estado_pago === 'pendiente' && order.metodo_pago !== 'contraentrega';
            const isContraentrega = order.metodo_pago === 'contraentrega';
            return (
              <div key={order.id_pedido} className={styles.card}>
                <div className={styles.header}>
                  <span>Pedido #{order.id_pedido}</span>
                  <span className={`${styles.status} ${styles[order.estado]}`}>{order.estado}</span>
                </div>
                <div>Fecha: {new Date(order.fecha_pedido).toLocaleDateString()}</div>
                <div>Total: S/ {order.total}</div>
                <div>Entrega: {order.tipo_entrega === 'delivery' ? 'Delivery' : 'Recojo'}</div>
                <div>Pago: {order.metodo_pago === 'contraentrega' ? 'Contraentrega' : order.metodo_pago.toUpperCase()}</div>
                <div>Estado pago: {order.estado_pago}</div>
                <div>Productos: {order.productos}</div>
                {order.evidencia_pago && (
                  <div>
                    <a href={order.evidencia_pago} target="_blank" rel="noopener noreferrer">Ver comprobante</a>
                  </div>
                )}
                {order.estado === 'pendiente' && order.estado_pago !== 'pagado' && (
                  <button onClick={() => handleCancel(order.id_pedido)} className={styles.cancelBtn}>
                    Cancelar pedido
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;