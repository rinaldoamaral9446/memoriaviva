import React from 'react';
import { Gamepad2, Star, Trophy } from 'lucide-react';
import MemoryPuzzle from '../components/games/MemoryPuzzle';

const KidsPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-6">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-lg mb-4">
                        <Gamepad2 className="w-12 h-12 text-purple-500 mr-3" />
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                            Espaço Kids
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600">Aprenda brincando com suas memórias!</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar / Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-yellow-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Trophy className="w-8 h-8 text-yellow-500" />
                                <h2 className="text-2xl font-bold text-gray-800">Suas Conquistas</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                                    <span className="font-medium text-gray-700">Explorador Júnior</span>
                                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl opacity-50">
                                    <span className="font-medium text-gray-700">Mestre da Memória</span>
                                    <Star className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl opacity-50">
                                    <span className="font-medium text-gray-700">Historiador Mirim</span>
                                    <Star className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl shadow-lg text-white">
                            <h3 className="text-xl font-bold mb-2">Dica do Dia! 💡</h3>
                            <p className="opacity-90">
                                "Pergunte aos seus avós sobre a brincadeira favorita deles quando eram crianças!"
                            </p>
                        </div>
                    </div>

                    {/* Main Game Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-purple-100">
                            <div className="p-6 bg-purple-50 border-b border-purple-100">
                                <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
                                    🧩 Jogo da Memória
                                </h2>
                                <p className="text-purple-600">Encontre os pares entre imagens e títulos!</p>
                            </div>

                            <MemoryPuzzle />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KidsPage;
