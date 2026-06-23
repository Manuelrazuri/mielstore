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
  const [metodoPago, setMetodoPago] = useState('');
  const [numeroOperacion, setNumeroOperacion] = useState('');
  const [evidencia, setEvidencia] = useState(null);

  useEffect(() => {
    if (tipoEntrega === 'recojo') {
      api.get('/dates/disponibles').then(res => setFechasDisponibles(res.data));
      setMetodoPago('contraentrega');
    } else {
      setMetodoPago('');
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
    if (tipoEntrega === 'delivery' && !metodoPago) return alert('Selecciona un método de pago');
    if (tipoEntrega === 'delivery' && !numeroOperacion) return alert('Ingresa el número de operación');
    if (tipoEntrega === 'delivery' && !evidencia) return alert('Sube la captura del comprobante de pago');

    const items = cart.map(item => ({ id_producto: item.id_producto, cantidad: item.cantidad }));
    const formData = new FormData();
    formData.append('items', JSON.stringify(items));
    formData.append('tipo_entrega', tipoEntrega);
    const fechaEntrega = fecha ? fecha.toISOString().split('T')[0] : new Date(Date.now() + 86400000).toISOString().split('T')[0];
    formData.append('fecha_entrega', fechaEntrega);
    if (tipoEntrega === 'delivery') {
      formData.append('direccion_entrega', direccion);
      formData.append('metodo_pago', metodoPago);
      formData.append('numero_operacion', numeroOperacion);
      formData.append('evidencia', evidencia);
    }
    if (tipoEntrega === 'recojo') {
      formData.append('lugar_recojo', 'Plaza San Miguel');
      formData.append('metodo_pago', 'contraentrega');
    }

    setLoading(true);
    try {
      await api.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
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
          <>
            <div className={styles.field}>
              <label>Dirección de entrega</label>
              <textarea value={direccion} onChange={e => setDireccion(e.target.value)} required rows={3} />
            </div>
            <div className={styles.field}>
              <label>Método de pago</label>
              <div className={styles.paymentOptions}>
                <label>
                  <input
                    type="radio"
                    name="metodoPago"
                    value="yape"
                    checked={metodoPago === 'yape'}
                    onChange={() => setMetodoPago('yape')}
                  /> Yape
                </label>
                <label>
                  <input
                    type="radio"
                    name="metodoPago"
                    value="plin"
                    checked={metodoPago === 'plin'}
                    onChange={() => setMetodoPago('plin')}
                  /> Plin
                </label>
              </div>
            </div>
            <div className={styles.field}>
              <label>Número de operación</label>
              <input
                type="text"
                placeholder="Ej: 1234567890"
                value={numeroOperacion}
                onChange={e => setNumeroOperacion(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Captura del comprobante (imagen)</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setEvidencia(e.target.files[0])}
                required
              />
            </div>
          </>
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
            <p className={styles.note}>Pago contraentrega en Plaza San Miguel.</p>
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