const express = require('express')
const router = express.Router()
const upload = require('../middleware/uploadMiddleware')
const { protect, admin } = require('../middleware/authMiddleware')
const {
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie
} = require('../controllers/movieController')

router.route('/')
    .get(getMovies)
    .post(protect, admin, upload.single('image'), createMovie)

router.route('/:id')
    .get(getMovieById)
    .put(protect, admin, upload.single('image'), updateMovie)
    .delete(protect, admin, deleteMovie)

module.exports = router