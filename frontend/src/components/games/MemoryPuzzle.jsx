import React, { useState, useEffect } from 'react';
import { Trophy, Star, RefreshCw, CheckCircle } from 'lucide-react';
import { API_URL } from '../../config/api';

const MemoryPuzzle = () => {
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [loading, setLoading] = useState(true);
    const [gameWon, setGameWon] = useState(false);

    useEffect(() => {
        fetchMemoriesAndStartGame();
    }, []);

    const fetchMemoriesAndStartGame = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/memories/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const memories = await response.json();

            // Filter memories with images
            const validMemories = memories.filter(m => m.imageUrl).slice(0, 6);

            if (validMemories.length < 3) {
                // Fallback if not enough memories
                initializeGame([]);
                return;
            }

            initializeGame(validMemories);
        } catch (error) {
            console.error('Error fetching memories:', error);
            initializeGame([]);
        } finally {
            setLoading(false);
        }
    };

    const initializeGame = (memories) => {
        // Create pairs
        const gameCards = [];
        memories.forEach(memory => {
            // Card 1: Image
            gameCards.push({
                id: `img-${memory.id}`,
                memoryId: memory.id,
                content: memory.imageUrl,
                type: 'image',
                title: memory.title
            });
            // Card 2: Title (or same image if preferred)
            gameCards.push({
                id: `txt-${memory.id}`,
                memoryId: memory.id,
                content: memory.title,
                type: 'text',
                title: memory.title
            });
        });

        // Shuffle
        const shuffled = gameCards.sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setFlippedCards([]);
        setMatchedPairs([]);
        setScore(0);
        setMoves(0);
        setGameWon(false);
    };

    const handleCardClick = (index) => {
        // Prevent clicking if already flipped, matched, or 2 cards already flipped
        if (
            flippedCards.includes(index) ||
            matchedPairs.includes(cards[index].memoryId) ||
            flippedCards.length >= 2
        ) return;

        const newFlipped = [...flippedCards, index];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            checkForMatch(newFlipped);
        }
    };

    const checkForMatch = (flippedIndices) => {
        const card1 = cards[flippedIndices[0]];
        const card2 = cards[flippedIndices[1]];

        if (card1.memoryId === card2.memoryId) {
            // Match!
            setMatchedPairs(prev => [...prev, card1.memoryId]);
            setScore(prev => prev + 100);
            setFlippedCards([]);

            if (matchedPairs.length + 1 === cards.length / 2) {
                setGameWon(true);
            }
        } else {
            // No match
            setTimeout(() => {
                setFlippedCards([]);
            }, 1000);
        }
    };

    if (loading) {
        return <div className="text-center p-8">Carregando jogo...</div>;
    }

    if (cards.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                <p className="text-gray-600 mb-4">Você precisa de pelo menos 3 memórias com imagens para jogar!</p>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">Criar Memórias</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-yellow-500">
                        <Trophy className="w-6 h-6" />
                        <span className="font-bold text-xl">{score} pts</span>
                    </div>
                    <div className="text-gray-600 font-medium">
                        Jogadas: {moves}
                    </div>
                </div>
                <button
                    onClick={fetchMemoriesAndStartGame}
                    className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reiniciar
                </button>
            </div>

            {gameWon && (
                <div className="mb-8 p-6 bg-green-100 border-2 border-green-400 rounded-xl text-center animate-bounce">
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Parabéns! 🎉</h3>
                    <p className="text-green-700">Você completou o jogo em {moves} jogadas!</p>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map((card, index) => {
                    const isFlipped = flippedCards.includes(index) || matchedPairs.includes(card.memoryId);
                    const isMatched = matchedPairs.includes(card.memoryId);

                    return (
                        <div
                            key={card.id}
                            onClick={() => handleCardClick(index)}
                            className={`
                                relative h-40 cursor-pointer transition-all duration-500 transform
                                ${isFlipped ? 'rotate-y-180' : ''}
                                ${isMatched ? 'opacity-50' : 'hover:scale-105'}
                            `}
                        >
                            <div className={`
                                absolute w-full h-full rounded-xl shadow-md flex items-center justify-center p-4 text-center
                                transition-all duration-500 backface-hidden
                                ${isFlipped
                                    ? 'bg-white border-2 border-purple-500'
                                    : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'}
                            `}>
                                {isFlipped ? (
                                    card.type === 'image' ? (
                                        <img
                                            src={card.content}
                                            alt={card.title}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <p className="font-bold text-gray-800 text-sm">{card.content}</p>
                                    )
                                ) : (
                                    <Star className="w-12 h-12 opacity-50" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MemoryPuzzle;
