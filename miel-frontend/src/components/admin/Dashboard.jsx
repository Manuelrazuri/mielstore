import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import styles from './Dashboard.module.scss';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando estadísticas:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingSpinner}>Cargando estadísticas...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.error}>Error al cargar los datos</div>
      </div>
    );
  }

  const COLORS_PIE = ['#FFB74D', '#FF9800', '#F57C00', '#E65100', '#BF360C'];
  const COLORS_ESTADO = {
    'pendiente': '#FFC107',
    'procesando': '#2196F3',
    'enviado': '#4CAF50',
    'entregado': '#8BC34A',
    'cancelado': '#F44336'
  };

  // Preparar datos para gráfico de productos
  const datosProductos = stats.ventas_por_producto.map(p => ({
    nombre: p.producto.replace('Miel de ', ''),
    unidades: p.unidades_vendidas,
    ingreso: p.ingreso
  }));

  // Preparar datos para gráfico de estado de pedidos
  const datosPedidos = stats.pedidos_por_estado.map(p => ({
    name: p.estado.charAt(0).toUpperCase() + p.estado.slice(1),
    value: p.cantidad,
    color: COLORS_ESTADO[p.estado] || '#9E9E9E'
  }));

  // Datos de tendencia de ventas (simulado - ajusta según tu API)
  const datosTendencia = [
    { fecha: 'Lun', ventas: 250 },
    { fecha: 'Mar', ventas: 420 },
    { fecha: 'Mié', ventas: 320 },
    { fecha: 'Jue', ventas: 640 },
    { fecha: 'Vie', ventas: 890 },
    { fecha: 'Sáb', ventas: 1200 },
    { fecha: 'Dom', ventas: 496 }
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Panel de Administración</h1>
        <p className={styles.fecha}>
          Última actualización: {new Date().toLocaleDateString('es-PE')}
        </p>
      </div>

      {/* KPIs principales */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>💰</div>
          <div className={styles.kpiContent}>
            <h3>Ventas Totales</h3>
            <p className={styles.kpiValue}>S/ {stats.resumen.total_ventas.toLocaleString('es-PE')}</p>
            <span className={styles.kpiChange}>+15% vs última semana</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>📦</div>
          <div className={styles.kpiContent}>
            <h3>Total de Pedidos</h3>
            <p className={styles.kpiValue}>{stats.resumen.total_pedidos}</p>
            <span className={styles.kpiChange}>Activos hoy</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>✅</div>
          <div className={styles.kpiContent}>
            <h3>Pedidos Entregados</h3>
            <p className={styles.kpiValue}>
              {stats.pedidos_por_estado.find(p => p.estado === 'entregado')?.cantidad || 0}
            </p>
            <span className={styles.kpiChange}>Este mes</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>⏳</div>
          <div className={styles.kpiContent}>
            <h3>Pendientes</h3>
            <p className={styles.kpiValue}>
              {stats.pedidos_por_estado.find(p => p.estado === 'pendiente')?.cantidad || 0}
            </p>
            <span className={styles.kpiChange}>Requieren atención</span>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className={styles.chartsGrid}>
        {/* Gráfico de tendencia de ventas */}
        <div className={styles.chartCard}>
          <h3>Tendencia de Ventas (últimos 7 días)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datosTendencia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="fecha" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#FF9800"
                strokeWidth={3}
                dot={{ fill: '#FF9800', r: 5 }}
                activeDot={{ r: 7 }}
                name="Ventas (S/)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de estado de pedidos */}
        <div className={styles.chartCard}>
          <h3>Estado de Pedidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datosPedidos}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {datosPedidos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ventas por producto */}
      <div className={styles.chartCard + ' ' + styles.fullWidth}>
        <h3>Ventas por Producto</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={datosProductos}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <XAxis dataKey="nombre" stroke="#666" />
            <YAxis yAxisId="left" stroke="#666" label={{ value: 'Unidades', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#FF9800" label={{ value: 'Ingreso (S/)', angle: 90, position: 'insideRight' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="unidades" fill="#2196F3" name="Unidades Vendidas" />
            <Bar yAxisId="right" dataKey="ingreso" fill="#FF9800" name="Ingreso (S/)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla detallada */}
      <div className={styles.tableSection}>
        <h3>Detalle de Ventas</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Unidades</th>
              <th>Ingreso</th>
              <th>% del Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.ventas_por_producto.map(p => {
              const porcentaje = ((p.ingreso / stats.resumen.total_ventas) * 100).toFixed(1);
              return (
                <tr key={p.id_producto}>
                  <td className={styles.productName}>{p.producto}</td>
                  <td className={styles.centered}>{p.unidades_vendidas}</td>
                  <td className={styles.amount}>S/ {p.ingreso.toLocaleString('es-PE')}</td>
                  <td>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                      <span>{porcentaje}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;