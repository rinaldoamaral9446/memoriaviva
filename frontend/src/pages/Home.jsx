import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { API_URL } from '../config/api';

const Home = () => {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPublicMemories();
    }, []);

    const fetchPublicMemories = async () => {
        try {
            const response = await fetch(`${API_URL}/api/memories`);
            const data = await response.json();
            setMemories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching public memories:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <header className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-20 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-6">Memória Cultural Viva</h1>
                    <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
                        Preservando a história, celebrando a cultura e conectando gerações através de memórias vivas.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            to="/login"
                            className="bg-white text-purple-900 px-8 py-3 rounded-full font-bold hover:bg-purple-50 transition-colors"
                        >
                            Entrar
                        </Link>
                        <Link
                            to="/register"
                            className="bg-purple-800 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition-colors border border-purple-700"
                        >
                            Criar Conta
                        </Link>
                    </div>
                </div>
            </header>

            {/* Featured Memories */}
            <main className="max-w-6xl mx-auto py-16 px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Memórias em Destaque</h2>
                        <p className="text-gray-600">Histórias compartilhadas por nossas organizações parceiras</p>
                    </div>
                    <div className="relative hidden md:block">
                        <input
                            type="text"
                            placeholder="Buscar memórias..."
                            className="pl-10 pr-4 py-2 border rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900 mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {memories.map(memory => (
                            <Link key={memory.id} to={`/memory/${memory.id}`} className="group">
                                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={memory.mediaUrl || 'https://placehold.co/400x300?text=Memoria'}
                                            alt={memory.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-purple-900">
                                            {memory.category || 'Geral'}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(memory.eventDate || memory.createdAt).toLocaleDateString()}
                                            {memory.location && (
                                                <>
                                                    <span>•</span>
                                                    <MapPin className="w-4 h-4" />
                                                    {memory.location}
                                                </>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                                            {memory.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                                            {memory.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-2">
                                                {memory.organization?.logo ? (
                                                    <img src={memory.organization.logo} alt="" className="w-6 h-6 rounded-full" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                                                        {memory.organization?.name?.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="text-xs font-medium text-gray-500">
                                                    {memory.organization?.name}
                                                </span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
