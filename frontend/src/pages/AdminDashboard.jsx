import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Bot, CheckCircle, Shield, Users } from 'lucide-react';
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
                setNewOrgData({ ...newOrgData, name: userInput, slug: userInput.toLowerCase().replace(/\s+/g, '-') });
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
                        fetchOrganizations();
                        setTimeout(() => setShowAIOnboarding(false), 3000);
                    } else {
                        aiResponse = 'Houve um erro ao criar a organização. Tente novamente.';
                    }
                } catch (error) {
                    aiResponse = 'Erro de conexão.';
                }
            }

            setAiMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        }, 1000);
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link to="/admin/org" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 group">
                        <div className="p-4 bg-purple-100 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Organizações</h3>
                            <p className="text-sm text-gray-500">Gerenciar limites e status</p>
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

                {/* Org List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {organizations.map(org => (
                        <OrganizationCard key={org.id} org={org} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const OrganizationCard = ({ org }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
        <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: org.primaryColor }}>
                {org.name.substring(0, 2).toUpperCase()}
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${org.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {org.isActive ? 'Ativo' : 'Inativo'}
            </span>
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-1">{org.name}</h3>
        <p className="text-sm text-gray-500 mb-4">{org.domain || 'Sem domínio configurado'}</p>

        <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-4">
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
