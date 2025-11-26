import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, CheckSquare, GraduationCap, Loader, FileText, Printer, Search } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const EducatorArea = () => {
    console.log('EducatorArea rendering...');
    const { user } = useAuth();
    const [memories, setMemories] = useState([]);
    const [selectedMemories, setSelectedMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [lessonPlan, setLessonPlan] = useState(null);

    const [config, setConfig] = useState({
        gradeLevel: 'Ensino Fundamental I - 3º Ano',
        subject: 'História',
        topic: ''
    });

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
                setLessonPlan(data);
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
        (memory.description && memory.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (memory.transcription && memory.transcription.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-brand-purple/10 rounded-xl text-brand-purple">
                    <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Área do Educador</h1>
                    <p className="text-gray-600">Transforme memórias culturais em planos de aula alinhados à BNCC.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Selection & Config */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Configuration Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-brand-gold" /> Configuração da Aula
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ano/Série</label>
                                <select
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-purple/20 outline-none"
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
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
                                <select
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-purple/20 outline-none"
                                    value={config.subject}
                                    onChange={e => setConfig({ ...config, subject: e.target.value })}
                                >
                                    <option>Artes</option>
                                    <option>História</option>
                                    <option>Geografia</option>
                                    <option>Língua Portuguesa</option>
                                    <option>Ciências</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tópico Específico (Opcional)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-purple/20 outline-none"
                                    placeholder="Ex: Patrimônio Imaterial"
                                    value={config.topic}
                                    onChange={e => setConfig({ ...config, topic: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Memory Selection */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 max-h-[600px] flex flex-col">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-brand-gold" /> Selecionar Memórias
                        </h3>

                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Buscar memórias..."
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-purple/20 outline-none text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="overflow-y-auto flex-1 pr-2">

                            {loading ? (
                                <div className="flex justify-center p-4"><Loader className="animate-spin text-brand-purple" /></div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredMemories.map(memory => (
                                        <div
                                            key={memory.id}
                                            onClick={() => toggleMemory(memory.id)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedMemories.includes(memory.id)
                                                ? 'border-brand-purple bg-brand-purple/5'
                                                : 'border-gray-200 hover:border-brand-purple/50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-4 h-4 mt-1 rounded border flex items-center justify-center ${selectedMemories.includes(memory.id) ? 'bg-brand-purple border-brand-purple' : 'border-gray-300'
                                                    }`}>
                                                    {selectedMemories.includes(memory.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{memory.title}</h4>
                                                    <p className="text-xs text-gray-500">{new Date(memory.date || memory.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={generating || selectedMemories.length === 0}
                            className="w-full py-3 bg-brand-purple text-white rounded-xl font-bold hover:bg-brand-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {generating ? (
                                <><Loader className="w-5 h-5 animate-spin" /> Gerando Plano...</>
                            ) : (
                                <><GraduationCap className="w-5 h-5" /> Gerar Plano de Aula</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Column: Generated Plan */}
                <div className="lg:col-span-2">
                    {lessonPlan ? (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
                            <div className="bg-brand-purple/5 p-6 border-b border-brand-purple/10 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">{lessonPlan.title}</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {lessonPlan.bnccCodes?.map(code => (
                                            <span key={code} className="px-2 py-1 bg-brand-purple text-white text-xs font-bold rounded">
                                                {code}
                                            </span>
                                        ))}
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                            {lessonPlan.duration}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.print()}
                                    className="p-2 text-gray-500 hover:text-brand-purple hover:bg-white rounded-lg transition-colors"
                                    title="Imprimir"
                                >
                                    <Printer className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                <section>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-brand-gold" /> Objetivos de Aprendizagem
                                    </h3>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                        {lessonPlan.objectives?.map((obj, i) => (
                                            <li key={i}>{obj}</li>
                                        ))}
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3">Materiais Necessários</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {lessonPlan.materials?.map((mat, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600">
                                                {mat}
                                            </span>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3">Metodologia</h3>
                                    <div className="space-y-4">
                                        {lessonPlan.methodology?.map((step, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="flex-shrink-0 w-8 h-8 bg-brand-purple/10 text-brand-purple rounded-full flex items-center justify-center font-bold text-sm">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{step.step}</h4>
                                                    <p className="text-gray-600 mt-1">{step.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                    <h3 className="font-bold text-yellow-800 mb-2">Avaliação</h3>
                                    <p className="text-yellow-900/80 text-sm">{lessonPlan.assessment}</p>
                                </section>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <GraduationCap className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Selecione memórias e clique em Gerar</p>
                            <p className="text-sm">O plano de aula aparecerá aqui.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EducatorArea;
