import React, { useState, useEffect } from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { Save, Loader2, Building2, Palette, Sparkles } from 'lucide-react';

const AdminPage = () => {
    const { organization, branding, updateOrganization } = useOrganization();
    const [formData, setFormData] = useState({
        aiInstructions: '',
        aiGuardrails: '',
        primaryColor: '#4B0082',
        secondaryColor: '#D4AF37'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (organization) {
            setFormData({
                aiInstructions: organization.config?.aiInstructions || '',
                aiGuardrails: organization.config?.aiGuardrails || '',
                primaryColor: organization.primaryColor || '#4B0082',
                secondaryColor: organization.secondaryColor || '#D4AF37'
            });
        }
    }, [organization]);

    const handleOptimize = async () => {
        if (!formData.aiInstructions) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/ai/optimize-instructions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ instructions: formData.aiInstructions })
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({ ...prev, aiInstructions: data.optimizedInstructions }));
                setMessage({ type: 'success', text: 'Instruções otimizadas pela IA!' });
            } else {
                setMessage({ type: 'error', text: 'Erro ao otimizar.' });
            }
        } catch (error) {
            console.error('Optimization error:', error);
            setMessage({ type: 'error', text: 'Erro de conexão.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            // Prepare config object
            const config = {
                ...organization.config,
                aiInstructions: formData.aiInstructions,
                aiGuardrails: formData.aiGuardrails
            };

            const success = await updateOrganization(organization.id, {
                primaryColor: formData.primaryColor,
                secondaryColor: formData.secondaryColor,
                config
            });

            if (success) {
                setMessage({ type: 'success', text: 'Configurações atualizadas com sucesso!' });
            } else {
                setMessage({ type: 'error', text: 'Erro ao atualizar configurações.' });
            }
        } catch (error) {
            console.error('Update error:', error);
            setMessage({ type: 'error', text: 'Erro inesperado.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!organization) return <div className="p-8 text-center">Carregando...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-gray-800 flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-brand-purple" />
                    Administração da Organização
                </h1>
                <p className="text-gray-600 mt-2">Personalize a experiência da {organization.name}.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* AI Configuration Section */}
                <div className="glass p-8 rounded-2xl shadow-sm border border-white/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-purple/10 rounded-lg">
                            <Sparkles className="w-6 h-6 text-brand-purple" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Inteligência Artificial</h2>
                            <p className="text-sm text-gray-500">Como a IA deve se comportar ao criar memórias.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-bold text-gray-700">
                                Instruções Personalizadas (Prompt do Sistema)
                            </label>
                            <button
                                type="button"
                                onClick={handleOptimize}
                                disabled={isSubmitting || !formData.aiInstructions}
                                className="text-xs bg-gradient-to-r from-brand-purple to-indigo-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:shadow-md transition-all disabled:opacity-50"
                            >
                                <Sparkles className="w-3 h-3" />
                                Otimizar com IA
                            </button>
                        </div>
                        <textarea
                            value={formData.aiInstructions}
                            onChange={(e) => setFormData({ ...formData, aiInstructions: e.target.value })}
                            rows="4"
                            placeholder="Ex: 'Sempre mencione o contexto histórico do carnaval de Olinda. Use linguagem formal. Identifique elementos arquitetônicos específicos.'"
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple transition-all resize-none font-mono text-sm bg-white/50"
                        />
                        <p className="text-xs text-gray-500">
                            Essas instruções serão adicionadas ao prompt padrão da IA para todas as memórias criadas nesta organização.
                        </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-200/50">
                        <label className="block text-sm font-bold text-gray-700 text-red-600">
                            Guardrails (Regras de Segurança e Bloqueio)
                        </label>
                        <textarea
                            value={formData.aiGuardrails}
                            onChange={(e) => setFormData({ ...formData, aiGuardrails: e.target.value })}
                            rows="4"
                            placeholder="Ex: 'Não gerar conteúdo sobre política partidária. Não descrever violência explícita. Se a imagem contiver nudez, recusar o processamento.'"
                            className="w-full p-4 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none font-mono text-sm bg-red-50/30"
                        />
                        <p className="text-xs text-gray-500">
                            Regras estritas sobre o que a IA <strong>NÃO</strong> deve fazer ou conteúdos que deve recusar.
                        </p>
                    </div>
                </div>

                {/* Branding Configuration Section */}
                <div className="glass p-8 rounded-2xl shadow-sm border border-white/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-gold/10 rounded-lg">
                            <Palette className="w-6 h-6 text-brand-gold" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Identidade Visual</h2>
                            <p className="text-sm text-gray-500">Cores principais da sua organização.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Cor Primária
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={formData.primaryColor}
                                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200 p-1"
                                />
                                <input
                                    type="text"
                                    value={formData.primaryColor}
                                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg uppercase font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Cor Secundária
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={formData.secondaryColor}
                                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200 p-1"
                                />
                                <input
                                    type="text"
                                    value={formData.secondaryColor}
                                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg uppercase font-mono"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Message */}
                {message.text && (
                    <div className={`p-4 rounded-xl text-center font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-4 bg-gradient-to-r from-brand-purple to-indigo-800 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Salvar Alterações
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminPage;
