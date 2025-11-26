const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { uploadCloudinary } = require('../config/multer');
const { uploadImage, deleteImage } = require('../controllers/uploadController');

// Upload single image
router.post('/image', verifyToken, uploadCloudinary.single('image'), uploadImage);

// Delete image
router.delete('/image/:filename', verifyToken, deleteImage);

module.exports = router;
