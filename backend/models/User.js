const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'El nombre de usuario es requerido'],
        unique: true,
        trim: true,
        minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
        maxlength: [30, 'El nombre no puede exceder 30 caracteres']
    },
    email: { 
        type: String, 
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Por favor ingrese un email válido']
    },
    password: { 
        type: String, 
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    isAdmin: { 
        type: Boolean, 
        default: false 
    },
    deleted: {
        type: Boolean,
        default: false,
        select: false 
    }
}, { 
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password
            return ret
        }
    }
})

userSchema.pre(/^find/, function(next) {
    this.find({ deleted: { $ne: true } })
    next()
})

userSchema.methods.softDelete = async function() {
    this.deleted = true
    await this.save()
}

module.exports = mongoose.model('User', userSchema)