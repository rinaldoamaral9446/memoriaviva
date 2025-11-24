import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import { LogOut, User, Home, BookOpen, Menu, X, Building2 } from 'lucide-react';

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
            {/*  Glassmorphism Navbar with dynamic branding */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/30" style={{ background: navGradient }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        {/* Logo with organization branding */}
                        <div className="flex-shrink-0 flex items-center gap-3">
                            {branding.logo ? (
                                <img src={branding.logo} alt={branding.name} className="w-10 h-10 rounded-full shadow-lg object-cover" />
                            ) : (
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`
                                    }}
                                >
                                    <span className="text-white font-serif font-bold text-xl">{branding.name.charAt(0)}</span>
                                </div>
                            )}
                            <div>
                                <Link
                                    to="/"
                                    className="text-2xl font-serif font-bold tracking-tight hover:opacity-80 transition-opacity"
                                    style={{ color: branding.primaryColor }}
                                >
                                    {branding.name}
                                </Link>
                                {organization && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                        <Building2 className="w-3 h-3" />
                                        <span>{organization.slug}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link
                                to="/"
                                className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${isActive('/') ? 'text-brand-purple' : 'text-gray-500 hover:text-brand-purple'}`}
                            >
                                <Home className="w-4 h-4" />
                                Início
                            </Link>

                            {user ? (
                                <>
                                    <Link
                                        to="/memories"
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${isActive('/memories') ? 'text-brand-purple' : 'text-gray-500 hover:text-brand-purple'}`}
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        Minhas Memórias
                                    </Link>
                                    <Link
                                        to="/dashboard"
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${isActive('/dashboard') ? 'text-brand-purple' : 'text-gray-500 hover:text-brand-purple'}`}
                                    >
                                        <User className="w-4 h-4" />
                                        Perfil
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 px-5 py-2 rounded-full border border-brand-purple/20 text-brand-purple hover:bg-brand-purple hover:text-white transition-all duration-300 text-sm font-medium"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sair
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="btn-primary shadow-brand-purple/20"
                                >
                                    Entrar
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-600 hover:text-brand-purple focus:outline-none transition-colors"
                            >
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden glass border-t border-white/20 animate-slide-up">
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            <Link
                                to="/"
                                className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-brand-purple hover:bg-purple-50 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Início
                            </Link>
                            {user ? (
                                <>
                                    <Link
                                        to="/memories"
                                        className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-brand-purple hover:bg-purple-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Minhas Memórias
                                    </Link>
                                    <Link
                                        to="/dashboard"
                                        className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-brand-purple hover:bg-purple-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Perfil
                                    </Link>
                                    <button
                                        onClick={() => { logout(); setIsMenuOpen(false); }}
                                        className="w-full text-left px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Sair
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="block px-3 py-3 rounded-lg text-base font-medium text-brand-purple font-bold hover:bg-purple-50 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Entrar
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Content Spacer for Fixed Navbar */}
            <div className="h-20"></div>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="glass border-t border-white/30 mt-auto">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500 text-sm font-medium">
                        &copy; {new Date().getFullYear()} Memória Cultural Viva. Preservando histórias com Inteligência.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
