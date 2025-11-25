import React, { useState } from 'react';
import { Bot, Star, Phone, Shield, GraduationCap, Briefcase } from 'lucide-react';
import VoiceAgent from '../components/VoiceAgent';

const agents = [
    {
        id: 'roberto',
        name: 'Roberto',
        role: 'Consultor de Expansão',
        description: 'Especialista em vendas B2G. Negocia contratos com prefeituras e explica o ROI da plataforma.',
        price: 'R$ 499/mês',
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
        icon: Briefcase,
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        rating: 4.9
    },
    {
        id: 'lia',
        name: 'Lia',
        role: 'Guia Pedagógica',
        description: 'Ensina professores a usar a plataforma e sugere atividades baseadas na BNCC.',
        price: 'Grátis',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
        icon: GraduationCap,
        color: 'text-pink-600',
        bg: 'bg-pink-100',
        rating: 5.0
    },
    {
        id: 'camara',
        name: 'Mestre Câmara',
        role: 'Curador Cultural',
        description: 'Analisa seu acervo e encontra conexões históricas invisíveis.',
        price: 'R$ 99/mês',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
        icon: Shield,
        color: 'text-amber-600',
        bg: 'bg-amber-100',
        rating: 4.8
    }
];

const AgentMarketplace = () => {
    const [activeAgent, setActiveAgent] = useState(null);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-purple/10 rounded-full text-brand-purple font-bold text-sm mb-4 animate-fade-in">
                    <Bot className="w-4 h-4" />
                    <span>Agent Marketplace</span>
                </div>
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                    Contrate Inteligência, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-gold">
                        Escale seu Impacto
                    </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Escolha agentes especializados para trabalhar 24/7 na sua organização.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {agents.map((agent) => (
                    <div key={agent.id} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-110 transition-transform">
                                <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                            </div>
                            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 p-2 rounded-full ${agent.bg} ${agent.color} shadow-sm`}>
                                <agent.icon className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
                            <p className="text-sm font-medium text-brand-purple mb-2">{agent.role}</p>
                            <div className="flex justify-center items-center gap-1 text-amber-400 text-sm">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-bold text-gray-700">{agent.rating}</span>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm text-center mb-6 h-12 line-clamp-2">
                            {agent.description}
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Preço</p>
                                <p className="text-lg font-bold text-gray-900">{agent.price}</p>
                            </div>
                            <button
                                onClick={() => setActiveAgent(agent)}
                                className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-brand-purple transition-colors flex items-center gap-2 shadow-lg"
                            >
                                <Phone className="w-4 h-4" />
                                {agent.id === 'roberto' ? 'Falar Agora' : 'Contratar'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Voice Agent Overlay */}
            {activeAgent && (
                <VoiceAgent
                    agent={activeAgent}
                    onClose={() => setActiveAgent(null)}
                />
            )}
        </div>
    );
};

export default AgentMarketplace;
