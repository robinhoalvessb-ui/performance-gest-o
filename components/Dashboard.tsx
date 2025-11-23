import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Student, Expense, PaymentStatus, StudentStatus } from '../types';
import { TrendingUp, TrendingDown, AlertCircle, Users, Clock, UserX, Calendar, DollarSign, ChevronRight, X } from 'lucide-react';

interface DashboardProps {
    students: Student[];
    expenses: Expense[];
    onNavigateTo: (view: string, filter?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ students, expenses, onNavigateTo }) => {
    const [showFinancialSummary, setShowFinancialSummary] = useState(false);

    // Logic for Cards
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const totalRevenue = students.reduce((acc, s) => {
        return acc + s.installments.filter(i => i.status === PaymentStatus.PAID).reduce((sum, i) => sum + i.amount, 0);
    }, 0);

    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    
    // Metrics
    const activeStudents = students.filter(s => s.status === StudentStatus.ACTIVE).length;
    const lateStudents = students.filter(s => s.status === StudentStatus.LATE || s.installments.some(i => i.status === PaymentStatus.OVERDUE)).length;
    const dropoutStudents = students.filter(s => s.status === StudentStatus.DROPOUT).length;
    
    // Financial Month Metrics
    const revenueThisMonth = students.reduce((acc, s) => {
        return acc + s.installments
            .filter(i => i.status === PaymentStatus.PAID && i.paidDate && new Date(i.paidDate).getMonth() === currentMonth && new Date(i.paidDate).getFullYear() === currentYear)
            .reduce((sum, i) => sum + i.amount, 0);
    }, 0);

    const expectedThisMonth = students.reduce((acc, s) => {
        return acc + s.installments
            .filter(i => {
                const parts = i.dueDate.split('-');
                const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum, i) => sum + i.originalAmount, 0);
    }, 0);

    const pendingThisMonth = expectedThisMonth - revenueThisMonth; // Simplified logic

    // Previous Month for comparison
    const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const revenuePrevMonth = students.reduce((acc, s) => {
        return acc + s.installments
            .filter(i => i.status === PaymentStatus.PAID && i.paidDate && new Date(i.paidDate).getMonth() === prevMonthDate.getMonth() && new Date(i.paidDate).getFullYear() === prevMonthDate.getFullYear())
            .reduce((sum, i) => sum + i.amount, 0);
    }, 0);

    const growth = revenuePrevMonth === 0 ? 100 : ((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth) * 100;

    // Chart Data
    const dataFinancials = [
        { name: 'Receita', value: totalRevenue, fill: '#22c55e' },
        { name: 'Despesa', value: totalExpenses, fill: '#ef4444' },
        { name: 'Inadimplência', value: students.reduce((acc, s) => acc + s.installments.filter(i => i.status === PaymentStatus.OVERDUE).reduce((sum,i) => sum + i.amount, 0), 0), fill: '#f59e0b' },
    ];

    const statusDistribution = [
        { name: 'Ativos', value: activeStudents },
        { name: 'Atrasados', value: lateStudents },
        { name: 'Desistentes', value: dropoutStudents },
    ];
    const COLORS = ['#3b82f6', '#f59e0b', '#ef4444'];

    const KPICard = ({ label, value, icon: Icon, color, onClick, subLabel }: any) => (
        <div 
            onClick={onClick}
            className={`bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg cursor-pointer hover:border-${color.split('-')[1]}-500 transition-all hover:translate-y-[-2px] group relative overflow-hidden`}
        >
            <div className={`absolute right-[-10px] top-[-10px] opacity-10 text-${color} group-hover:opacity-20 transition-opacity`}>
                <Icon size={80} />
            </div>
            <div className="flex justify-between items-center mb-2 relative z-10">
                <h3 className="text-slate-400 text-xs uppercase font-bold tracking-wider">{label}</h3>
                <div className={`p-1.5 rounded-lg bg-${color}/10 text-${color}`}>
                    <Icon size={18} />
                </div>
            </div>
            <p className="text-2xl font-bold text-white relative z-10">{value}</p>
            {subLabel && <p className="text-xs text-slate-500 mt-1 relative z-10">{subLabel}</p>}
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Dashboard Geral</h2>
                <button 
                    onClick={() => setShowFinancialSummary(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-emerald-900/20 transition-all font-medium"
                >
                    <DollarSign size={18} />
                    Resumo Financeiro do Mês
                </button>
            </div>
            
            {/* Smart KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                <KPICard 
                    label="Alunos Ativos" 
                    value={activeStudents} 
                    icon={Users} 
                    color="blue-500" 
                    onClick={() => onNavigateTo('students', 'active')}
                />
                <KPICard 
                    label="Em Atraso" 
                    value={lateStudents} 
                    icon={AlertCircle} 
                    color="amber-500" 
                    onClick={() => onNavigateTo('due_dates', 'overdue')}
                    subLabel="Cobrança Necessária"
                />
                <KPICard 
                    label="A Vencer (Semana)" 
                    value={students.reduce((acc, s) => acc + s.installments.filter(i => {
                        const parts = i.dueDate.split('-');
                        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                        const now = new Date();
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        return d >= now && d <= nextWeek && i.status !== 'Pago';
                    }).length, 0)} 
                    icon={Clock} 
                    color="purple-500" 
                    onClick={() => onNavigateTo('due_dates', 'week')}
                />
                <KPICard 
                    label="Recebido (Mês)" 
                    value={`R$ ${revenueThisMonth.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} 
                    icon={TrendingUp} 
                    color="emerald-500" 
                    onClick={() => setShowFinancialSummary(true)}
                />
                <KPICard 
                    label="Desistentes" 
                    value={dropoutStudents} 
                    icon={UserX} 
                    color="red-500" 
                    onClick={() => onNavigateTo('students', 'dropout')}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Fluxo Financeiro Total</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataFinancials}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    cursor={{fill: '#334155', opacity: 0.4}}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Status dos Alunos</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Monthly Summary Modal */}
            {showFinancialSummary && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl relative">
                        <button onClick={() => setShowFinancialSummary(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                        
                        <div className="p-6 border-b border-slate-800">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Calendar className="text-emerald-500" />
                                Resumo Financeiro do Mês
                            </h3>
                            <p className="text-slate-400 text-sm">Balanço de {today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <span className="text-xs text-slate-500 uppercase font-bold">Recebido</span>
                                    <p className="text-2xl font-bold text-emerald-400">R$ {revenueThisMonth.toLocaleString('pt-BR')}</p>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <span className="text-xs text-slate-500 uppercase font-bold">Previsto</span>
                                    <p className="text-2xl font-bold text-blue-400">R$ {expectedThisMonth.toLocaleString('pt-BR')}</p>
                                </div>
                            </div>

                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-300 text-sm">Comparação (Mês Anterior)</span>
                                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${growth >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((revenueThisMonth / expectedThisMonth) * 100, 100)}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 text-center">
                                    {(revenueThisMonth / (expectedThisMonth || 1) * 100).toFixed(1)}% da meta mensal atingida
                                </p>
                            </div>

                             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                                <div>
                                    <span className="text-xs text-slate-500 uppercase font-bold">Falta Receber</span>
                                    <p className="text-xl font-bold text-amber-400">R$ {pendingThisMonth > 0 ? pendingThisMonth.toLocaleString('pt-BR') : '0,00'}</p>
                                </div>
                                <button 
                                    onClick={() => { setShowFinancialSummary(false); onNavigateTo('due_dates', 'month'); }}
                                    className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors"
                                >
                                    Ver Detalhes <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};