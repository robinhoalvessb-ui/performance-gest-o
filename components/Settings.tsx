
import React, { useState, useEffect } from 'react';
import { School, UserRole, SystemRole, Course, EducationPackage, User, FinancialConfig } from '../types';
import { Save, AlertTriangle, Settings as SettingsIcon, Building2, Landmark, Users, BookOpen, Package, ArrowLeft, Plus, Trash2, Edit2, Percent, Database, Cloud, History, FileJson, Upload, Download, RefreshCw, FileText, Copy } from 'lucide-react';

interface SettingsProps {
    school: School;
    onUpdateSchool: (updatedSchool: School) => void;
    role: UserRole | SystemRole | string;
}

type SettingsView = 'menu' | 'company' | 'bank' | 'users' | 'courses' | 'packages' | 'financial' | 'backup' | 'contracts';

export const Settings: React.FC<SettingsProps> = ({ school, onUpdateSchool, role }) => {
    const [activeView, setActiveView] = useState<SettingsView>('menu');
    
    // Check access for Directors (Legacy ADMIN or New SCHOOL_ADMIN)
    const isAuthorized = role === UserRole.ADMIN || role === SystemRole.SCHOOL_ADMIN;

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <AlertTriangle size={48} className="mb-4 text-amber-500" />
                <h2 className="text-xl font-semibold text-white">Acesso Restrito</h2>
                <p>Apenas diretores podem alterar configurações do sistema.</p>
            </div>
        );
    }

    // --- COMPONENTS FOR SUB-VIEWS ---

    const MenuCard = ({ icon: Icon, title, desc, view }: { icon: any, title: string, desc: string, view: SettingsView }) => (
        <button 
            onClick={() => setActiveView(view)}
            className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-indigo-500 transition-all hover:translate-y-[-4px] text-left group shadow-lg"
        >
            <div className="bg-slate-900 p-3 rounded-lg w-fit mb-4 group-hover:bg-indigo-600/20 transition-colors">
                <Icon className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-400">{desc}</p>
        </button>
    );

    const Header = ({ title, icon: Icon }: { title: string, icon: any }) => (
        <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
            <button onClick={() => setActiveView('menu')} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg">
                    <Icon className="text-white w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
            </div>
        </div>
    );

    // 1. COMPANY INFO VIEW
    const CompanyView = () => {
        const [form, setForm] = useState(school.companyInfo || { name: '', cnpj: '', address: '', phone: '', email: '' });

        const handleSave = (e: React.FormEvent) => {
            e.preventDefault();
            onUpdateSchool({ ...school, companyInfo: form });
            alert("Informações salvas!");
        };

        return (
            <div className="animate-fade-in max-w-2xl mx-auto">
                <Header title="Informações Empresariais" icon={Building2} />
                <form onSubmit={handleSave} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-500 cursor-pointer hover:bg-slate-600 transition-colors">
                            <span className="text-xs text-slate-400">Logo</span>
                        </div>
                    </div>
                    <div><label className="text-xs text-slate-400 font-bold uppercase">Nome da Empresa</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1" /></div>
                    <div><label className="text-xs text-slate-400 font-bold uppercase">CNPJ</label><input value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1" /></div>
                    <div><label className="text-xs text-slate-400 font-bold uppercase">Endereço</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-slate-400 font-bold uppercase">Telefone / WhatsApp</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1" /></div>
                        <div><label className="text-xs text-slate-400 font-bold uppercase">Email Comercial</label><input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1" /></div>
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold mt-4 flex items-center justify-center gap-2"><Save size={18}/> Salvar Alterações</button>
                </form>
            </div>
        );
    };

    // 2. BANK INFO VIEW
    const BankView = () => {
        const [form, setForm] = useState(school.bankInfo || { bankName: '', accountType: 'Pix', pixKey: '', agency: '', accountNumber: '', holderName: '' });

        const handleSave = (e: React.FormEvent) => {
            e.preventDefault();
            onUpdateSchool({ ...school, bankInfo: form as any });
            alert("Dados bancários salvos!");
        };

        return (
            <div className="animate-fade-in max-w-2xl mx-auto">
                <Header title="Configurações de Banco" icon={Landmark} />
                <form onSubmit={handleSave} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-slate-400 font-bold uppercase">Nome do Banco</label><input value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1" placeholder="Ex: Nubank" /></div>
                        <div>
                            <label className="text-xs text-slate-400 font-bold uppercase">Tipo de Conta</label>
                            <select value={form.accountType} onChange={e => setForm({...form, accountType: e.target.value as any})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1">
                                <option>Pix</option><option>Conta Corrente</option><option>Poupança</option>
                            </select>
                        </div>
                    </div>
                    <div><label className="text-xs text-slate-400 font-bold uppercase text-emerald-400">Chave PIX (Principal)</label><input value={form.pixKey} onChange={e => setForm({...form, pixKey: e.target.value})} className="w-full bg-slate-900 border border-emerald-600 rounded p-2 text-white mt-1 font-bold" placeholder="CPF, Email ou Aleatória" /></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div><label className="text-xs text-slate-400 font-bold uppercase">Agência</label><input value={form.agency} onChange={e => setForm({...form, agency: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1" /></div>
                        <div className="col-span-2"><label className="text-xs text-slate-400 font-bold uppercase">Conta</label><input value={form.accountNumber} onChange={e => setForm({...form, accountNumber: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1" /></div>
                    </div>
                    <div><label className="text-xs text-slate-400 font-bold uppercase">Nome do Titular</label><input value={form.holderName} onChange={e => setForm({...form, holderName: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1" /></div>
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold mt-4 flex items-center justify-center gap-2"><Save size={18}/> Salvar Dados Bancários</button>
                </form>
            </div>
        );
    };

    // 3. USERS VIEW
    const UsersView = () => {
        const [isEditing, setIsEditing] = useState(false);
        const [userForm, setUserForm] = useState<Partial<User>>({ name: '', username: '', password: '', role: UserRole.COORDINATOR });

        const handleSaveUser = (e: React.FormEvent) => {
            e.preventDefault();
            const newUser: User = {
                id: userForm.id || Math.random().toString(36).substr(2, 9),
                name: userForm.name!,
                username: userForm.username!,
                password: userForm.password || '123',
                role: userForm.role as any
            };
            
            let updatedUsers = school.users;
            if (userForm.id) {
                updatedUsers = school.users.map(u => u.id === userForm.id ? { ...u, ...newUser } : u);
            } else {
                updatedUsers = [...school.users, newUser];
            }

            onUpdateSchool({ ...school, users: updatedUsers });
            setIsEditing(false);
            setUserForm({ name: '', username: '', password: '', role: UserRole.COORDINATOR });
        };

        const handleDelete = (id: string) => {
            if (confirm("Remover este usuário?")) {
                onUpdateSchool({ ...school, users: school.users.filter(u => u.id !== id) });
            }
        };

        return (
            <div className="animate-fade-in">
                <Header title="Gestão de Usuários" icon={Users} />
                
                {isEditing ? (
                    <form onSubmit={handleSaveUser} className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-lg mx-auto">
                        <h3 className="text-lg font-bold text-white mb-4">{userForm.id ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                        <div className="space-y-3">
                            <input required placeholder="Nome" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white" />
                            <input required placeholder="Login (Usuário)" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white" />
                            <input placeholder="Senha (deixe em branco para manter)" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white" />
                            <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as any})} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white">
                                <option value={UserRole.COORDINATOR}>Coordenador</option>
                                <option value={UserRole.ADMIN}>Administrador (Diretor)</option>
                                <option value="INSTRUCTOR">Instrutor</option>
                                <option value="SECRETARY">Secretaria</option>
                            </select>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-bold">Salvar</button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                         <div className="p-4 flex justify-between items-center border-b border-slate-700">
                            <h3 className="font-bold text-white">Usuários Cadastrados</h3>
                            <button onClick={() => { setUserForm({role: UserRole.COORDINATOR}); setIsEditing(true); }} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"><Plus size={14}/> Novo</button>
                        </div>
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-900/50"><tr><th className="p-3">Nome</th><th className="p-3">Login</th><th className="p-3">Função</th><th className="p-3 text-right">Ações</th></tr></thead>
                            <tbody>
                                {school.users.map(u => (
                                    <tr key={u.id} className="border-t border-slate-700">
                                        <td className="p-3">{u.name}</td>
                                        <td className="p-3">{u.username}</td>
                                        <td className="p-3"><span className="bg-slate-700 px-2 py-0.5 rounded text-xs">{u.role}</span></td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => { setUserForm(u); setIsEditing(true); }} className="p-1 text-blue-400 hover:text-white mr-2"><Edit2 size={16}/></button>
                                            <button onClick={() => handleDelete(u.id)} className="p-1 text-red-400 hover:text-white"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    // 4. COURSES VIEW
    const CoursesView = () => {
        const [isEditing, setIsEditing] = useState(false);
        const [courseForm, setCourseForm] = useState<Partial<Course>>({ isActive: true, registrationFee: 0, materialFee: 0, defaultBonus: 0, hoursPerWeek: 1 });

        const handleSaveCourse = (e: React.FormEvent) => {
            e.preventDefault();
            const newCourse: Course = {
                id: courseForm.id || Math.random().toString(36).substr(2, 9),
                name: courseForm.name!,
                totalValue: Number(courseForm.totalValue),
                installments: Number(courseForm.installments),
                duration: courseForm.duration || '',
                modality: courseForm.modality || 'Presencial',
                category: courseForm.category || 'Geral',
                isActive: courseForm.isActive !== false,
                
                // Financial Defaults
                registrationFee: Number(courseForm.registrationFee || 0),
                materialFee: Number(courseForm.materialFee || 0),
                defaultBonus: Number(courseForm.defaultBonus || 0),
                hoursPerWeek: Number(courseForm.hoursPerWeek || 1)
            };
            
            const currentCourses = school.courses || [];
            let updatedCourses;
            if (courseForm.id) {
                updatedCourses = currentCourses.map(c => c.id === courseForm.id ? newCourse : c);
            } else {
                updatedCourses = [...currentCourses, newCourse];
            }

            onUpdateSchool({ ...school, courses: updatedCourses });
            setIsEditing(false);
            setCourseForm({ isActive: true, registrationFee: 0, materialFee: 0, defaultBonus: 0, hoursPerWeek: 1 });
        };

        const handleDelete = (id: string) => {
            if(confirm("Excluir curso?")) {
                 const updatedCourses = (school.courses || []).filter(c => c.id !== id);
                 onUpdateSchool({ ...school, courses: updatedCourses });
            }
        };

        return (
            <div className="animate-fade-in">
                <Header title="Gestão de Cursos" icon={BookOpen} />
                {isEditing ? (
                     <form onSubmit={handleSaveCourse} className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-lg mx-auto space-y-3">
                        <h3 className="text-lg font-bold text-white mb-4">{courseForm.id ? 'Editar Curso' : 'Novo Curso'}</h3>
                        <input required placeholder="Nome do Curso" value={courseForm.name || ''} onChange={e => setCourseForm({...courseForm, name: e.target.value})} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white" />
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-xs text-slate-400 uppercase font-bold">Valor Pacote (R$)</label><input required type="number" value={courseForm.totalValue || ''} onChange={e => setCourseForm({...courseForm, totalValue: Number(e.target.value)})} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white" /></div>
                            <div><label className="text-xs text-slate-400 uppercase font-bold">Parcelas</label><input required type="number" value={courseForm.installments || ''} onChange={e => setCourseForm({...courseForm, installments: Number(e.target.value)})} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white" /></div>
                        </div>

                        {/* Advanced Defaults */}
                        <div className="bg-slate-900/50 p-3 rounded border border-slate-700 space-y-3">
                            <p className="text-xs font-bold text-indigo-400 uppercase border-b border-slate-700 pb-1">Padrões de Matrícula</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[10px] text-slate-400 uppercase font-bold">Taxa Matrícula</label><input type="number" value={courseForm.registrationFee || ''} onChange={e => setCourseForm({...courseForm, registrationFee: Number(e.target.value)})} className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white text-xs" /></div>
                                <div><label className="text-[10px] text-slate-400 uppercase font-bold">Valor Material</label><input type="number" value={courseForm.materialFee || ''} onChange={e => setCourseForm({...courseForm, materialFee: Number(e.target.value)})} className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white text-xs" /></div>
                                <div><label className="text-[10px] text-slate-400 uppercase font-bold">Bônus Pont.</label><input type="number" value={courseForm.defaultBonus || ''} onChange={e => setCourseForm({...courseForm, defaultBonus: Number(e.target.value)})} className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white text-xs" /></div>
                                <div><label className="text-[10px] text-slate-400 uppercase font-bold">Horas/Semana</label><input type="number" value={courseForm.hoursPerWeek || ''} onChange={e => setCourseForm({...courseForm, hoursPerWeek: Number(e.target.value)})} className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white text-xs" /></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                             <input placeholder="Duração (ex: 40h)" value={courseForm.duration || ''} onChange={e => setCourseForm({...courseForm, duration: e.target.value})} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white" />
                             <select value={courseForm.modality || 'Presencial'} onChange={e => setCourseForm({...courseForm, modality: e.target.value as any})} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white">
                                <option>Presencial</option><option>Online</option><option>Híbrido</option>
                            </select>
                        </div>
                        <div className="flex gap-2 pt-2">
                             <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                             <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-bold">Salvar Curso</button>
                        </div>
                     </form>
                ) : (
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                        <div className="p-4 flex justify-between items-center border-b border-slate-700">
                            <h3 className="font-bold text-white">Cursos Disponíveis</h3>
                            <button onClick={() => { setCourseForm({registrationFee: 0, materialFee: 0, hoursPerWeek: 1}); setIsEditing(true); }} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"><Plus size={14}/> Novo Curso</button>
                        </div>
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-900/50"><tr><th className="p-3">Nome</th><th className="p-3">Valor</th><th className="p-3">Modo</th><th className="p-3 text-right">Ações</th></tr></thead>
                            <tbody>
                                {(school.courses || []).map(c => (
                                    <tr key={c.id} className="border-t border-slate-700">
                                        <td className="p-3 font-medium">{c.name}</td>
                                        <td className="p-3">R$ {c.totalValue.toFixed(2)} ({c.installments}x)</td>
                                        <td className="p-3">{c.modality}</td>
                                        <td className="p-3 text-right">
                                             <button onClick={() => { setCourseForm(c); setIsEditing(true); }} className="p-1 text-blue-400 hover:text-white mr-2"><Edit2 size={16}/></button>
                                             <button onClick={() => handleDelete(c.id)} className="p-1 text-red-400 hover:text-white"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                                {(!school.courses || school.courses.length === 0) && <tr><td colSpan={4} className="p-4 text-center text-slate-500">Nenhum curso cadastrado.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    // 5. PACKAGES VIEW
    const PackagesView = () => {
        const [isEditing, setIsEditing] = useState(false);
        const [pkgForm, setPkgForm] = useState<Partial<EducationPackage>>({ includedCourseIds: [] });

        const handleSavePackage = (e: React.FormEvent) => {
            e.preventDefault();
            const newPkg: EducationPackage = {
                id: pkgForm.id || Math.random().toString(36).substr(2, 9),
                name: pkgForm.name!,
                totalValue: Number(pkgForm.totalValue),
                promotionalValue: Number(pkgForm.promotionalValue),
                installments: Number(pkgForm.installments),
                validity: pkgForm.validity,
                includedCourseIds: pkgForm.includedCourseIds || [],
                contractTemplate: pkgForm.contractTemplate
            };
             const currentPkgs = school.packages || [];
            let updatedPkgs;
            if (pkgForm.id) {
                updatedPkgs = currentPkgs.map(p => p.id === pkgForm.id ? newPkg : p);
            } else {
                updatedPkgs = [...currentPkgs, newPkg];
            }

            onUpdateSchool({ ...school, packages: updatedPkgs });
            setIsEditing(false);
            setPkgForm({ includedCourseIds: [] });
        };

        const toggleCourseInPackage = (courseId: string) => {
            const current = pkgForm.includedCourseIds || [];
            if (current.includes(courseId)) {
                setPkgForm({ ...pkgForm, includedCourseIds: current.filter(id => id !== courseId) });
            } else {
                setPkgForm({ ...pkgForm, includedCourseIds: [...current, courseId] });
            }
        };

        const handleDelete = (id: string) => {
             if(confirm("Excluir pacote?")) {
                 onUpdateSchool({ ...school, packages: (school.packages || []).filter(p => p.id !== id) });
            }
        };

        return (
            <div className="animate-fade-in">
                <Header title="Gestão de Pacotes" icon={Package} />
                {isEditing ? (
                    <form onSubmit={handleSavePackage} className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-lg mx-auto space-y-3">
                        <h3 className="text-lg font-bold text-white mb-4">{pkgForm.id ? 'Editar Pacote' : 'Novo Pacote'}</h3>
                        <input required placeholder="Nome do Pacote (ex: Combo Tech)" value={pkgForm.name || ''} onChange={e => setPkgForm({...pkgForm, name: e.target.value})} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white" />
                        
                        <div className="bg-slate-900 p-3 rounded border border-slate-700">
                            <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Cursos Inclusos</label>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {(school.courses || []).map(c => (
                                    <label key={c.id} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-white">
                                        <input type="checkbox" checked={(pkgForm.includedCourseIds || []).includes(c.id)} onChange={() => toggleCourseInPackage(c.id)} className="rounded border-slate-600 bg-slate-800" />
                                        {c.name}
                                    </label>
                                ))}
                                {(!school.courses || school.courses.length === 0) && <p className="text-xs text-slate-500">Nenhum curso disponível. Cadastre cursos primeiro.</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                             <input required type="number" placeholder="Valor Original (R$)" value={pkgForm.totalValue || ''} onChange={e => setPkgForm({...pkgForm, totalValue: Number(e.target.value)})} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white" />
                             <input required type="number" placeholder="Valor Promocional (R$)" value={pkgForm.promotionalValue || ''} onChange={e => setPkgForm({...pkgForm, promotionalValue: Number(e.target.value)})} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white border-emerald-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input required type="number" placeholder="Max Parcelas" value={pkgForm.installments || ''} onChange={e => setPkgForm({...pkgForm, installments: Number(e.target.value)})} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white" />
                            <input placeholder="Validade (ex: 12 meses)" value={pkgForm.validity || ''} onChange={e => setPkgForm({...pkgForm, validity: e.target.value})} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white" />
                        </div>

                        <div className="flex gap-2 pt-2">
                             <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                             <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-bold">Salvar Pacote</button>
                        </div>
                    </form>
                ) : (
                     <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                        <div className="p-4 flex justify-between items-center border-b border-slate-700">
                            <h3 className="font-bold text-white">Pacotes Promocionais</h3>
                            <button onClick={() => { setPkgForm({includedCourseIds: []}); setIsEditing(true); }} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"><Plus size={14}/> Novo Pacote</button>
                        </div>
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-900/50"><tr><th className="p-3">Nome</th><th className="p-3">Cursos</th><th className="p-3">Valor Promo</th><th className="p-3 text-right">Ações</th></tr></thead>
                            <tbody>
                                {(school.packages || []).map(p => (
                                    <tr key={p.id} className="border-t border-slate-700">
                                        <td className="p-3 font-medium">{p.name}</td>
                                        <td className="p-3">{p.includedCourseIds.length} Cursos</td>
                                        <td className="p-3 text-emerald-400 font-bold">R$ {p.promotionalValue?.toFixed(2)}</td>
                                        <td className="p-3 text-right">
                                             <button onClick={() => { setPkgForm(p); setIsEditing(true); }} className="p-1 text-blue-400 hover:text-white mr-2"><Edit2 size={16}/></button>
                                             <button onClick={() => handleDelete(p.id)} className="p-1 text-red-400 hover:text-white"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                                {(!school.packages || school.packages.length === 0) && <tr><td colSpan={4} className="p-4 text-center text-slate-500">Nenhum pacote cadastrado.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    // 6. FINANCIAL PARAMS VIEW
    const FinancialParamsView = () => {
        const [form, setForm] = useState<FinancialConfig>(school.settings);

        const handleSave = (e: React.FormEvent) => {
            e.preventDefault();
            onUpdateSchool({ ...school, settings: form });
            alert("Parâmetros financeiros atualizados!");
        };

        return (
            <div className="animate-fade-in max-w-xl mx-auto">
                <Header title="Parâmetros de Multa e Juros" icon={Percent} />
                <form onSubmit={handleSave} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
                     <div>
                        <label className="block text-sm text-slate-400 mb-2">Multa Fixa (R$)</label>
                        <input type="number" step="0.01" value={form.fineAmount} onChange={e => setForm({...form, fineAmount: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Juros Diários (%)</label>
                        <input type="number" step="0.01" value={form.dailyInterestRate} onChange={e => setForm({...form, dailyInterestRate: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Dias de Carência</label>
                        <input type="number" value={form.gracePeriodDays} onChange={e => setForm({...form, gracePeriodDays: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold"><Save size={18} className="inline mr-2"/> Salvar Parâmetros</button>
                </form>
            </div>
        );
    };

    // 7. BACKUP & RESTORE VIEW
    const BackupView = () => {
        const [autoBackup, setAutoBackup] = useState(localStorage.getItem('settings_auto_backup') === 'true');
        const [logs, setLogs] = useState<any[]>(JSON.parse(localStorage.getItem('settings_backup_logs') || '[]'));

        const toggleAutoBackup = () => {
            const newState = !autoBackup;
            setAutoBackup(newState);
            localStorage.setItem('settings_auto_backup', String(newState));
        };

        const handleManualBackup = () => {
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `backup-${dateStr}.json`;
            const data = JSON.stringify(school, null, 2);
            
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Log
            const newLog = { date: new Date().toISOString(), name: filename, type: 'Manual' };
            const updatedLogs = [newLog, ...logs].slice(0, 30);
            setLogs(updatedLogs);
            localStorage.setItem('settings_backup_logs', JSON.stringify(updatedLogs));
        };

        const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedSchool = JSON.parse(event.target?.result as string);
                    if (importedSchool && importedSchool.id && importedSchool.students) {
                        if(confirm(`Restaurar backup de ${importedSchool.name}? Isso substituirá os dados atuais.`)) {
                            onUpdateSchool(importedSchool);
                            alert("Sistema restaurado com sucesso!");
                        }
                    } else {
                        alert("Arquivo de backup inválido.");
                    }
                } catch (err) {
                    alert("Erro ao ler arquivo.");
                }
            };
            reader.readAsText(file);
        };

        return (
            <div className="animate-fade-in max-w-3xl mx-auto">
                <Header title="Backup & Restauração" icon={Database} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Automation Card */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-indigo-600/20 p-3 rounded-lg text-indigo-400">
                                <RefreshCw size={24} />
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={autoBackup} onChange={toggleAutoBackup} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Backup Automático</h3>
                        <p className="text-sm text-slate-400 mb-4">Exporta os dados a cada 24 horas.</p>
                        <div className={`text-xs font-mono p-2 rounded ${autoBackup ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                            STATUS: {autoBackup ? 'ATIVO' : 'INATIVO'}
                        </div>
                    </div>

                    {/* Manual Actions Card */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-between">
                        <div>
                             <div className="bg-blue-600/20 p-3 rounded-lg text-blue-400 w-fit mb-4">
                                <Cloud size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Exportar / Importar</h3>
                            <p className="text-sm text-slate-400 mb-4">Gere arquivos JSON de segurança.</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleManualBackup} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                <Download size={16} /> Backup Agora
                            </button>
                            <label className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                                <Upload size={16} /> Restaurar
                                <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>

                {/* History Log */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700 flex items-center gap-2">
                        <History size={18} className="text-slate-400" />
                        <h3 className="font-bold text-white">Histórico de Backups (Últimos 30)</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-900/50"><tr><th className="p-3">Data / Hora</th><th className="p-3">Arquivo</th><th className="p-3 text-right">Tipo</th></tr></thead>
                            <tbody>
                                {logs.map((log, idx) => (
                                    <tr key={idx} className="border-t border-slate-700 hover:bg-slate-700/30">
                                        <td className="p-3 font-mono text-xs text-slate-400">{new Date(log.date).toLocaleString('pt-BR')}</td>
                                        <td className="p-3 flex items-center gap-2 text-white"><FileJson size={14} className="text-emerald-500" /> {log.name}</td>
                                        <td className="p-3 text-right"><span className="bg-slate-900 px-2 py-0.5 rounded text-xs text-slate-500">{log.type || 'Auto'}</span></td>
                                    </tr>
                                ))}
                                {logs.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-slate-500">Nenhum backup registrado.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // 8. CONTRACTS VIEW
    const ContractsView = () => {
        const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
        const [templateContent, setTemplateContent] = useState('');
        
        const selectedPackage = school.packages?.find(p => p.id === selectedPackageId);

        const DEFAULT_TEMPLATE = `<html>
<head>
    <title>Contrato de Prestação de Serviços</title>
    <style>
        body { font-family: 'Times New Roman', serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .bold { font-weight: bold; }
        .signature-box { margin-top: 60px; display: flex; justify-content: space-between; }
        .sign-line { border-top: 1px solid #000; width: 45%; text-align: center; padding-top: 5px; }
    </style>
</head>
<body>
    <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h1>
    
    <div class="section">
        <p><span class="bold">CONTRATADA:</span> {NOME_EMPRESA}, inscrita no CNPJ sob nº {CNPJ_EMPRESA}, com sede em {ENDERECO_EMPRESA}.</p>
        <p><span class="bold">CONTRATANTE:</span> {NOME_ALUNO}, CPF nº {CPF_ALUNO}, residente em {ENDERECO_ALUNO}, {CIDADE_ALUNO}.</p>
    </div>

    <div class="section">
        <p><span class="bold">CLÁUSULA 1ª - DO OBJETO:</span> O presente contrato tem por objeto a prestação de serviços educacionais referentes ao curso/pacote <span class="bold">"{NOME_CURSO}"</span>.</p>
    </div>

    <div class="section">
        <p><span class="bold">CLÁUSULA 2ª - DO VALOR:</span> Pelos serviços prestados, o CONTRATANTE pagará à CONTRATADA o valor total de <span class="bold">R$ {VALOR_TOTAL}</span>.</p>
        <p>O pagamento será realizado conforme plano financeiro acordado (carnê/boleto/cartão).</p>
    </div>

    <div class="section">
        <p><span class="bold">CLÁUSULA 3ª - DA VIGÊNCIA:</span> Este contrato entra em vigor na data de sua assinatura e encerra-se com a conclusão do curso ou rescisão formal.</p>
    </div>

    <div class="signature-box">
        <div class="sign-line">CONTRATANTE<br/>{NOME_ALUNO}</div>
        <div class="sign-line">CONTRATADA<br/>{NOME_EMPRESA}</div>
    </div>

    <p style="text-align: center; margin-top: 40px; font-size: 12px;">{DATA_ATUAL}</p>
</body>
</html>`;

        useEffect(() => {
            if (selectedPackage) {
                setTemplateContent(selectedPackage.contractTemplate || DEFAULT_TEMPLATE);
            }
        }, [selectedPackage]);

        const handleSaveContract = () => {
            if (!selectedPackage) return;
            const updatedPackages = school.packages?.map(p => 
                p.id === selectedPackage.id ? { ...p, contractTemplate: templateContent } : p
            );
            onUpdateSchool({ ...school, packages: updatedPackages });
            alert("Modelo de contrato salvo com sucesso!");
        };

        const handleResetDefault = () => {
            if(confirm("Tem certeza? Isso substituirá o texto atual pelo modelo padrão.")) {
                setTemplateContent(DEFAULT_TEMPLATE);
            }
        };

        return (
            <div className="animate-fade-in h-[calc(100vh-200px)] flex flex-col">
                <Header title="Configuração de Contratos" icon={FileText} />
                
                <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
                    {/* Sidebar List */}
                    <div className="col-span-4 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                        <div className="p-4 bg-slate-900 border-b border-slate-700">
                            <h3 className="font-bold text-white text-sm uppercase">Selecione o Pacote</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {school.packages?.map(pkg => (
                                <button
                                    key={pkg.id}
                                    onClick={() => setSelectedPackageId(pkg.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${selectedPackageId === pkg.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                                >
                                    {pkg.name}
                                </button>
                            ))}
                            {(!school.packages || school.packages.length === 0) && (
                                <p className="text-center text-slate-500 text-sm p-4">Nenhum pacote cadastrado.</p>
                            )}
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div className="col-span-8 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden relative">
                        {!selectedPackage ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                                <FileText size={48} className="mb-4 opacity-20" />
                                <p>Selecione um pacote ao lado para editar seu contrato.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-3 border-b border-slate-700 bg-slate-900 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-white font-bold text-sm">{selectedPackage.name}</h3>
                                        <p className="text-xs text-slate-500">Editando Modelo HTML</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleResetDefault} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-600 transition-colors flex items-center gap-1">
                                            <RefreshCw size={12} /> Restaurar Padrão
                                        </button>
                                        <button onClick={handleSaveContract} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded font-bold transition-colors flex items-center gap-1">
                                            <Save size={14} /> Salvar Contrato
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex-1 flex flex-col relative">
                                    <div className="absolute top-2 right-4 z-10 group">
                                        <button className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded opacity-70 hover:opacity-100">Ver Variáveis</button>
                                        <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-slate-900 border border-slate-700 p-3 rounded-lg w-64 shadow-xl z-20 text-xs text-slate-300">
                                            <p className="font-bold text-white mb-2 border-b border-slate-700 pb-1">Variáveis Disponíveis:</p>
                                            <ul className="space-y-1 font-mono text-[10px]">
                                                <li>{'{NOME_ALUNO}'}</li>
                                                <li>{'{CPF_ALUNO}'} / {'{RG_ALUNO}'}</li>
                                                <li>{'{ENDERECO_ALUNO}'} / {'{CIDADE_ALUNO}'}</li>
                                                <li>{'{NOME_CURSO}'}</li>
                                                <li>{'{VALOR_TOTAL}'}</li>
                                                <li>{'{NOME_EMPRESA}'}</li>
                                                <li>{'{CNPJ_EMPRESA}'}</li>
                                                <li>{'{ENDERECO_EMPRESA}'}</li>
                                                <li>{'{DATA_ATUAL}'}</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <textarea 
                                        value={templateContent}
                                        onChange={(e) => setTemplateContent(e.target.value)}
                                        className="flex-1 w-full bg-[#1e1e1e] text-slate-300 font-mono text-sm p-4 resize-none outline-none border-none focus:ring-0"
                                        spellCheck={false}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // --- MAIN RENDER ---

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            {/* MAIN HEADER (Logo & Name) */}
            <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border border-slate-800 shadow-lg">
                 <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-slate-700">
                     {school.companyInfo?.logoUrl ? (
                         <img src={school.companyInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                     ) : (
                         <Building2 className="text-slate-400 w-8 h-8" />
                     )}
                 </div>
                 <div>
                     <h1 className="text-3xl font-bold text-white tracking-tight">{school.companyInfo?.name || school.name || 'Configurar Empresa'}</h1>
                     <p className="text-slate-400 flex items-center gap-2">
                         <span className="font-mono bg-slate-950 px-2 py-0.5 rounded text-xs">{school.companyInfo?.cnpj || 'CNPJ Não Informado'}</span>
                         <span>• {school.companyInfo?.phone || 'Sem telefone'}</span>
                     </p>
                 </div>
            </div>

            {activeView === 'menu' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">Painel de Configurações</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <MenuCard view="company" icon={Building2} title="Informações da Empresa" desc="CNPJ, Endereço, Logo e Contatos." />
                        <MenuCard view="bank" icon={Landmark} title="Dados Financeiros" desc="Contas bancárias e Chaves Pix." />
                        <MenuCard view="users" icon={Users} title="Gestão de Usuários" desc="Adicionar coordenadores e permissões." />
                        <MenuCard view="courses" icon={BookOpen} title="Cursos" desc="Cadastrar cursos e valores base." />
                        <MenuCard view="packages" icon={Package} title="Pacotes Promocionais" desc="Criar combos de cursos." />
                        <MenuCard view="contracts" icon={FileText} title="Configurações de Contratos" desc="Gerenciar Contratos dos Pacotes." />
                        <MenuCard view="financial" icon={Percent} title="Juros e Multas" desc="Configurar taxas de atraso." />
                        <MenuCard view="backup" icon={Database} title="Backup & Dados" desc="Backup Automático e Restauração." />
                    </div>
                </div>
            )}

            {activeView === 'company' && <CompanyView />}
            {activeView === 'bank' && <BankView />}
            {activeView === 'users' && <UsersView />}
            {activeView === 'courses' && <CoursesView />}
            {activeView === 'packages' && <PackagesView />}
            {activeView === 'financial' && <FinancialParamsView />}
            {activeView === 'backup' && <BackupView />}
            {activeView === 'contracts' && <ContractsView />}

        </div>
    );
};