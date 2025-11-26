import React, { useEffect, useState } from 'react';
import MemoryCard from '../components/MemoryCard';
import AIMemoryCreator from '../components/AIMemoryCreator';
import TimelineView from '../components/TimelineView';
import EditMemoryModal from '../components/EditMemoryModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import SearchBar from '../components/SearchBar';
import { API_ENDPOINTS } from '../config/api';
import { LayoutGrid, List, Loader2, Edit2, Trash2 } from 'lucide-react';

const MemoriesPage = () => {
    const [memories, setMemories] = useState([]);
    const [filteredMemories, setFilteredMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'timeline'

    // Modals state
    const [editingMemory, setEditingMemory] = useState(null);
    const [deletingMemory, setDeletingMemory] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchMemories();
    }, []);

    useEffect(() => {
        setFilteredMemories(memories);
    }, [memories]);

    const fetchMemories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.memories.my, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setMemories(data);
            }
        } catch (error) {
            console.error('Error fetching memories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMemoryCreated = (newMemory) => {
        setMemories([newMemory, ...memories]);
    };

    const handleSearch = async (filters) => {
        if (!filters.q && !filters.category) {
            setFilteredMemories(memories);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_ENDPOINTS.memories.search}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setFilteredMemories(data);
            }
        } catch (error) {
            console.error('Error searching:', error);
        }
    };

    const handleEditSave = (updated) => {
        setMemories(memories.map(m => m.id === updated.id ? updated : m));
        setEditingMemory(null);
    };

    const handleDelete = async () => {
        if (!deletingMemory) return;

        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.memories.delete(deletingMemory.id), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setMemories(memories.filter(m => m.id !== deletingMemory.id));
                setDeletingMemory(null);
            }
        } catch (error) {
            console.error('Error deleting:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Minhas Memórias</h1>
                    <p className="text-gray-600 mt-2">Colecione e preserve seus momentos culturais.</p>
                </div>

                {/* View Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Visualização em Grade"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'timeline' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Linha do Tempo"
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <AIMemoryCreator onMemoryCreated={handleMemoryCreated} />

            <SearchBar onSearch={handleSearch} />

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            ) : (
                <>
                    {filteredMemories.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500">Nenhuma memória encontrada.</p>
                            <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros ou adicionar novas memórias!</p>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMemories.map(memory => (
                                        <div key={memory.id} className="relative group">
                                            <MemoryCard memory={memory} />
                                            {/* Action Buttons */}
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingMemory(memory)}
                                                    className="p-2 bg-white hover:bg-blue-50 text-blue-600 rounded-lg shadow-md hover:shadow-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingMemory(memory)}
                                                    className="p-2 bg-white hover:bg-red-50 text-red-600 rounded-lg shadow-md hover:shadow-lg transition-all"
                                                    title="Deletar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <TimelineView memories={filteredMemories} />
                            )}
                        </>
                    )}
                </>
            )}

            {/* Modals */}
            <EditMemoryModal
                memory={editingMemory}
                isOpen={!!editingMemory}
                onClose={() => setEditingMemory(null)}
                onSave={handleEditSave}
            />
            <DeleteConfirmDialog
                memory={deletingMemory}
                isOpen={!!deletingMemory}
                onClose={() => setDeletingMemory(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default MemoriesPage;
