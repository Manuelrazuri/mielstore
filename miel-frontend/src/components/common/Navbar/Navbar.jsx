import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { useCart } from '../../../hooks/useCart';
import styles from './Navbar.module.scss';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // No logueado
  if (!user) {
    return (
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link to="/" className={styles.brand}>🍯 Miel Store</Link>
          <div className={styles.links}>
            <Link to="/productos">Productos</Link>
            <Link to="/carrito" className={styles.cart}>
              🛒 Carrito
              {getTotalItems() > 0 && <span className={styles.badge}>{getTotalItems()}</span>}
            </Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
          </div>
        </div>
      </nav>
    );
  }

  // Admin
  if (user.rol === 'admin') {
    return (
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link to="/" className={styles.brand}>🍯 Miel Store | Admin</Link>
          <div className={styles.links}>
            <Link to="/admin/dashboard">📊 Dashboard</Link>
            <Link to="/admin/productos">📦 Productos</Link>
            <Link to="/admin/pedidos">📋 Pedidos</Link>
            <Link to="/admin/usuarios">👥 Usuarios</Link>
            <Link to="/admin/fechas-recojo">📅 Fechas recojo</Link>
            <button onClick={handleLogout} className={styles.logout}>Cerrar sesión</button>
            <span className={styles.user}>Hola, {user.nombre}</span>
          </div>
        </div>
      </nav>
    );
  }

  // Cliente normal
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>🍯 Miel Store</Link>
        <div className={styles.links}>
          <Link to="/productos">Productos</Link>
          <Link to="/carrito" className={styles.cart}>
            🛒 Carrito
            {getTotalItems() > 0 && <span className={styles.badge}>{getTotalItems()}</span>}
          </Link>
          <Link to="/mis-pedidos">Mis pedidos</Link>
          <button onClick={handleLogout} className={styles.logout}>Cerrar sesión</button>
          <span className={styles.user}>Hola, {user.nombre}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;