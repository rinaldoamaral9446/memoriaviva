import React, { useState, useEffect } from 'react';
import { X, Bot, Briefcase, GraduationCap, Heart, Shield, Sparkles, Zap, Brain } from 'lucide-react';

const ICONS = {
    Bot, Brain, Briefcase, GraduationCap, Heart, Shield, Sparkles, Zap
};

const COLORS = [
    'text-blue-600', 'text-purple-600', 'text-green-600', 'text-amber-600', 'text-pink-600', 'text-red-600'
];

const AgentForm = ({ agent, onClose, onSave, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        description: '',
        systemPrompt: '',
        icon: 'Bot',
        color: 'text-blue-600'
    });

    useEffect(() => {
        if (agent) {
            setFormData({
                name: agent.name || '',
                role: agent.role || '',
                description: agent.description || '',
                systemPrompt: agent.systemPrompt || '',
                icon: agent.icon || 'Bot',
                color: agent.color || 'text-blue-600'
            });
        }
    }, [agent]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, id: agent?.id });
    };

    const SelectedIcon = ICONS[formData.icon] || Bot;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {agent ? 'Editar Agente' : 'Novo Agente Personalizado'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Visual Identity Section */}
                    <div className="flex gap-6 items-start">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">Ícone</label>
                            <div className="grid grid-cols-4 gap-2">
                                {Object.keys(ICONS).map((iconKey) => {
                                    const Icon = ICONS[iconKey];
                                    return (
                                        <button
                                            key={iconKey}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, icon: iconKey }))}
                                            className={`p-3 rounded-xl border transition-all ${formData.icon === iconKey
                                                    ? 'border-brand-purple bg-brand-purple/10 text-brand-purple ring-2 ring-brand-purple/20'
                                                    : 'border-gray-200 hover:border-brand-purple/50 text-gray-500'
                                                }`}
                                        >
                                            <Icon className="w-6 h-6 mx-auto" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            <label className="block text-sm font-medium text-gray-700">Cor do Tema</label>
                            <div className="flex flex-wrap gap-3">
                                {COLORS.map((colorClass) => (
                                    <button
                                        key={colorClass}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, color: colorClass }))}
                                        className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${colorClass.replace('text-', 'bg-')
                                            } ${formData.color === colorClass
                                                ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                                                : 'border-transparent'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Preview Card */}
                            <div className="mt-4 p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-center gap-4">
                                <div className={`p-3 rounded-full bg-white shadow-sm ${formData.color}`}>
                                    <SelectedIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{formData.name || 'Nome do Agente'}</p>
                                    <p className={`text-sm font-medium ${formData.color}`}>{formData.role || 'Cargo'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-brand-purple"
                                placeholder="Ex: Mestre Câmara"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Função</label>
                            <input
                                required
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-brand-purple"
                                placeholder="Ex: Curador Cultural"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Curta</label>
                        <textarea
                            name="description"
                            rows="2"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-brand-purple"
                            placeholder="Aparece no card do agente..."
                        />
                    </div>

                    {/* The Brain */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prompt do Sistema (Cérebro)
                            <span className="ml-2 text-xs text-gray-500 font-normal">Instrua como o agente deve se comportar.</span>
                        </label>
                        <textarea
                            required
                            name="systemPrompt"
                            rows="8"
                            value={formData.systemPrompt}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-brand-purple font-mono text-sm bg-slate-50"
                            placeholder="Você é um especialista em história local..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-brand-purple text-white font-bold rounded-xl hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/20 disabled:opacity-50"
                        >
                            {isLoading ? 'Salvando...' : 'Salvar Agente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgentForm;
