import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useCart } from '../../hooks/useCart';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './Checkout.module.scss';

const Checkout = () => {
  const { cart, getSubtotal, getShippingCost, getTotal, clearCart } = useCart();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tipoEntrega, setTipoEntrega] = useState('delivery');
  const [direccion, setDireccion] = useState(user?.direccion || '');
  const [fecha, setFecha] = useState(null);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tipoEntrega === 'recojo') {
      api.get('/dates/disponibles').then(res => setFechasDisponibles(res.data));
    }
  }, [tipoEntrega]);

  const tileDisabled = ({ date }) => {
    const dateStr = date.toISOString().split('T')[0];
    return !fechasDisponibles.includes(dateStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tipoEntrega === 'recojo' && !fecha) return alert('Selecciona una fecha de recojo');
    if (tipoEntrega === 'delivery' && !direccion) return alert('Ingresa dirección de delivery');

    const items = cart.map(item => ({ id_producto: item.id_producto, cantidad: item.cantidad }));
    const payload = {
      items,
      tipo_entrega: tipoEntrega,
      fecha_entrega: fecha ? fecha.toISOString().split('T')[0] : new Date(Date.now() + 86400000).toISOString().split('T')[0]
    };
    if (tipoEntrega === 'delivery') payload.direccion_entrega = direccion;
    if (tipoEntrega === 'recojo') payload.lugar_recojo = 'Plaza San Miguel';

    setLoading(true);
    try {
      await api.post('/orders', payload);
      alert('¡Pedido realizado con éxito!');
      clearCart();
      navigate('/mis-pedidos');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.checkout}>
      <h2>Finalizar compra</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Tipo de entrega</label>
          <select value={tipoEntrega} onChange={e => setTipoEntrega(e.target.value)}>
            <option value="delivery">Delivery (S/ {getShippingCost()})</option>
            <option value="recojo">Recojo en Plaza San Miguel (gratis)</option>
          </select>
        </div>

        {tipoEntrega === 'delivery' && (
          <div className={styles.field}>
            <label>Dirección de entrega</label>
            <textarea value={direccion} onChange={e => setDireccion(e.target.value)} required rows={3} />
          </div>
        )}

        {tipoEntrega === 'recojo' && (
          <div className={styles.field}>
            <label>Fecha de recojo</label>
            <Calendar
              onChange={setFecha}
              value={fecha}
              tileDisabled={tileDisabled}
              minDate={new Date()}
              className={styles.calendar}
            />
          </div>
        )}

        <div className={styles.summary}>
          <div>Subtotal: S/ {getSubtotal().toFixed(2)}</div>
          <div>Envío: S/ {getShippingCost().toFixed(2)}</div>
          <div className={styles.total}>Total: S/ {getTotal().toFixed(2)}</div>
        </div>

        <button type="submit" disabled={loading} className={styles.btn}>
          {loading ? 'Procesando...' : 'Confirmar pedido'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;