import React from 'react';
import { Calendar, MapPin, Tag } from 'lucide-react';

const MemoryCard = ({ memory }) => {
    return (
        <div className="glass rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
                {memory.mediaUrl || memory.imageUrl ? (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                        <img
                            src={(memory.mediaUrl || memory.imageUrl).includes('via.placeholder.com')
                                ? 'https://placehold.co/400x200?text=Memoria+Cultural'
                                : (memory.mediaUrl || memory.imageUrl)}
                            alt={memory.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-purple to-indigo-900 flex items-center justify-center">
                        <span className="text-white/20 font-serif text-4xl">Memória</span>
                    </div>
                )}

                {/* Date Badge */}
                <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-purple shadow-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(memory.eventDate || memory.date).toLocaleDateString('pt-BR')}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-serif font-bold text-gray-800 mb-2 group-hover:text-brand-purple transition-colors line-clamp-1">
                    {memory.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
                    {memory.description}
                </p>

                <div className="mt-auto space-y-3">
                    {memory.location && (
                        <div className="flex items-center text-xs text-gray-500 font-medium">
                            <MapPin className="w-3 h-3 mr-1 text-brand-gold" />
                            {memory.location}
                        </div>
                    )}

                    {/* Audio Player if available */}
                    {memory.audioUrl && (
                        <div className="mt-4 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-lg">
                            <audio controls className="w-full h-10">
                                <source src={memory.audioUrl} type="audio/webm" />
                                <source src={memory.audioUrl} type="audio/mpeg" />
                                Seu navegador não suporta áudio.
                            </audio>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                🎙️ Relato oral gravado
                            </p>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {JSON.parse(memory.tags || '[]').slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-brand-purple/5 text-brand-purple text-[10px] uppercase tracking-wider font-bold rounded-md border border-brand-purple/10"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemoryCard;
