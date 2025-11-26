const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

// Configure Cloudinary Storage (for standard uploads)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'memoria-viva',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'heic', 'heif', 'mp3', 'wav', 'webm', 'm4a', 'ogg', 'pdf', 'doc', 'docx', 'txt'],
        transformation: [{ width: 1000, crop: "limit" }],
        resource_type: 'auto' // Auto-detect image vs audio vs raw (docs)
    },
});

// Configure Memory Storage (for AI processing - needs buffer)
const memoryStorage = multer.memoryStorage();

// File filter for images, audio, and documents
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') ||
        file.mimetype.startsWith('audio/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'text/plain') {
        cb(null, true);
    } else {
        cb(new Error('Not a valid file! Please upload an image, audio, or document.'), false);
    }
};

// Export both configurations
const uploadCloudinary = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

const uploadMemory = multer({
    storage: memoryStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for large audio files
    fileFilter: fileFilter
});

module.exports = { uploadCloudinary, uploadMemory };
