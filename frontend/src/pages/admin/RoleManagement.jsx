import React, { useState, useEffect } from 'react';
import {
    Shield, Plus, Edit2, Trash2, Save, X, Sparkles, Check, AlertCircle, Loader
} from 'lucide-react';
import { API_URL } from '../../config/api';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        mode: 'magic', // 'magic' or 'manual'
        magicDescription: '',
        permissions: {
            memories: [],
            users: [],
            settings: [],
            analytics: []
        }
    });

    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);

    const RESOURCES = ['memories', 'users', 'settings', 'analytics'];
    const ACTIONS = {
        memories: ['create', 'read', 'update', 'delete', 'publish', 'create_draft'],
        users: ['create', 'read', 'update', 'delete'],
        settings: ['read', 'update'],
        analytics: ['read']
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/roles`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setRoles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching roles:', error);
            setRoles([]); // Fallback to empty array
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePermissions = async () => {
        if (!formData.magicDescription) return;

        setAiLoading(true);
        setAiError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/roles/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ description: formData.magicDescription })
            });

            if (!response.ok) throw new Error('Failed to generate');

            const data = await response.json();
            setFormData(prev => ({
                ...prev,
                permissions: { ...prev.permissions, ...data.permissions },
                description: prev.description || formData.magicDescription // Auto-fill description if empty
            }));
        } catch (error) {
            setAiError('Erro ao gerar permissões. Tente novamente.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingRole
                ? `${API_URL}/api/roles/${editingRole.id}`
                : `${API_URL}/api/roles`;

            const method = editingRole ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    permissions: formData.permissions
                })
            });

            if (response.ok) {
                fetchRoles();
                setIsModalOpen(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error saving role:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este perfil?')) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/roles/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRoles();
        } catch (error) {
            console.error('Error deleting role:', error);
        }
    };

    const resetForm = () => {
        setEditingRole(null);
        setFormData({
            name: '',
            description: '',
            mode: 'magic',
            magicDescription: '',
            permissions: { memories: [], users: [], settings: [], analytics: [] }
        });
    };

    const openEdit = (role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            mode: 'manual', // Default to manual for editing
            magicDescription: '',
            permissions: typeof role.permissions === 'string'
                ? JSON.parse(role.permissions)
                : role.permissions
        });
        setIsModalOpen(true);
    };

    const togglePermission = (resource, action) => {
        setFormData(prev => {
            const current = prev.permissions[resource] || [];
            const updated = current.includes(action)
                ? current.filter(a => a !== action)
                : [...current, action];

            return {
                ...prev,
                permissions: { ...prev.permissions, [resource]: updated }
            };
        });
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <Loader className="w-8 h-8 animate-spin mx-auto text-brand-purple" />
                <p className="mt-2 text-gray-600">Carregando perfis...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-brand-purple" />
                        Gestão de Perfis
                    </h1>
                    <p className="text-gray-600 mt-2">Crie e gerencie perfis de acesso personalizados para sua organização.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Novo Perfil
                </button>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-brand-purple/10 rounded-lg">
                                <Shield className="w-6 h-6 text-brand-purple" />
                            </div>
                            {!role.isSystem && (
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(role)} className="p-1 text-gray-400 hover:text-brand-purple">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(role.id)} className="p-1 text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {role.isSystem && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">Sistema</span>
                            )}
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{role.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{role.description}</p>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                                    {role._count?.users || 0}
                                </div>
                            </div>
                            <span>usuários ativos</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal - NO FRAMER MOTION */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingRole ? 'Editar Perfil' : 'Novo Perfil'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Perfil</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none"
                                        placeholder="Ex: Fotógrafo Voluntário"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none"
                                        placeholder="Breve descrição das responsabilidades"
                                    />
                                </div>
                            </div>

                            {/* Mode Switcher */}
                            <div className="bg-gray-50 p-1 rounded-lg flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, mode: 'magic' })}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.mode === 'magic'
                                        ? 'bg-white text-brand-purple shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Criação Mágica (IA)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, mode: 'manual' })}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.mode === 'manual'
                                        ? 'bg-white text-brand-purple shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Configuração Manual
                                </button>
                            </div>

                            {/* Magic Mode */}
                            {formData.mode === 'magic' && (
                                <div className="space-y-4">
                                    <div className="bg-brand-purple/5 border border-brand-purple/10 rounded-xl p-4">
                                        <label className="block text-sm font-medium text-brand-purple mb-2">
                                            Descreva o que este perfil deve fazer
                                        </label>
                                        <textarea
                                            value={formData.magicDescription}
                                            onChange={e => setFormData({ ...formData, magicDescription: e.target.value })}
                                            className="w-full px-4 py-3 border border-brand-purple/20 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none min-h-[100px] bg-white"
                                            placeholder="Ex: Quero um perfil para estagiários que possam criar rascunhos de memórias e ver o conteúdo publicado, mas sem poder apagar nada ou ver configurações."
                                        />
                                        <div className="flex justify-end mt-2">
                                            <button
                                                type="button"
                                                onClick={handleGeneratePermissions}
                                                disabled={!formData.magicDescription || aiLoading}
                                                className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 disabled:opacity-50 transition-colors text-sm"
                                            >
                                                {aiLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                Gerar Permissões
                                            </button>
                                        </div>
                                        {aiError && (
                                            <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {aiError}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Permissions Preview / Manual Edit */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-700">Permissões de Acesso</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {RESOURCES.map(resource => (
                                        <div key={resource} className="border border-gray-200 rounded-lg p-4">
                                            <h4 className="font-medium text-gray-900 capitalize mb-3 border-b border-gray-100 pb-2">
                                                {resource === 'memories' ? 'Memórias' :
                                                    resource === 'users' ? 'Usuários' :
                                                        resource === 'settings' ? 'Configurações' : 'Analytics'}
                                            </h4>
                                            <div className="space-y-2">
                                                {ACTIONS[resource].map(action => (
                                                    <label key={action} className="flex items-center gap-2 cursor-pointer group">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.permissions[resource]?.includes(action)
                                                            ? 'bg-brand-purple border-brand-purple'
                                                            : 'border-gray-300 group-hover:border-brand-purple'
                                                            }`}>
                                                            {formData.permissions[resource]?.includes(action) && (
                                                                <Check className="w-3 h-3 text-white" />
                                                            )}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={formData.permissions[resource]?.includes(action) || false}
                                                            onChange={() => togglePermission(resource, action)}
                                                        />
                                                        <span className="text-sm text-gray-600 capitalize">
                                                            {action === 'create_draft' ? 'Criar Rascunho' : action}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    Salvar Perfil
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
