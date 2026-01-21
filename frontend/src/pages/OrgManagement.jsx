
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Filter, MoreVertical, Shield, Trash2, School } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api';

const OrgManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [units, setUnits] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user', schoolUnitId: '' });

    // [NEW] Get orgId from URL for Super Admin
    const queryParams = new URLSearchParams(location.search);
    const targetOrgId = queryParams.get('orgId');

    useEffect(() => {
        fetchUsers();
        fetchUnits();
    }, [targetOrgId]);

    const fetchUnits = async () => {
        try {
            const token = localStorage.getItem('token');
            // If targetOrgId exists, we might want to fetch units for THAT org too, but backend needs update. 
            // For now assuming units are global or irrelevant for simpler user management.
            const response = await fetch(`${API_URL}/api/units`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUnits(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching units:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = targetOrgId
                ? `${API_URL}/api/users/organization?organizationId=${targetOrgId}`
                : `${API_URL}/api/users/organization`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = { ...newUser };

            if (!payload.schoolUnitId) delete payload.schoolUnitId;
            else payload.schoolUnitId = parseInt(payload.schoolUnitId);

            // [NEW] Inject targetOrgId if present
            if (targetOrgId) {
                payload.organizationId = parseInt(targetOrgId);
            }

            const response = await fetch(`${API_URL}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowAddModal(false);
                setNewUser({ name: '', email: '', password: '', role: 'user', schoolUnitId: '' });
                fetchUsers();
                alert('Usuário criado com sucesso!');
            } else {
                const data = await response.json();
                alert(data.message || 'Erro ao criar usuário');
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Tem certeza que deseja remover este usuário?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchUsers();
            } else {
                alert('Erro ao remover usuário');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-8 h-8 text-purple-600" />
                            Gestão de Equipe
                        </h1>
                        <p className="text-gray-600">Gerencie os membros da sua organização</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/admin/units"
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <School className="w-5 h-5" />
                            Gerenciar Unidades
                        </Link>
                        <Link
                            to="/admin/roles"
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Shield className="w-5 h-5" />
                            Gerenciar Perfis
                        </Link>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                            Adicionar Membro
                        </button>
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Nome</th>
                                <th className="p-4 font-semibold text-gray-600">Email</th>
                                <th className="p-4 font-semibold text-gray-600">Unidade</th>
                                <th className="p-4 font-semibold text-gray-600">Cargo</th>
                                <th className="p-4 font-semibold text-gray-600">Memórias</th>
                                <th className="p-4 font-semibold text-gray-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-900">{user.name}</td>
                                    <td className="p-4 text-gray-600">{user.email}</td>
                                    <td className="p-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            {user.schoolUnit ? (
                                                <>
                                                    <School className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm">{user.schoolUnit.name}</span>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Sem unidade</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                            className={`
px - 2 py - 1 rounded - full text - xs font - semibold border - 0 cursor - pointer
                                                ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }
`}
                                        >
                                            <option value="user">Usuário</option>
                                            <option value="editor">Editor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-gray-600">{user._count?.memories || 0}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                                            title="Remover usuário"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add User Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">Adicionar Novo Membro</h3>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border rounded-lg p-2"
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full border rounded-lg p-2"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha Provisória</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full border rounded-lg p-2"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidade Escolar</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={newUser.schoolUnitId}
                                        onChange={e => setNewUser({ ...newUser, schoolUnitId: e.target.value })}
                                    >
                                        <option value="">Selecione uma unidade...</option>
                                        {units.map(unit => (
                                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="user">Usuário</option>
                                        <option value="editor">Editor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        Criar Usuário
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrgManagement;
