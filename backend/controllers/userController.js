const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const User = require('../models/User')

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { 
        expiresIn: '30d' 
    })
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        res.status(400)
        throw new Error('Faltan campos requeridos')
    }

    if (!validator.isEmail(email)) {
        res.status(400)
        throw new Error('Email inválido')
    }

    if (password.length < 6) {
        res.status(400)
        throw new Error('La contraseña debe tener al menos 6 caracteres')
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400)
        throw new Error('El usuario ya existe')
    }

    const usernameExists = await User.findOne({ username })
    if (usernameExists) {
        res.status(400)
        throw new Error('El nombre de usuario ya está en uso')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
        username,
        email,
        password: hashedPassword
    })

    res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
    })
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400)
        throw new Error('Faltan campos requeridos')
    }

    const user = await User.findOne({ email })
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)
        })
    } else {
        res.status(401)
        throw new Error('Credenciales inválidas')
    }
})

const getUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      res.status(400)
      throw new Error('Parámetros de paginación inválidos')
  }

  const finalLimit = Math.min(limit, 50)

  const [users, total] = await Promise.all([
      User.find().select('-password').skip(skip).limit(finalLimit),
      User.countDocuments()
  ])

  res.status(200).json({
      success: true,
      data: users,
      pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / finalLimit),
          totalItems: total,
          itemsPerPage: finalLimit
      }
  })
})

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id, deleted: false })
    if (!user) {
        res.status(404)
        throw new Error('Usuario no encontrado')
    }

    if (req.user._id.toString() !== req.params.id) {
        res.status(403)
        throw new Error('No autorizado para actualizar este usuario')
    }

    const { username, email } = req.body

    if (username) {
        const usernameExists = await User.findOne({ 
            username, 
            _id: { $ne: req.params.id },
            deleted: false
        })
        if (usernameExists) {
            res.status(400)
            throw new Error('Nombre de usuario ya en uso')
        }
    }

if (email) {
    if (!validator.isEmail(email)) {
        res.status(400)
        throw new Error('Email inválido')
    }

    const emailExists = await User.findOne({ email })
    if (emailExists && emailExists._id.toString() !== req.params.id) {
        res.status(400)
        throw new Error('Email ya registrado')
    }
}

  const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email },
      { new: true, runValidators: true }
  ).select('-password')

  res.status(200).json(updatedUser)
})

const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
        res.status(404)
        throw new Error('Usuario no encontrado')
    }

    if (!newPassword || newPassword.length < 6) {
        res.status(400)
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres')
    }

    if (!(await bcrypt.compare(oldPassword, user.password))) {
        res.status(401)
        throw new Error('Contraseña actual incorrecta')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    await User.findByIdAndUpdate(
        req.params.id, 
        { password: hashedPassword },
        { new: true }
    )
    
    res.status(200).json({ 
        success: true,
        message: 'Contraseña actualizada correctamente' 
    })
})

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        res.status(404)
        throw new Error('Usuario no encontrado')
    }

    await user.softDelete() 
    res.status(200).json({ 
        id: req.params.id,
        message: 'Usuario marcado como eliminado (soft delete)' 
    })
})

module.exports = { 
  registerUser, 
  loginUser, 
  getUsers, 
  updateUser,
  updatePassword,
  deleteUser, 
}