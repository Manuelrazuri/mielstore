const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const register = async (userData) => {
    const { nombre, email, password, direccion, telefono } = userData;

    // Verificar si el email ya existe
    const [existing] = await pool.query('SELECT id_usuario FROM Usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
        const error = new Error('El email ya está registrado');
        error.statusCode = 400;
        throw error;
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario
    const [result] = await pool.query(
        `INSERT INTO Usuarios (nombre, email, password, direccion, telefono, rol)
         VALUES (?, ?, ?, ?, ?, 'cliente')`,
        [nombre, email, hashedPassword, direccion || null, telefono || null]
    );

    // Generar token JWT
    const token = jwt.sign(
        { id: result.insertId, email, rol: 'cliente' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return {
        token,
        user: {
            id: result.insertId,
            nombre,
            email,
            rol: 'cliente'
        }
    };
};

const login = async (credentials) => {
    const { email, password } = credentials;

    const [users] = await pool.query('SELECT * FROM Usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401;
        throw error;
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        { id: user.id_usuario, email: user.email, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return {
        token,
        user: {
            id: user.id_usuario,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol
        }
    };
};

module.exports = { register, login };