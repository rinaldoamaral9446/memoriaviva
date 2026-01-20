import React, { useState, useEffect } from 'react';
import { useOrganization } from '../context/OrganizationContext';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, BookOpen, MapPin, Lightbulb, Download, TrainFrontTunnel } from 'lucide-react';
import { API_URL } from '../config/api';

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

const AnalyticsPage = () => {
    const { organization, branding } = useOrganization();
    const [overview, setOverview] = useState(null);
    const [memoryStats, setMemoryStats] = useState([]);
    const [userActivity, setUserActivity] = useState([]);
    const [locations, setLocations] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (organization) {
            fetchAnalytics();
        }
    }, [organization]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [overviewRes, statsRes, usersRes, locationsRes, insightsRes] = await Promise.all([
                fetch(`${API_URL}/api/analytics/overview`, { headers }),
                fetch(`${API_URL}/api/analytics/memories`, { headers }),
                fetch(`${API_URL}/api/analytics/users`, { headers }),
                fetch(`${API_URL}/api/analytics/locations`, { headers }),
                fetch(`${API_URL}/api/analytics/insights`, { headers })
            ]);

            if (overviewRes.ok) setOverview(await overviewRes.json());
            if (statsRes.ok) setMemoryStats(await statsRes.json());
            if (usersRes.ok) setUserActivity(await usersRes.json());
            if (locationsRes.ok) setLocations(await locationsRes.json());
            if (insightsRes.ok) setInsights(await insightsRes.json());

        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Regional Logic for Rio Largo
    const isRioLargo = organization?.name?.toLowerCase().includes('rio largo') || organization?.slug?.includes('rio-largo');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: branding?.primaryColor || '#8B5CF6' }}></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Painel de Impacto Cultural</h1>
                    <p className="text-gray-500 mt-1">
                        Acompanhe em tempo real a preservação da memória em <span className="font-semibold text-gray-800">{organization?.name}</span>.
                    </p>
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-sm hover:shadow-md transition-all text-sm font-bold"
                    style={{ backgroundColor: branding?.primaryColor || '#8B5CF6' }}
                >
                    <Download className="w-4 h-4" />
                    Exportar Relatório
                </button>
            </div>

            {/* AI Insights - Stitch Alert Design */}
            {insights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.map((insight, i) => (
                        <div
                            key={i}
                            className={`p-4 rounded-lg border-l-4 shadow-sm flex items-start gap-4 ${insight.type === 'positive' ? 'bg-green-50 border-green-500' :
                                insight.type === 'warning' ? 'bg-amber-50 border-amber-500' :
                                    'bg-blue-50 border-blue-500'
                                }`}
                        >
                            <Lightbulb className={`w-5 h-5 mt-0.5 ${insight.type === 'positive' ? 'text-green-600' :
                                insight.type === 'warning' ? 'text-amber-600' :
                                    'text-blue-600'
                                }`} />
                            <div>
                                <p className={`font-bold text-sm ${insight.type === 'positive' ? 'text-green-800' :
                                    insight.type === 'warning' ? 'text-amber-800' :
                                        'text-blue-800'
                                    }`}>Insight da IA</p>
                                <p className="text-gray-700 text-sm">{insight.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Metric Cards - Stitch Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-lg" style={{ color: branding?.primaryColor, backgroundColor: `${branding?.primaryColor}15` }}>
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de Memórias</p>
                        <h3 className="text-2xl font-bold text-gray-900">{overview?.totalMemories || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-pink-100 text-pink-600 rounded-lg">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Usuários Ativos</p>
                        <h3 className="text-2xl font-bold text-gray-900">{overview?.totalUsers || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Novas este Mês</p>
                        <h3 className="text-2xl font-bold text-gray-900">{overview?.memoriesThisMonth || 0}</h3>
                    </div>
                </div>

                {/* Regional Card: Rio Largo */}
                {isRioLargo ? (
                    <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100 flex items-center gap-4 hover:shadow-md transition-shadow ring-1 ring-indigo-200">
                        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
                            <TrainFrontTunnel className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Patrimônio Ferroviário</p>
                            <h3 className="text-xl font-bold text-indigo-900">
                                {Math.floor((overview?.totalMemories || 0) * 0.3)} <span className="text-sm font-normal text-indigo-700">registros</span>
                            </h3>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Locais Mapeados</p>
                            <h3 className="text-2xl font-bold text-gray-900">{locations.length}</h3>
                        </div>
                    </div>
                )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart: Growth Over Time */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-serif font-bold text-gray-800 mb-6">Evolução do Acervo</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={memoryStats}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={branding?.primaryColor || '#8B5CF6'} stopOpacity={0.1} />
                                        <stop offset="95%" stopColor={branding?.primaryColor || '#8B5CF6'} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: branding?.primaryColor || '#8B5CF6', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke={branding?.primaryColor || '#8B5CF6'}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Chart: Categories */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-serif font-bold text-gray-800 mb-6">Por Tipo de Mídia</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={overview?.categories || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {(overview?.categories || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            {(overview?.categories || []).map((entry, index) => (
                                <div key={index} className="flex items-center gap-1 text-xs text-gray-600">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    <span>{entry.category} ({entry.count})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Activity */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Top Colaboradores</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={userActivity.slice(0, 6)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: '#4B5563' }} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="memoriesCount" fill={branding?.primaryColor || '#8B5CF6'} radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Locations */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Destaques Geográficos</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {locations.slice(0, 8).map((loc, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700 font-medium text-sm">{loc.location}</span>
                                </div>
                                <span className="font-bold text-gray-900 text-sm">{loc.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
