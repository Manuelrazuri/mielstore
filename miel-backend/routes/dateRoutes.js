const express = require('express');
const dateController = require('../controllers/dateController');
const router = express.Router();

router.get('/disponibles', dateController.getFechasDisponibles);

module.exports = router;