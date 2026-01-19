const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');

async function testDownload() {
    console.log("Starting download test...");
    const url = 'https://www.youtube.com/watch?v=UxAz1Gme-_8';
    try {
        const info = await ytdl.getInfo(url);
        console.log("Video Info fetched:", info.videoDetails.title);

        const tempPath = path.join(__dirname, 'test_video.mp4');
        const stream = ytdl(url, { quality: 'lowest' });

        stream.pipe(fs.createWriteStream(tempPath))
            .on('finish', () => {
                console.log("Download finished successfully to", tempPath);
                fs.unlinkSync(tempPath);
            })
            .on('error', (err) => {
                console.error("Stream Error:", err);
            });

    } catch (err) {
        console.error("General Error:", err);
    }
}

testDownload();
