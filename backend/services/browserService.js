const ytdl = require('@distube/ytdl-core');
const { YoutubeTranscript } = require('youtube-transcript');

class BrowserService {
    async capturePageData(url) {
        console.log('🕵️‍♂️ [BrowserAgent] Fetching video data (Lightweight Mode) for:', url);

        try {
            // 1. Get Video Metadata using ytdl-core
            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title;
            const description = info.videoDetails.description;

            // Use the high quality thumbnail as "screenshot"
            const thumbnails = info.videoDetails.thumbnails;
            const bestThumbnail = thumbnails[thumbnails.length - 1]; // usually the last one is biggest
            const screenshotPath = bestThumbnail ? bestThumbnail.url : null;

            console.log('✅ [BrowserAgent] Metadata extracted:', title);

            // 2. Get Transcript
            let transcript = '';
            try {
                // YoutubeTranscript often needs just the ID or URL
                const transcriptItems = await YoutubeTranscript.fetchTranscript(url, { lang: 'pt' });
                transcript = transcriptItems.map(item => item.text).join(' ');
                console.log('📜 [BrowserAgent] Transcript extracted successfully!');
            } catch (e) {
                console.warn('⚠️ [BrowserAgent] Could not fetch transcript via API:', e.message);

                // Fallback: Check if description has "auto-generated" or similar manual fallback? 
                // Currently just empty string if fail.
            }

            return {
                title,
                description,
                transcript,
                screenshotPath // Returning URL directly instead of local path is better for serverless logic anyway
            };

        } catch (error) {
            console.error('❌ [BrowserAgent] Error:', error.message);
            // Don't crash the whole process, just return minimal info or throw handled error
            throw new Error(`Failed to capture data: ${error.message}`);
        }
    }
}

module.exports = new BrowserService();
