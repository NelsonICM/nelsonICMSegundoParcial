const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'El título es requerido'],
        trim: true
    },
    genre: { 
        type: String, 
        required: [true, 'El género es requerido'],
        trim: true
    },
    year: { 
        type: Number, 
        required: [true, 'El año es requerido'],
        min: [1900, 'El año debe ser mayor a 1900'],
        max: [new Date().getFullYear() + 5, 'El año no puede ser futuro']
    },
    description: { 
        type: String, 
        trim: true
    },
    imageUrl: { 
        type: String, 
        required: [true, 'La imagen es requerida'],
        match: [/^https?:\/\/.+\..+/, 'URL de imagen no válida']
    },
    category: { 
        type: String, 
        required: [true, 'La categoría es requerida'],
        enum: {
            values: ['accion', 'comedia', 'drama'],
            message: 'Categoría no válida'
        }
    },
    deleted: { 
        type: Boolean, 
        default: false,
        select: false 
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

movieSchema.pre(/^find/, function(next) {
    this.find({ deleted: { $ne: true } })
    next()
})

movieSchema.methods.softDelete = async function() {
    this.deleted = true
    await this.save()
}

module.exports = mongoose.model('Movie', movieSchema)