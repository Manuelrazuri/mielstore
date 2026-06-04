import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import styles from './MyOrders.module.scss';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/mis-pedidos')
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando pedidos...</div>;

  return (
    <div className={styles.container}>
      <h2>Mis pedidos</h2>
      {orders.length === 0 ? (
        <p>No has realizado ningún pedido aún.</p>
      ) : (
        <div className={styles.list}>
          {orders.map(order => (
            <div key={order.id_pedido} className={styles.card}>
              <div className={styles.header}>
                <span>Pedido #{order.id_pedido}</span>
                <span className={`${styles.status} ${styles[order.estado]}`}>{order.estado}</span>
              </div>
              <div>Fecha: {new Date(order.fecha_pedido).toLocaleDateString()}</div>
              <div>Total: S/ {order.total}</div>
              <div>Entrega: {order.tipo_entrega === 'delivery' ? 'Delivery' : 'Recojo en Plaza San Miguel'}</div>
              <div>Productos: {order.productos}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;