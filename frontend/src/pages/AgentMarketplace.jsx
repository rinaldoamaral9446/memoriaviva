import React, { useState, useEffect } from 'react';
import { Bot, Star, Phone, Shield, GraduationCap, Briefcase, Plus, Heart, Sparkles, Zap, Brain, Edit, Trash2, Search, Filter, CheckCircle2, MonitorPlay } from 'lucide-react';
import VoiceAgent from '../components/VoiceAgent';
import AgentForm from '../components/AgentForm';
import useAgents from '../hooks/useAgents';

// Mapeamento de ícones
const ICONS = { Bot, Brain, Briefcase, GraduationCap, Heart, Shield, Sparkles, Zap, MonitorPlay };

const CATEGORIES = [
    { id: 'all', label: 'Todos os Agentes' },
    { id: 'pedagogy', label: 'Pedagogia' },
    { id: 'regional_history', label: 'História Regional' },
    { id: 'media', label: 'Produção de Mídia' },
    { id: 'public_mgmt', label: 'Gestão Pública' }
];

// Mock Data for "Specialist Agents" (Start with these if DB is empty)
const SPECIALIST_AGENTS = [
    {
        id: 'spec_1',
        name: 'Mestre do Folclore',
        role: 'Historiador Cultural',
        description: 'Especialista em tradições locais, lendas e manifestações culturais de Alagoas.',
        skills: ['Narrativa Oral', 'Identidade Cultural', 'Pesquisa Histórica'],
        rating: 5.0,
        avatar: null, // Use Icon
        icon: 'Heart',
        color: 'text-pink-600 bg-pink-50',
        category: 'regional_history',
        isWorking: true
    },
    {
        id: 'spec_2',
        name: 'Curador de Acervos',
        role: 'Arquivista Digital',
        description: 'Organiza, cataloga e preserva documentos históricos e fotografias antigas.',
        skills: ['Catalogação', 'Digitalização', 'Conservação'],
        rating: 4.9,
        avatar: null,
        icon: 'Shield',
        color: 'text-amber-600 bg-amber-50',
        category: 'public_mgmt',
        isWorking: false
    },
    {
        id: 'spec_3',
        name: 'Especialista BNCC',
        role: 'Consultor Pedagógico',
        description: 'Alinha planos de aula e projetos escolares às competências da Base Nacional Comum.',
        skills: ['BNCC', 'Planejamento', 'Avaliação'],
        rating: 5.0,
        avatar: null,
        icon: 'GraduationCap',
        color: 'text-brand-purple bg-purple-50',
        category: 'pedagogy',
        isWorking: true
    },
    {
        id: 'spec_4',
        name: 'Produtor Multimídia',
        role: 'Editor de Conteúdo',
        description: 'Transforma memórias e textos em roteiros de vídeo e podcasts educativos.',
        skills: ['Roteiro', 'Edição de Vídeo', 'Storytelling'],
        rating: 4.8,
        avatar: null,
        icon: 'MonitorPlay',
        color: 'text-blue-600 bg-blue-50',
        category: 'media',
        isWorking: false
    }
];

const AgentMarketplace = () => {
    const [activeAgent, setActiveAgent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { agents, loading, error, fetchAgents, saveAgent, deleteAgent } = useAgents();

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    // Combine DB agents with Specialists (prevent duplicates if ID matches)
    // For demo purposes, we prioritizing showing the UI structure.
    // Ideally we merge active agents. Assuming DB might be empty or valid.
    const displayAgents = [...SPECIALIST_AGENTS, ...agents.filter(a => !SPECIALIST_AGENTS.find(s => s.id === a.id))];

    const filteredAgents = displayAgents.filter(agent => {
        const matchCategory = selectedCategory === 'all' || agent.category === selectedCategory || (selectedCategory === 'pedagogy' && !agent.category); // Default uncat to pedagogy for demo
        const matchSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || agent.role.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

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
        if (window.confirm('Tem certeza que deseja demitir este agente?')) {
            await deleteAgent(id);
        }
    };

    const handleSave = async (agentData) => {
        await saveAgent(agentData);
        setIsEditing(false);
    };

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-gray-50">
            {/* Sidebar Filters */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-brand-purple" />
                        Especialidades
                    </h2>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${selectedCategory === cat.id
                                ? 'bg-brand-purple/10 text-brand-purple font-bold'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {cat.label}
                            {selectedCategory === cat.id && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <div className="bg-gradient-to-br from-brand-purple to-indigo-600 rounded-xl p-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-amber-300" />
                            <span className="font-bold text-sm">IA Premium</span>
                        </div>
                        <p className="text-xs text-purple-100 mb-3">Sua organização tem acesso ilimitado a todos os especialistas.</p>
                        <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors">
                            Ver Detalhes
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900">
                            Equipe de Especialistas
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Selecione um agente para colaborar em seus projetos culturais e pedagógicos.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar especialista..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none w-64 shadow-sm"
                            />
                        </div>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-purple text-white rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-brand-purple/20 text-sm whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Agente
                        </button>
                    </div>
                </div>

                {/* Agents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAgents.map((agent) => {
                        const IconComponent = ICONS[agent.icon] || Bot;
                        const isWorking = agent.isWorking; // Mock status

                        return (
                            <div
                                key={agent.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative flex flex-col"
                            >
                                {/* Active Badge */}
                                {isWorking && (
                                    <div className="absolute top-4 left-4 bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 z-10 animate-fade-in">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        Trabalhando Agora
                                    </div>
                                )}

                                {/* Card Actions (Edit/Delete) - Only for user created (check id type roughly) */}
                                {agent.id.length > 20 && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button onClick={(e) => handleEdit(agent, e)} className="p-2 bg-white rounded-full text-gray-500 hover:text-brand-purple shadow-sm ring-1 ring-gray-100">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={(e) => handleDelete(agent.id, e)} className="p-2 bg-white rounded-full text-gray-500 hover:text-red-500 shadow-sm ring-1 ring-gray-100">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="p-6 flex-1">
                                    <div className="flex items-start justify-between mb-4 mt-2">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${agent.color || 'bg-gray-100 text-gray-600'}`}>
                                            <IconComponent className="w-7 h-7" />
                                        </div>
                                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                                            <span className="font-bold text-xs text-amber-700">{agent.rating || '5.0'}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-purple transition-colors">{agent.name}</h3>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">{agent.role}</p>

                                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                                        {agent.description}
                                    </p>

                                    {/* Skills Badges */}
                                    {agent.skills && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {agent.skills.slice(0, 3).map((skill, i) => (
                                                <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[10px] font-medium text-gray-600">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 border-t border-gray-50">
                                    <button
                                        onClick={() => setActiveAgent(agent)}
                                        className="w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group-hover:bg-brand-purple group-hover:text-white bg-gray-50 text-gray-900"
                                    >
                                        <Zap className="w-4 h-4 group-hover:text-yellow-300 transition-colors" />
                                        Ativar Agente
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

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
