import React, { useState, useEffect } from 'react';
import { Share2, Instagram, Linkedin, Copy, Check, Loader, Video, Image as ImageIcon } from 'lucide-react';
import { API_URL } from '../../config/api';

const SocialDashboard = () => {
    const [memories, setMemories] = useState([]);
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [platform, setPlatform] = useState('instagram');
    const [generatedContent, setGeneratedContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchMemories();
    }, []);

    const fetchMemories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/memories/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setMemories(data.slice(0, 10)); // Show recent 10
        } catch (error) {
            console.error('Error fetching memories:', error);
        }
    };

    const handleGenerate = async () => {
        if (!selectedMemory) return;
        setLoading(true);
        setGeneratedContent(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/social/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    memoryId: selectedMemory.id,
                    platform
                })
            });

            const data = await response.json();
            setGeneratedContent(data);
        } catch (error) {
            console.error('Error generating content:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedContent) return;
        const text = `${generatedContent.caption}\n\n${generatedContent.hashtags.join(' ')}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Share2 className="w-8 h-8 text-pink-600" />
                        Social Media Manager
                    </h1>
                    <p className="text-gray-600 mt-2">Crie conteúdo viral para suas redes sociais com IA.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Selection Column */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="font-bold text-gray-900 mb-4">1. Escolha uma Memória/Evento</h2>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {memories.map(memory => (
                            <div
                                key={memory.id}
                                onClick={() => setSelectedMemory(memory)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedMemory?.id === memory.id
                                    ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500'
                                    : 'border-gray-200 hover:border-pink-300'
                                    }`}
                            >
                                <h3 className="font-medium text-gray-900 text-sm truncate">{memory.title}</h3>
                                <p className="text-xs text-gray-500 mt-1 truncate">{memory.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Configuration Column */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="font-bold text-gray-900 mb-4">2. Configure o Post</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Plataforma</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setPlatform('instagram')}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${platform === 'instagram'
                                        ? 'border-pink-500 bg-pink-50 text-pink-700 font-medium'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Instagram className="w-5 h-5" />
                                    Instagram
                                </button>
                                <button
                                    onClick={() => setPlatform('linkedin')}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${platform === 'linkedin'
                                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Linkedin className="w-5 h-5" />
                                    LinkedIn
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!selectedMemory || loading}
                            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
                            Gerar Conteúdo
                        </button>
                    </div>
                </div>

                {/* Result Column */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit min-h-[400px]">
                    <h2 className="font-bold text-gray-900 mb-4">3. Resultado</h2>

                    {generatedContent ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                                    {generatedContent.caption}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {generatedContent.hashtags.map(tag => (
                                        <span key={tag} className="text-xs text-blue-600 font-medium">{tag}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <h4 className="text-xs font-bold text-yellow-800 uppercase mb-1 flex items-center gap-1">
                                    <Video className="w-3 h-3" /> Sugestão Visual
                                </h4>
                                <p className="text-sm text-yellow-900">
                                    {generatedContent.visualSuggestion}
                                </p>
                            </div>

                            <button
                                onClick={copyToClipboard}
                                className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copiado!' : 'Copiar Legenda'}
                            </button>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                            <p>Selecione uma memória e clique em gerar para ver a mágica acontecer.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SocialDashboard;
