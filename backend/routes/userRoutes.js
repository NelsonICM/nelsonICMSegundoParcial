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

router.get('/', protect, admin, getUsers)

router.route('/:id')
    .put(protect, updateUser)
    .delete(protect, admin, deleteUser)

router.put('/:id/password', protect, updatePassword)
router.put('/:id/admin', protect, admin, setAdmin) 

module.exports = router