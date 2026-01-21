import React from 'react';
import { Calendar, MapPin, Tag } from 'lucide-react';

const TimelineView = ({ memories, onView }) => {
    // Sort memories by date (newest first)
    const sortedMemories = [...memories].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="relative container mx-auto px-6 flex flex-col space-y-12 py-8">
            {/* Vertical Line */}
            <div className="absolute z-0 w-1 h-full bg-gradient-to-b from-brand-gold/20 via-brand-purple/20 to-brand-gold/20 left-8 md:left-1/2 transform -translate-x-1/2 rounded-full"></div>

            {sortedMemories.map((memory, index) => (
                <div
                    key={memory.id}
                    className={`relative z-10 flex items-center w-full ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} animate-slide-up`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                >

                    {/* Date Bubble (Center) */}
                    <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-brand-purple border-4 border-brand-light shadow-lg z-20">
                        <div className="w-3 h-3 bg-brand-gold rounded-full animate-pulse"></div>
                    </div>

                    {/* Content Card */}
                    <div className={`w-full md:w-5/12 ml-16 md:ml-0 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12 text-right'}`}>
                        <div
                            onClick={() => onView && onView(memory)}
                            className="glass p-6 rounded-2xl hover:shadow-xl transition-all duration-300 group border border-white/40 cursor-pointer"
                        >
                            <div className={`flex items-center gap-2 text-sm text-brand-purple font-bold mb-3 ${index % 2 === 0 ? '' : 'md:justify-end'}`}>
                                <Calendar className="w-4 h-4" />
                                <span className="font-serif">{new Date(memory.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>

                            <h3 className="text-2xl font-serif font-bold text-gray-800 mb-3 group-hover:text-brand-purple transition-colors">{memory.title}</h3>

                            {memory.imageUrl && (
                                <div className="mb-4 rounded-xl overflow-hidden h-56 w-full shadow-md">
                                    <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                </div>
                            )}

                            <p className="text-gray-600 mb-5 leading-relaxed font-light">{memory.description}</p>

                            <div className={`flex flex-wrap gap-2 ${index % 2 === 0 ? '' : 'md:justify-end'}`}>
                                {memory.location && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-gold/10 text-yellow-700 text-xs font-bold rounded-full border border-brand-gold/20">
                                        <MapPin className="w-3 h-3" />
                                        <span>{memory.location}</span>
                                    </span>
                                )}
                                {JSON.parse(memory.tags || '[]').map((tag, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-brand-purple/5 text-brand-purple text-xs font-bold rounded-full border border-brand-purple/10 uppercase tracking-wider">
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TimelineView;
