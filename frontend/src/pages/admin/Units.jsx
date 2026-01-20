import React, { useState, useEffect } from 'react';
import {
    School, Plus, Edit2, Trash2, Save, X, Loader, MapPin, Hash, Check
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

const Units = () => {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        inepCode: '',
        address: ''
    });

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(API_ENDPOINTS.units.base, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUnits(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching units:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const url = editingUnit
                ? API_ENDPOINTS.units.byId(editingUnit.id)
                : API_ENDPOINTS.units.base;

            const method = editingUnit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchUnits();
                setIsModalOpen(false);
                resetForm();
            } else {
                alert('Erro ao salvar unidade');
            }
        } catch (error) {
            console.error('Error saving unit:', error);
            alert('Erro de conexão');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta unidade?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.units.byId(id), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                fetchUnits();
            } else {
                alert('Erro ao excluir unidade');
            }
        } catch (error) {
            console.error('Error deleting unit:', error);
        }
    };

    const resetForm = () => {
        setEditingUnit(null);
        setFormData({
            name: '',
            inepCode: '',
            address: ''
        });
    };

    const openEdit = (unit) => {
        setEditingUnit(unit);
        setFormData({
            name: unit.name,
            inepCode: unit.inepCode || '',
            address: unit.address || ''
        });
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <Loader className="w-8 h-8 animate-spin mx-auto text-brand-purple" />
                <p className="mt-2 text-gray-600">Carregando unidades...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <School className="w-8 h-8 text-brand-purple" />
                        Unidades Escolares
                    </h1>
                    <p className="text-gray-600 mt-2">Gerencie as escolas e centros educacionais da rede.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors shadow-lg hover:shadow-brand-purple/20"
                >
                    <Plus className="w-5 h-5" />
                    Nova Unidade
                </button>
            </div>

            {/* Units Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {units.map((unit) => (
                    <div
                        key={unit.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group relative"
                    >
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(unit)} className="p-2 bg-gray-50 text-brand-purple rounded-lg hover:bg-brand-purple hover:text-white transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(unit.id)} className="p-2 bg-gray-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-brand-purple/10 rounded-xl">
                                <School className="w-6 h-6 text-brand-purple" />
                            </div>
                            <div className="flex-1 pr-8">
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">{unit.name}</h3>
                                {unit.inepCode && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Hash className="w-3 h-3" />
                                        <span>INEP: {unit.inepCode}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-50">
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                                <span className="line-clamp-2">{unit.address || 'Endereço não cadastrado'}</span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                                <span>Usuários vinculados</span>
                                <span className="font-bold text-gray-900">{unit._count?.users || 0}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {units.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-gray-500 font-medium">Nenhuma unidade cadastrada</h3>
                        <p className="text-sm text-gray-400">Clique em "Nova Unidade" para começar.</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <School className="w-5 h-5 text-brand-purple" />
                                {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Escola/Unidade</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all placeholder-gray-400"
                                    placeholder="Ex: Escola Municipal..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Código INEP (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.inepCode}
                                    onChange={e => setFormData({ ...formData, inepCode: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all placeholder-gray-400"
                                    placeholder="00000000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Endereço</label>
                                <textarea
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all placeholder-gray-400 min-h-[80px] resize-none"
                                    placeholder="Rua, Bairro, CEP..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-purple text-white rounded-xl hover:bg-brand-purple/90 transition-colors font-bold shadow-lg shadow-brand-purple/20 disabled:opacity-70"
                                >
                                    {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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

export default Units;
