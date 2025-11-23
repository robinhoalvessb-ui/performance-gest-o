import React, { useState } from 'react';
import { Student, PaymentStatus } from '../types';
import { Calendar, Filter, Search, AlertCircle, CheckCircle, Clock, ChevronRight } from 'lucide-react';

interface DueDatesProps {
    students: Student[];
}

type FilterType = 'all' | 'week' | 'month' | 'overdue' | 'incoming';

export const DueDates: React.FC<DueDatesProps> = ({ students }) => {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Helper to normalize string date (YYYY-MM-DD) to local Date object at midnight
    const parseDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    // Flatten installments into a single list enriched with student info
    const allInstallments = students.flatMap(student => 
        student.installments.map(inst => ({
            ...inst,
            studentName: student.fullName,
            studentClass: student.courseClass,
            studentId: student.id
        }))
    );

    const getFilteredInstallments = () => {
        let filtered = allInstallments;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (activeFilter) {
            case 'week':
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);
                filtered = filtered.filter(i => {
                    const d = parseDate(i.dueDate);
                    return d >= today && d <= nextWeek && i.status !== PaymentStatus.PAID;
                });
                break;
            case 'month':
                const currentMonth = today.getMonth();
                filtered = filtered.filter(i => {
                    const d = parseDate(i.dueDate);
                    return d.getMonth() === currentMonth && d.getFullYear() === today.getFullYear() && i.status !== PaymentStatus.PAID;
                });
                break;
            case 'overdue':
                filtered = filtered.filter(i => 
                    i.status === PaymentStatus.OVERDUE || 
                    (i.status === PaymentStatus.PENDING && parseDate(i.dueDate) < today)
                );
                break;
            case 'incoming':
                // Pending installments in future
                filtered = filtered.filter(i => i.status === PaymentStatus.PENDING && parseDate(i.dueDate) > today);
                break;
            default:
                break;
        }

        if (dateRange.start) {
            filtered = filtered.filter(i => parseDate(i.dueDate) >= parseDate(dateRange.start));
        }
        if (dateRange.end) {
            filtered = filtered.filter(i => parseDate(i.dueDate) <= parseDate(dateRange.end));
        }

        return filtered.sort((a, b) => parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime());
    };

    const filteredList = getFilteredInstallments();
    const totalValue = filteredList.reduce((acc, curr) => acc + curr.amount, 0);

    const FilterButton = ({ label, type, icon: Icon }: { label: string, type: FilterType, icon: any }) => (
        <button 
            onClick={() => setActiveFilter(type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all
            ${activeFilter === type 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'}`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Vencimentos & Cobranças</h2>
                    <p className="text-slate-400 text-sm">Controle avançado de mensalidades e previsão de caixa.</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col items-end">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Total na Seleção</span>
                    <span className="text-xl font-bold text-green-400">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg space-y-4">
                <div className="flex flex-wrap gap-2">
                    <FilterButton label="Todos" type="all" icon={Filter} />
                    <FilterButton label="Esta Semana" type="week" icon={Calendar} />
                    <FilterButton label="Este Mês" type="month" icon={Calendar} />
                    <FilterButton label="Em Atraso" type="overdue" icon={AlertCircle} />
                    <FilterButton label="A Vencer / Futuros" type="incoming" icon={Clock} />
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-700 flex-wrap">
                    <span className="text-sm text-slate-400 flex items-center gap-2">
                        <Search size={16} />
                        Filtrar por Período:
                    </span>
                    <input 
                        type="date" 
                        className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-1 text-white text-sm outline-none focus:border-blue-500"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                    <span className="text-slate-600">até</span>
                    <input 
                        type="date" 
                        className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-1 text-white text-sm outline-none focus:border-blue-500"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                    {(dateRange.start || dateRange.end) && (
                        <button 
                            onClick={() => setDateRange({ start: '', end: '' })}
                            className="text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                            Limpar Datas
                        </button>
                    )}
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-900/50 text-slate-400 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Vencimento</th>
                                <th className="px-6 py-4">Aluno / Turma</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Valor (Atual)</th>
                                <th className="px-6 py-4 text-right">Original</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Nenhuma mensalidade encontrada para os filtros selecionados.
                                    </td>
                                </tr>
                            ) : (
                                filteredList.map((item, idx) => {
                                    const itemDate = parseDate(item.dueDate);
                                    const now = new Date();
                                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                    const isLate = itemDate < today && item.status !== 'Pago';

                                    return (
                                        <tr key={`${item.id}-${idx}`} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-500" />
                                                    <span className={isLate ? 'text-red-400 font-bold' : 'text-white'}>
                                                        {itemDate.toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-white">{item.studentName}</p>
                                                    <p className="text-xs text-slate-500">{item.studentClass}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium border
                                                    ${item.status === PaymentStatus.PAID ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                                      item.status === PaymentStatus.OVERDUE || isLate ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                      'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                    {item.status === PaymentStatus.PENDING && isLate ? 'Vencido' : item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-medium text-white">
                                                R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-500 text-xs">
                                                R$ {item.originalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};