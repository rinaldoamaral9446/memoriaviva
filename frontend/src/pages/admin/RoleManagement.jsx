
import React, { useState, useEffect } from 'react';
import {
    Shield, Plus, Save, Trash2, Check,
    AlertCircle, Loader, Users, Lock, ChevronRight, LayoutGrid, Search
} from 'lucide-react';
import { API_URL } from '../../config/api';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Permission Matrix Configuration
    const RESOURCES = ['memories', 'users', 'units', 'marketplace', 'ai_copilot', 'moderation', 'settings', 'analytics'];

    const RESOURCE_CONFIG = {
        memories: { label: 'Memórias', description: 'Gerenciar acervo e histórias' },
        users: { label: 'Usuários', description: 'Gestão de equipe e acessos' },
        units: { label: 'Unidades (Escolas)', description: 'Escolas e centros (Gigantinhos)' },
        marketplace: { label: 'Marketplace', description: 'Ativação de Agentes' },
        ai_copilot: { label: 'DNA & Prompts da IA', description: 'Configuração de Comportamento e Guardrails' },
        moderation: { label: 'Moderação de Mídia', description: 'Aprovação e curadoria de conteúdo' },
        settings: { label: 'Configurações', description: 'Ajustes globais do sistema' },
        analytics: { label: 'Analytics', description: 'Visualização de dados' }
    };

    // Mapping specific actions to Matrix Columns
    const COLUMNS = [
        { key: 'create', label: 'Create', actionMatch: ['create'] },
        { key: 'read', label: 'Read', actionMatch: ['read', 'view', 'browse'] },
        { key: 'update', label: 'Update', actionMatch: ['update', 'edit_instructions', 'edit_guardrails', 'configure', 'moderate'] },
        { key: 'delete', label: 'Delete', actionMatch: ['delete', 'deactivate'] },
        { key: 'publish', label: 'Publish', actionMatch: ['publish', 'activate', 'create_draft'] }
    ];

    const AVAILABLE_ACTIONS = {
        memories: ['create', 'read', 'update', 'delete', 'publish', 'create_draft'],
        users: ['create', 'read', 'update', 'delete'],
        units: ['create', 'read', 'update', 'delete'],
        marketplace: ['browse', 'activate', 'deactivate'],
        ai_copilot: ['view', 'edit_instructions', 'edit_guardrails'],
        moderation: ['read', 'moderate'],
        settings: ['read', 'update'],
        analytics: ['read']
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL} /api/roles`, {
                headers: { Authorization: `Bearer ${token} ` }
            });
            const data = await response.json();
            const loadedRoles = Array.isArray(data) ? data : [];
            setRoles(loadedRoles);

            // Select first role by default if none selected
            if (!selectedRole && loadedRoles.length > 0) {
                selectRole(loadedRoles[0]);
            } else if (selectedRole) {
                // Refresh currently selected role data
                const updated = loadedRoles.find(r => r.id === selectedRole.id);
                if (updated) selectRole(updated);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectRole = (role) => {
        // Parse permissions if string
        const permissions = typeof role.permissions === 'string'
            ? JSON.parse(role.permissions)
            : role.permissions || {};

        // Ensure all resources exist in permissions object
        RESOURCES.forEach(r => {
            if (!permissions[r]) permissions[r] = [];
        });

        setSelectedRole({ ...role, permissions });
    };

    const handlePermissionChange = (resource, columnKey) => {
        if (!selectedRole) return;

        // Find which actual actions map to this column for this resource
        const actionsInColumn = COLUMNS.find(c => c.key === columnKey).actionMatch;
        const validActionsForResource = AVAILABLE_ACTIONS[resource]; // e.g. ['browse', 'activate'] for marketplace

        // Intersect: Which actions *could* be toggled here?
        const targetActions = actionsInColumn.filter(a => validActionsForResource.includes(a));

        if (targetActions.length === 0) return; // No actions for this column in this resource

        setSelectedRole(prev => {
            const currentPerms = prev.permissions[resource] || [];
            // Check if ANY of the target actions are present
            const isChecked = targetActions.some(a => currentPerms.includes(a));

            let newPerms;
            if (isChecked) {
                // Uncheck: Remove ALL target actions
                newPerms = currentPerms.filter(a => !targetActions.includes(a));
            } else {
                // Check: Add ALL target actions
                // (Simple toggle logic. For more granularity, we'd need checkboxes per action, but Matrix implies grouping)
                const toAdd = targetActions.filter(a => !currentPerms.includes(a));
                newPerms = [...currentPerms, ...toAdd];
            }

            return {
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [resource]: newPerms
                }
            };
        });
    };

    const isBoxChecked = (resource, columnKey) => {
        if (!selectedRole) return false;
        const actionsInColumn = COLUMNS.find(c => c.key === columnKey).actionMatch;
        const currentPerms = selectedRole.permissions[resource] || [];
        // Checked if at least one relevant action is present
        return actionsInColumn.some(a => currentPerms.includes(a));
    };

    const isBoxDisabled = (resource, columnKey) => {
        // Disabled if this resource has NO actions that map to this column
        const actionsInColumn = COLUMNS.find(c => c.key === columnKey).actionMatch;
        const validActionsForResource = AVAILABLE_ACTIONS[resource] || [];
        const hasActions = actionsInColumn.some(a => validActionsForResource.includes(a));
        return !hasActions;
    };

    const handleSave = async () => {
        if (!selectedRole) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const url = `${API_URL} /api/roles / ${selectedRole.id} `;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token} `
                },
                body: JSON.stringify({
                    permissions: selectedRole.permissions
                    // We don't update name/desc here based on the screenshot, but could add inputs
                })
            });

            if (response.ok) {
                alert('Permissões atualizadas com sucesso!');
                fetchRoles();
            } else {
                alert('Erro ao salvar.');
            }
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleCreateRole = async () => {
        const name = prompt("Nome do novo papel:");
        if (!name) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL} /api/roles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token} `
                },
                body: JSON.stringify({
                    name,
                    description: 'Novo papel personalizado',
                    permissions: {}
                })
            });
            if (response.ok) fetchRoles();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteRole = async () => {
        if (!selectedRole || selectedRole.isSystem) return;
        if (!confirm(`Excluir o papel "${selectedRole.name}" ? `)) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL} /api/roles / ${selectedRole.id} `, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token} ` }
            });
            setSelectedRole(null);
            fetchRoles();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading && roles.length === 0) return <div className="p-8"><Loader className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center gap-3 shadow-sm sticky top-0 z-10">
                <Shield className="w-6 h-6 text-brand-purple" />
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Gestão de Papéis e Permissões</h1>
                    <p className="text-xs text-gray-500">Defina o que cada nível de acesso pode fazer na plataforma.</p>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full p-6 gap-6">

                {/* Sidebar: Role List */}
                <div className="w-64 flex-shrink-0 flex flex-col gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-h-[calc(100vh-140px)]">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="font-bold text-gray-700 text-sm">Papéis Disponíveis</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {roles.map(role => (
                                <button
                                    key={role.id}
                                    onClick={() => selectRole(role)}
                                    className={`w - full text - left p - 3 rounded - lg text - sm transition - all flex items - center justify - between group ${selectedRole?.id === role.id
                                            ? 'bg-brand-purple/10 text-brand-purple font-medium border border-brand-purple/20'
                                            : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                                        } `}
                                >
                                    <div>
                                        <div className="font-semibold">{role.name}</div>
                                        <div className="text-[10px] opacity-70 truncate max-w-[140px]">{role.description}</div>
                                    </div>
                                    {selectedRole?.id === role.id && <ChevronRight className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                        <div className="p-3 border-t border-gray-100">
                            <button
                                onClick={handleCreateRole}
                                className="w-full py-2 flex items-center justify-center gap-2 text-brand-purple text-sm font-bold hover:bg-brand-purple/5 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Criar Novo Papel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content: Matrix */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full max-h-[calc(100vh-140px)]">
                    {selectedRole ? (
                        <>
                            {/* Role Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedRole.name}</h2>
                                    <p className="text-gray-500 text-sm">{selectedRole.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    {!selectedRole.isSystem && (
                                        <button
                                            onClick={handleDeleteRole}
                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" /> Excluir
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-6 py-2 bg-brand-purple text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Salvar Alterações
                                    </button>
                                </div>
                            </div>

                            {/* System Role Warning */}
                            {selectedRole.isSystem && (
                                <div className="mx-6 mt-6 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3 text-sm text-blue-700">
                                    <Lock className="w-4 h-4 flex-shrink-0" />
                                    Este é um papel de sistema. Você pode editar as permissões, mas tenha cuidado ao remover acessos críticos.
                                </div>
                            )}

                            {/* Permissions Table */}
                            <div className="p-6 overflow-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-4 font-bold text-gray-900 w-1/3">Recurso / Módulo</th>
                                            {COLUMNS.map(col => (
                                                <th key={col.key} className="text-center py-4 font-bold text-gray-700">{col.label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {RESOURCES.map(resource => (
                                            <tr key={resource} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-5 pr-4">
                                                    <div className="font-bold text-gray-800">{RESOURCE_CONFIG[resource].label}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{RESOURCE_CONFIG[resource].description}</div>
                                                </td>
                                                {COLUMNS.map(col => {
                                                    const disabled = isBoxDisabled(resource, col.key);
                                                    const checked = isBoxChecked(resource, col.key);

                                                    return (
                                                        <td key={col.key} className="text-center py-5">
                                                            <div className="flex justify-center">
                                                                <button
                                                                    onClick={() => !disabled && handlePermissionChange(resource, col.key)}
                                                                    disabled={disabled}
                                                                    className={`
w - 6 h - 6 rounded border transition - all flex items - center justify - center
                                                                        ${disabled
                                                                            ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                                                                            : checked
                                                                                ? 'bg-brand-purple border-brand-purple shadow-sm scale-110'
                                                                                : 'items-center border-gray-300 hover:border-brand-purple cursor-pointer'
                                                                        }
`}
                                                                >
                                                                    {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <LayoutGrid className="w-16 h-16 mb-4 opacity-20" />
                            <p>Selecione um papel para editar suas permissões</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleManagement;

