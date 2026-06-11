import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './LandingPage.module.scss';

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const [variedades, setVariedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const [pedidosLoading, setPedidosLoading] = useState(false);

  // Cargar productos y agrupar por variedad
  useEffect(() => {
    api.get('/products')
      .then(res => {
        const products = res.data;
        const variedadesMap = new Map();

        products.forEach(prod => {
          const variedad = prod.variedad;
          if (!variedadesMap.has(variedad)) {
            variedadesMap.set(variedad, {
              variedad: variedad,
              presentaciones: [],
              precios: [],
              imagen_url: prod.imagen_url || null,
              id: prod.id_producto
            });
          }
          const entry = variedadesMap.get(variedad);
          entry.presentaciones.push(prod.presentacion);
          entry.precios.push(prod.precio_normal);
        });

        // Convertir mapa a array y ordenar
        const variedadesArray = Array.from(variedadesMap.values()).map(v => ({
          ...v,
          precio_min: Math.min(...v.precios),
          precio_max: Math.max(...v.precios),
          presentaciones_text: v.presentaciones.join(', ')
        }));

        setVariedades(variedadesArray);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando productos:', err);
        setLoading(false);
      });
  }, []);

  // Cargar últimos pedidos solo si es admin
  useEffect(() => {
    if (user?.rol === 'admin') {
      setPedidosLoading(true);
      api.get('/admin/pedidos')
        .then(res => {
          const ultimos = res.data.slice(0, 5);
          setUltimosPedidos(ultimos);
        })
        .catch(err => console.error('Error cargando pedidos recientes:', err))
        .finally(() => setPedidosLoading(false));
    }
  }, [user]);

  return (
    <div className={styles.landing}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1>Miel pura de abeja</h1>
        <p>Directo de nuestros apiarios a tu mesa</p>
        <Link to="/productos" className={styles.cta}>Comprar ahora</Link>
      </section>

      {/* Video */}
      <section className={styles.videoSection}>
        <h2>Descubre cómo producimos nuestra miel</h2>
        <div className={styles.videoWrapper}>
          <video className={styles.video} controls preload="metadata">
            <source src="/videos/produccion-miel.mp4" type="video/mp4" />
            Tu navegador no soporta la reproducción de videos.
          </video>
        </div>
      </section>

      {/* Beneficios */}
      <section className={styles.features}>
        <div className={styles.feature}>
          <h3>🐝 100% natural</h3>
          <p>Sin aditivos ni conservantes</p>
        </div>
        <div className={styles.feature}>
          <h3>🚚 Delivery</h3>
          <p>Entregas rápidas a todo Lima</p>
        </div>
        <div className={styles.feature}>
          <h3>🏪 Recojo en los alrededores</h3>
          <p>Plaza San Miguel</p>
        </div>
      </section>

      {/* Variedades de miel (público) */}
      <section className={styles.varieties}>
        <h2>Nuestras variedades de miel</h2>
        {loading ? (
          <p className={styles.loading}>Cargando...</p>
        ) : (
          <div className={styles.cards}>
            {variedades.map(variedad => (
              <div key={variedad.variedad} className={styles.card}>
                <div className={styles.cardImage}>
                  {variedad.imagen_url ? (
                    <img src={variedad.imagen_url} alt={variedad.variedad} />
                  ) : (
                    <div className={styles.imagePlaceholder}>🍯</div>
                  )}
                </div>
                <h3>{variedad.variedad}</h3>
                <p>Presentaciones: {variedad.presentaciones_text}</p>
                <p>Precio desde S/ {variedad.precio_min} hasta S/ {variedad.precio_max}</p>
                <Link to="/productos" className={styles.btnSmall}>Ver productos</Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Precios por presentación (opcional) */}
      <section className={styles.prices}>
        <h2>Precios por presentación</h2>
        <div className={styles.priceCards}>
         <div className={styles.priceCard}>
            <h3>Frasco 1 kg</h3>
            <p>S/ 40 (normal)</p>
            <p>S/ 35 (6+ unidades)</p>
        </div>
        <div className={styles.priceCard}>
            <h3>Frasco ½ kg</h3>
            <p>S/ 28 (normal)</p>
            <p>S/ 25 (6+ unidades)</p>
        </div>
        </div>
      </section>

      {/* Últimos pedidos (solo visible para admin) */}
      {user?.rol === 'admin' && (
        <section className={styles.recentOrders}>
          <h2>Últimos pedidos en la tienda</h2>
          {pedidosLoading ? (
            <p>Cargando pedidos recientes...</p>
          ) : ultimosPedidos.length === 0 ? (
            <p>No hay pedidos aún.</p>
          ) : (
            <div className={styles.ordersList}>
              {ultimosPedidos.map(pedido => (
                <div key={pedido.id_pedido} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span>Pedido #{pedido.id_pedido}</span>
                    <span className={`${styles.status} ${styles[pedido.estado]}`}>{pedido.estado}</span>
                  </div>
                  <div><strong>Cliente:</strong> {pedido.cliente_nombre || 'N/A'}</div>
                  <div><strong>Fecha:</strong> {new Date(pedido.fecha_pedido).toLocaleDateString()}</div>
                  <div><strong>Total:</strong> S/ {pedido.total}</div>
                  <div><strong>Entrega:</strong> {pedido.tipo_entrega === 'delivery' ? 'Delivery' : 'Recojo'}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default LandingPage;