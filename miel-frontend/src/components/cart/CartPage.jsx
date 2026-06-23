import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { AuthContext } from '../../context/AuthContext';
import styles from './CartPage.module.scss';

const CartPage = () => {
  const { cart, updateQuantity, removeItem, getSubtotal, getShippingCost, getTotal } = useCart();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) navigate('/login', { state: { from: '/checkout' } });
    else navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <div className={styles.emptyIcon}>🛒</div>
        <h2>Tu carrito está vacío</h2>
        <p>¡Explora nuestras mieles y agrega tus favoritas!</p>
        <button onClick={() => navigate('/productos')} className={styles.shopBtn}>
          Ver productos
        </button>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <h2>Tu carrito de compras</h2>
      <div className={styles.cartItems}>
        {cart.map(item => {
          const price = item.cantidad >= 6 ? item.precio_mayor : item.precio_normal;
          const itemTotal = price * item.cantidad;
          const nombreProducto = item.variedad || item.nombre || 'Producto';
          const presentacion = item.presentacion || '';

          return (
            <div key={item.id_producto} className={styles.cartItem}>
              <div className={styles.itemInfo}>
                <div className={styles.itemIcon}>🍯</div>
                <div className={styles.itemDetails}>
                  <h4>{nombreProducto} {presentacion && `(${presentacion})`}</h4>
                  <p className={styles.itemMeta}>
                    <span className={styles.unitPrice}>S/ {price.toFixed(2)} c/u</span>
                  </p>
                  {item.cantidad >= 6 && (
                    <span className={styles.wholesaleBadge}>✨ Precio mayor</span>
                  )}
                </div>
              </div>
              <div className={styles.itemControls}>
                <div className={styles.qtyControls}>
                  <button onClick={() => updateQuantity(item.id_producto, item.cantidad - 1)}>-</button>
                  <span className={styles.qty}>{item.cantidad}</span>
                  <button onClick={() => updateQuantity(item.id_producto, item.cantidad + 1)}>+</button>
                </div>
                <div className={styles.itemTotal}>S/ {itemTotal.toFixed(2)}</div>
                <button onClick={() => removeItem(item.id_producto)} className={styles.removeBtn}>
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.cartSummary}>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>S/ {getSubtotal().toFixed(2)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Envío</span>
          <span>S/ {getShippingCost().toFixed(2)}</span>
        </div>
        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
          <span>Total</span>
          <span>S/ {getTotal().toFixed(2)}</span>
        </div>
        <button onClick={handleCheckout} className={styles.checkoutBtn}>
          Proceder al pago
        </button>
      </div>
    </div>
  );
};

export default CartPage;