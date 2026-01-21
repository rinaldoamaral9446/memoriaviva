import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Bot, CheckCircle, Shield, Users, Settings, MapPin, X, Sparkles, School } from 'lucide-react';
import { API_URL } from '../config/api';

const AdminDashboard = () => {
    const [organizations, setOrganizations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAIOnboarding, setShowAIOnboarding] = useState(false);

    // AI Onboarding State
    const [step, setStep] = useState(0);
    const [aiMessages, setAiMessages] = useState([
        { role: 'ai', content: 'Olá! Sou seu assistente de cultura. Vamos configurar uma nova organização. Qual é o nome da instituição?' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [newOrgData, setNewOrgData] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [orgsRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/api/organizations`, { headers }),
                fetch(`${API_URL}/api/admin/stats`, { headers })
            ]);

            const orgsData = await orgsRes.json();
            const statsData = await statsRes.json();

            setOrganizations(orgsData.organizations || []);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAiSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const newMessages = [...aiMessages, { role: 'user', content: userInput }];
        setAiMessages(newMessages);
        setUserInput('');

        // Simple state machine for the "AI" interview
        setTimeout(async () => {
            let aiResponse = '';

            if (step === 0) {
                // Sanitize Slug
                const sanitizedSlug = userInput.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

                setNewOrgData({ ...newOrgData, name: userInput, slug: sanitizedSlug });
                aiResponse = `Ótimo! "${userInput}" soa imponente. Qual é a cor principal da marca (ex: #FF0000 ou "Azul Real")?`;
                setStep(1);
            } else if (step === 1) {
                setNewOrgData({ ...newOrgData, primaryColor: userInput.includes('#') ? userInput : '#4B0082' });
                aiResponse = 'Entendido. Agora, descreva em uma frase o "DNA Cultural" da organização. Isso ajudará a IA a gerar conteúdo relevante.';
                setStep(2);
            } else if (step === 2) {
                const finalData = {
                    ...newOrgData,
                    config: { aiInstructions: userInput, features: ['memories', 'timeline', 'ai'] }
                };

                // Create Org
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_URL}/api/organizations`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(finalData)
                    });

                    if (response.ok) {
                        aiResponse = '🎉 Organização criada com sucesso! O ambiente já está configurado com as diretrizes culturais definidas.';
                        fetchData();
                        setTimeout(() => setShowAIOnboarding(false), 3000);
                    } else {
                        const errData = await response.json().catch(() => ({}));
                        aiResponse = `Erro ao criar: ${errData.error || 'Tente novamente.'}`;
                    }
                } catch (error) {
                    console.error('AI Onboarding Error:', error);
                    aiResponse = `Erro de conexão: ${error.message}`;
                }
            }

            setAiMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        }, 1000);
    };

    // Config Modal State
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [selectedOrgId, setSelectedOrgId] = useState(null);
    const [configForm, setConfigForm] = useState({
        educational_brand: '',
        pedagogical_prompt: '',
        regional_context: ''
    });

    const openConfigModal = (org) => {
        setSelectedOrgId(org.id);
        const currentConfig = org.config || {};
        setConfigForm({
            educational_brand: currentConfig.educational_brand || '',
            pedagogical_prompt: currentConfig.pedagogical_prompt || '',
            regional_context: currentConfig.regional_context || ''
        });
        setShowConfigModal(true);
    };

    const handleConfigSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/organizations/${selectedOrgId}/config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(configForm)
            });

            if (response.ok) {
                alert('Configurações Regionais atualizadas!');
                setShowConfigModal(false);
                fetchData(); // Refresh to ensure local state is consistent
            } else {
                alert('Erro ao salvar configurações.');
            }
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Erro de conexão.');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Tem certeza que deseja EXCLUIR a organização "${name}"? Essa ação é irreversível e apagará todos os usuários e memórias associados.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/organizations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Organização excluída com sucesso.');
                fetchData();
            } else {
                const data = await response.json();
                alert(`Erro ao excluir: ${data.error}`);
            }
        } catch (error) {
            console.error('Error deleting org:', error);
            alert('Erro de conexão ao excluir.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="w-8 h-8 text-purple-600" />
                            Super Admin
                        </h1>
                        <p className="text-gray-600">Gestão Central de Organizações</p>
                    </div>
                    <button
                        onClick={() => setShowAIOnboarding(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Bot className="w-5 h-5" />
                        Nova Organização (AI Setup)
                    </button>
                </header>

                {/* Quick Actions */}


                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                    <Link to="/admin/org" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 group">
                        <div className="p-4 bg-purple-100 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Organizações</h3>
                            <p className="text-sm text-gray-500">Gerenciar limites e status</p>
                        </div>
                    </Link>
                    {/* [NEW] Units Management */}
                    <Link to="/admin/units" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 group">
                        <div className="p-4 bg-amber-100 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            <School className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Unidades</h3>
                            <p className="text-sm text-gray-500">Escolas e Gigantinhos</p>
                        </div>
                    </Link>
                    <Link to="/admin/ai" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 group">
                        <div className="p-4 bg-green-100 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <Bot className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Inteligência Artificial</h3>
                            <p className="text-sm text-gray-500">Monitorar custos e modelos</p>
                        </div>
                    </Link>
                    <Link to="/admin/audit" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 group">
                        <div className="p-4 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Auditoria</h3>
                            <p className="text-sm text-gray-500">Logs de segurança</p>
                        </div>
                    </Link>
                    <Link to="/admin/system" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 group">
                        <div className="p-4 bg-orange-100 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            <Settings className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Config. Globais</h3>
                            <p className="text-sm text-gray-500">DNA e Prompt Mestre</p>
                        </div>
                    </Link>
                    <Link to="/admin/roles" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 group">
                        <div className="p-4 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Papéis e Permissões</h3>
                            <p className="text-sm text-gray-500">Definir Acessos RBAC</p>
                        </div>
                    </Link>
                </div>

                {/* Stats Overview */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Organizações</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrgs}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ativas</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stats.activeOrgs}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Usuários Totais</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-pink-100 text-pink-600 rounded-lg">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Memórias</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalMemories}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Onboarding Modal */}
                {showAIOnboarding && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[600px]">
                            <div className="bg-purple-600 p-4 text-white flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Bot className="w-6 h-6" />
                                    <span className="font-bold">Assistente de Cultura</span>
                                </div>
                                <button onClick={() => setShowAIOnboarding(false)} className="hover:bg-purple-700 p-1 rounded">
                                    ✕
                                </button>
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
                                {aiMessages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`
                                            max-w-[80%] p-3 rounded-xl
                                            ${msg.role === 'user'
                                                ? 'bg-purple-600 text-white rounded-tr-none'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}
                                        `}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleAiSubmit} className="p-4 bg-white border-t">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={e => setUserInput(e.target.value)}
                                        placeholder="Digite sua resposta..."
                                        className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700"
                                    >
                                        Enviar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Regional Config Modal */}
                {showConfigModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden p-6 animate-fade-in">
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-6 h-6 text-brand-gold" />
                                    Configurações Regionais
                                </h2>
                                <button onClick={() => setShowConfigModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleConfigSubmit}>
                                <div className="space-y-4 mb-6">
                                    {/* Copilot Action */}
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-purple-900 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-purple-600" />
                                                IA Copilot
                                            </h3>
                                            <p className="text-xs text-purple-700">Preencher automaticamente com base na cidade.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const org = organizations.find(o => o.id === selectedOrgId);
                                                if (!org) return;

                                                const loadingBtn = document.getElementById('btn-suggest');
                                                if (loadingBtn) loadingBtn.innerText = 'Gerando...';

                                                try {
                                                    const token = localStorage.getItem('token');
                                                    const res = await fetch(`${API_URL}/api/pedagogical/suggest-config`, {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Authorization': `Bearer ${token}`
                                                        },
                                                        body: JSON.stringify({ cityName: org.name })
                                                    });
                                                    const data = await res.json();
                                                    if (data.educational_brand) {
                                                        setConfigForm(prev => ({
                                                            ...prev,
                                                            educational_brand: data.educational_brand,
                                                            pedagogical_prompt: data.pedagogical_prompt,
                                                            regional_context: data.regional_context
                                                        }));
                                                        alert('✨ Sugestão gerada! Por favor, revise os campos.');
                                                    }
                                                } catch (e) {
                                                    alert('Erro ao gerar sugestão.');
                                                } finally {
                                                    if (loadingBtn) loadingBtn.innerText = '✨ Sugerir DNA (IA)';
                                                }
                                            }}
                                            id="btn-suggest"
                                            className="px-4 py-2 bg-white border border-purple-200 text-purple-700 font-bold rounded-lg shadow-sm hover:bg-purple-100 transition-colors text-sm"
                                        >
                                            ✨ Sugerir DNA (IA)
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Nome do Material Didático (Kit 3D / Brand)
                                        </label>
                                        <input
                                            type="text"
                                            value={configForm.educational_brand}
                                            onChange={e => setConfigForm({ ...configForm, educational_brand: e.target.value })}
                                            placeholder="Ex: Kit Gigantinhos"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Este nome aparecerá no PDF e na interface do plano de aula.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Instrução Pedagógica (Prompt IA)
                                        </label>
                                        <textarea
                                            value={configForm.pedagogical_prompt}
                                            onChange={e => setConfigForm({ ...configForm, pedagogical_prompt: e.target.value })}
                                            placeholder="Ex: Priorize a ludicidade e a oralidade nas atividades."
                                            rows="2"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Contexto Regional Específico
                                        </label>
                                        <textarea
                                            value={configForm.regional_context}
                                            onChange={e => setConfigForm({ ...configForm, regional_context: e.target.value })}
                                            placeholder="Ex: Cite a história da Usina Utinga Leão e a Ferrovia. Mencione o Rio Mundaú."
                                            rows="4"
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Essas instruções guiarão a "personalidade local" da IA.</p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setShowConfigModal(false)}
                                        className="px-6 py-3 text-gray-600 hover:bg-gray-50 font-bold rounded-xl border border-gray-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow"
                                    >
                                        Salvar Configurações
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Org List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {organizations.map(org => (
                        <OrganizationCard key={org.id} org={org} onDelete={handleDelete} onConfig={() => openConfigModal(org)} />
                    ))}
                </div>
            </div>
        </div >
    );
};

const OrganizationCard = ({ org, onDelete, onConfig }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: org.primaryColor }}>
                {org.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${org.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {org.isActive ? 'Ativo' : 'Inativo'}
                </span>

                {/* [NEW] Manage Team Button */}
                <Link
                    to={`/admin/team?orgId=${org.id}`}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Gerenciar Equipe"
                >
                    <Users className="w-4 h-4" />
                </Link>

                {/* [NEW] Config Button */}
                <button
                    onClick={onConfig}
                    className="p-1.5 text-gray-400 hover:text-brand-purple hover:bg-purple-50 rounded-lg transition-colors"
                    title="Configurações Regionais (IA)"
                >
                    <Settings className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                {org.id !== 1 && (
                    <button
                        onClick={() => onDelete(org.id, org.name)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Organização"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                    </button>
                )}
            </div>
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-1">{org.name}</h3>
        <p className="text-sm text-gray-500 mb-4 flex-1">{org.domain || 'Sem domínio configurado'}</p>

        <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-4 mt-auto">
            <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {org._count?.users || 0} usuários
            </div>
            <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {org._count?.memories || 0} memórias
            </div>
        </div>
    </div>
);

export default AdminDashboard;
