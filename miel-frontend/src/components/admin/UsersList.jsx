import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import styles from './UsersList.module.scss';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/usuarios');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/usuarios/${userId}/rol`, { rol: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cambiar rol');
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;

  return (
    <div className={styles.container}>
      <h2>Gestión de usuarios</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Fecha registro</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id_usuario}>
              <td>{user.id_usuario}</td>
              <td>{user.nombre}</td>
              <td>{user.email}</td>
              <td className={user.rol === 'admin' ? styles.admin : styles.client}>{user.rol}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                <select
                  value={user.rol}
                  onChange={(e) => updateRole(user.id_usuario, e.target.value)}
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList;