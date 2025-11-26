import React, { useState } from 'react';
import { Sparkles, Loader2, Check, Image as ImageIcon, Mic, MicOff, X, MapPin, Lightbulb, FileText } from 'lucide-react';
import { useOrganization } from '../context/OrganizationContext';
import AudioRecorder from './AudioRecorder';

import { API_ENDPOINTS } from '../config/api';

const AIMemoryCreator = ({ onMemoryCreated }) => {
    const { organization, branding } = useOrganization();
    const [textInput, setTextInput] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [structuredData, setStructuredData] = useState(null);
    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'pt-BR';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setTextInput(prev => (prev ? prev + ' ' : '') + transcript);
            };
            recognition.start();
        } else {
            alert('Seu navegador não suporta reconhecimento de voz.');
        }
    };

    // Get AI instructions from organization config
    const aiInstructions = organization?.config?.aiInstructions || 'A IA vai extrair título, descrição, data, local e tags da sua memória';

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!textInput.trim() && !selectedFile && !audioBlob) return;

        console.log('🔍 Starting analyze...', {
            hasText: !!textInput,
            hasFile: !!selectedFile,
            hasAudio: !!audioBlob,
            fileName: selectedFile?.name,
            fileType: selectedFile?.type,
            fileSize: selectedFile?.size
        });

        setIsAnalyzing(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('textInput', textInput);
            if (selectedFile) {
                console.log('📎 Appending selectedFile to FormData');
                formData.append('media', selectedFile);
            } else if (audioBlob) {
                console.log('🎙️ Appending audioBlob to FormData');
                formData.append('media', audioBlob, 'recording.webm');
            }

            console.log('📡 Sending request to /api/ai/process...');
            const response = await fetch(API_ENDPOINTS.ai.process, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Content-Type is automatically set by browser for FormData
                },
                body: formData
            });

            console.log('📥 Response received:', response.status, response.statusText);
            const data = await response.json();
            console.log('📦 Response data:', data);

            if (response.ok) {
                setStructuredData(data);
            } else {
                console.error('AI Error:', data);
                alert('Erro ao processar com IA: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Request Error:', error);
            alert('Erro na requisição: ' + error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!structuredData) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.memories.create, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: structuredData.title,
                    description: structuredData.description,
                    date: structuredData.date,
                    location: structuredData.location,
                    isPublic: true,
                    imageUrl: structuredData.imageUrl || 'https://via.placeholder.com/400x200?text=Memória+Cultural',
                    documentUrl: structuredData.documentUrl
                })
            });

            if (response.ok) {
                const newMemory = await response.json();
                onMemoryCreated(newMemory);
                // Reset form
                setTextInput('');
                setSelectedFile(null);
                setFilePreview(null);
                setAudioBlob(null);
                setStructuredData(null);
            } else {
                alert('Erro ao salvar memória.');
            }
        } catch (error) {
            console.error('Save Error:', error);
        }
    };

    return (
        <div className="glass p-8 rounded-2xl shadow-xl border border-white/50 mb-12 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-purple/10 rounded-lg">
                        <Sparkles className="w-6 h-6 text-brand-purple" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-serif font-bold text-gray-800">Criador Mágico de Memórias</h2>
                        <p className="text-sm text-gray-500">Transforme rascunhos em histórias eternas com IA.</p>
                    </div>
                </div>

                {/* Organization-specific AI hint */}
                {organization && organization.config?.aiInstructions && (
                    <div
                        className="mb-6 p-4 rounded-xl border-2"
                        style={{
                            backgroundColor: `${branding.primaryColor}08`,
                            borderColor: `${branding.primaryColor}30`
                        }}
                    >
                        <div className="flex items-start gap-2">
                            <Lightbulb
                                className="w-5 h-5 mt-0.5 flex-shrink-0"
                                style={{ color: branding.primaryColor }}
                            />
                            <div>
                                <p className="text-sm font-bold" style={{ color: branding.primaryColor }}>
                                    Dica para {organization.name}:
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {aiInstructions}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!structuredData ? (
                    <div className="space-y-6">
                        <div className="relative">
                            <textarea
                                className="w-full p-6 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple transition-all resize-none bg-white/50 backdrop-blur-sm text-lg placeholder-gray-400 shadow-inner pr-12"
                                rows="4"
                                placeholder="Conte sua história aqui... (ex: 'O carnaval de Olinda em 2015 foi incrível...')"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                            />
                            <button
                                onClick={startListening}
                                className={`absolute top-4 right-4 p-2 rounded-full transition-all ${isListening
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-gray-100 text-gray-500 hover:bg-brand-purple hover:text-white'
                                    }`}
                                title="Falar memória"
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Audio Recording */}
                        <div className="border-t border-gray-200 pt-6">
                            <AudioRecorder
                                onAudioReady={(blob) => setAudioBlob(blob)}
                                onClear={() => setAudioBlob(null)}
                            />
                        </div>

                        {/* File Upload Area */}
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-600 rounded-xl border border-gray-200 transition-all shadow-sm hover:shadow-md group">
                                <ImageIcon className="w-5 h-5 group-hover:text-brand-purple transition-colors" />
                                <span className="font-medium">Adicionar Mídia/Doc</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                    onChange={handleFileChange}
                                />
                            </label>
                            {selectedFile && (
                                <span className="text-sm text-brand-purple font-medium bg-brand-purple/5 px-3 py-1 rounded-full border border-brand-purple/10 truncate max-w-xs flex items-center gap-2">
                                    {selectedFile.type.includes('image') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                    {selectedFile.name}
                                </span>
                            )}
                        </div>

                        {/* Preview */}
                        {filePreview && selectedFile?.type.startsWith('image/') && (
                            <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-white shadow-lg rotate-2 hover:rotate-0 transition-transform duration-300">
                                <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => { setSelectedFile(null); setFilePreview(null); }}
                                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors backdrop-blur-sm"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || (!textInput && !selectedFile && !audioBlob)}
                            className="w-full py-4 bg-gradient-to-r from-brand-purple via-indigo-800 to-brand-purple bg-[length:200%_auto] hover:bg-right text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-brand-purple/30 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Tecendo memórias...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6 group-hover:animate-spin" />
                                    Mágica da IA
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="p-6 bg-white/60 rounded-xl border border-brand-purple/20 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-brand-gold" />
                                <h3 className="font-serif font-bold text-brand-purple text-lg">Sugestão da IA</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título</span>
                                        <p className="text-gray-800 font-serif font-bold text-xl">{structuredData.title}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data</span>
                                        <p className="text-gray-800 font-medium">{structuredData.date}</p>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Local</span>
                                    <p className="text-gray-800 font-medium flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-brand-gold" />
                                        {structuredData.location || 'Não identificado'}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">História</span>
                                    <p className="text-gray-700 leading-relaxed italic border-l-4 border-brand-gold/30 pl-4 py-1">
                                        "{structuredData.description}"
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {structuredData.tags?.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-brand-purple/5 text-brand-purple text-xs font-bold rounded-full border border-brand-purple/10">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStructuredData(null)}
                                className="flex-1 py-3 px-6 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                            >
                                Tentar Novamente
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 px-6 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg hover:shadow-green-600/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" />
                                Confirmar e Salvar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIMemoryCreator;
