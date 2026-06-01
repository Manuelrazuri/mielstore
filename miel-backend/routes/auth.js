const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');

const router = express.Router();

const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
    body('nombre').notEmpty().withMessage('El nombre es requerido')
];

const loginValidation = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
];

router.post('/register', registerValidation, authController.register);
router.post('/login',    loginValidation,    authController.login);

module.exports = router;