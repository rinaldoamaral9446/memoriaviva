import React, { useEffect, useState } from 'react';
import { Shield, ArrowRight, User, Loader } from 'lucide-react';
import { API_URL } from '../config/api';

const AuditLogSidebar = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/audit`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // Poll every 30 seconds for live updates
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, []);

    const getActionBadge = (action) => {
        if (action.includes('SYSTEM') || action.includes('DNA') || action.includes('AI')) {
            return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">IA System</span>;
        }
        if (action.includes('UNIT')) {
            return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">Unidades</span>;
        }
        if (action.includes('ORG')) {
            return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">Organização</span>;
        }
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">Geral</span>;
    };

    // Helper to format time as "há X horas" or date
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'agora mesmo';
        if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} horas`;
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="h-full bg-slate-50 border-l border-gray-200 p-4 flex flex-col w-80">
            <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-gray-500" />
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Histórico de Auditoria</h3>
            </div>

            {loading ? (
                <div className="flex justify-center p-4">
                    <Loader className="w-6 h-6 animate-spin text-gray-400" />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {logs.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center italic">Nenhum registro encontrado.</p>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className="relative pl-4 border-l-2 border-gray-200 hover:border-brand-purple transition-colors group">
                                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-brand-purple transition-colors"></div>

                                <div className="mb-1 flex justify-between items-start">
                                    {getActionBadge(log.action)}
                                    <span className="text-[10px] text-gray-400">{formatTime(log.createdAt)}</span>
                                </div>

                                <h4 className="text-sm font-semibold text-gray-800 leading-tight mb-1">
                                    {log.action.replace(/_/g, ' ')}
                                </h4>

                                <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                    {log.details.replace(/"/g, '')}
                                </p>

                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                            {log.user?.name ? log.user.name.charAt(0) : <User className="w-3 h-3" />}
                                        </div>
                                        <span className="text-xs text-gray-600 truncate max-w-[80px]">
                                            {log.user?.name || 'Sistema'}
                                        </span>
                                    </div>

                                    <button
                                        className="text-[10px] font-medium text-brand-purple hover:underline flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => alert(`Detalhes do Log #${log.id}:\n\n${log.details}`)}
                                    >
                                        Ver Detalhes <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AuditLogSidebar;
