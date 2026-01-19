import React, { useState, useEffect } from 'react';
import { Camera, BookOpen, School, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import StatCard from '../components/analytics/StatCard';
import EngagementChart from '../components/analytics/EngagementChart';
import { useAuth } from '../context/AuthContext';

const SemedDashboard = () => {
    const { token } = useAuth();
    const [summary, setSummary] = useState(null);
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // Fetch Summary and Schools in parallel
                const [resSummary, resRanking] = await Promise.all([
                    fetch('http://localhost:5000/api/analytics/summary', { headers }),
                    fetch('http://localhost:5000/api/analytics/schools', { headers })
                ]);

                if (!resSummary.ok || !resRanking.ok) {
                    throw new Error('Falha ao carregar dados analíticos');
                }

                const summaryData = await resSummary.json();
                const rankingData = await resRanking.json();

                setSummary(summaryData);
                setRanking(rankingData);

            } catch (err) {
                console.error("Dashboard Load Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchAnalytics();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader className="w-10 h-10 text-brand-purple animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Carregando dados da rede...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Ops! Algo deu errado.</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-brand-purple text-white rounded-full hover:bg-brand-purple-dark transition-colors"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <header className="mb-10">
                <h1 className="text-3xl font-serif font-bold text-gray-900">Gestão - Rede Municipal</h1>
                <p className="text-gray-600 mt-2">Monitoramento do Programa Memória Viva (Gigantinhos)</p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard
                    label="Memórias Preservadas"
                    value={summary?.totalMemories || 0}
                    icon={Camera}
                    color="text-blue-600"
                    subtext="Acervo Digital Total"
                />
                <StatCard
                    label="Planos de Aula"
                    value={summary?.totalLessonPlans || 0}
                    icon={BookOpen}
                    color="text-emerald-500"
                    subtext="Gerados pela IA"
                />
                <StatCard
                    label="Escolas Ativas"
                    value={summary?.activeSchools || 0}
                    icon={School}
                    color="text-orange-500"
                    subtext="Com engajamento registrado"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* School Ranking Chart (Occupies 2 columns) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-brand-gold" />
                            Ranking de Engajamento
                        </h2>
                        <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-500">
                            Top Escolas
                        </span>
                    </div>
                    <EngagementChart data={ranking} height={350} />
                </div>

                {/* Recent Activity / Quick Actions (Occupies 1 column) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Ações Rápidas</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-1">Exportar Relatório</h3>
                            <p className="text-sm text-blue-700 mb-3">Baixe os dados completos em CSV.</p>
                            <button className="w-full py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                                Em Breve
                            </button>
                        </div>

                        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <h3 className="font-semibold text-emerald-900 mb-1">Nova Campanha</h3>
                            <p className="text-sm text-emerald-700 mb-3">Incentive o cadastro de novas memórias.</p>
                            <button className="w-full py-2 bg-white border border-emerald-200 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors">
                                Criar Notificação
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SemedDashboard;
