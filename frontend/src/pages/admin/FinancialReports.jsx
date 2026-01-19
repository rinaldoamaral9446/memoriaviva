import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Plus, Trash2, TrendingUp, AlertCircle, Loader, Calendar } from 'lucide-react';
import { API_URL } from '../../config/api';

const FinancialReports = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    // Form State
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Outros'
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/expenses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setExpenses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newExpense)
            });

            if (response.ok) {
                setNewExpense({ ...newExpense, description: '', amount: '' });
                fetchExpenses();
            }
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir despesa?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/expenses/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const handleGenerateReport = async () => {
        setReportLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Default to last 30 days for now
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const response = await fetch(`${API_URL}/api/expenses/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ startDate, endDate })
            });

            const data = await response.json();
            if (response.ok) {
                setReportData(data);
            } else {
                alert(data.error || 'Erro ao gerar relatório');
            }
        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        Gestão Financeira
                    </h1>
                    <p className="text-gray-600 mt-2">Controle de custos e prestação de contas automatizada.</p>
                </div>
                <button
                    onClick={handleGenerateReport}
                    disabled={reportLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                    {reportLoading ? <Loader className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                    Gerar Relatório (IA)
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Expense List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Add Form */}
                    <form onSubmit={handleAddExpense} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-end">
                        <div className="flex-grow">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
                            <input
                                type="text"
                                required
                                value={newExpense.description}
                                onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                placeholder="Ex: Aluguel de Som"
                            />
                        </div>
                        <div className="w-32">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Valor (R$)</label>
                            <input
                                type="number"
                                required
                                value={newExpense.amount}
                                onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="w-40">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
                            <select
                                value={newExpense.category}
                                onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                            >
                                <option>Equipamento</option>
                                <option>Pessoal</option>
                                <option>Marketing</option>
                                <option>Logística</option>
                                <option>Outros</option>
                            </select>
                        </div>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <Plus className="w-5 h-5" />
                        </button>
                    </form>

                    {/* List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Data</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Categoria</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valor</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.map(expense => (
                                    <tr key={expense.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {expense.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            R$ {expense.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(expense.id)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AI Report Area */}
                <div className="lg:col-span-1">
                    {reportData ? (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 space-y-6 animate-fade-in">
                            <div className="border-b border-gray-100 pb-4">
                                <h2 className="text-xl font-bold text-gray-900">Relatório de Transparência</h2>
                                <p className="text-sm text-gray-500 mt-1">Gerado por IA • Últimos 30 dias</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Resumo Executivo</h3>
                                <p className="text-sm text-gray-600 leading-relaxed text-justify">
                                    {reportData.analysis.summary}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                    Insights
                                </h3>
                                <ul className="space-y-2">
                                    {reportData.analysis.insights.map((insight, i) => (
                                        <li key={i} className="text-sm text-gray-600 flex gap-2">
                                            <span className="text-blue-500">•</span> {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {reportData.analysis.anomalies.length > 0 && (
                                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                    <h3 className="text-sm font-bold text-red-800 uppercase mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Atenção Necessária
                                    </h3>
                                    <ul className="space-y-2">
                                        {reportData.analysis.anomalies.map((anomaly, i) => (
                                            <li key={i} className="text-sm text-red-700 flex gap-2">
                                                <span>•</span> {anomaly}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-2xl font-bold text-gray-900 text-right">
                                    Total: R$ {reportData.total.toFixed(2)}
                                </p>
                            </div>

                            <button className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium">
                                Baixar PDF Oficial
                            </button>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-8 rounded-xl border-2 border-dashed border-gray-200 text-center h-full flex flex-col items-center justify-center text-gray-500">
                            <FileText className="w-12 h-12 mb-4 opacity-20" />
                            <p>Gere um relatório para ver a análise da IA sobre os gastos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialReports;
