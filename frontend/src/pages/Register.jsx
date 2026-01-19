import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Building2, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { API_URL } from '../config/api';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        organizationId: '',
        organizationName: ''
    });
    const [isNewOrg, setIsNewOrg] = useState(false);
    const [errors, setErrors] = useState({});

    // Fetch organizations on mount
    React.useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const response = await fetch(`${API_URL}/api/organizations/public`);
            const data = await response.json();
            if (response.ok) {
                setOrganizations(data.organizations || []);
            }
        } catch (error) {
            console.error('Error fetching organizations:', error);
        }
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Senhas não coincidem';
        }

        if (isNewOrg) {
            if (!formData.organizationName.trim()) {
                newErrors.organizationName = 'Nome da organização é obrigatório';
            }
        } else {
            if (!formData.organizationId) {
                newErrors.organizationId = 'Selecione uma organização';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    organizationId: isNewOrg ? null : parseInt(formData.organizationId),
                    organizationName: isNewOrg ? formData.organizationName : null
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Auto-login after registration
                await login(data.token, data.user);
                navigate('/memories');
            } else {
                setErrors({ general: data.message || 'Erro ao registrar' });
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ general: 'Erro de conexão' });
        } finally {
            setLoading(false);
        }
    };

    const selectedOrg = organizations.find(org => org.id === parseInt(formData.organizationId));

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-purple/5 via-white to-brand-gold/5 flex items-center justify-center p-4">
            <div className="glass max-w-md w-full rounded-2xl shadow-2xl border border-white/20 p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-gradient-to-r from-brand-purple to-indigo-800 rounded-2xl mb-4">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Criar Conta</h1>
                    <p className="text-gray-600 mt-2">Junte-se à preservação cultural</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {errors.general && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                            {errors.general}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nome Completo *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-purple/50 transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Seu nome"
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Email *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-purple/50 transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="seu@email.com"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Organization */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-gray-700">
                                Organização *
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsNewOrg(!isNewOrg)}
                                className="text-xs text-brand-purple hover:underline font-medium"
                            >
                                {isNewOrg ? 'Selecionar existente' : 'Criar nova organização'}
                            </button>
                        </div>

                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                            {isNewOrg ? (
                                <input
                                    type="text"
                                    value={formData.organizationName}
                                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-purple/50 transition-all ${errors.organizationName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Nome da nova organização"
                                />
                            ) : (
                                <select
                                    value={formData.organizationId}
                                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-purple/50 transition-all ${errors.organizationId ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Selecione uma organização</option>
                                    {organizations.map(org => (
                                        <option key={org.id} value={org.id}>
                                            {org.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {isNewOrg ? (
                            errors.organizationName && <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>
                        ) : (
                            errors.organizationId && <p className="text-red-500 text-sm mt-1">{errors.organizationId}</p>
                        )}

                        {/* Organization Preview */}
                        {!isNewOrg && selectedOrg && (
                            <div
                                className="mt-2 p-3 rounded-lg border-2"
                                style={{
                                    backgroundColor: `${selectedOrg.primaryColor}08`,
                                    borderColor: `${selectedOrg.primaryColor}30`
                                }}
                            >
                                <p className="text-sm font-medium" style={{ color: selectedOrg.primaryColor }}>
                                    {selectedOrg.name}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Você fará parte desta organização
                                </p>
                            </div>
                        )}

                        {isNewOrg && (
                            <div className="mt-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs">
                                Uma nova organização será criada automaticamente para você.
                            </div>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Senha *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-brand-purple/50 transition-all ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Mínimo 6 caracteres"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <Eye className="w-5 h-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Confirmar Senha *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-purple/50 transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Repita a senha"
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-brand-purple to-indigo-800 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-purple/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Criando conta...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Criar Conta
                            </>
                        )}
                    </button>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-gray-600">
                            Já tem uma conta?{' '}
                            <Link to="/login" className="text-brand-purple font-bold hover:underline">
                                Faça login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
