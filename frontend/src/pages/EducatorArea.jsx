import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import { BookOpen, CheckSquare, GraduationCap, Loader, FileText, Printer, Search, Sparkles, Image as ImageIcon, CheckCircle2, Layout, SlidersHorizontal, ChevronRight, Wand2 } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const EducatorArea = () => {
    console.log('EducatorArea (Studio) rendering...');
    const { user } = useAuth();
    const { organization, branding } = useOrganization(); // Dynamic Branding
    const [memories, setMemories] = useState([]);
    const [selectedMemories, setSelectedMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [lessonPlan, setLessonPlan] = useState(null);

    // Styling Config based on Organization
    const primaryColor = branding?.primaryColor || '#7e22ce';
    const accentColor = branding?.secondaryColor || '#fbbf24';

    const [config, setConfig] = useState({
        gradeLevel: 'Ensino Fundamental I - 3º Ano',
        subject: 'História',
        topic: ''
    });

    // Onboarding Tour
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('hasSeenEducatorTour');

        if (!hasSeenTour) {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                doneBtnText: 'Concluir',
                nextBtnText: 'Próximo',
                prevBtnText: 'Anterior',
                steps: [
                    {
                        element: '#tour-welcome',
                        popover: {
                            title: 'Bem-vindo ao Memória Viva!',
                            description: 'Vamos transformar uma atividade cultural em um plano de aula completo? 🚀',
                            side: "center",
                            align: 'center'
                        }
                    },
                    {
                        element: '#tour-context',
                        popover: {
                            title: 'Identidade Local',
                            description: `Aqui confirmamos que você está criando para o ${organization?.name || 'seu contexto'}. Isso garante que o plano use a história do seu bairro.`,
                            side: "right",
                            align: 'start'
                        }
                    },
                    {
                        element: '#tour-media-upload',
                        popover: {
                            title: 'A Memória',
                            description: 'Selecione o vídeo ou foto da atividade que você realizou com seus alunos.',
                            side: "right",
                            align: 'start'
                        }
                    },
                    {
                        element: '#tour-generate-btn',
                        popover: {
                            title: 'A Mágica da IA',
                            description: 'Agora é só clicar aqui! Nossa IA vai analisar a cultura local e as normas da BNCC para criar seu roteiro pedagógico em segundos. ✨',
                            side: "top",
                            align: 'center'
                        }
                    }
                ],
                onDestroying: () => {
                    localStorage.setItem('hasSeenEducatorTour', 'true');
                }
            });

            // Small delay to ensure render
            setTimeout(() => {
                driverObj.drive();
            }, 1000);
        }
    }, [organization]);

    useEffect(() => {
        fetchMemories();
    }, []);

    const fetchMemories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.memories.my, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMemories(data);
        } catch (error) {
            console.error('Error fetching memories:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMemory = (id) => {
        setSelectedMemories(prev =>
            prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (selectedMemories.length === 0) return alert('Selecione pelo menos uma memória.');

        setGenerating(true);
        setLessonPlan(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.ai.process.replace('/process', '')}/pedagogical/plan`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    memoryIds: selectedMemories,
                    ...config
                })
            });

            const data = await response.json();
            if (response.ok) {
                // Ensure Plan structure consistency
                const planContent = data.plan?.content ? JSON.parse(data.plan.content) : (data.plan || data);
                setLessonPlan(planContent);
            } else {
                alert('Erro ao gerar plano: ' + data.message);
            }
        } catch (error) {
            console.error('Error generating plan:', error);
            alert('Erro na requisição.');
        } finally {
            setGenerating(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredMemories = memories.filter(memory =>
        memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (memory.description && memory.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div id="tour-welcome" className="flex h-[calc(100vh-80px)] overflow-hidden bg-gray-50">
            {/* Left Column: Controls (Editor Studio Sidebar) */}
            <aside className="w-[400px] bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm animate-slide-in-left">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Layout className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Estúdio de Criação</span>
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900 leading-tight">
                        <span className="notranslate">Configure sua Aula</span>
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* 1. Contexto */}
                    <section id="tour-context">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs">1</span>
                            Contexto Escolar
                        </h3>
                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="absolute -top-2 left-2 px-1 bg-white text-[10px] font-bold text-brand-purple uppercase">Ano/Série</label>
                                <select
                                    className="w-full p-4 bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-brand-purple rounded-xl outline-none font-medium text-gray-700 transition-all appearance-none notranslate"
                                    value={config.gradeLevel}
                                    onChange={e => setConfig({ ...config, gradeLevel: e.target.value })}
                                >
                                    <option>Ensino Fundamental I - 1º Ano</option>
                                    <option>Ensino Fundamental I - 2º Ano</option>
                                    <option>Ensino Fundamental I - 3º Ano</option>
                                    <option>Ensino Fundamental I - 4º Ano</option>
                                    <option>Ensino Fundamental I - 5º Ano</option>
                                    <option>Ensino Fundamental II - 6º Ano</option>
                                    <option>Ensino Médio - 1º Ano</option>
                                    <option>Educação Infantil (Grupo 5)</option>
                                </select>
                                <ChevronRight className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                            </div>

                            <div className="relative group">
                                <label className="absolute -top-2 left-2 px-1 bg-white text-[10px] font-bold text-brand-purple uppercase">Disciplina</label>
                                <select
                                    className="w-full p-4 bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-brand-purple rounded-xl outline-none font-medium text-gray-700 transition-all appearance-none notranslate"
                                    value={config.subject}
                                    onChange={e => setConfig({ ...config, subject: e.target.value })}
                                >
                                    <option>História</option>
                                    <option>Geografia</option>
                                    <option>Artes</option>
                                    <option>Língua Portuguesa</option>
                                    <option>Ciências</option>
                                    <option>Ensino Religioso</option>
                                    <option>Projeto de Vida</option>
                                </select>
                                <ChevronRight className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full p-4 bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-brand-purple rounded-xl outline-none font-medium text-gray-700 transition-all placeholder-gray-400"
                                    placeholder="Tópico (Ex: Patrimônio Oral)"
                                    value={config.topic}
                                    onChange={e => setConfig({ ...config, topic: e.target.value })}
                                />
                                <SlidersHorizontal className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    </section>

                    {/* 2. Memórias */}
                    <section id="tour-media-upload">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs">2</span>
                            Selecionar Material Base
                        </h3>

                        <div className="bg-gray-50 rounded-xl p-2 border border-gray-100 max-h-[300px] flex flex-col">
                            <div className="relative mb-2 px-1 pt-1">
                                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Buscar no acervo..."
                                    className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/20 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="overflow-y-auto flex-1 space-y-2 pr-1 custom-scrollbar">
                                {loading ? (
                                    <div className="flex justify-center p-4"><Loader className="animate-spin text-brand-purple w-5 h-5" /></div>
                                ) : (
                                    filteredMemories.map(memory => (
                                        <div
                                            key={memory.id}
                                            onClick={() => toggleMemory(memory.id)}
                                            className={`p-2 rounded-lg border-2 cursor-pointer transition-all group flex items-start gap-3 relative ${selectedMemories.includes(memory.id)
                                                ? 'border-brand-purple bg-white shadow-md'
                                                : 'border-transparent hover:bg-white hover:border-gray-200'
                                                }`}
                                        >
                                            <div className="w-16 h-16 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden">
                                                {memory.imageUrl ? (
                                                    <img src={memory.imageUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <ImageIcon className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm font-bold truncate ${selectedMemories.includes(memory.id) ? 'text-brand-purple' : 'text-gray-700'}`}>
                                                    <span>{memory.title}</span>
                                                </h4>
                                                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5"><span>{memory.description}</span></p>
                                            </div>
                                            {selectedMemories.includes(memory.id) && (
                                                <div className="absolute top-2 right-2 text-brand-purple bg-white rounded-full">
                                                    <CheckCircle2 className="w-4 h-4 fill-current" />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t border-gray-100 bg-white">
                    <button
                        id="tour-generate-btn"
                        onClick={handleGenerate}
                        disabled={generating || selectedMemories.length === 0}
                        style={{ backgroundColor: primaryColor }} // Dynamic Primary Color
                        className="w-full py-4 text-white rounded-xl font-bold font-sans hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl shadow-brand-purple/20 flex items-center justify-center gap-2 group relative overflow-hidden"
                    >
                        {generating ? (
                            <><Loader className="w-5 h-5 animate-spin" /> <span>Gerando Plano Mágico...</span></>
                        ) : (
                            <>
                                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
                                <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                <span>Gerar Plano de Aula ✨</span>
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-widest">
                        <span>Powered by MemViva AI</span>
                    </p>
                </div>
            </aside>

            {/* Right Column: Visualization Area */}
            <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8 flex items-center justify-center relative">
                <div className="absolute inset-0 pattern-grid-lg opacity-[0.03] pointer-events-none"></div>

                {lessonPlan ? (
                    // Active State: Generated Plan
                    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
                        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple font-bold text-xs rounded-full uppercase tracking-wider border border-brand-purple/20 notranslate">
                                            {config.subject}
                                        </span>
                                        <span className="text-gray-400 text-sm font-medium">•</span>
                                        <span className="text-gray-600 text-sm font-medium notranslate">{config.gradeLevel}</span>
                                    </div>
                                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2 notranslate">{lessonPlan.title}</h1>
                                </div>
                                <button
                                    onClick={() => window.print()}
                                    className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                                    title="Imprimir"
                                >
                                    <Printer className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Tags/BNCC */}
                            {lessonPlan.bnccCodes && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {lessonPlan.bnccCodes.map(code => (
                                        <span key={code} className="px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded shadow-sm">
                                            {code}
                                        </span>
                                    ))}
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded border border-gray-200">
                                        {lessonPlan.duration || '50 min'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Educational Brand / Kit Helper */}
                            {(lessonPlan.educationalBrand || lessonPlan.gigantinhosKit || organization?.config?.educationalBrand) && (
                                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-900">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                    <p className="text-sm font-medium">
                                        <strong className="block text-blue-800">Recurso Didático Sugerido:</strong>
                                        {lessonPlan.educationalBrand || lessonPlan.gigantinhosKit || organization?.config?.educationalBrand || 'Coleção Gigantinhos'}
                                        <span className="text-blue-600/80 font-normal"> — Página 24, Atividade 2.</span>
                                    </p>
                                </div>
                            )}

                            {/* Objectives */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 border-l-4 border-brand-purple pl-3">Objetivos de Aprendizagem</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {lessonPlan.objectives?.map((obj, i) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span>{obj}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Methodology - Main Column */}
                                <section className="md:col-span-2">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 border-l-4 border-brand-gold pl-3">Metodologia</h3>
                                    <div className="space-y-6">
                                        {lessonPlan.methodology?.map((step, i) => (
                                            <div key={i} className="group flex gap-4">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-brand-purple/20 text-brand-purple font-bold text-sm flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-colors">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm">{step.step}</h4>
                                                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">{step.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Materials & Assessment - Sidebar Column */}
                                <aside className="space-y-8">
                                    <section>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Materiais</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {lessonPlan.materials?.map((mat, i) => (
                                                <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 font-medium whitespace-nowrap">
                                                    {mat}
                                                </span>
                                            ))}
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Avaliação</h3>
                                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-900 leading-relaxed italic">
                                            "{lessonPlan.assessment}"
                                        </div>
                                    </section>
                                </aside>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Empty State
                    <div className="text-center max-w-md mx-auto opacity-60 hover:opacity-100 transition-opacity">
                        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-gray-400 mb-2">Seu Estúdio de Criação</h3>
                        <p className="text-gray-400 font-serif italic text-lg">
                            "Selecione uma memória ao lado para começar a tecer o conhecimento..."
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EducatorArea;
