const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

/**
 * Generates a thumbnail for a given video file.
 * @param {string} filePath - Absolute path to the video file.
 * @param {string} filename - Original filename (used to name the thumbnail).
 * @returns {Promise<string>} - Public URL of the generated thumbnail.
 */
exports.generateThumbnail = (filePath, filename) => {
    return new Promise((resolve, reject) => {
        // Define uploads directory (where we save the thumbnail)
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        // Clean filename to avoid issues, append timestamp to ensure uniqueness if needed, 
        // but sticking to a simple pattern 'thumb-' + unique part of filename is safer.
        // Assuming filename passed here is the stored filename (unique).
        const outputFilename = `thumb-${path.basename(filename, path.extname(filename))}.jpg`;

        // Ensure uploads dir exists (sanity check)
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Check if ffmpeg is available (optional safety check, but fluent-ffmpeg usually throws if not found)

        ffmpeg(filePath)
            .screenshots({
                timestamps: ['25%'], // Capture at 25% of video duration
                filename: outputFilename,
                folder: uploadsDir,
                size: '640x360' // Standard 16:9 thumbnail
            })
            .on('end', () => {
                // Return public URL relative to server root
                resolve(`/uploads/${outputFilename}`);
            })
            .on('error', (err) => {
                console.error('❌ Error generating thumbnail for ' + filename, err);
                // Rejecting allows the caller to catch and decide whether to fail the request or just skip the thumbnail
                reject(err);
            });
    });
};
