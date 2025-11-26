import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, FileText, MapPin, Lightbulb, Download } from 'lucide-react';
import { API_URL } from '../config/api';

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

const AnalyticsPage = () => {
    const [overview, setOverview] = useState(null);
    const [memoryStats, setMemoryStats] = useState([]);
    const [userActivity, setUserActivity] = useState([]);
    const [locations, setLocations] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [overviewRes, statsRes, usersRes, locationsRes, insightsRes] = await Promise.all([
                fetch(`${API_URL}/api/analytics/overview`, { headers }),
                fetch(`${API_URL}/api/analytics/memories`, { headers }),
                fetch(`${API_URL}/api/analytics/users`, { headers }),
                fetch(`${API_URL}/api/analytics/locations`, { headers }),
                fetch(`${API_URL}/api/analytics/insights`, { headers })
            ]);

            setOverview(await overviewRes.json());
            setMemoryStats(await statsRes.json());
            setUserActivity(await usersRes.json());
            setLocations(await locationsRes.json());
            setInsights(await insightsRes.json());
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
                    <p className="text-gray-600 mt-2">Insights e métricas da sua organização</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Download className="w-4 h-4" />
                    Exportar Relatório
                </button>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
                <div className="space-y-3">
                    {insights.map((insight, i) => (
                        <div
                            key={i}
                            className={`p-4 rounded-xl border-l-4 ${insight.type === 'positive' ? 'bg-green-50 border-green-500' :
                                    insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                                        'bg-blue-50 border-blue-500'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <Lightbulb className={`w-5 h-5 ${insight.type === 'positive' ? 'text-green-600' :
                                        insight.type === 'warning' ? 'text-yellow-600' :
                                            'text-blue-600'
                                    }`} />
                                <p className="text-gray-700">{insight.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                        <FileText className="w-8 h-8 opacity-80" />
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-bold">{overview?.totalMemories || 0}</h3>
                    <p className="text-purple-100 text-sm">Total de Memórias</p>
                </div>

                <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 opacity-80" />
                    </div>
                    <h3 className="text-2xl font-bold">{overview?.totalUsers || 0}</h3>
                    <p className="text-pink-100 text-sm">Usuários Ativos</p>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                        <FileText className="w-8 h-8 opacity-80" />
                    </div>
                    <h3 className="text-2xl font-bold">{overview?.memoriesThisMonth || 0}</h3>
                    <p className="text-amber-100 text-sm">Memórias este Mês</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                        <MapPin className="w-8 h-8 opacity-80" />
                    </div>
                    <h3 className="text-2xl font-bold">{locations.length}</h3>
                    <p className="text-blue-100 text-sm">Locais Diferentes</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Memory Timeline */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Memórias ao Longo do Tempo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={memoryStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#8B5CF6"
                                strokeWidth={3}
                                dot={{ fill: '#8B5CF6', r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Distribuição por Categoria</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={overview?.categories || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {(overview?.categories || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* User Activity */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Usuários Mais Ativos</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={userActivity.slice(0, 6)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip />
                            <Bar dataKey="memoriesCount" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Locations */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Locais Mais Mencionados</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {locations.slice(0, 8).map((loc, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-purple-600" />
                                    <span className="text-gray-700 font-medium">{loc.location}</span>
                                </div>
                                <span className="text-purple-600 font-bold">{loc.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
