// ProductCard.jsx

import React, { useState } from 'react';
import styles from './ProductCard.module.scss';

const ProductCard = ({ product, addToCart }) => {
  const [cantidad, setCantidad] = useState(1);
  const price = cantidad >= 6 ? product.precio_mayor : product.precio_normal;
  const total = price * cantidad;

  return (
    <div className={styles.card}>
      <div className={styles.icon}>🍯</div>
      <h3>{product.nombre}</h3>
      <p>Stock: {product.stock}</p>
      <div className={styles.prices}>
        <span>Normal: S/ {product.precio_normal}</span>
        <span className={styles.wholesale}>Mayor (6+): S/ {product.precio_mayor}</span>
      </div>
      <div className={styles.quantity}>
        <label>Cantidad:</label>
        <input
          type="number"
          min="1"
          max={product.stock}
          value={cantidad}
          onChange={e => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
        />
      </div>
      <div className={styles.total}>Total: S/ {total.toFixed(2)}</div>
      <button className={styles.btn} onClick={() => addToCart(product, cantidad)}>
        Agregar al carrito
      </button>
    </div>
  );
};

export default ProductCard;