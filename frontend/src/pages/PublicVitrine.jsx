import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { LayoutGrid, Map as MapIcon, Filter, Play, Search, X } from 'lucide-react';
import { API_URL } from '../config/api';

// GeoJSON for Brazil (or we can use a library, but for now simple Brazil map)
const GEO_URL = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

const PublicVitrine = () => {
    const { slug } = useParams();
    const [org, setOrg] = useState(null);
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterUnit, setFilterUnit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Org Data by Slug (or ID if we changed route, assuming slug for public url)
                // If the user navigates to /public/vitrine without slug, we might need a landing page.
                // For this task, let's assume /public/vitrine is the route and maybe we fetch "default" or list all?
                // The prompt says "colors injected based on organizationId of the URL".
                // So let's assume route is /public/vitrine/:orgId or :slug.
                // I will update App.jsx to use /public/vitrine/:slug

                let orgData = null;
                if (slug) {
                    const orgRes = await fetch(`${API_URL}/api/organizations/slug/${slug}`);
                    if (orgRes.ok) {
                        const data = await orgRes.json();
                        orgData = data.organization;
                        setOrg(orgData);
                    }
                }

                // 2. Fetch Memories
                const memRes = await fetch(`${API_URL}/api/memories`);
                if (memRes.ok) {
                    let data = await memRes.json();
                    if (orgData) {
                        data = data.filter(m => m.organization?.slug === slug);
                    }
                    setMemories(data);
                }
            } catch (error) {
                console.error("Failed to fetch showcase data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    const primaryColor = org?.primaryColor || '#7e22ce';
    const secondaryColor = org?.secondaryColor || '#fbbf24';

    const uniqueUnits = [...new Set(memories.map(m => m.location).filter(Boolean))];
    const uniqueTags = [...new Set(memories.flatMap(m => m.tags ? JSON.parse(m.tags) : []))];

    const filteredMemories = memories.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesUnit = filterUnit ? m.location === filterUnit : true;
        return matchesSearch && matchesUnit;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Hero Section */}
            <header className="relative bg-gray-900 text-white overflow-hidden h-[400px]">
                <div className="absolute inset-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1497294815431-9365093b7331?auto=format&fit=crop&q=80"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>

                <div className="relative container mx-auto px-6 h-full flex flex-col justify-center items-center text-center z-10">
                    {org?.logo && (
                        <img src={org.logo} alt={org.name} className="h-16 mb-4 object-contain brightness-0 invert" />
                    )}
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight">
                        Patrimônio Educativo de {org?.name || 'Comunidade'}
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto font-light">
                        Explore as memórias, saberes e projetos que transformam a educação em nossa cidade.
                    </p>

                    <div className="grid grid-cols-3 gap-8 mt-8 text-center">
                        <div>
                            <span className="block text-3xl font-bold" style={{ color: secondaryColor }}>{memories.length}</span>
                            <span className="text-xs uppercase tracking-widest text-gray-400">Memórias</span>
                        </div>
                        <div>
                            <span className="block text-3xl font-bold" style={{ color: secondaryColor }}>{uniqueUnits.length}</span>
                            <span className="text-xs uppercase tracking-widest text-gray-400">Unidades</span>
                        </div>
                        <div>
                            <span className="block text-3xl font-bold" style={{ color: secondaryColor }}>~50</span>
                            <span className="text-xs uppercase tracking-widest text-gray-400">Educadores</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Search className="w-4 h-4" /> Buscar
                        </h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Pesquisar..."
                                className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <MapIcon className="w-4 h-4" /> Unidades
                        </h3>
                        <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                            <button
                                onClick={() => setFilterUnit(null)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!filterUnit ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Todas as Unidades
                            </button>
                            {uniqueUnits.map(unit => (
                                <button
                                    key={unit}
                                    onClick={() => setFilterUnit(unit)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all truncate ${filterUnit === unit ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {unit}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Small Map Widget */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-48 relative grayscale hover:grayscale-0 transition-all duration-700">
                        <ComposableMap
                            projection="geoMercator"
                            projectionConfig={{
                                scale: 600,
                                center: [-50, -15] // Center of Brazil nicely
                            }}
                            className="w-full h-full"
                        >
                            <Geographies geography={GEO_URL}>
                                {({ geographies }) =>
                                    geographies.map((geo) => (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill="#e5e7eb"
                                            stroke="#d1d5db"
                                            strokeWidth={0.5}
                                        />
                                    ))
                                }
                            </Geographies>
                        </ComposableMap>
                        <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 text-[10px] font-bold rounded shadow-sm text-gray-500 backdrop-blur-sm">
                            Mapa Interativo
                        </div>
                    </div>
                </aside>

                {/* Main Grid */}
                <main className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-gray-400" />
                            Galeria de Memórias
                        </h2>
                        <span className="text-sm text-gray-500 font-medium">
                            {filteredMemories.length} resultados encontrados
                        </span>
                    </div>

                    {filteredMemories.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500">Nenhuma memória encontrada com estes filtros.</p>
                        </div>
                    ) : (
                        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                            {filteredMemories.map(memory => (
                                <div key={memory.id} className="break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                                    <div className="relative h-48 overflow-hidden bg-gray-100">
                                        {memory.mediaUrl ? (
                                            <img
                                                src={memory.mediaUrl}
                                                alt={memory.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Filter className="w-8 h-8" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <button className="w-12 h-12 rounded-full bg-white/90 text-gray-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                                                <Play className="w-5 h-5 ml-1 fill-current" />
                                            </button>
                                        </div>
                                        <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-800 rounded-md shadow-sm">
                                            {memory.category || 'Geral'}
                                        </span>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 group-hover:text-purple-600 transition-colors">
                                            {memory.title}
                                        </h3>
                                        {memory.location && (
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-3">
                                                <MapIcon className="w-3 h-3" />
                                                {memory.location}
                                            </p>
                                        )}
                                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                                            {memory.description}
                                        </p>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-xs text-gray-400">
                                                {new Date(memory.eventDate || memory.createdAt).toLocaleDateString()}
                                            </span>
                                            {/* Organization Badge if diverse */}
                                            {memory.organization && (
                                                <div className="flex items-center gap-1.5 opacity-60 grayscale group-hover:grayscale-0 transition-all">
                                                    {memory.organization.logo && <img src={memory.organization.logo} className="w-4 h-4 rounded-full" />}
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{memory.organization.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default PublicVitrine;
