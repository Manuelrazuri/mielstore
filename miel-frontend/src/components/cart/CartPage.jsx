import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { AuthContext } from '../../context/AuthContext';
import './CartPage.module.scss';

const CartPage = () => {
  const { cart, updateQuantity, removeItem, getSubtotal, getShippingCost, getTotal } = useCart();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) navigate('/login', { state: { from: '/checkout' } });
    else navigate('/checkout');
  };

  if (cart.length === 0) return <div className="empty-cart">🛒 Tu carrito está vacío</div>;

  return (
    <div className="cart-page">
      <h2>Tu carrito</h2>
      {cart.map(item => {
        const price = item.cantidad >= 6 ? item.precio_mayor : item.precio_normal;
        return (
          <div key={item.id_producto} className="cart-item">
            <div className="item-info">
              <h4>{item.nombre}</h4>
              <p>Precio unit: S/ {price}</p>
            </div>
            <div className="item-controls">
              <button onClick={() => updateQuantity(item.id_producto, item.cantidad - 1)}>-</button>
              <span>{item.cantidad}</span>
              <button onClick={() => updateQuantity(item.id_producto, item.cantidad + 1)}>+</button>
              <button onClick={() => removeItem(item.id_producto)}>Eliminar</button>
            </div>
            <div className="item-total">S/ {(price * item.cantidad).toFixed(2)}</div>
          </div>
        );
      })}
      <div className="cart-summary">
        <p>Subtotal: S/ {getSubtotal().toFixed(2)}</p>
        <p>Envío: S/ {getShippingCost().toFixed(2)}</p>
        <p className="total">Total: S/ {getTotal().toFixed(2)}</p>
        <button onClick={handleCheckout}>Proceder al pago</button>
      </div>
    </div>
  );
};

export default CartPage;