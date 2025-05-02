const express = require('express')
const router = express.Router()
const { protect, admin } = require('../middleware/authMiddleware')
const {
    registerUser,
    loginUser,
    getUsers,
    updateUser,
    updatePassword,
    deleteUser,
    setAdmin
} = require('../controllers/userController')

router.post('/', registerUser)
router.post('/login', loginUser)

router.get('/', protect, getUsers)

router.route('/:id')
    .put(protect, updateUser)
    .delete(protect, deleteUser)

router.put('/:id/password', protect, updatePassword)

module.exports = router