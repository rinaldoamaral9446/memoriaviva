import React, { useState, useEffect } from 'react';
import { Film, Video } from 'lucide-react';
import VideoCreator from '../components/VideoCreator';
import { API_URL } from '../config/api';

const StudioPage = () => {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMemories();
    }, []);

    const fetchMemories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/memories/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMemories(data.filter(m => m.imageUrl)); // Only memories with images
        } catch (error) {
            console.error('Error fetching memories:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Video className="w-8 h-8 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Estúdio de Criação</h1>
                            <p className="text-gray-600">Transforme suas memórias em micro-documentários</p>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <VideoCreator memories={memories} />
                )}
            </div>
        </div>
    );
};

export default StudioPage;
