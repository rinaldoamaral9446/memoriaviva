const path = require('path');
const fs = require('fs');

/**
 * Generates a thumbnail for a video file.
 * [SERVERLESS COMPATIBLE STUB]
 * FFmpeg is not available in standard Vercel environment.
 * Returning null allows the frontend/AI to handle it gracefully (or use Cloudinary auto-derived thumbnails).
 */
exports.generateThumbnail = (filePath, filename) => {
    return new Promise((resolve, reject) => {
        console.log('[MediaService] Thumbnail generation (FFmpeg) disabled for Serverless environment.');
        resolve(null);
    });
};

/**
 * Extracts metadata from a video file.
 * [SERVERLESS COMPATIBLE STUB]
 */
exports.getVideoMetadata = (filePath) => {
    return new Promise((resolve, reject) => {
        console.log('[MediaService] Metadata extraction (FFmpeg) disabled for Serverless environment.');
        resolve({
            duration: 0,
            size: 0,
            width: 0,
            height: 0,
            codec: 'unknown'
        });
    });
};
