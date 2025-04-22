const asyncHandler = require('express-async-handler')
const validator = require('validator')
const Contact = require('../models/Contact')

const sendContactMessage = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body
    
    if (!name || !email || !message) {
        res.status(400)
        throw new Error('Faltan campos requeridos')
    }

    if (!validator.isEmail(email)) {
        res.status(400)
        throw new Error('Email no válido')
    }

    const contactMessage = await Contact.create({ name, email, message })
    res.status(201).json(contactMessage)
})

const getContactMessages = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
        res.status(400)
        throw new Error('Parámetros de paginación inválidos')
    }

    const finalLimit = Math.min(limit, 50)

    const [messages, total] = await Promise.all([
        Contact.find({ deleted: false }).sort({ createdAt: -1 }).skip(skip).limit(finalLimit),
        Contact.countDocuments({ deleted: false })
    ])

    res.status(200).json({
        success: true,
        data: messages,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / finalLimit),
            totalItems: total,
            itemsPerPage: finalLimit
        }
    })
})

const updateContactMessage = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body 
    const msgToUpdate = await Contact.findOne({ _id: req.params.id, deleted: false })
    
    if (!msgToUpdate) {
        res.status(404)
        throw new Error('Mensaje no encontrado')
    }
    
    if (!name || !email || !message) {
        res.status(400)
        throw new Error('Faltan campos requeridos')
    }

    if (!validator.isEmail(email)) {
        res.status(400)
        throw new Error('Email no válido')
    }

    const updatedMessage = await Contact.findByIdAndUpdate(
        req.params.id,
        { name, email, message },
        { new: true, runValidators: true }
    )

    res.status(200).json(updatedMessage)
})

const deleteContactMessage = asyncHandler(async (req, res) => {
    const message = await Contact.findById(req.params.id)

    if (!message) {
        res.status(404)
        throw new Error('Mensaje no encontrado')
    }

    await message.softDelete() 
    res.status(200).json({ 
        id: req.params.id, 
        message: 'Mensaje marcado como eliminado (soft delete)' 
    })
})

module.exports = { 
    sendContactMessage, 
    getContactMessages, 
    updateContactMessage, 
    deleteContactMessage 
}