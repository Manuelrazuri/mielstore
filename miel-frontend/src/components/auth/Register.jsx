import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Register.scss';

const Register = () => {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', direccion: '', telefono: '' });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error en registro');
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Registro</h2>
        {error && <div className="error">{error}</div>}
        <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Contraseña (mín 6)" onChange={handleChange} required />
        <input name="direccion" placeholder="Dirección (opcional)" onChange={handleChange} />
        <input name="telefono" placeholder="Teléfono (opcional)" onChange={handleChange} />
        <button type="submit">Registrarse</button>
        <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </form>
    </div>
  );
};

export default Register;