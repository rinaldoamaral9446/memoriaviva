import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Save, ArrowLeft, Check, Lock, AlertTriangle } from 'lucide-react';
import { API_URL } from '../config/api';

const RESOURCES = ['memories', 'users', 'settings', 'organization', 'analytics', 'ai_copilot'];
const ACTIONS = ['create', 'read', 'update', 'delete', 'publish'];

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/roles`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setRoles(data);
            if (data.length > 0 && !selectedRole) {
                selectRole(data[0]);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectRole = (role) => {
        setSelectedRole(role);
        try {
            setPermissions(JSON.parse(role.permissions));
        } catch (e) {
            setPermissions({});
        }
    };

    const togglePermission = (resource, action) => {
        setPermissions(prev => {
            const resourcePerms = prev[resource] || [];
            if (resourcePerms.includes(action)) {
                return {
                    ...prev,
                    [resource]: resourcePerms.filter(a => a !== action)
                };
            } else {
                return {
                    ...prev,
                    [resource]: [...resourcePerms, action]
                };
            }
        });
    };

    const handleSave = async () => {
        if (!selectedRole) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/roles/${selectedRole.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: selectedRole.name,
                    description: selectedRole.description,
                    permissions: JSON.stringify(permissions)
                })
            });

            if (res.ok) {
                alert('Permissões atualizadas com sucesso!');
                fetchRoles(); // Refresh to update audit logs reference if needed
            } else {
                alert('Erro ao salvar permissões.');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Erro de conexão.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando papéis...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <Shield className="w-8 h-8 text-purple-600" />
                                Gestão de Papéis e Permissões
                            </h1>
                            <p className="text-gray-500">Defina o que cada nível de acesso pode fazer na plataforma.</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar: Role List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700">
                            Papéis Disponíveis
                        </div>
                        <div className="divide-y divide-gray-100">
                            {roles.map(role => (
                                <button
                                    key={role.id}
                                    onClick={() => selectRole(role)}
                                    className={`w-full text-left p-4 hover:bg-purple-50 transition-colors flex justify-between items-center ${selectedRole?.id === role.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''}`}
                                >
                                    <div>
                                        <div className="font-bold text-gray-900">{role.name}</div>
                                        <div className="text-xs text-gray-500">{role.slug}</div>
                                    </div>
                                    {selectedRole?.id === role.id && <Check className="w-4 h-4 text-purple-600" />}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <button className="text-sm text-purple-600 font-bold hover:underline">
                                + Criar Novo Papel
                            </button>
                        </div>
                    </div>

                    {/* Main Content: Matrix */}
                    <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        {selectedRole ? (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedRole.name}</h2>
                                        <p className="text-gray-500">{selectedRole.description || 'Sem descrição definida.'}</p>
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>

                                {selectedRole.isSystem && (
                                    <div className="mb-6 bg-blue-50 text-blue-800 p-3 rounded-lg flex items-center gap-2 text-sm border border-blue-100">
                                        <Lock className="w-4 h-4" />
                                        Este é um papel de sistema. Você pode editar as permissões, mas tenha cuidado ao remover acessos críticos.
                                    </div>
                                )}

                                {/* Permission Matrix */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-center">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="p-4 text-left font-bold text-gray-700 rounded-tl-lg">Recurso / Módulo</th>
                                                {ACTIONS.map(action => (
                                                    <th key={action} className="p-4 font-bold text-gray-700 capitalize">
                                                        {action}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {RESOURCES.map(resource => (
                                                <tr key={resource} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4 text-left font-medium text-gray-700 capitalize">
                                                        {resource.replace('_', ' ')}
                                                    </td>
                                                    {ACTIONS.map(action => {
                                                        const isChecked = permissions[resource]?.includes(action);
                                                        return (
                                                            <td key={action} className="p-4">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!isChecked}
                                                                    onChange={() => togglePermission(resource, action)}
                                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300 cursor-pointer"
                                                                />
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
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Shield className="w-16 h-16 mb-4 opacity-20" />
                                <p>Selecione um papel à esquerda para editar suas permissões.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleManagement;
