import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Captions, List, SkipForward } from 'lucide-react';

const SmartPlayer = ({ url, chapters = [], transcription = '', title = 'Vídeo' }) => {
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0); // 0 to 1
    const [duration, setDuration] = useState(0);
    const [fullScreen, setFullScreen] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);
    const [showChapters, setShowChapters] = useState(true);

    // Parse chapters if string
    const parsedChapters = typeof chapters === 'string' ? JSON.parse(chapters) : chapters || [];

    const playerRef = useRef(null);
    const containerRef = useRef(null);

    const formatTime = (seconds) => {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = ("0" + date.getUTCSeconds()).slice(-2);
        if (hh) {
            return `${hh}:${("0" + mm).slice(-2)}:${ss}`;
        }
        return `${mm}:${ss}`;
    };

    const handleSeekChange = (e) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseUp = (e) => {
        const seekTo = parseFloat(e.target.value);
        setPlayed(seekTo);
        playerRef.current?.seekTo(seekTo);
    };

    const jumpToChapter = (time) => {
        playerRef.current?.seekTo(time);
        setPlaying(true);
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setFullScreen(true);
        } else {
            document.exitFullscreen();
            setFullScreen(false);
        }
    };

    // Current Chapter Detection
    const currentChapter = parsedChapters?.reduce((prev, curr) => {
        const currentTime = played * duration;
        return (curr.time <= currentTime) ? curr : prev;
    }, parsedChapters[0]);

    return (
        <div ref={containerRef} className={`relative bg-black rounded-xl overflow-hidden shadow-2xl group ${fullScreen ? 'w-full h-full' : 'w-full aspect-video flex'}`}>

            {/* Main Video Area */}
            <div className={`relative flex-1 bg-black flex items-center justify-center`}>
                <ReactPlayer
                    ref={playerRef}
                    url={url}
                    width="100%"
                    height="100%"
                    playing={playing}
                    volume={volume}
                    muted={muted}
                    onProgress={(state) => setPlayed(state.played)}
                    onDuration={setDuration}
                    config={{
                        youtube: { playerVars: { showinfo: 0, controls: 0 } }
                    }}
                />

                {/* Overlay Controls (Visible on Hover) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">

                    {/* Header: Title & Chapter */}
                    <div className="flex justify-between items-start pointer-events-auto">
                        <div>
                            <h3 className="text-white font-bold text-lg drop-shadow-md">{title}</h3>
                            {currentChapter && (
                                <span className="text-brand-gold text-xs font-bold uppercase tracking-wider flex items-center gap-1 bg-black/50 px-2 py-1 rounded backdrop-blur-md w-fit mt-1">
                                    <List className="w-3 h-3" />
                                    {currentChapter.label}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="space-y-2 pointer-events-auto">

                        {/* Timeline with Chapters Markers */}
                        <div className="relative group/timeline h-2 bg-white/20 rounded-full cursor-pointer hover:h-4 transition-all">

                            {/* Markers */}
                            {parsedChapters.map((chapter, idx) => (
                                <div
                                    key={idx}
                                    className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10"
                                    style={{ left: `${(chapter.time / duration) * 100}%` }}
                                    title={chapter.label}
                                />
                            ))}

                            <input
                                type="range"
                                min={0}
                                max={0.999999}
                                step="any"
                                value={played}
                                onMouseDown={() => setPlaying(false)}
                                onChange={handleSeekChange}
                                onMouseUp={handleSeekMouseUp}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />

                            {/* Played Bar */}
                            <div
                                className="absolute top-0 left-0 bottom-0 bg-brand-purple rounded-full pointer-events-none"
                                style={{ width: `${played * 100}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setPlaying(!playing)} className="hover:text-brand-gold transition-colors">
                                    {playing ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                                </button>

                                <div className="flex items-center gap-2 group/vol">
                                    <button onClick={() => setMuted(!muted)}>
                                        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    </button>
                                    <input
                                        type="range" min={0} max={1} step="0.1"
                                        value={muted ? 0 : volume}
                                        onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                                        className="w-0 overflow-hidden group-hover/vol:w-20 transition-all accent-brand-gold"
                                    />
                                </div>

                                <span className="text-xs font-mono opacity-80">
                                    {formatTime(played * duration)} / {formatTime(duration)}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                {transcription && (
                                    <button
                                        onClick={() => setShowTranscript(!showTranscript)}
                                        className={`p-1.5 rounded-lg transition-colors ${showTranscript ? 'bg-white text-black' : 'hover:bg-white/20'}`}
                                        title="Legendas / Transcrição"
                                    >
                                        <Captions className="w-5 h-5" />
                                    </button>
                                )}

                                {parsedChapters.length > 0 && (
                                    <button
                                        onClick={() => setShowChapters(!showChapters)}
                                        className={`p-1.5 rounded-lg transition-colors ${showChapters ? 'bg-brand-purple text-white' : 'hover:bg-white/20'}`}
                                        title="Capítulos"
                                    >
                                        <List className="w-5 h-5" />
                                    </button>
                                )}

                                <button onClick={toggleFullScreen} className="hover:text-brand-gold">
                                    {fullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CC Overlay */}
                {showTranscript && transcription && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white p-4 rounded-xl backdrop-blur-md max-w-[80%] text-center text-sm leading-relaxed animate-fade-in-up">
                        {/* Simple Display - For full sync we'd need word-level timestamps */}
                        <p className="line-clamp-3">{transcription}</p>
                    </div>
                )}
            </div>

            {/* Sidebar Chapters (Collapsible) */}
            {showChapters && parsedChapters.length > 0 && !fullScreen && (
                <div className="w-64 bg-gray-900 border-l border-gray-800 flex flex-col animate-slide-in-right">
                    <div className="p-4 border-b border-gray-800">
                        <h4 className="text-white font-bold text-sm flex items-center gap-2">
                            <SkipForward className="w-4 h-4 text-brand-gold" />
                            Navegação Inteligente
                        </h4>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {parsedChapters.map((chapter, i) => {
                            const isActive = currentChapter?.label === chapter.label;
                            return (
                                <button
                                    key={i}
                                    onClick={() => jumpToChapter(chapter.time)}
                                    className={`w-full text-left p-3 rounded-lg text-sm transition-all flex items-center gap-3 ${isActive
                                            ? 'bg-brand-purple text-white shadow-lg'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <span className={`font-mono text-xs opacity-75 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                        {formatTime(chapter.time)}
                                    </span>
                                    <span className="font-medium truncate">{chapter.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartPlayer;
