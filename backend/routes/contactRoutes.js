const express = require('express')
const router = express.Router()
const { protect, admin } = require('../middleware/authMiddleware')
const {
    sendContactMessage,
    getContactMessages,
    updateContactMessage,
    deleteContactMessage
} = require('../controllers/contactController')

router.route('/')
    .post(sendContactMessage)
    .get(protect, getContactMessages)

router.route('/:id')
    .put(protect, updateContactMessage)
    .delete(protect, deleteContactMessage)

module.exports = router