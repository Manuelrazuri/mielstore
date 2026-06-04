import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.scss';

const LandingPage = () => {
  return (
    <div className={styles.landing}>
      <section className={styles.hero}>
        <h1>Miel pura de abeja</h1>
        <p>Directo de nuestros apiarios a tu mesa</p>
        <Link to="/productos" className={styles.cta}>Comprar ahora</Link>
      </section>
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
      <section className={styles.preview}>
        <h2>Nuestros productos</h2>
        <div className={styles.cards}>
          <div className={styles.card}>
            <h3>Miel 1kg</h3>
            <p>Precio: S/ 45</p>
            <p>Mayor (6+): S/ 40 c/u</p>
          </div>
          <div className={styles.card}>
            <h3>Miel 1/2kg</h3>
            <p>Precio: S/ 30</p>
            <p>Mayor (6+): S/ 25 c/u</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;