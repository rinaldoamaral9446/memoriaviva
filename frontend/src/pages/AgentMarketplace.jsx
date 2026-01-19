import React, { useState, useEffect } from 'react';
import { Bot, Star, Phone, Shield, GraduationCap, Briefcase, Plus, Heart, Sparkles, Zap, Brain, Edit, Trash2 } from 'lucide-react';
import VoiceAgent from '../components/VoiceAgent';
import AgentForm from '../components/AgentForm';
import useAgents from '../hooks/useAgents';

// Mapeamento de ícones para renderização
const ICONS = {
    Bot, Brain, Briefcase, GraduationCap, Heart, Shield, Sparkles, Zap
};

const AgentMarketplace = () => {
    const [activeAgent, setActiveAgent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);

    const { agents, loading, error, fetchAgents, saveAgent, deleteAgent } = useAgents();

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    const handleCreate = () => {
        setEditingAgent(null);
        setIsEditing(true);
    };

    const handleEdit = (agent, e) => {
        e.stopPropagation();
        setEditingAgent(agent);
        setIsEditing(true);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Tem certeza que deseja excluir este agente?')) {
            await deleteAgent(id);
        }
    };

    const handleSave = async (agentData) => {
        await saveAgent(agentData);
        setIsEditing(false);
    };

    if (loading && agents.length === 0) {
        return <div className="p-8 text-center text-gray-500">Carregando agentes...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Erro ao carregar agentes: {error}</div>;
    }

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
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                    Escolha agentes especializados ou edite seus próprios assistentes.
                </p>

                <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-purple text-white rounded-xl font-bold hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/20"
                >
                    <Plus className="w-5 h-5" />
                    Criar Novo Agente
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {agents.length === 0 ? (
                    <div className="col-span-1 md:col-span-3 text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bot className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum agente encontrado</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Sua organização ainda não possui agentes personalizados. Crie seu primeiro agente para começar a escalar sua produtividade.
                        </p>
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Criar Agora
                        </button>
                    </div>
                ) : (
                    agents.map((agent) => {
                        const IconComponent = ICONS[agent.icon] || Bot;

                        return (
                            <div
                                key={agent.id}
                                onClick={() => setActiveAgent(agent)}
                                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative"
                            >
                                {/* Management Actions */}
                                {!agent.isGlobal && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                            onClick={(e) => handleEdit(agent, e)}
                                            className="p-2 bg-white/90 rounded-full hover:text-brand-purple text-gray-500 shadow-sm border border-gray-100"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(agent.id, e)}
                                            className="p-2 bg-white/90 rounded-full hover:text-red-500 text-gray-500 shadow-sm border border-gray-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="relative mb-6">
                                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-110 transition-transform bg-gray-50 flex items-center justify-center">
                                        {agent.avatarUrl ? (
                                            <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <IconComponent className={`w-12 h-12 ${agent.color}`} />
                                        )}
                                    </div>
                                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 p-2 rounded-full bg-white shadow-sm border border-gray-100`}>
                                        <IconComponent className={`w-5 h-5 ${agent.color}`} />
                                    </div>
                                </div>

                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
                                    <p className={`text-sm font-medium mb-2 ${agent.color}`}>{agent.role}</p>
                                    <div className="flex justify-center items-center gap-1 text-amber-400 text-sm">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-bold text-gray-700">5.0</span>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm text-center mb-6 h-12 line-clamp-2">
                                    {agent.description}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Status</p>
                                        <p className="text-sm font-bold text-green-600">Disponível</p>
                                    </div>
                                    <button className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-brand-purple transition-colors flex items-center gap-2 shadow-lg">
                                        <Phone className="w-4 h-4" />
                                        Falar
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Voice Agent Overlay */}
            {activeAgent && (
                <VoiceAgent
                    agent={activeAgent}
                    onClose={() => setActiveAgent(null)}
                />
            )}

            {/* Edit/Create Modal */}
            {isEditing && (
                <AgentForm
                    agent={editingAgent}
                    onClose={() => setIsEditing(false)}
                    onSave={handleSave}
                    isLoading={loading}
                />
            )}
        </div>
    );
};
export default AgentMarketplace;
