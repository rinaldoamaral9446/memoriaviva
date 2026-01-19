import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';
import { Shield, Ban, CheckCircle, Settings, Save } from 'lucide-react';

const OrgList = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingOrg, setEditingOrg] = useState(null);

    useEffect(() => {
        fetchOrgs();
    }, []);

    const fetchOrgs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/organizations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setOrganizations(data.organizations || []);
        } catch (error) {
            console.error('Error fetching orgs:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (org) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/organizations/${org.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !org.isActive })
            });

            if (response.ok) {
                fetchOrgs();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleSaveLimits = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/organizations/${editingOrg.id}/limits`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    storageLimit: parseInt(editingOrg.storageLimit),
                    userLimit: parseInt(editingOrg.userLimit),
                    aiTokenLimit: parseInt(editingOrg.aiTokenLimit)
                })
            });

            if (response.ok) {
                setEditingOrg(null);
                fetchOrgs();
            }
        } catch (error) {
            console.error('Error updating limits:', error);
        }
    };

    const handleImpersonate = async (org) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/organizations/${org.id}/impersonate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Save super admin token to session storage to allow switching back
                sessionStorage.setItem('superAdminToken', token);
                // Set new token
                localStorage.setItem('token', data.token);
                // Redirect to dashboard
                window.location.href = '/dashboard';
            } else {
                alert('Erro ao acessar organização: ' + response.statusText);
            }
        } catch (error) {
            console.error('Error impersonating:', error);
            alert('Erro de conexão.');
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Gerenciar Organizações</h2>
            </div>
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4 font-semibold text-gray-600">Nome</th>
                        <th className="p-4 font-semibold text-gray-600">Status</th>
                        <th className="p-4 font-semibold text-gray-600">Limites (GB / Users / AI)</th>
                        <th className="p-4 font-semibold text-gray-600">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {organizations.map(org => (
                        <tr key={org.id} className="hover:bg-gray-50">
                            <td className="p-4">
                                <div className="font-medium text-gray-900">{org.name}</div>
                                <div className="text-sm text-gray-500">{org.slug}</div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${org.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {org.isActive ? 'Ativo' : 'Suspenso'}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                                {org.storageLimit}GB / {org.userLimit} users / {org.aiTokenLimit} tokens
                            </td>
                            <td className="p-4 flex gap-2">
                                <button
                                    onClick={() => toggleStatus(org)}
                                    className={`p-2 rounded-lg ${org.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                    title={org.isActive ? 'Suspender' : 'Ativar'}
                                >
                                    {org.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setEditingOrg(org)}
                                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                                    title="Editar Limites"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleImpersonate(org)}
                                    className="p-2 rounded-lg text-purple-600 hover:bg-purple-50"
                                    title="Acessar como Admin"
                                >
                                    <Shield className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit Modal */}
            {editingOrg && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Editar Limites: {editingOrg.name}</h3>
                        <form onSubmit={handleSaveLimits} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Armazenamento (GB)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg p-2"
                                    value={editingOrg.storageLimit}
                                    onChange={e => setEditingOrg({ ...editingOrg, storageLimit: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Usuários</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg p-2"
                                    value={editingOrg.userLimit}
                                    onChange={e => setEditingOrg({ ...editingOrg, userLimit: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Tokens IA (Mensal)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg p-2"
                                    value={editingOrg.aiTokenLimit}
                                    onChange={e => setEditingOrg({ ...editingOrg, aiTokenLimit: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingOrg(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrgList;
