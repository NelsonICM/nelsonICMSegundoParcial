const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: process.env.CLOUDINARY_FOLDER || 'moviesgo',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => {
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      return `movie-${timestamp}-${randomString}`
    },
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto:good' }
    ]
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten imágenes JPEG, PNG o JPG'), false)
    }
  }
})

module.exports = upload