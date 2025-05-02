const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/User')

const protect = asyncHandler(async (req, res, next) => {
    if (!req.headers.authorization?.startsWith('Bearer')) {
        res.status(401)
        throw new Error('Acceso no autorizado, token no proporcionado')
    }

    const token = req.headers.authorization.split(' ')[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-password')
        next()
    } catch (error) {
        console.error('Error en verificación de token:', error)
        res.status(401)
        throw new Error('Token inválido o expirado')
    }
})

module.exports = { protect }