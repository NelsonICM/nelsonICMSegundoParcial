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
    .get(protect, admin, getContactMessages)

router.route('/:id')
    .put(protect, admin, updateContactMessage)
    .delete(protect, admin, deleteContactMessage)

module.exports = router