import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';
import { Bot, DollarSign, BarChart3, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AiSettings = () => {
    const [settings, setSettings] = useState({});
    const [usageData, setUsageData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Settings
            const settingsRes = await fetch(`${API_URL}/api/admin/settings`, { headers });
            const settingsData = await settingsRes.json();

            // Fetch Usage (Last 30 days)
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const usageRes = await fetch(`${API_URL}/api/admin/ai/usage?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, { headers });
            const usageData = await usageRes.json();

            setSettings(settingsData);
            setUsageData(usageData);
        } catch (error) {
            console.error('Error fetching AI data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSetting = async (key, value) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/admin/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ key, value })
            });
            fetchData();
        } catch (error) {
            console.error('Error saving setting:', error);
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="space-y-6">
            {/* Global Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <SettingsIcon className="w-6 h-6 text-purple-600" />
                    Configurações Globais de IA
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo Padrão</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={settings.global_ai_model || 'gemini-pro'}
                            onChange={(e) => handleSaveSetting('global_ai_model', e.target.value)}
                        >
                            <option value="gemini-pro">Gemini Pro (Padrão)</option>
                            <option value="gemini-flash">Gemini Flash (Rápido/Econômico)</option>
                            <option value="gpt-4">GPT-4 (Alto Custo)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modo de Manutenção IA</label>
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                checked={settings.ai_maintenance_mode === true}
                                onChange={(e) => handleSaveSetting('ai_maintenance_mode', e.target.checked)}
                                className="w-5 h-5 text-purple-600 rounded"
                            />
                            <span className="text-gray-600">Pausar todas as gerações</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                    Consumo de Tokens (Últimos 30 dias)
                </h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={usageData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                            <YAxis />
                            <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                            <Legend />
                            <Line type="monotone" dataKey="tokensUsed" stroke="#8884d8" name="Tokens" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Cost Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-yellow-600" />
                        Relatório de Custos por Organização
                    </h2>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Organização</th>
                            <th className="p-4 font-semibold text-gray-600">Modelo</th>
                            <th className="p-4 font-semibold text-gray-600">Tokens</th>
                            <th className="p-4 font-semibold text-gray-600">Custo Estimado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {usageData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900">{item.organizationName}</td>
                                <td className="p-4 text-gray-600">{item.model}</td>
                                <td className="p-4 text-gray-600">{item.tokensUsed.toLocaleString()}</td>
                                <td className="p-4 font-medium text-green-600">
                                    ${item.cost.toFixed(4)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SettingsIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default AiSettings;
