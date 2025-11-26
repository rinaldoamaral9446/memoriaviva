import React from 'react';
import { useAuth } from '../context/AuthContext';
import CuratorWidget from '../components/CuratorWidget';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">
                Olá, {user?.name}!
            </h1>
            <p className="text-gray-600 mb-8">Bem-vindo de volta ao seu acervo de memórias.</p>

            {/* AI Curator Widget */}
            <CuratorWidget />

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                <p className="text-gray-700">
                    Bem-vindo de volta, <span className="font-bold">{user?.name}</span>!
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Suas Informações</h3>
                    <p className="text-gray-600">Email: {user?.email}</p>
                    <p className="text-gray-600">Membro desde: {new Date(user?.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="border p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Atividades Recentes</h3>
                    <p className="text-gray-500 italic">Nenhuma atividade recente.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
