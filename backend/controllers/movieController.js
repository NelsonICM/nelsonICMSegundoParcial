const asyncHandler = require('express-async-handler')
const Movie = require('../models/Movie')
const cloudinary = require('../config/cloudinary')

const getMovies = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit
    const { category, title } = req.query

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
        res.status(400)
        throw new Error('Parámetros de paginación inválidos')
    }

    const finalLimit = Math.min(limit, 50)

    const query = { deleted: false }
    if (category) query.category = category
    if (title) query.title = { $regex: title, $options: 'i' }
    
    const [movies, total] = await Promise.all([
        Movie.find(query)
            .skip(skip)
            .limit(finalLimit)
            .sort({ createdAt: -1 }),
        Movie.countDocuments(query)
    ])

    res.status(200).json({
        success: true,
        data: movies,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / finalLimit),
            totalItems: total,
            itemsPerPage: finalLimit
        }
    })
})

const getMovieById = asyncHandler(async (req, res) => {
    const movie = await Movie.findOne({ _id: req.params.id, deleted: false })
    if (!movie) {
        res.status(404)
        throw new Error('Película no encontrada')
    }
    res.status(200).json({ success: true, data: movie })
})

const createMovie = asyncHandler(async (req, res) => {
    const { title, genre, year, description, category } = req.body

    const yearNumber = Number(year);
    if (isNaN(yearNumber) || yearNumber < 1900 || yearNumber > new Date().getFullYear() + 5) {
        res.status(400);
        throw new Error('El año debe ser un número entre 1900 y el año actual + 5');
    }

    if (!title || !genre || !year || !category) {
        res.status(400)
        throw new Error('Faltan campos requeridos')
    }

    if (!req.file) {
        res.status(400)
        throw new Error('Se requiere una imagen')
    }

    let result
    try {
        result = await cloudinary.uploader.upload(req.file.path)
        const movie = await Movie.create({
            title,
            genre,
            year,
            description,
            imageUrl: result.secure_url,
            category
        });
        res.status(201).json({ success: true, data: movie })
    } catch (error) {
        if (result) await cloudinary.uploader.destroy(result.public_id)
        throw error
    }
})

const updateMovie = asyncHandler(async (req, res) => {
    const { year } = req.body
    const movie = await Movie.findById(req.params.id)

    if (year && (isNaN(year) || year.toString().length !== 4)) {
        res.status(400)
        throw new Error('El año debe ser un número de 4 dígitos')
    }

    if (!movie) {
        res.status(404)
        throw new Error('Película no encontrada')
    }

    const updates = { ...req.body }

    if (req.file) {
        const urlParts = movie.imageUrl.split('/')
        const publicIdWithExtension = urlParts[urlParts.length - 1]
        const publicId = publicIdWithExtension.split('.')[0]
        await cloudinary.uploader.destroy(`moviesgo/${publicId}`)

        const result = await cloudinary.uploader.upload(req.file.path)
        updates.imageUrl = result.secure_url
    }

    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, updates, { 
        new: true,
        runValidators: true 
    })

    res.status(200).json({ success: true, data: updatedMovie })
})

const deleteMovie = asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.id)
    if (!movie) {
        res.status(404)
        throw new Error('Película no encontrada')
    }

    const urlParts = movie.imageUrl.split('/')
    const publicIdWithExtension = urlParts[urlParts.length - 1]
    const publicId = publicIdWithExtension.split('.')[0]

    await movie.softDelete() 
    await cloudinary.uploader.destroy(`moviesgo/${publicId}`)

    res.status(200).json({ 
        success: true, 
        data: { id: req.params.id },
        message: `Película "${movie.title}" eliminada`
    })
})

module.exports = {
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie
}