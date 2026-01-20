import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, Sparkles, MapPin, Calendar, Film } from 'lucide-react';
import { API_URL } from '../../config/api';

const MemoryModeration = () => {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchPendingMemories();
    }, []);

    const fetchPendingMemories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/memories/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMemories(data);
            } else {
                console.error('Failed to fetch pending memories');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        setProcessingId(id);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/memories/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                // Remove from list
                setMemories(prev => prev.filter(m => m.id !== id));
            } else {
                alert('Erro ao atualizar status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Erro de conexão');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Moderação de Memórias</h1>
                <p className="text-gray-600">Aprove ou rejeite memórias enviadas pelos colaboradores.</p>
            </div>

            {memories.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Nenhuma memória pendente no momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memories.map((memory) => (
                        <div key={memory.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className="relative aspect-video bg-gray-100">
                                {memory.thumbnailUrl ? (
                                    <img
                                        src={memory.thumbnailUrl.startsWith('http') ? memory.thumbnailUrl : `${API_URL}${memory.thumbnailUrl}`}
                                        alt={memory.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Film className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-md border border-yellow-200">
                                    Pendente
                                </div>
                            </div>

                            <div className="p-5 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-medium text-brand-purple bg-brand-purple/5 px-2 py-0.5 rounded-full">
                                        {memory.user?.name || 'Autor Desconhecido'}
                                    </span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(memory.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight">
                                    {memory.title}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                    {memory.description}
                                </p>

                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                    {memory.location && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {memory.location}
                                        </div>
                                    )}
                                    {memory.eventDate && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(memory.eventDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleStatusUpdate(memory.id, 'REJECTED')}
                                    disabled={processingId === memory.id}
                                    className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    {processingId === memory.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                    Rejeitar
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(memory.id, 'APPROVED')}
                                    disabled={processingId === memory.id}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {processingId === memory.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Aprovar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MemoryModeration;
