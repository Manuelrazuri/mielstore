const pool = require('../db/pool');

const getFechasDisponibles = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT fecha FROM FechasRecojo WHERE disponible = TRUE AND fecha >= CURDATE() ORDER BY fecha'
        );
        res.json(rows.map(r => r.fecha));
    } catch (error) {
        next(error);
    }
};

module.exports = { getFechasDisponibles };