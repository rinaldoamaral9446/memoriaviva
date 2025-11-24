import React, { useState } from 'react';
import { Search, X, Filter, Calendar } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
    const [searchText, setSearchText] = useState('');
    const [category, setCategory] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        onSearch({
            q: searchText,
            category: category || undefined
        });
    };

    const handleClear = () => {
        setSearchText('');
        setCategory('');
        onSearch({});
    };

    const activeFilters = (searchText ? 1 : 0) + (category ? 1 : 0);

    return (
        <div className="glass p-4 rounded-xl border border-white/20 mb-6">
            <div className="flex gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Buscar memórias..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple transition-all"
                    />
                    {searchText && (
                        <button
                            onClick={() => setSearchText('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${showFilters || activeFilters > 0
                            ? 'bg-brand-purple text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <Filter className="w-5 h-5" />
                    Filtros
                    {activeFilters > 0 && (
                        <span className="bg-white text-brand-purple rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                            {activeFilters}
                        </span>
                    )}
                </button>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="px-6 py-2 bg-gradient-to-r from-brand-purple to-indigo-800 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                >
                    Buscar
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Categoria
                        </label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Ex: Cultura, História..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple transition-all"
                        />
                    </div>

                    {/* Clear Filters */}
                    {activeFilters > 0 && (
                        <button
                            onClick={handleClear}
                            className="w-full px-4 py-2 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                        >
                            Limpar Filtros
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
