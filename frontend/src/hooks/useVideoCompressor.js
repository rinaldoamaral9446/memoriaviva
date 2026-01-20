import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export const useVideoCompressor = () => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('idle'); // idle, loading, compressing, done, error
    const ffmpegRef = useRef(new FFmpeg());
    const [loaded, setLoaded] = useState(false);

    const load = async () => {
        if (loaded) return true;

        try {
            setStatus('loading');
            const ffmpeg = ffmpegRef.current;

            // Standard loading from CDN
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            await ffmpeg.load({
                coreURL: await fetchFile(`${baseURL}/ffmpeg-core.js`),
                wasmURL: await fetchFile(`${baseURL}/ffmpeg-core.wasm`),
            });

            setLoaded(true);
            return true;
        } catch (error) {
            console.error('Failed to load FFmpeg:', error);
            setStatus('error');
            return false;
        }
    };

    const compress = async (file) => {
        setProgress(0);
        setStatus('loading');

        // 1. Hardware/Timeout Check (30s limit)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT')), 30000);
        });

        try {
            // Lazy load if needed
            const isLoaded = await load();
            if (!isLoaded) throw new Error('Could not load FFmpeg');

            setStatus('compressing');
            const ffmpeg = ffmpegRef.current;

            // Log progress
            ffmpeg.on('progress', ({ progress: p }) => {
                setProgress(Math.round(p * 100));
            });

            // Write file to virtual FS
            await ffmpeg.writeFile('input.mp4', await fetchFile(file));

            console.log('🎥 Starting compression...');

            // Compression Command:
            // - scale=...: Scale to max 1080p width (maintain aspect ratio)
            // - Crf 28: Good balance for web (lower is better quality, higher is smaller)
            // - preset ultrafast: Prioritize speed over tiny size gains
            const commandPromise = ffmpeg.exec([
                '-i', 'input.mp4',
                '-vf', "scale='min(1920,iw)':-2",
                '-c:v', 'libx264',
                '-crf', '28',
                '-preset', 'ultrafast',
                'output.mp4'
            ]);

            // Race against timeout
            await Promise.race([commandPromise, timeoutPromise]);

            console.log('✅ Compression finished');

            // Read output
            const data = await ffmpeg.readFile('output.mp4');
            const compressedBlob = new Blob([data.buffer], { type: 'video/mp4' });

            // Safety check: if compression actually made it bigger (rare but possible with low quality inputs), use original
            if (compressedBlob.size > file.size) {
                console.warn('⚠️ Compressed file larger than original, using original.');
                setStatus('done');
                return file;
            }

            // Creating a File object to mimic original input
            const compressedFile = new File([compressedBlob], `compressed_${file.name.replace(/\.[^/.]+$/, "")}.mp4`, {
                type: 'video/mp4',
                lastModified: Date.now(),
            });

            setStatus('done');
            return compressedFile;

        } catch (error) {
            console.warn('⚠️ Compression failed or timed out:', error.message);
            // Fallback to original file
            setStatus('error'); // Effectively just means "compression error", app should handle fallback
            return file;
        } finally {
            // Cleanup
            try {
                if (loaded) {
                    await ffmpegRef.current.deleteFile('input.mp4');
                    await ffmpegRef.current.deleteFile('output.mp4');
                }
            } catch (e) { }
        }
    };

    return {
        compress,
        progress,
        status,
        isReady: loaded
    };
};
