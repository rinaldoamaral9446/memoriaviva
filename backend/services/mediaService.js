const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

/**
 * Generates a thumbnail for a video file at 25% duration or 1s mark.
 * @param {string} filePath - Absolute path to the source video
 * @param {string} filename - Base filename of the source video (e.g. "video_123.mp4")
 * @returns {Promise<string>} - Public URL of the generated thumbnail
 */
exports.generateThumbnail = (filePath, filename) => {
    return new Promise((resolve, reject) => {
        // Define upload directory (relative to this service file: ../uploads)
        const uploadsDir = path.join(__dirname, '..', 'uploads');

        // Ensure upload dir exists
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const thumbFilename = `thumb-${path.parse(filename).name}.jpg`;

        console.log(`[MediaService] Generating thumbnail for ${filename}...`);

        ffmpeg(filePath)
            .screenshots({
                timestamps: ['25%'], // Capture at 25% of video
                filename: thumbFilename,
                folder: uploadsDir,
                size: '640x360' // Standard 16:9 thumbnail
            })
            .on('end', () => {
                console.log(`[MediaService] Thumbnail generated: ${thumbFilename}`);
                // Return relative URL path that frontend can access
                resolve(`/uploads/${thumbFilename}`);
            })
            .on('error', (err) => {
                console.error('[MediaService] Error generating thumbnail:', err);
                // Non-blocking error: resolve with null (no thumbnail) rather than crashing flow
                resolve(null);
            });
    });
};

/**
 * Extracts metadata from a video file (duration, resolution, etc)
 * @param {string} filePath 
 * @returns {Promise<Object>} Metadata object
 */
exports.getVideoMetadata = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                console.error('[MediaService] Error fetching metadata:', err);
                resolve({});
            } else {
                const videoStream = metadata.streams.find(s => s.codec_type === 'video');
                const format = metadata.format;

                resolve({
                    duration: format.duration,
                    size: format.size,
                    width: videoStream ? videoStream.width : 0,
                    height: videoStream ? videoStream.height : 0,
                    codec: videoStream ? videoStream.codec_name : 'unknown'
                });
            }
        });
    });
};
