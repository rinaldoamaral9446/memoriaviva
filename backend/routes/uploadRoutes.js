const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const { uploadImage, deleteImage } = require('../controllers/uploadController');

// Upload single image
router.post('/image', verifyToken, upload.single('image'), uploadImage);

// Delete image
router.delete('/image/:filename', verifyToken, deleteImage);

module.exports = router;
