import React, { useState, useRef } from 'react';
import { Play, Pause, Download, Music, Image as ImageIcon, Film } from 'lucide-react';
import html2canvas from 'html2canvas';

const VideoCreator = ({ memories }) => {
    const [selectedMemories, setSelectedMemories] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [processing, setProcessing] = useState(false);
    const previewRef = useRef(null);

    const toggleMemorySelection = (memory) => {
        if (selectedMemories.find(m => m.id === memory.id)) {
            setSelectedMemories(selectedMemories.filter(m => m.id !== memory.id));
        } else {
            if (selectedMemories.length < 5) {
                setSelectedMemories([...selectedMemories, memory]);
            } else {
                alert('Máximo de 5 memórias por vídeo!');
            }
        }
    };

    const handlePlay = () => {
        if (selectedMemories.length === 0) return;
        setIsPlaying(true);
        setCurrentSlide(0);

        const interval = setInterval(() => {
            setCurrentSlide(prev => {
                if (prev >= selectedMemories.length - 1) {
                    clearInterval(interval);
                    setIsPlaying(false);
                    return 0;
                }
                return prev + 1;
            });
        }, 3000); // 3 seconds per slide
    };

    const handleExport = async () => {
        if (selectedMemories.length === 0) return;
        setProcessing(true);

        try {
            // Simulation of video export (in a real app, this would use a backend service or ffmpeg.wasm)
            // Here we just capture the current slide as an image for demonstration
            if (previewRef.current) {
                const canvas = await html2canvas(previewRef.current);
                const link = document.createElement('a');
                link.download = 'memoria-viva-snapshot.png';
                link.href = canvas.toDataURL();
                link.click();
                alert('Snapshot salvo! (Exportação de vídeo completa requer processamento no servidor)');
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Selection Panel */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg h-[600px] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    Selecione as Memórias ({selectedMemories.length}/5)
                </h3>
                <div className="space-y-3">
                    {memories.map(memory => (
                        <div
                            key={memory.id}
                            onClick={() => toggleMemorySelection(memory)}
                            className={`
                                p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3
                                ${selectedMemories.find(m => m.id === memory.id)
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-100 hover:border-purple-200'}
                            `}
                        >
                            <img
                                src={memory.imageUrl || 'https://via.placeholder.com/50'}
                                alt={memory.title}
                                className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-800 truncate">{memory.title}</h4>
                                <p className="text-xs text-gray-500 truncate">{memory.date ? new Date(memory.date).toLocaleDateString() : 'Sem data'}</p>
                            </div>
                            {selectedMemories.find(m => m.id === memory.id) && (
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                                    {selectedMemories.findIndex(m => m.id === memory.id) + 1}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2 space-y-6">
                <div
                    ref={previewRef}
                    className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group"
                >
                    {selectedMemories.length > 0 ? (
                        <>
                            <img
                                src={selectedMemories[currentSlide]?.imageUrl}
                                alt="Slide"
                                className="w-full h-full object-cover transition-opacity duration-500"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {selectedMemories[currentSlide]?.title}
                                </h2>
                                <p className="text-white/80 text-lg line-clamp-2">
                                    {selectedMemories[currentSlide]?.description}
                                </p>
                            </div>

                            {/* Logo Overlay */}
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                <span className="text-white font-medium text-sm">Memória Viva</span>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
                            <Film className="w-16 h-16 mb-4" />
                            <p>Selecione memórias para visualizar</p>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePlay}
                            disabled={selectedMemories.length === 0 || isPlaying}
                            className={`
                                w-12 h-12 rounded-full flex items-center justify-center transition-all
                                ${isPlaying
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-purple-500/30'}
                            `}
                        >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                        </button>

                        <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                                {isPlaying ? 'Reproduzindo...' : 'Visualização'}
                            </span>
                            <span className="text-xs text-gray-500">
                                {selectedMemories.length} slides selecionados
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                            <Music className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={selectedMemories.length === 0 || processing}
                            className={`
                                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                                ${processing
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-gray-900 text-white hover:bg-black'}
                            `}
                        >
                            <Download className="w-4 h-4" />
                            {processing ? 'Processando...' : 'Exportar Vídeo'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCreator;
