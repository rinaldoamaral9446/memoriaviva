import React, { useState, useEffect, useRef } from 'react';
import { Phone, Mic, MicOff, X, Volume2, VolumeX } from 'lucide-react';

const VoiceAgent = ({ agent, onClose }) => {
    const [isCallActive, setIsCallActive] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [isMuted, setIsMuted] = useState(false);

    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'pt-BR';
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.onresult = handleSpeechResult;
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (synthRef.current) synthRef.current.cancel();
        };
    }, []);

    const handleSpeechResult = async (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        await sendToAgent(text);
    };

    const sendToAgent = async (text) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5001/api/ai/agent/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: text,
                    agentId: agent.id
                })
            });

            const data = await res.json();
            setResponse(data.response);
            speak(data.response);
        } catch (error) {
            console.error('Agent Error:', error);
        }
    };

    const speak = (text) => {
        if (synthRef.current.speaking) {
            synthRef.current.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.1; // Slightly faster for sales persona
        utterance.pitch = 0.9; // Slightly deeper

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            // Auto-listen after agent finishes speaking (conversation flow)
            if (isCallActive && !isMuted) {
                setTimeout(() => {
                    try {
                        recognitionRef.current.start();
                    } catch (e) { /* Ignore if already started */ }
                }, 500);
            }
        };

        synthRef.current.speak(utterance);
    };

    const startCall = () => {
        setIsCallActive(true);
        // Initial greeting
        speak("Alô? Aqui é o Roberto da Memória Viva! Tudo bom? Vi que você tá explorando nossa plataforma. Já pensou em levar essa tecnologia pra todas as escolas da sua rede?");
    };

    const endCall = () => {
        setIsCallActive(false);
        if (synthRef.current) synthRef.current.cancel();
        if (recognitionRef.current) recognitionRef.current.stop();
        onClose();
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (!isMuted) {
            if (recognitionRef.current) recognitionRef.current.stop();
        }
    };

    if (!isCallActive) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-brand-purple shadow-lg">
                        <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{agent.name}</h2>
                    <p className="text-gray-500 mb-8">{agent.role}</p>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={onClose}
                            className="p-4 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <button
                            onClick={startCall}
                            className="p-4 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/30 transition-all animate-pulse"
                        >
                            <Phone className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="mt-4 text-sm text-gray-400">Clique para iniciar a chamada</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-between py-12 z-50 animate-fade-in">
            {/* Header */}
            <div className="text-center text-white/80">
                <p className="text-sm font-medium tracking-widest uppercase">Chamada de Voz</p>
                <p className="text-xs mt-1 opacity-50">Criptografada • IA Ativa</p>
            </div>

            {/* Avatar & Visualizer */}
            <div className="relative">
                {/* Pulsing Rings */}
                {(isSpeaking || isListening) && (
                    <>
                        <div className="absolute inset-0 bg-brand-purple/30 rounded-full animate-ping opacity-75"></div>
                        <div className="absolute inset-0 bg-brand-purple/20 rounded-full animate-ping delay-75 opacity-50"></div>
                    </>
                )}

                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl relative z-10">
                    <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                </div>

                <div className="mt-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">{agent.name}</h2>
                    <p className="text-brand-purple font-medium animate-pulse">
                        {isSpeaking ? 'Falando...' : isListening ? 'Ouvindo...' : 'Conectado'}
                    </p>
                </div>
            </div>

            {/* Transcript (Optional - for debug/accessibility) */}
            <div className="px-8 w-full max-w-md text-center">
                <p className="text-white/50 text-sm italic line-clamp-2">
                    "{response || transcript || '...'}"
                </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8">
                <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <button
                    onClick={endCall}
                    className="p-6 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-red-500/30 transition-all transform hover:scale-105"
                >
                    <Phone className="w-8 h-8 rotate-[135deg]" />
                </button>

                <button className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
                    <Volume2 className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default VoiceAgent;
