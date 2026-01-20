import React from 'react';
import { X, Calendar, MapPin, Tag } from 'lucide-react';
import SmartPlayer from './SmartPlayer';

const MemoryViewModal = ({ memory, isOpen, onClose }) => {
    if (!isOpen || !memory) return null;

    // Detect if the mediaUrl is a video
    const isVideo = memory.mediaUrl && (
        memory.mediaUrl.endsWith('.mp4') ||
        memory.mediaUrl.endsWith('.webm') ||
        memory.mediaUrl.endsWith('.mov') ||
        memory.type === 'video' ||
        // Basic check for video mime type logic or youtube links if supported
        memory.mediaUrl.includes('youtube') ||
        // Fallback context based guess
        (memory.mediaUrl.includes('cloudinary') && memory.mediaUrl.includes('/video/'))
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gray-900 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border border-white/10">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
                    <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-brand-purple rounded-full" />
                        {memory.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto custom-scrollbar flex-1">

                    {/* Media Area */}
                    <div className="bg-black aspect-video w-full flex items-center justify-center">
                        {isVideo ? (
                            <SmartPlayer
                                url={memory.mediaUrl}
                                title={memory.title}
                                chapters={memory.chapters}
                                transcription={memory.transcription}
                            />
                        ) : memory.mediaUrl ? (
                            <img
                                src={memory.mediaUrl}
                                alt={memory.title}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="text-white/30 flex flex-col items-center">
                                <span className="text-4xl">📷</span>
                                <span className="mt-2 text-sm">Sem mídia visual</span>
                            </div>
                        )}
                    </div>

                    {/* Meta Info */}
                    <div className="p-8 bg-gray-900 text-gray-200">
                        <div className="flex flex-wrap gap-6 text-sm mb-6 border-b border-white/5 pb-6">
                            <div className="flex items-center gap-2 text-brand-gold">
                                <Calendar className="w-4 h-4" />
                                <span className="font-bold">
                                    {new Date(memory.eventDate || memory.date).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
                                </span>
                            </div>
                            {memory.location && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    <span>{memory.location}</span>
                                </div>
                            )}
                            {memory.category && (
                                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs">
                                    {memory.category}
                                </div>
                            )}
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <h3 className="text-lg font-bold text-white mb-2">Sobre esta memória</h3>
                            <p className="leading-relaxed text-gray-300 whitespace-pre-wrap">
                                {memory.description}
                            </p>
                        </div>

                        {memory.tags && (
                            <div className="mt-8 flex flex-wrap gap-2">
                                {JSON.parse(memory.tags).map((tag, i) => (
                                    <span key={i} className="flex items-center gap-1 px-3 py-1 bg-brand-purple/20 text-brand-purple text-xs font-bold rounded-lg uppercase tracking-wider">
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MemoryViewModal;
