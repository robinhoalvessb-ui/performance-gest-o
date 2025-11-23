import React, { useState } from 'react';
import { Expense, Student, UserRole, PaymentStatus } from '../types';
import { analyzeFinancials } from '../services/geminiService';
import { DollarSign, TrendingUp, TrendingDown, Brain, Loader2, UploadCloud, Plus, Trash2, ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface FinancialsProps {
    students: Student[];
    expenses: Expense[];
    role: UserRole;
    onAddExpense: (e: Expense) => void;
    onDeleteExpense: (id: string) => void;
}

export const Financials: React.FC<FinancialsProps> = ({ students, expenses, role, onAddExpense, onDeleteExpense }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'expenses'>('overview');
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);

    // Sorting State
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    // Expense Form State
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Outros');
    const [beneficiary, setBeneficiary] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Pix');
    const [notes, setNotes] = useState('');

    // Aggregations
    const revenue = students.reduce((acc, s) => 
        acc + s.installments.filter(i => i.status === PaymentStatus.PAID).reduce((sum, i) => sum + i.amount, 0), 0
    );
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    const handleAiAnalysis = async () => {
        setLoadingAi(true);
        const result = await analyzeFinancials(students, expenses);
        setAiAnalysis(result);
        setLoadingAi(false);
    };

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        onAddExpense({
            id: Math.random().toString(36).substr(2,9),
            description: desc,
            amount: Number(amount),
            category: category as any,
            date: new Date().toISOString().split('T')[0],
            beneficiary,
            paymentMethod,
            notes: notes || undefined
        });
        // Reset form
        setDesc('');
        setAmount('');
        setCategory('Outros');
        setBeneficiary('');
        setPaymentMethod('Pix');
        setNotes('');
        alert('Despesa registrada com sucesso!');
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("Excluindo despesa:", id);
        onDeleteExpense(id);
        
        // Feedback
        setTimeout(() => alert('Despesa excluída com sucesso!'), 100);
    };

    // Sorting Logic
    const sortedExpenses = [...expenses].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-2xl font-bold text-white">Gestão Financeira</h2>
                <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 self-start md:self-auto">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                        Visão Geral
                    </button>
                    <button 
                        onClick={() => setActiveTab('expenses')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'expenses' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                        Despesas
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col">
                            <span className="text-slate-400 text-sm mb-1">Receita Confirmada</span>
                            <span className="text-2xl font-bold text-green-400">R$ {revenue.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col">
                            <span className="text-slate-400 text-sm mb-1">Despesas Totais</span>
                            <span className="text-2xl font-bold text-red-400">R$ {totalExpenses.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col">
                            <span className="text-slate-400 text-sm mb-1">Balanço Líquido</span>
                            <span className={`text-2xl font-bold ${(revenue - totalExpenses) >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
                                R$ {(revenue - totalExpenses).toLocaleString('pt-BR')}
                            </span>
                        </div>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-500/20 p-2 rounded-lg">
                                <Brain className="text-purple-400 w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Performance AI Intelligence</h3>
                        </div>
                        
                        {!aiAnalysis && !loadingAi && (
                            <div className="text-center py-8">
                                <p className="text-slate-400 mb-4">Utilize a inteligência artificial para analisar seus dados financeiros e receber recomendações estratégicas.</p>
                                <button 
                                    onClick={handleAiAnalysis}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                                >
                                    <Brain size={18} />
                                    Gerar Relatório Inteligente
                                </button>
                            </div>
                        )}

                        {loadingAi && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
                                <p className="text-slate-300">Analisando dados com Gemini...</p>
                            </div>
                        )}

                        {aiAnalysis && (
                            <div className="prose prose-invert max-w-none bg-slate-950/50 p-6 rounded-lg border border-slate-800">
                                <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                                <button 
                                    onClick={() => setAiAnalysis(null)}
                                    className="mt-4 text-sm text-purple-400 hover:text-purple-300 underline"
                                >
                                    Limpar Análise
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'expenses' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Expense List */}
                    <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-700 flex flex-wrap justify-between items-center gap-4">
                            <h3 className="font-semibold text-white">Histórico de Despesas</h3>
                            
                            {/* Sorting Controls */}
                            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700">
                                <button 
                                    onClick={() => setSortOrder('newest')}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${sortOrder === 'newest' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <ArrowDownWideNarrow size={14} /> Mais Recentes
                                </button>
                                <button 
                                    onClick={() => setSortOrder('oldest')}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${sortOrder === 'oldest' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <ArrowUpNarrowWide size={14} /> Mais Antigas
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-900/50 text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3">Descrição</th>
                                        <th className="px-4 py-3">Beneficiário</th>
                                        <th className="px-4 py-3">Categoria</th>
                                        <th className="px-4 py-3">Pagamento</th>
                                        <th className="px-4 py-3">Data</th>
                                        <th className="px-4 py-3 text-right">Valor</th>
                                        <th className="px-4 py-3 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {sortedExpenses.map(exp => (
                                        <tr key={exp.id} className="hover:bg-slate-700/30">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-white">{exp.description}</p>
                                                {exp.notes && <p className="text-xs text-slate-500 truncate max-w-[150px]">{exp.notes}</p>}
                                            </td>
                                            <td className="px-4 py-3">{exp.beneficiary}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 rounded-md bg-slate-700 text-xs whitespace-nowrap">
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs">{exp.paymentMethod}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{new Date(exp.date).toLocaleDateString('pt-BR')}</td>
                                            <td className="px-4 py-3 text-right text-red-400 font-mono font-bold whitespace-nowrap">
                                                R$ {exp.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {role === UserRole.ADMIN && (
                                                    <button 
                                                        onClick={(e) => handleDeleteClick(exp.id, e)}
                                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Excluir Despesa"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {sortedExpenses.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-slate-500">
                                                Nenhuma despesa registrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Add Expense Form */}
                    {role === UserRole.ADMIN ? (
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 h-fit">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-500" />
                                Nova Despesa
                            </h3>
                            <form onSubmit={handleAddExpense} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Descrição</label>
                                    <input 
                                        required
                                        placeholder="Ex: Compra de Material"
                                        type="text" 
                                        value={desc}
                                        onChange={e => setDesc(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Beneficiário</label>
                                    <input 
                                        required
                                        placeholder="Ex: Papelaria Silva"
                                        type="text" 
                                        value={beneficiary}
                                        onChange={e => setBeneficiary(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-600"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Valor (R$)</label>
                                        <input 
                                            required
                                            type="number" 
                                            step="0.01"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Categoria</label>
                                        <select 
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="Professores">Professores</option>
                                            <option value="Infraestrutura">Infraestrutura</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Forma de Pagamento</label>
                                    <select 
                                        value={paymentMethod}
                                        onChange={e => setPaymentMethod(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Pix">Pix</option>
                                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                                        <option value="Dinheiro">Dinheiro</option>
                                        <option value="Boleto">Boleto</option>
                                        <option value="Transferência">Transferência Bancária</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Observações (Opcional)</label>
                                    <textarea 
                                        rows={2}
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-600 resize-none"
                                    />
                                </div>

                                <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-700/50 transition-colors">
                                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                                    <span className="text-xs text-slate-400">Anexar comprovante (Opcional)</span>
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors shadow-lg shadow-red-900/20"
                                >
                                    Registrar Despesa
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
                            <p className="text-slate-400">Acesso restrito a Administradores.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};