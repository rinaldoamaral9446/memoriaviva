const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

// Configure Cloudinary Storage (for standard uploads)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'memoria-viva',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'heic', 'heif', 'mp3', 'wav', 'webm', 'm4a', 'ogg', 'pdf', 'doc', 'docx', 'txt', 'mp4', 'mov', 'quicktime'],
        transformation: [{ width: 1000, crop: "limit" }],
        resource_type: 'auto' // Auto-detect image vs audio vs raw (docs)
    },
});

// Configure Disk Storage (for AI processing - prevents RAM exhaustion)
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fs = require('fs');
        const os = require('os');
        const tempDir = os.tmpdir();
        // /tmp always exists, no need to mkdir usually, but safe to leave if checking specific subfolder
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

// File filter for images, audio, and documents
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') ||
        file.mimetype.startsWith('audio/') ||
        file.mimetype.startsWith('video/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'text/plain') {
        cb(null, true);
    } else {
        cb(new Error('Formato de arquivo inválido! Por favor envie imagem, áudio, vídeo ou documento.'), false);
    }
};

// Export both configurations
const uploadCloudinary = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

const uploadMemory = multer({
    storage: diskStorage, // Changed from memoryStorage to diskStorage
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for large video/audio files
    fileFilter: fileFilter
});

module.exports = { uploadCloudinary, uploadMemory };
