import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertTriangle, Activity, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api';

const SystemSettings = () => {
    const [settings, setSettings] = useState({});
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form Stats
    const [metaPrompt, setMetaPrompt] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [settingsRes, logsRes] = await Promise.all([
                fetch(`${API_URL}/api/system/settings`, { headers }),
                fetch(`${API_URL}/api/system/audit`, { headers })
            ]);

            const settingsData = await settingsRes.json();
            const logsData = await logsRes.json();

            // Find Meta Prompt
            const promptSetting = settingsData.find(s => s.key === 'ai_meta_prompt_city_dna');
            if (promptSetting) {
                const parsed = JSON.parse(promptSetting.value);
                setMetaPrompt(parsed.prompt);
            }

            setLogs(logsData || []);
        } catch (error) {
            console.error('Error fetching system data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/system/settings/ai_meta_prompt_city_dna`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    value: { prompt: metaPrompt },
                    description: 'Meta-prompt utilizado pelo Copilot para sugerir configurações regionais via IA.'
                })
            });

            if (response.ok) {
                alert('Configurações salvas com sucesso!');
                fetchData(); // Refresh logs
            } else {
                alert('Erro ao salvar configurações.');
            }
        } catch (error) {
            alert('Erro de conexão.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Carregando sistema...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin" className="p-2 bg-white rounded-lg hover:bg-gray-100 shadow-sm transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <SettingsIcon className="w-6 h-6 text-gray-700" />
                            Configurações do Sistema
                        </h1>
                        <p className="text-gray-500">Ajustes globais da Inteligência Artificial e Auditoria</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Config Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <h2 className="font-bold text-lg text-gray-800">Meta-Prompt do Copilot</h2>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Instrução Mestra (DNA Regional)
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    Este prompt define como a IA sugere configurações para novas cidades.
                                    Use <code>${'{cityName}'}</code> onde o nome da cidade deve ser inserido.
                                </p>
                                <textarea
                                    value={metaPrompt}
                                    onChange={(e) => setMetaPrompt(e.target.value)}
                                    rows={15}
                                    className="w-full p-4 border border-gray-200 rounded-xl font-mono text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-lg shadow-purple-200"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Salvando...' : 'Salvar Mestra'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Audit Log */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                Log de Auditoria
                            </h3>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {logs.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">Nenhum registro encontrado.</p>
                                ) : (
                                    logs.map(log => (
                                        <div key={log.id} className="text-sm border-b border-gray-50 pb-3 last:border-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-gray-700">{log.action}</span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(log.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 break-words font-mono bg-gray-50 p-1 rounded">
                                                {log.details ? log.details.substring(0, 100) + '...' : 'Sem detalhes'}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
