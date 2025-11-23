
import React, { useState, useEffect } from 'react';
import { Student, User, UserRole, Expense, StudentStatus, PaymentStatus, FinancialConfig, School, SystemRole } from './types';
import { INITIAL_SCHOOLS, MASTER_ADMIN, DEFAULT_SETTINGS } from './constants';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { Financials } from './components/Financials';
import { DueDates } from './components/DueDates';
import { Settings } from './components/Settings';
import { MasterAdminPanel } from './components/MasterAdminPanel';
import { LayoutDashboard, Users, DollarSign, LogOut, Menu, ShieldCheck, Calendar, Settings as SettingsIcon, Building2 } from 'lucide-react';

// --- Login Screen with School ID Support ---
interface LoginProps {
    onLogin: (data: { user: User, schoolId?: string }) => void;
}

const LoginScreen = ({ onLogin }: LoginProps) => {
    const [schoolId, setSchoolId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Check Master Admin (Global Login)
        if (username === MASTER_ADMIN.username && password === MASTER_ADMIN.password) {
            onLogin({ user: MASTER_ADMIN, schoolId: undefined });
            return;
        }

        // 2. Check School Login
        // Requires School ID + Valid User in that school
        if (!schoolId || schoolId.length !== 4) {
            alert('Para acesso de escola, digite o ID de 4 dígitos. Para Admin Geral, use o usuário mestre.');
            return;
        }

        // Pass credentials up to App to validate against dynamic state
        onLogin({ 
            user: { id: 'temp', name: '', username, password, role: UserRole.ADMIN } as User, 
            schoolId 
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-900/20">
                        <ShieldCheck className="text-white w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Performance Gestão</h1>
                    <p className="text-slate-400 text-sm mt-2">Acesso Seguro</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    
                    {/* School ID Field */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">ID da Escola (4 dígitos)</label>
                        <input 
                            type="text" 
                            maxLength={4}
                            value={schoolId}
                            onChange={e => setSchoolId(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-mono tracking-widest text-center placeholder-slate-800"
                            placeholder="0000"
                        />
                        <p className="text-xs text-slate-600 mt-1 text-center">ID 3550 para Sede / Em branco para Master</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Usuário</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            placeholder="usuario.sistema"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            placeholder="••••••"
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-indigo-900/30">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

type ViewState = 'dashboard' | 'students' | 'finance' | 'due_dates' | 'settings';

function App() {
    // Initialize User from LocalStorage to persist login on refresh
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('performance_user_session');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    
    // Initialize state from LocalStorage if available, otherwise use Constants
    const [schools, setSchools] = useState<School[]>(() => {
        const saved = localStorage.getItem('performance_schools_data');
        return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
    });

    // Initialize Current School ID from LocalStorage
    const [currentSchoolId, setCurrentSchoolId] = useState<string | null>(() => {
        return localStorage.getItem('performance_current_school_id') || null;
    });

    const [currentView, setCurrentView] = useState<ViewState>('dashboard');
    const [currentFilter, setCurrentFilter] = useState<string>(''); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Auto-Save Data
    useEffect(() => {
        localStorage.setItem('performance_schools_data', JSON.stringify(schools));
    }, [schools]);

    // Auto-Save Session
    useEffect(() => {
        if (user) {
            localStorage.setItem('performance_user_session', JSON.stringify(user));
        } else {
            localStorage.removeItem('performance_user_session');
        }
    }, [user]);

    // Auto-Save Current School Selection
    useEffect(() => {
        if (currentSchoolId) {
            localStorage.setItem('performance_current_school_id', currentSchoolId);
        } else {
            localStorage.removeItem('performance_current_school_id');
        }
    }, [currentSchoolId]);

    // Derived State
    const currentSchool = schools.find(s => s.id === currentSchoolId) || null;

    // --- AUTOMATIC BACKUP AUTOMATION ---
    useEffect(() => {
        const checkAutoBackup = () => {
            // Only run if configured and a school is active
            const isEnabled = localStorage.getItem('settings_auto_backup') === 'true';
            if (!isEnabled || !currentSchool) return;

            const lastBackup = localStorage.getItem('settings_last_backup');
            const now = Date.now();
            const ONE_DAY = 24 * 60 * 60 * 1000;

            // If never backed up, or more than 24h ago
            if (!lastBackup || now - parseInt(lastBackup) > ONE_DAY) {
                // Generate Filename
                const dateStr = new Date().toISOString().split('T')[0];
                const filename = `backup-${dateStr}.json`;
                
                // Create and Download Blob
                const data = JSON.stringify(currentSchool, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Update Logs (Keep last 30)
                const logs = JSON.parse(localStorage.getItem('settings_backup_logs') || '[]');
                logs.unshift({ date: new Date().toISOString(), name: filename, type: 'Auto' });
                if (logs.length > 30) logs.pop();
                
                localStorage.setItem('settings_backup_logs', JSON.stringify(logs));
                localStorage.setItem('settings_last_backup', now.toString());
                
                // Notification (Simulated Google Drive instruction)
                alert(`Backup Automático Gerado: ${filename}\n\nPor favor, salve este arquivo no seu Google Drive para segurança.`);
            }
        };

        // Check on mount and then every minute
        const interval = setInterval(checkAutoBackup, 60000); 
        checkAutoBackup();
        
        return () => clearInterval(interval);
    }, [currentSchool]);


    const handleLogin = (credentials: { user: User, schoolId?: string }) => {
        // 1. Master Admin Logic
        if (credentials.user.role === SystemRole.MASTER_ADMIN) {
             setUser(credentials.user);
             setCurrentSchoolId(null);
             return;
        }

        // 2. School Login Logic
        if (credentials.schoolId) {
            const school = schools.find(s => s.id === credentials.schoolId);
            if (!school) {
                alert('Escola não encontrada com este ID.');
                return;
            }

            const foundUser = school.users.find(u => u.username === credentials.user.username && u.password === credentials.user.password);
            
            if (foundUser) {
                setUser(foundUser);
                setCurrentSchoolId(school.id);
            } else {
                alert('Usuário ou senha incorretos para esta escola.');
            }
            return;
        }
    };

    const handleLogout = () => {
        setUser(null);
        setCurrentSchoolId(null);
        setCurrentView('dashboard');
        localStorage.removeItem('performance_user_session');
        localStorage.removeItem('performance_current_school_id');
    };

    // --- MASTER ADMIN HANDLERS ---

    const addSchool = (name: string) => {
        const newId = Math.floor(1000 + Math.random() * 9000).toString();
        const newSchool: School = {
            id: newId,
            name: name,
            users: [
                // Default admin for new school
                { 
                    id: `u-${Date.now()}`, 
                    name: 'Diretor Admin', 
                    username: 'admin', 
                    password: '123', 
                    role: SystemRole.SCHOOL_ADMIN 
                }
            ],
            students: [],
            expenses: [],
            settings: DEFAULT_SETTINGS,
            companyInfo: { name, cnpj: '', address: '', phone: '', email: '' },
            bankInfo: { bankName: '', accountType: 'Pix', pixKey: '', agency: '', accountNumber: '', holderName: '' },
            courses: [],
            packages: []
        };
        setSchools([...schools, newSchool]);
        alert(`Escola criada com sucesso!\nID: ${newId}\nUsuário Admin: admin\nSenha: 123`);
    };

    const deleteSchool = (id: string) => {
        setSchools(schools.filter(s => s.id !== id));
    };

    const addUserToSchool = (schoolId: string, userPartial: Partial<User>) => {
        setSchools(prevSchools => prevSchools.map(s => {
            if (s.id === schoolId) {
                const newUser: User = {
                    id: `u-${Date.now()}`,
                    name: userPartial.name || 'Novo Usuário',
                    username: userPartial.username || 'user',
                    password: userPartial.password || '123',
                    role: userPartial.role as any
                };
                return { ...s, users: [...s.users, newUser] };
            }
            return s;
        }));
    };

    const resetPassword = (schoolId: string, username: string) => {
        setSchools(schools.map(s => {
            if (s.id === schoolId) {
                return {
                    ...s,
                    users: s.users.map(u => 
                        u.username === username ? { ...u, password: '123' } : u
                    )
                };
            }
            return s;
        }));
        alert(`Senha do usuário ${username} resetada para '123'.`);
    };

    // --- DATA HANDLERS (Scoped to Current School) ---

    // General updater for the current school (Settings Tab uses this heavily)
    const updateCurrentSchoolState = (updatedSchool: School) => {
        setSchools(prev => prev.map(s => s.id === updatedSchool.id ? updatedSchool : s));
    };

    const updateCurrentSchool = (updater: (school: School) => School) => {
        if (!currentSchoolId) return;
        setSchools(prev => prev.map(s => s.id === currentSchoolId ? updater(s) : s));
    };

    const addStudent = (s: Student) => {
        updateCurrentSchool(school => ({ ...school, students: [...school.students, s] }));
    };

    // New Function to update full student object (for installments changes)
    const updateStudent = (updatedStudent: Student) => {
        updateCurrentSchool(school => ({
             ...school,
             students: school.students.map(s => s.id === updatedStudent.id ? updatedStudent : s)
        }));
    };
    
    const deleteStudent = (id: string) => {
        updateCurrentSchool(school => ({ ...school, students: school.students.filter(s => s.id !== id) }));
    };
    
    const updateStatus = (id: string, status: StudentStatus) => {
        updateCurrentSchool(school => ({ ...school, students: school.students.map(s => s.id === id ? { ...s, status } : s) }));
    };
    
    const togglePayment = (studentId: string, installmentId: string, paidAmount: number, paidDate: string, paymentMethod?: string, observation?: string) => {
        updateCurrentSchool(school => ({
            ...school,
            students: school.students.map(s => {
                if (s.id === studentId) {
                    const updatedInstallments = s.installments.map(i => {
                        if (i.id === installmentId) {
                             const isPaying = paidDate !== ''; 
                             let newStatus = isPaying ? PaymentStatus.PAID : PaymentStatus.PENDING;
                             
                             if (!isPaying) {
                                 const now = new Date();
                                 const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                 const [y, m, d] = i.dueDate.split('-').map(Number);
                                 const dueDateObj = new Date(y, m - 1, d);
                                 if (dueDateObj < today) {
                                     newStatus = PaymentStatus.OVERDUE;
                                 }
                             }

                             return { 
                                 ...i, 
                                 status: newStatus, 
                                 amount: isPaying ? paidAmount : i.originalAmount,
                                 paidDate: isPaying ? paidDate : undefined,
                                 paymentMethod: isPaying ? paymentMethod : i.paymentMethod, // Update method if provided
                                 observation: observation ? observation : i.observation, // Append or replace observation
                                 discountApplied: undefined 
                             };
                        }
                        return i;
                    });
                    return { ...s, installments: updatedInstallments };
                }
                return s;
            })
        }));
    };

    const addExpense = (e: Expense) => {
        updateCurrentSchool(school => ({ ...school, expenses: [...school.expenses, e] }));
    };

    const deleteExpense = (id: string) => {
        updateCurrentSchool(school => ({ ...school, expenses: school.expenses.filter(e => e.id !== id) }));
    };

    const navigateTo = (view: string, filter: string = '') => {
        setCurrentView(view as ViewState);
        setCurrentFilter(filter);
    };

    // --- RENDER ---

    if (!user) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    // VIEW: Master Admin
    if (user.role === SystemRole.MASTER_ADMIN) {
        return (
            <div className="min-h-screen bg-slate-950 text-white">
                 <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 shadow-md">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-1.5 rounded">
                            <ShieldCheck className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Performance <span className="font-normal opacity-50">Master</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">Admin Geral</span>
                        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-2 bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-900/20 transition-colors">
                            <LogOut size={16} /> Sair
                        </button>
                    </div>
                </header>
                <MasterAdminPanel 
                    schools={schools} 
                    onAddSchool={addSchool} 
                    onDeleteSchool={deleteSchool}
                    onAddUserToSchool={addUserToSchool}
                    onResetPassword={resetPassword}
                />
            </div>
        );
    }

    // VIEW: School User
    if (!currentSchool) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white bg-slate-950 gap-4">
                <p className="text-red-400">Erro Crítico: Dados da escola não carregados.</p>
                <button onClick={handleLogout} className="text-slate-400 hover:text-white underline">Voltar ao Login</button>
            </div>
        );
    }

    const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
        <button
            onClick={() => { setCurrentView(view); setCurrentFilter(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
                currentView === view 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-950 flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <Building2 className="text-white w-6 h-6" />
                    </div>
                    <div className="overflow-hidden">
                        <h1 className="text-white font-bold text-sm leading-none truncate">{currentSchool.name}</h1>
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider">ID: {currentSchool.id}</span>
                    </div>
                </div>

                <nav className="p-4 flex-1">
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase mb-4 mt-2">Menu Principal</p>
                    <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem view="students" icon={Users} label="Alunos & Turmas" />
                    <NavItem view="due_dates" icon={Calendar} label="Vencimentos" />
                    <NavItem view="finance" icon={DollarSign} label="Financeiro" />
                    <NavItem view="settings" icon={SettingsIcon} label="Configurações" />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                            {user.name.substring(0,2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm text-white font-medium truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">
                                {user.role === UserRole.ADMIN || user.role === SystemRole.SCHOOL_ADMIN ? 'Diretor(a)' : 'Coordenador(a)'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors text-sm"
                    >
                        <LogOut size={16} />
                        <span>Sair da Conta</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header Mobile */}
                <header className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                         <div className="bg-blue-600 p-1 rounded">
                            <ShieldCheck className="text-white w-5 h-5" />
                        </div>
                        <span className="text-white font-bold">Performance</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2">
                        <Menu size={24} />
                    </button>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        {currentView === 'dashboard' && (
                            <Dashboard 
                                students={currentSchool.students} 
                                expenses={currentSchool.expenses} 
                                onNavigateTo={navigateTo} 
                            />
                        )}
                        {currentView === 'students' && (
                            <StudentList 
                                students={currentSchool.students} 
                                role={user.role as UserRole} 
                                settings={currentSchool.settings}
                                school={currentSchool} // Pass full school object for integration
                                initialFilter={currentFilter}
                                onAddStudent={addStudent}
                                onUpdateStudent={updateStudent}
                                onDeleteStudent={deleteStudent}
                                onUpdateStatus={updateStatus}
                                onTogglePayment={togglePayment}
                            />
                        )}
                        {currentView === 'due_dates' && (
                            <DueDates students={currentSchool.students} />
                        )}
                        {currentView === 'finance' && (
                            <Financials 
                                students={currentSchool.students} 
                                expenses={currentSchool.expenses}
                                role={user.role as UserRole}
                                onAddExpense={addExpense}
                                onDeleteExpense={deleteExpense}
                            />
                        )}
                        {currentView === 'settings' && (
                            <Settings 
                                school={currentSchool}
                                onUpdateSchool={updateCurrentSchoolState} 
                                role={user.role} 
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
