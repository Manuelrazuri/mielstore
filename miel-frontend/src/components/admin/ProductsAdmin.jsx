import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import styles from './ProductsAdmin.module.scss';

const ProductsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    tipo: '1kg',
    precio_normal: '',
    precio_mayor: '',
    stock: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/productos');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/admin/productos/${editingId}`, form);
      } else {
        await api.post('/admin/productos', form);
      }
      setForm({ nombre: '', tipo: '1kg', precio_normal: '', precio_mayor: '', stock: '' });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar lógicamente este producto?')) return;
    try {
      await api.delete(`/admin/productos/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id_producto);
    setForm({
      nombre: product.nombre,
      tipo: product.tipo,
      precio_normal: product.precio_normal,
      precio_mayor: product.precio_mayor,
      stock: product.stock
    });
  };

  return (
    <div className={styles.container}>
      <h2>Gestión de Productos</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
          <option value="1kg">1kg</option>
          <option value="1/2kg">1/2kg</option>
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Precio normal"
          value={form.precio_normal}
          onChange={(e) => setForm({ ...form, precio_normal: e.target.value })}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Precio mayor"
          value={form.precio_mayor}
          onChange={(e) => setForm({ ...form, precio_mayor: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          required
        />
        <div className={styles.buttons}>
          <button type="submit" disabled={loading}>
            {editingId ? 'Actualizar' : 'Crear'}
          </button>
          {editingId && (
            <button type="button" onClick={() => {
              setEditingId(null);
              setForm({ nombre: '', tipo: '1kg', precio_normal: '', precio_mayor: '', stock: '' });
            }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Tipo</th><th>Precio normal</th><th>Precio mayor</th><th>Stock</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id_producto}>
              <td>{p.id_producto}</td>
              <td>{p.nombre}</td>
              <td>{p.tipo}</td>
              <td>S/ {p.precio_normal}</td>
              <td>S/ {p.precio_mayor}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Editar</button>
                <button onClick={() => handleDelete(p.id_producto)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsAdmin;