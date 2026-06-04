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
          {user ? (
            <>
              {user.rol === 'admin' && <Link to="/admin/dashboard">Dashboard</Link>}
              <Link to="/mis-pedidos">Mis pedidos</Link>
              <button onClick={handleLogout} className={styles.logout}>Cerrar sesión</button>
              <span className={styles.user}>Hola, {user.nombre}</span>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Registro</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;