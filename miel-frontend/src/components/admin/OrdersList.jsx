import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import styles from './OrdersList.module.scss';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/pedidos');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/admin/pedidos/${id}/estado`, { estado: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar estado');
    }
  };

  if (loading) return <div>Cargando pedidos...</div>;

  return (
    <div className={styles.container}>
      <h2>Todos los pedidos</h2>
      {orders.length === 0 ? (
        <p>No hay pedidos aún.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Entrega</th><th>Estado</th><th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id_pedido}>
                <td>{order.id_pedido}</td>
                <td>{order.cliente_nombre}<br/><small>{order.email}</small></td>
                <td>{new Date(order.fecha_pedido).toLocaleDateString()}</td>
                <td>S/ {order.total}</td>
                <td>{order.tipo_entrega === 'delivery' ? 'Delivery' : 'Recojo'}</td>
                <td className={styles[order.estado]}>{order.estado}</td>
                <td>
                  <select
                    value={order.estado}
                    onChange={(e) => updateStatus(order.id_pedido, e.target.value)}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="pagado">Pagado</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersList;