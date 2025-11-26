import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2, Check } from 'lucide-react';

const AudioRecorder = ({ onAudioReady, onClear }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioURL(url);
                onAudioReady(blob);

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Erro ao acessar o microfone. Verifique as permissões.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const clearRecording = () => {
        setAudioBlob(null);
        setAudioURL(null);
        if (onClear) onClear();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                {!audioBlob ? (
                    <>
                        {!isRecording ? (
                            <button
                                type="button"
                                onClick={startRecording}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
                            >
                                <Mic className="w-5 h-5" />
                                Gravar Relato
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-all shadow-md animate-pulse"
                            >
                                <Square className="w-5 h-5" />
                                Parar Gravação
                            </button>
                        )}
                        {isRecording && (
                            <span className="text-sm text-red-600 font-medium flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                                Gravando...
                            </span>
                        )}
                    </>
                ) : (
                    <div className="flex items-center gap-3 w-full">
                        <audio src={audioURL} controls className="flex-1 h-10" />
                        <button
                            type="button"
                            onClick={clearRecording}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir Gravação"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="flex items-center text-green-600 text-sm font-medium">
                            <Check className="w-5 h-5 mr-1" />
                            Pronto
                        </div>
                    </div>
                )}
            </div>

            {!audioBlob && (
                <p className="text-xs text-gray-500">
                    🎙️ Grave um relato oral sobre a memória. A IA irá transcrever e extrair informações automaticamente.
                </p>
            )}
        </div>
    );
};

export default AudioRecorder;
