import React, { useState } from 'react';
import { School, SystemRole, User } from '../types';
import { Trash2, Plus, RotateCcw, Building2, ShieldCheck, UserPlus, ChevronDown, ChevronUp, X, Save } from 'lucide-react';

interface MasterAdminPanelProps {
    schools: School[];
    onAddSchool: (name: string) => void;
    onDeleteSchool: (id: string) => void;
    onAddUserToSchool: (schoolId: string, user: Partial<User>) => void;
    onResetPassword: (schoolId: string, username: string) => void;
}

export const MasterAdminPanel: React.FC<MasterAdminPanelProps> = ({
    schools,
    onAddSchool,
    onDeleteSchool,
    onAddUserToSchool,
    onResetPassword
}) => {
    // School Creation State
    const [showCreateSchool, setShowCreateSchool] = useState(false);
    const [schoolName, setSchoolName] = useState("");
    
    // User Creation State
    const [addingUserSchoolId, setAddingUserSchoolId] = useState<string | null>(null);
    const [newUserForm, setNewUserForm] = useState({
        name: '',
        username: '',
        password: '123',
        role: SystemRole.COORDENATOR as SystemRole
    });

    // UI State
    const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedSchool(expandedSchool === id ? null : id);
    };

    const handleOpenAddUser = (schoolId: string) => {
        setAddingUserSchoolId(schoolId);
        setNewUserForm({
            name: '',
            username: '',
            password: '123',
            role: SystemRole.COORDENATOR
        });
    };

    const handleSubmitNewUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!addingUserSchoolId) return;
        if (!newUserForm.username || !newUserForm.name) {
            alert("Por favor, preencha o nome e o usuário.");
            return;
        }

        onAddUserToSchool(addingUserSchoolId, newUserForm);
        setAddingUserSchoolId(null); // Close modal
        alert("Usuário adicionado com sucesso!");
    };

    return (
        <div className="p-6 text-white max-w-6xl mx-auto animate-fade-in">

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-900/20">
                        <ShieldCheck className="text-white w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Painel Master</h1>
                        <p className="text-slate-400">Administração Geral do Sistema Multi-Escolas</p>
                    </div>
                </div>

                {/* Botão adicionar escola */}
                <button 
                    onClick={() => setShowCreateSchool(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg shadow-indigo-900/30"
                >
                    <Plus size={20} />
                    Nova Escola
                </button>
            </div>

            {/* Modal criar escola */}
            {showCreateSchool && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Building2 className="text-indigo-400" />
                            Cadastrar Escola
                        </h2>
                        <input 
                            type="text"
                            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-white mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Nome da instituição"
                            value={schoolName}
                            onChange={e => setSchoolName(e.target.value)}
                            autoFocus
                        />

                        <div className="flex justify-end gap-3">
                             <button 
                                onClick={() => setShowCreateSchool(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => {
                                    if (schoolName.trim()) {
                                        onAddSchool(schoolName);
                                        setSchoolName("");
                                        setShowCreateSchool(false);
                                    }
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
                            >
                                Criar Escola
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Adicionar Usuário */}
            {addingUserSchoolId && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <UserPlus className="text-indigo-400" />
                                Novo Usuário
                            </h2>
                            <button onClick={() => setAddingUserSchoolId(null)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitNewUser} className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Nome Completo</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500"
                                    value={newUserForm.name}
                                    onChange={e => setNewUserForm({...newUserForm, name: e.target.value})}
                                    placeholder="Ex: João da Silva"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Nome de Usuário (Login)</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500"
                                    value={newUserForm.username}
                                    onChange={e => setNewUserForm({...newUserForm, username: e.target.value})}
                                    placeholder="Ex: joao.silva"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Senha Inicial</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500 font-mono"
                                    value={newUserForm.password}
                                    onChange={e => setNewUserForm({...newUserForm, password: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Permissão</label>
                                <select 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500"
                                    value={newUserForm.role}
                                    onChange={e => setNewUserForm({...newUserForm, role: e.target.value as SystemRole})}
                                >
                                    <option value={SystemRole.COORDENATOR}>Coordenador (Acesso Padrão)</option>
                                    <option value={SystemRole.SCHOOL_ADMIN}>Diretor (Admin da Escola)</option>
                                </select>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setAddingUserSchoolId(null)} className="px-4 py-2 text-slate-400 hover:text-white">
                                    Cancelar
                                </button>
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                                    <Save size={18} />
                                    Salvar Usuário
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lista de escolas */}
            <div className="space-y-4">
                {schools.map(school => (
                    <div key={school.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all hover:border-indigo-500/30">

                        <div className="p-5 flex justify-between items-center bg-slate-800/50">
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-700 p-2 rounded-lg">
                                    <Building2 size={24} className="text-slate-300" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{school.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono">ID: {school.id}</span>
                                        <span>• {school.students.length} Alunos</span>
                                        <span>• {school.users.length} Usuários</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => toggleExpand(school.id)}
                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                                >
                                    {expandedSchool === school.id ? <ChevronUp /> : <ChevronDown />}
                                </button>
                                <button
                                    onClick={() => {
                                        if(window.confirm(`Tem certeza que deseja excluir a escola "${school.name}"? Essa ação não pode ser desfeita.`)) {
                                            onDeleteSchool(school.id);
                                        }
                                    }}
                                    className="text-red-400 hover:bg-red-900/20 hover:text-red-300 p-2 rounded-lg transition-colors"
                                    title="Excluir Escola"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>

                        {expandedSchool === school.id && (
                            <div className="p-6 border-t border-slate-800 bg-slate-900/50 animate-fade-in">
                                
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold text-indigo-400 flex items-center gap-2">
                                        <ShieldCheck size={18} /> Gestão de Acesso
                                    </h4>
                                    <button
                                        onClick={() => handleOpenAddUser(school.id)}
                                        className="text-sm bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <UserPlus size={16} /> Adicionar Usuário
                                    </button>
                                </div>

                                {/* Listar usuários */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {school.users.map(u => (
                                        <div key={u.username} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                                            <div>
                                                <p className="font-bold text-sm text-white">{u.name || u.username}</p>
                                                <p className="text-xs text-slate-500">{u.username} • {u.role === SystemRole.SCHOOL_ADMIN ? 'Diretor' : 'Coord.'}</p>
                                            </div>

                                            <button
                                                onClick={() => onResetPassword(school.id, u.username)}
                                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/30 hover:bg-blue-900/40 transition-colors"
                                                title="Resetar senha para '123'"
                                            >
                                                <RotateCcw size={12} /> Resetar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {school.users.length === 0 && (
                                    <p className="text-slate-500 text-sm italic">Nenhum usuário cadastrado.</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {schools.length === 0 && (
                     <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                        <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Nenhuma escola cadastrada no sistema.</p>
                    </div>
                )}
            </div>

        </div>
    );
};