import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import { LogOut, User, Home, BookOpen, Menu, X, Building2, GraduationCap, BarChart3, Gamepad2, Film, Shield, Users, Calendar, Share2, Bot } from 'lucide-react';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const { branding, organization } = useOrganization();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const isActive = (path) => location.pathname === path;

    // Dynamic gradient based on organization colors
    const navGradient = `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}15 100%)`;

    return (
        <div className="min-h-screen flex flex-col">
            {/*  Stitch Design Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo & Brand */}
                        <div className="flex-shrink-0 flex items-center gap-3">
                            {branding.logo ? (
                                <img src={branding.logo} alt={branding.name} className="w-8 h-8 rounded-full shadow-sm object-cover" />
                            ) : (
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                                    style={{
                                        background: `linear-gradient(135deg, ${branding.primaryColor}00, ${branding.primaryColor}20)`,
                                        border: `1px solid ${branding.primaryColor}40`
                                    }}
                                >
                                    <span className="font-serif font-bold text-lg" style={{ color: branding.primaryColor }}>{branding.name.charAt(0)}</span>
                                </div>
                            )}
                            <div>
                                <Link
                                    to="/"
                                    className="text-lg font-serif font-bold tracking-tight text-gray-900 leading-none hover:opacity-80 transition-opacity"
                                >
                                    {branding.name}
                                </Link>
                                {organization && (
                                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                                        <Building2 className="w-3 h-3" />
                                        <span>{organization.slug}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop Menu - Centered & Clean */}
                        <div className="hidden md:flex items-center space-x-1">
                            {/* Navigation Items with Stitch Active State */}
                            {[
                                { path: '/', label: 'Início', icon: Home },
                                user && { path: '/memories', label: 'Memórias', icon: BookOpen },
                                user && { path: '/educator', label: 'Educador', icon: GraduationCap },
                                user && { path: '/agents', label: 'Agentes', icon: Bot }, // Added Agents
                                user && { path: '/analytics', label: 'Analytics', icon: BarChart3 },
                            ].filter(Boolean).map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                                        ? 'text-brand-primary bg-brand-primary/5'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 ${isActive(item.path) ? 'fill-current' : ''}`} />
                                    <span>{item.label}</span>
                                    {isActive(item.path) && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-primary rounded-full mb-1.5 opacity-0"></span>
                                    )}
                                </Link>
                            ))}

                            {/* Protected Routes (Admin) */}
                            {user?.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className={`ml-2 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive('/admin') ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <Shield className="w-4 h-4" />
                                    Admin
                                </Link>
                            )}
                            {/* Super Admin Link */}
                            {user?.role === 'super_admin' && (
                                <Link
                                    to="/admin/super"
                                    className={`ml-2 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive('/admin/super') ? 'bg-red-600 text-white shadow-md' : 'text-red-600 hover:bg-red-50'}`}
                                >
                                    <Shield className="w-4 h-4" />
                                    Super
                                </Link>
                            )}
                        </div>

                        {/* User Profile & Actions */}
                        <div className="hidden md:flex items-center gap-4 border-l border-gray-200 pl-6 ml-2">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden lg:block">
                                        <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    <div className="relative group">
                                        <Link to="/dashboard">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all cursor-pointer">
                                                <User className="w-5 h-5" />
                                            </div>
                                        </Link>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                                        title="Sair"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="px-5 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-full shadow-lg hover:shadow-brand-primary/30 hover:-translate-y-0.5 transition-all"
                                >
                                    Entrar
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-600 hover:text-brand-primary focus:outline-none transition-colors p-2"
                            >
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu (Simplified) */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 shadow-xl animate-slide-up absolute w-full left-0 top-16">
                        <div className="px-4 py-6 space-y-3">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 text-gray-900 font-medium">
                                <Home className="w-5 h-5" /> Início
                            </Link>
                            {user && (
                                <>
                                    <Link to="/memories" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
                                        <BookOpen className="w-5 h-5" /> Minhas Memórias
                                    </Link>
                                    <Link to="/educator" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
                                        <GraduationCap className="w-5 h-5" /> Educador
                                    </Link>
                                    <div className="border-t border-gray-100 my-2 pt-2">
                                        <div className="px-4 mb-2">
                                            <p className="font-bold text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                        <button onClick={logout} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium">
                                            <LogOut className="w-5 h-5" /> Sair
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Content Spacer for Fixed Navbar */}
            <div className="h-20"></div>

            {/* Impersonation Banner */}
            {
                sessionStorage.getItem('superAdminToken') && (
                    <div className="bg-red-600 text-white p-2 text-center text-sm font-bold flex items-center justify-center gap-4">
                        <span>⚠️ Você está acessando como {user?.name} ({organization?.name})</span>
                        <button
                            onClick={() => {
                                localStorage.setItem('token', sessionStorage.getItem('superAdminToken'));
                                sessionStorage.removeItem('superAdminToken');
                                window.location.href = '/admin/super';
                            }}
                            className="bg-white text-red-600 px-3 py-1 rounded-full text-xs hover:bg-gray-100"
                        >
                            Sair do Modo de Acesso
                        </button>
                    </div>
                )
            }

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="glass border-t border-white/30 mt-auto">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500 text-sm font-medium">
                        &copy; {new Date().getFullYear()} {branding?.name || 'Memória Cultural Viva'}. Preservando histórias com Inteligência.
                    </p>
                </div>
            </footer>
        </div >
    );
};

export default MainLayout;
