import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useCart } from '../../hooks/useCart';
import styles from './ProductList.module.scss';
import ProductCard from './ProductCard';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Cargando productos...</div>;

  return (
    <div className={styles.container}>
      <h2>Nuestras mieles</h2>
      <div className={styles.grid}>
        {products.map(p => (
          <ProductCard key={p.id_producto} product={p} addToCart={addItem} />
        ))}
      </div>
      <div className={styles.infoMayor}>
        <p>✨ OFERTA POR MAYOR ✨</p>
        <p>Lleva 6 o más unidades de un mismo producto y paga precio especial (1kg: S/40, 1/2kg: S/25).</p>
      </div>
    </div>
  );
};

export default ProductList;