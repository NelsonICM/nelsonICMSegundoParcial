const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    deleted: {
        type: Boolean,
        default: false,
        select: false
    }
}, { timestamps: true })

contactSchema.pre(/^find/, function(next) {
    this.find({ deleted: { $ne: true } })
    next()
})

contactSchema.methods.softDelete = async function() {
    this.deleted = true
    await this.save()
}

module.exports = mongoose.model('Contact', contactSchema)