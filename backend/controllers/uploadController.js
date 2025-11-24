// Upload single image
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Generate public URL
        const orgId = req.user.organizationId;
        const imageUrl = `/uploads/memories/${orgId}/${req.file.filename}`;

        res.json({
            success: true,
            imageUrl: imageUrl,
            filename: req.file.filename,
            size: req.file.size
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
};

// Delete image
exports.deleteImage = async (req, res) => {
    const path = require('path');
    const fs = require('fs');

    try {
        const { filename } = req.params;
        const orgId = req.user.organizationId;
        const filePath = path.join(__dirname, '../uploads/memories', orgId.toString(), filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true, message: 'Image deleted' });
        } else {
            res.status(404).json({ error: 'Image not found' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
};
