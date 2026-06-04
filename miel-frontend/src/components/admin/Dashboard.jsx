import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import styles from './Dashboard.scss';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data));
  }, []);

  if (!stats) return <div>Cargando estadísticas...</div>;

  return (
    <div className={styles.dashboard}>
      <h1>Panel de Administración</h1>
      <div className={styles.cards}>
        <div className={styles.card}>Ventas totales: S/ {stats.resumen.total_ventas}</div>
        <div className={styles.card}>Total pedidos: {stats.resumen.total_pedidos}</div>
      </div>
      <section>
        <h3>Pedidos por estado</h3>
        <ul>
          {stats.pedidos_por_estado.map(p => <li key={p.estado}>{p.estado}: {p.cantidad}</li>)}
        </ul>
      </section>
      <section>
        <h3>Ventas por producto</h3>
        <table className={styles.table}>
          <thead><tr><th>Producto</th><th>Unidades</th><th>Ingreso</th></tr></thead>
          <tbody>
            {stats.ventas_por_producto.map(p => (
              <tr key={p.id_producto}>
                <td>{p.producto}</td><td>{p.unidades_vendidas}</td><td>S/ {p.ingreso}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {/* más secciones: ventas por distrito, tipo entrega, top productos */}
    </div>
  );
};

export default Dashboard;