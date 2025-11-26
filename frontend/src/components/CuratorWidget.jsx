import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, ArrowRight } from 'lucide-react';

const CuratorWidget = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/ai/curate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.suggestions) {
                setSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error('Error fetching curator suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;
    if (suggestions.length === 0) return null;

    return (
        <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-brand-gold" />
                <h2 className="text-xl font-serif font-bold text-gray-800">Sugestões do Curador</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {suggestions.map((collection, index) => (
                    <div
                        key={index}
                        className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-gold to-brand-purple opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-brand-purple/5 rounded-lg text-brand-purple">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                    {collection.memoryIds.length} memórias
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-brand-purple transition-colors">
                                {collection.title}
                            </h3>

                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                {collection.description}
                            </p>

                            <div className="flex items-center text-xs font-bold text-brand-gold group-hover:translate-x-1 transition-transform">
                                VER COLEÇÃO <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CuratorWidget;
