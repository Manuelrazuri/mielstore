import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import styles from './PickupDatesAdmin.module.scss';

const PickupDatesAdmin = () => {
  const [dates, setDates] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [available, setAvailable] = useState(true);

  const fetchDates = async () => {
    try {
      const res = await api.get('/admin/fechas-recojo');
      setDates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDates();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newDate) return;
    try {
      await api.post('/admin/fechas-recojo', { fecha: newDate, disponible: available });
      setNewDate('');
      setAvailable(true);
      fetchDates();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al agregar fecha');
    }
  };

  const handleDelete = async (fecha) => {
    if (!window.confirm(`¿Eliminar fecha ${fecha}?`)) return;
    try {
      await api.delete(`/admin/fechas-recojo/${fecha}`);
      fetchDates();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const toggleDisponible = async (fecha, current) => {
    try {
      await api.post('/admin/fechas-recojo', { fecha, disponible: !current });
      fetchDates();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Gestión de fechas de recojo</h2>
      <form onSubmit={handleAdd} className={styles.form}>
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          required
        />
        <label>
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          /> Disponible
        </label>
        <button type="submit">Agregar / Actualizar</button>
      </form>
      <table className={styles.table}>
        <thead>
          <tr><th>Fecha</th><th>Disponible</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {dates.map(d => (
            <tr key={d.fecha}>
              <td>{d.fecha}</td>
              <td>{d.disponible ? 'Sí' : 'No'}</td>
              <td>
                <button onClick={() => toggleDisponible(d.fecha, d.disponible)}>
                  {d.disponible ? 'Deshabilitar' : 'Habilitar'}
                </button>
                <button onClick={() => handleDelete(d.fecha)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PickupDatesAdmin;