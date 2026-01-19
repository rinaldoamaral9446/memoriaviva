import React, { useState } from 'react';
import { Sparkles, Loader2, Check, Image as ImageIcon, Mic, MicOff, X, MapPin, Lightbulb, FileText, Film, BookOpen, Download } from 'lucide-react';
import { useOrganization } from '../context/OrganizationContext';
import AudioRecorder from './AudioRecorder';

import { API_ENDPOINTS, API_URL } from '../config/api';

const AIMemoryCreator = ({ onMemoryCreated }) => {
    const { organization, branding } = useOrganization();
    const [textInput, setTextInput] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // [NEW] Toggle: 'file' or 'youtube'
    const [inputMode, setInputMode] = useState('file');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [structuredData, setStructuredData] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [showReasoning, setShowReasoning] = useState(false); // [NEW] Toggle for AI Reasoning
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');

    // [NEW] Lesson Plan State
    const [savedMemory, setSavedMemory] = useState(null);
    const [lessonPlan, setLessonPlan] = useState(null);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

    // [NEW] Review Mode State
    const [isReviewing, setIsReviewing] = useState(false);
    const [reviewData, setReviewData] = useState({ title: '', description: '' });

    React.useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/events`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

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
        if (inputMode === 'file' && !textInput.trim() && !selectedFile && !audioBlob) return;
        if (inputMode === 'youtube' && !youtubeUrl) return;

        console.log(`🔍 Starting analyze mode: ${inputMode}...`, {
            hasText: !!textInput,
            hasFile: !!selectedFile,
            hasAudio: !!audioBlob
        });

        setIsAnalyzing(true);
        try {
            let response;
            const token = localStorage.getItem('token');

            if (inputMode === 'youtube') {
                console.log('📡 Sending request to /api/ai/process-link...');
                response = await fetch(`${API_ENDPOINTS.ai.base}/process-link`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ youtubeUrl, textInput })
                });
            } else {
                const formData = new FormData();
                formData.append('textInput', textInput);
                if (selectedFile) {
                    formData.append('media', selectedFile);
                } else if (audioBlob) {
                    formData.append('media', audioBlob, 'recording.webm');
                }

                console.log('📡 Sending request to /api/ai/process...');
                response = await fetch(API_ENDPOINTS.ai.process, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
            }

            console.log('📥 Response received:', response.status, response.statusText);
            const data = await response.json();
            console.log('📦 Response data:', data);

            if (response.ok) {
                // [FIX] Handle Friendly Errors (Success: False) from Backend
                if (data.success === false) {
                    console.warn('AI Soft Error:', data);
                    alert('Atenção: ' + (data.message || 'Erro no processamento.'));
                    return; // Exit without entering review mode
                }

                setStructuredData(data);
                // [NEW] Enter Review Mode
                setReviewData({
                    title: data.title || '',
                    description: data.description || ''
                });
                setIsReviewing(true);
            } else {
                console.error('AI Error:', data);
                alert('Erro ao processar com IA: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Request Error:', error);
            console.error('Request Error:', error);
            alert('Erro na requisição: ' + error.message);
            setIsReviewing(false); // [SAFETY] Ensure review mode is off on error
        } finally {
            // Ensured to run to unblock UI
            setIsAnalyzing(false);
        }
    };

    // [NEW] Combined Action: Save Memory + Generate Plan
    const handleSaveAndGeneratePlan = async () => {
        if (!structuredData) return;

        try {
            // 1. Save Memory
            const token = localStorage.getItem('token');
            const saveResponse = await fetch(API_ENDPOINTS.memories.create, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    title: reviewData.title,
                    description: reviewData.description,
                    date: structuredData.date,
                    location: structuredData.location,
                    isPublic: true,
                    imageUrl: structuredData.imageUrl || 'https://placehold.co/400x200?text=Memoria+Cultural',
                    documentUrl: structuredData.documentUrl,
                    eventId: selectedEventId || null,
                    thumbnailUrl: structuredData.thumbnailUrl,
                    metadata: structuredData.metadata
                })
            });

            if (!saveResponse.ok) throw new Error('Falha ao salvar memória');
            const newMemory = await saveResponse.json();
            onMemoryCreated(newMemory);

            // 2. Generate Lesson Plan (Maceió Context)
            setIsGeneratingPlan(true); // Show loader immediately in next view if needed, or handle here

            // Optimistic Switch to Success View
            setSavedMemory(newMemory);
            setStructuredData(null);
            setIsReviewing(false);

            try {
                // [FIX] Adjusted Endpoint to /api/pedagogical/plan and added error logging
                const planResponse = await fetch(`${API_URL}/api/pedagogical/plan`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        memories: [newMemory],
                        gradeLevel: 'Grupo 5 - Educação Infantil', // [Maceió Context Enforced]
                        topic: `Memória: ${newMemory.title}`,
                        organizationId: organization.id
                    })
                });

                if (!planResponse.ok) {
                    const errorText = await planResponse.text();
                    throw new Error(`Erro na API (${planResponse.status}): ${errorText}`);
                }

                const planData = await planResponse.json();
                if (planData.success) {
                    setLessonPlan(planData.plan);
                }
            } catch (planError) {
                console.error('Plan Gen Error:', planError);
                // Plan generation failed but memory is saved. User sees generic success screen.
            } finally {
                setIsGeneratingPlan(false);
            }

        } catch (error) {
            console.error('Flow Error:', error);
            alert('Erro ao processar: ' + error.message);
        }
    };

    // [NEW] Generate BNCC Lesson Plan
    const generateLessonPlan = async () => {
        if (!savedMemory) return;
        setIsGeneratingPlan(true);
        try {
            const token = localStorage.getItem('token');
            // Assuming "Early Childhood" for now or derived from User/Event? 
            // We'll pass generic data and let backend adapt or default to Maceió logic if no grade specified.
            const response = await fetch(`${API_URL}/api/pedagogical/plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    memories: [savedMemory],
                    gradeLevel: 'Educação Infantil (4 a 5 anos)', // Defaulting for Scenario
                    topic: `Memória: ${savedMemory.title}`,
                    organizationId: organization.id // [FIX] Ensure Organization ID logic matches
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro na API (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            if (data.success) {
                setLessonPlan(data.plan);
            } else {
                alert('Erro ao gerar plano: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Erro na requisição do plano.');
        } finally {
            setIsGeneratingPlan(false);
        }
    };



    const handleDownloadPDF = async () => {
        if (!lessonPlan?.id) return;
        try {
            const token = localStorage.getItem('token');
            // [DEBUG] Log token to ensure it exists
            if (!token) {
                alert('Erro de Autenticação: Token não encontrado. Faça login novamente.');
                return;
            }

            const response = await fetch(`${API_URL}/api/pedagogical/plan/${lessonPlan.id}/pdf`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/pdf'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Plano_BNCC_${lessonPlan.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            console.error('Download Logic Error:', e);
            alert(`Erro ao baixar PDF: ${e.message}`);
        }
    };

    return (
        <div className="glass p-8 rounded-2xl shadow-xl border border-white/50 mb-12 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
                {savedMemory ? (
                    // [NEW] Success & Lesson Plan View
                    <div className="animate-fade-in text-center p-6">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Check className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-green-800 mb-2">Memória Preservada!</h2>
                        <p className="text-gray-600 mb-8">"{savedMemory.title}" agora faz parte do acervo.</p>

                        <div className="bg-white/60 rounded-xl p-6 border border-brand-purple/20 shadow-sm">
                            <h3 className="font-bold text-lg text-brand-purple mb-4 flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Inteligência Pedagógica (BNCC)
                            </h3>

                            {!lessonPlan ? (
                                <button
                                    onClick={generateLessonPlan}
                                    disabled={isGeneratingPlan}
                                    className="w-full py-4 bg-gradient-to-r from-brand-purple to-brand-gold text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {isGeneratingPlan ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Criando Plano...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-5 h-5" />
                                            <span>🎓 Gerar Plano de Aula (Maceió)</span>
                                        </div>
                                    )}
                                </button>
                            ) : (
                                <div className="text-left animate-fade-in-down">
                                    <div className="p-4 bg-white border border-gray-200 rounded-xl mb-4">
                                        {(() => {
                                            // [SAFETY] Safe Parsing
                                            let plan = null;
                                            try {
                                                // Handle both DB record (with stringified .content) and direct API object
                                                plan = lessonPlan?.content ? JSON.parse(lessonPlan.content) : lessonPlan;
                                            } catch (e) {
                                                return <p className="text-red-500">Erro ao processar dados do plano.</p>;
                                            }
                                            if (!plan) return <p className="text-red-500">Erro ao carregar plano.</p>;

                                            return (
                                                <>
                                                    <h4 className="font-bold text-gray-800 mb-1">{plan.title || 'Plano sem Título'}</h4>

                                                    {/* Summary Section */}
                                                    {plan.summary && (
                                                        <blockquote className="p-3 my-3 border-l-4 border-brand-purple bg-purple-50 italic text-gray-600 text-sm rounded-r-lg">
                                                            "{plan.summary}"
                                                        </blockquote>
                                                    )}

                                                    <p className="text-sm text-gray-500 mb-3">Códigos: {plan.bnccCodes?.join(', ') || 'N/A'}</p>

                                                    {/* Highlight Gigantinhos Kit */}
                                                    {plan.gigantinhosKit && (
                                                        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-3 border border-blue-100">
                                                            <strong>⚡ Kit Gigantinhos:</strong> {plan.gigantinhosKit}
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleDownloadPDF}
                                            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" /> PDF Oficial
                                        </button>
                                        <button
                                            onClick={() => { setSavedMemory(null); setLessonPlan(null); setTextInput(''); }}
                                            className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-50"
                                        >
                                            Nova Memória
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
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

                        {/* End of Organization Hint */}
                        {!structuredData ? (
                            <div className="space-y-6">
                                {/* [NEW] Input Mode Toggle */}
                                <div className="flex p-1 bg-gray-100 rounded-lg w-fit">
                                    <button
                                        onClick={() => setInputMode('file')}
                                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${inputMode === 'file' ? 'bg-white shadow text-brand-purple' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        📁 Upload Arquivo
                                    </button>
                                    <button
                                        onClick={() => setInputMode('youtube')}
                                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${inputMode === 'youtube' ? 'bg-red-600 shadow text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        📹 YouTube
                                    </button>
                                </div>

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

                                {/* Conditional Inputs based on Mode */}
                                {inputMode === 'file' ? (
                                    <>
                                        <div className="border-t border-gray-200 pt-6">
                                            <AudioRecorder
                                                onAudioReady={(blob) => setAudioBlob(blob)}
                                                onClear={() => setAudioBlob(null)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-600 rounded-xl border border-gray-200 transition-all shadow-sm hover:shadow-md group">
                                                <ImageIcon className="w-5 h-5 group-hover:text-brand-purple transition-colors" />
                                                <span className="font-medium">Adicionar Mídia/Doc</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*,audio/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
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
                                    </>
                                ) : (
                                    <div className="mt-4 animate-fade-in">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Cole o link do YouTube</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                                value={youtubeUrl}
                                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                            />
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1 bg-red-100 rounded text-red-600">
                                                <Film className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 ml-1">
                                            ℹ️ A IA lerá a legenda do vídeo para criar a memória automaticamente.
                                        </p>
                                    </div>
                                )}

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
                                    disabled={isAnalyzing || (inputMode === 'file' && !textInput && !selectedFile && !audioBlob) || (inputMode === 'youtube' && !youtubeUrl)}
                                    className={`w-full py-4 bg-gradient-to-r ${inputMode === 'youtube' ? 'from-red-600 via-red-500 to-red-600' : 'from-brand-purple via-indigo-800 to-brand-purple'} bg-[length:200%_auto] hover:bg-right text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group`}
                                >
                                    {isAnalyzing ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span>Tecendo memórias...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-6 h-6 group-hover:animate-spin" />
                                            <span>Mágica da IA</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-6 animate-fade-in">
                                    <div className="p-6 bg-white/60 rounded-xl border border-brand-purple/20 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-5 h-5 text-brand-gold" />
                                                <h3 className="font-serif font-bold text-brand-purple text-lg">Revisar Memória</h3>
                                            </div>
                                            <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg border border-yellow-200">
                                                Status: Pendente de Aprovação
                                            </span>
                                        </div>

                                        {/* [NEW] Media Preview for Review */}
                                        {structuredData?.thumbnailUrl && (
                                            <div className="mb-6 relative rounded-xl overflow-hidden shadow-lg border-2 border-white aspect-video bg-gray-100">
                                                <img
                                                    src={structuredData.thumbnailUrl.startsWith('http') ? structuredData.thumbnailUrl : `${API_URL}${structuredData.thumbnailUrl}`}
                                                    alt="Thumbnail do Vídeo"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                                        <div className="w-0 h-0 border-l-[12px] border-l-brand-purple border-y-[8px] border-y-transparent ml-1"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* [NEW] Reasoning Display (Collapsible) */}
                                        {structuredData?.reasoning && (
                                            <div className="mb-6">
                                                <button
                                                    onClick={() => setShowReasoning(!showReasoning)}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2 transition-colors uppercase tracking-wider"
                                                >
                                                    {showReasoning ? 'Ocultar Raciocínio' : '🔍 Ver como a IA pensou'}
                                                </button>

                                                {showReasoning && (
                                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl relative animate-fade-in-down">
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                                                                <Lightbulb className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Raciocínio da IA</h4>
                                                                <p className="text-sm text-blue-900 leading-relaxed italic">
                                                                    "{structuredData.reasoning}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Título da Memória</label>
                                                <input
                                                    type="text"
                                                    value={reviewData.title}
                                                    onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                                                    className="w-full p-3 font-serif font-bold text-xl text-gray-800 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/50"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data Sugerida</span>
                                                    {/* Safety check for data availability */}
                                                    <p className="text-gray-800 font-medium">{structuredData?.date || 'Data não identificada'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Local</span>
                                                    <p className="text-gray-800 font-medium flex items-center gap-1">
                                                        <MapPin className="w-4 h-4 text-brand-gold" />
                                                        {structuredData?.location || 'Não identificado'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">História (Edite se necessário)</label>
                                                <textarea
                                                    value={reviewData.description}
                                                    onChange={(e) => setReviewData({ ...reviewData, description: e.target.value })}
                                                    rows={6}
                                                    className="w-full p-4 text-gray-700 leading-relaxed italic bg-white border-l-4 border-brand-gold/30 rounded-r-lg focus:ring-2 focus:ring-brand-purple/50"
                                                />
                                            </div>

                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {structuredData?.tags?.map((tag, i) => (
                                                    <span key={i} className="px-3 py-1 bg-brand-purple/5 text-brand-purple text-xs font-bold rounded-full border border-brand-purple/10">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => {
                                                setStructuredData(null);
                                                setIsReviewing(false); // [SAFETY] Exit review mode explicitly
                                            }}
                                            className="flex-1 py-3 px-6 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                                        >
                                            Tentar Novamente
                                        </button>
                                        <button
                                            onClick={handleSaveAndGeneratePlan}
                                            className="flex-1 py-3 px-6 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg hover:shadow-green-600/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-5 h-5" />
                                            Confirmar e Salvar
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AIMemoryCreator;
