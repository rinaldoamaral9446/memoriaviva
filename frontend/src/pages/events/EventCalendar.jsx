import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Sparkles, Calendar as CalendarIcon, Plus, Loader, X, Check, MapPin, DollarSign, Users } from 'lucide-react';
import { API_URL } from '../../config/api';

const locales = {
    'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const EventCalendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [generatedSchedule, setGeneratedSchedule] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/events`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            // Format dates for calendar
            const formattedEvents = data.map(event => ({
                ...event,
                start: new Date(event.eventDate),
                end: new Date(new Date(event.eventDate).getTime() + 2 * 60 * 60 * 1000), // Assume 2h duration
                title: event.title
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSchedule = async () => {
        if (!aiPrompt) return;

        setAiLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/events/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ prompt: aiPrompt })
            });

            const data = await response.json();
            setGeneratedSchedule(data.schedule);
        } catch (error) {
            console.error('Error generating schedule:', error);
            alert('Erro ao gerar agenda. Tente novamente.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleConfirmSchedule = async () => {
        if (!generatedSchedule) return;

        try {
            const token = localStorage.getItem('token');
            // Create events sequentially
            for (const event of generatedSchedule) {
                await fetch(`${API_URL}/api/events`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(event)
                });
            }

            setIsAiModalOpen(false);
            setGeneratedSchedule(null);
            setAiPrompt('');
            fetchEvents();
            alert('Agenda criada com sucesso!');
        } catch (error) {
            console.error('Error saving schedule:', error);
            alert('Erro ao salvar eventos.');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-brand-purple" />
                        Agenda Cultural
                    </h1>
                    <p className="text-gray-600 mt-2">Gerencie e planeje os eventos da sua organização.</p>
                </div>
                <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
                >
                    <Sparkles className="w-5 h-5" />
                    Agendamento Mágico (IA)
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[600px]">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    culture="pt-BR"
                    messages={{
                        next: "Próximo",
                        previous: "Anterior",
                        today: "Hoje",
                        month: "Mês",
                        week: "Semana",
                        day: "Dia"
                    }}
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor: '#7C3AED', // brand-purple
                            borderRadius: '4px',
                        }
                    })}
                />
            </div>

            {/* AI Modal */}
            {isAiModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-brand-purple" />
                                Agendamento Mágico
                            </h2>
                            <button onClick={() => setIsAiModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {!generatedSchedule ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            O que você gostaria de agendar?
                                        </label>
                                        <textarea
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none min-h-[100px]"
                                            placeholder="Ex: Crie uma programação para a Semana do Livro na próxima semana, com palestras de manhã e oficinas à tarde."
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleGenerateSchedule}
                                            disabled={!aiPrompt || aiLoading}
                                            className="flex items-center gap-2 px-6 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 disabled:opacity-50 transition-colors"
                                        >
                                            {aiLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                            Gerar Agenda
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">Sugestão da IA:</h3>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {generatedSchedule.map((event, index) => (
                                            <div key={index} className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-purple-900">{event.title}</h4>
                                                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                                                        {new Date(event.eventDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-purple-700 mb-3">{event.description}</p>
                                                <div className="flex gap-4 text-xs text-purple-600">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {event.location}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" /> Cap: {event.capacity}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="w-3 h-3" /> {event.ticketPrice === 0 ? 'Grátis' : `R$ ${event.ticketPrice}`}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => setGeneratedSchedule(null)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            Voltar
                                        </button>
                                        <button
                                            onClick={handleConfirmSchedule}
                                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                            Confirmar e Salvar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventCalendar;
