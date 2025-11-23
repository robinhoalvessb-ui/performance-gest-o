
import React, { useState, useMemo, useEffect } from 'react';
import { Student, StudentStatus, PaymentMethod, UserRole, Installment, PaymentStatus, FinancialConfig, School } from '../types';
import { Search, Plus, Trash2, FileText, X, CheckCircle, AlertCircle, Calendar, User, BookOpen, DollarSign, AlertTriangle, MapPin, Baby, CreditCard, Percent, Printer, RotateCcw, Briefcase, Tag, Users, Layers, Filter, Edit2, Receipt, Copy, RefreshCw, Save, FileSignature, Clock, Ban, FilePlus, CalendarDays, FileX, Eraser, Plane as RocketIcon, Barcode, Split, Repeat, CreditCard as CardIcon, Phone, Mail, UserCheck, Calculator, ArrowRight, Wallet, Banknote, ChevronDown, Settings as SettingsIcon } from 'lucide-react';

interface StudentListProps {
    students: Student[];
    role: UserRole;
    settings: FinancialConfig;
    school?: School; // New prop for full integration
    initialFilter?: string;
    onAddStudent: (s: Student) => void;
    onDeleteStudent: (id: string) => void;
    onUpdateStudent: (s: Student) => void;
    onUpdateStatus: (id: string, status: StudentStatus) => void;
    onTogglePayment: (studentId: string, installmentId: string, paidAmount: number, paidDate: string, paymentMethod?: string, observation?: string) => void;
}

const PAYMENT_PLANS = [
    "ADM/DESIGNER/MARKETING",
    "MENSALIDADE RECORRENTE",
    "PARCELADO NO CARTÃO",
    "À VISTA COM DESCONTO",
    "PERSONALIZADO"
];

export const StudentList: React.FC<StudentListProps> = ({ students, role, settings, school, initialFilter, onAddStudent, onDeleteStudent, onUpdateStudent, onUpdateStatus, onTogglePayment }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    // Main List Filter State
    const [statusFilter, setStatusFilter] = useState<string>('Todos');

    // Sync initial filter from props (Dashboard redirect)
    useEffect(() => {
        if (initialFilter === 'active') setStatusFilter(StudentStatus.ACTIVE);
        else if (initialFilter === 'dropout') setStatusFilter(StudentStatus.DROPOUT);
        else if (initialFilter === 'overdue') setStatusFilter(StudentStatus.LATE);
        else setStatusFilter('Todos');
    }, [initialFilter]);

    // Modal Logic
    const [activeTab, setActiveTab] = useState<'student' | 'course'>('student');
    
    // Detailed View Modal Logic
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [detailTab, setDetailTab] = useState<'enrollment' | 'financial' | 'personal'>('enrollment');
    
    const selectedStudent = students.find(s => s.id === selectedStudentId) || null;

    // --- FINANCIAL STATE ---
    const [receiptFilterType, setReceiptFilterType] = useState<'Parcela' | 'Outros'>('Parcela');
    const [receiptFilterStatus, setReceiptFilterStatus] = useState<'Todas' | 'Em Aberto' | 'Quitada'>('Todas');
    const [selectedFinancialCourse, setSelectedFinancialCourse] = useState<string>(''); // NEW: Selected Course Context
    const [selectedInstallmentIds, setSelectedInstallmentIds] = useState<string[]>([]);

    // --- INSTALLMENT MODAL STATE ---
    const [installmentModalOpen, setInstallmentModalOpen] = useState(false);
    const [installmentForm, setInstallmentForm] = useState<Partial<Installment>>({
        amount: 0,
        originalAmount: 0,
        dueDate: '',
        history: '',
        documentNumber: ''
    });
    const [editingInstallmentId, setEditingInstallmentId] = useState<string | null>(null);
    
    // --- ENROLLMENT ACTION MODAL STATE ---
    const [enrollmentActionModalOpen, setEnrollmentActionModalOpen] = useState(false);
    const [enrollmentForm, setEnrollmentForm] = useState<Partial<Student> & { installmentsCount?: number, dueDay?: number, firstDueDate?: string, customMonthlyFee?: string, customDiscountedValue?: string }>({});
    const [enrollmentMode, setEnrollmentMode] = useState<'replace' | 'add'>('replace');

    // --- PAYMENT CONFIRMATION MODAL STATE ---
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState({
        installmentId: '',
        originalAmount: 0,
        fineInterest: 0,
        discount: 0,
        finalAmount: 0,
        paymentDate: '',
        paymentMethod: 'Pix',
        observation: ''
    });

    // --- CARD PAYMENT MODAL STATE ---
    const [cardModalOpen, setCardModalOpen] = useState(false);
    const [cardInstallments, setCardInstallments] = useState(1);

    // --- PERSONAL DATA EDIT STATE ---
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const [personalForm, setPersonalForm] = useState<Partial<Student>>({});

    // Retrieve last used course class from local storage
    const getLastCourse = () => localStorage.getItem('lastCourseClass') || '';

    // --- INTEGRATED OPTIONS (FROM SETTINGS) ---
    const courses = school?.courses || [];
    const packages = school?.packages || [];
    
    // Combined options for dropdowns
    const availableOptions = useMemo(() => {
        const courseOpts = courses.filter(c => c.isActive).map(c => ({ 
            type: 'Curso', 
            name: c.name, 
            value: c.totalValue, 
            installments: c.installments,
            registrationFee: c.registrationFee,
            materialFee: c.materialFee,
            defaultBonus: c.defaultBonus,
            hoursPerWeek: c.hoursPerWeek
        }));
        const packageOpts = packages.map(p => ({ 
            type: 'Pacote', 
            name: p.name, 
            value: p.promotionalValue || p.totalValue, 
            installments: p.installments,
            registrationFee: p.registrationFee,
            materialFee: p.materialFee,
            defaultBonus: 0, // Packages might not have this yet
            hoursPerWeek: 1
        }));
        return [...packageOpts, ...courseOpts];
    }, [courses, packages]);

    // Form State (Add New Student)
    const [formData, setFormData] = useState({
        // Personal
        fullName: '', cpf: '', rg: '', rgIssuer: '', birthDate: '', 
        guardianName: '', guardianCpf: '', guardianPhone: '',
        email: '', phone: '', 
        address: '', addressNumber: '', neighborhood: '', city: '', 
        observations: '',

        // Course & Financial
        courseClass: getLastCourse(), // Holds the Name of Course/Package
        batch: '',
        paymentPlan: '',
        classType: 'Interativa',
        hoursPerWeek: 1,
        
        // Values
        registrationFee: 0,
        packageValue: 0,
        installmentsCount: 1,
        packageBonus: 0,
        dueDay: 10,
        
        // Material
        materialFee: 0,
        materialInstallments: 1,
        materialBonus: 0,
        isMaterialIncluded: false,
        
        // Discount
        earlyPaymentDiscount: 0,
        isScholarship: false,
        agreement: '',
        discountPercent: 0,
        discountValue: 0,

        // Additional
        attendant: '', seller: '', knowledgeSource: '', promotion: '', referrer: '',
        paymentMethod: PaymentMethod.PIX as PaymentMethod
    });
    
    const [cpfError, setCpfError] = useState(false);

    // --- VALIDATORS ---
    const validateCPF = (cpf: string) => {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
        let sum = 0;
        let remainder;
        for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        sum = 0;
        for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    };

    const handleCpfBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const valid = validateCPF(e.target.value);
        setCpfError(!valid && e.target.value.length > 0);
    };

    const isMinor = (dateStr: string) => {
        if (!dateStr) return false;
        const today = new Date();
        const birth = new Date(dateStr);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age < 18;
    };

    const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    // --- CALCULATIONS ---
    const calculateFinancials = (installment: Installment, studentDiscount: number = 0) => {
        if (installment.status === PaymentStatus.PAID) {
            return { total: installment.amount, fine: 0, interest: 0, discount: installment.discountApplied || 0, days: 0, isEarly: false };
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const due = parseDate(installment.dueDate);

        if (today <= due) {
             const discount = studentDiscount || 0;
             const total = Math.max(0, installment.originalAmount - discount);
             return { total, fine: 0, interest: 0, discount, days: 0, isEarly: true };
        }

        const diffTime = Math.abs(today.getTime() - due.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays <= settings.gracePeriodDays) {
            return { total: installment.originalAmount, fine: 0, interest: 0, discount: 0, days: 0, isEarly: false };
        }

        const daysLate = diffDays;
        const fine = settings.fineAmount;
        const interest = (installment.originalAmount * (settings.dailyInterestRate / 100)) * daysLate;
        const total = installment.originalAmount + fine + interest;

        return { total, fine, interest, discount: 0, days: daysLate, isEarly: false };
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
             const checked = (e.target as HTMLInputElement).checked;
             setFormData(prev => ({ ...prev, [name]: checked }));
             return;
        }

        const numericFields = [
            'registrationFee', 'packageValue', 'installmentsCount', 'dueDay', 
            'earlyPaymentDiscount', 'materialFee', 'hoursPerWeek', 
            'discountPercent', 'discountValue', 'packageBonus', 'materialInstallments', 'materialBonus'
        ];

        // Automatic Package/Course Selection Logic
        if (name === 'courseClass') {
            const selectedOption = availableOptions.find(o => o.name === value);
            if (selectedOption) {
                setFormData(prev => ({
                    ...prev,
                    courseClass: value,
                    packageValue: selectedOption.value,
                    installmentsCount: selectedOption.installments,
                    // Auto-fill defaults from Settings
                    registrationFee: selectedOption.registrationFee || 0,
                    materialFee: selectedOption.materialFee || 0,
                    packageBonus: selectedOption.defaultBonus || 0,
                    hoursPerWeek: selectedOption.hoursPerWeek || 1
                }));
                return;
            }
        }

        // Discount Calculation Logic
        if (name === 'discountPercent') {
             const pct = Number(value);
             const val = formData.packageValue * (pct / 100);
             setFormData(prev => ({ ...prev, discountPercent: pct, discountValue: Number(val.toFixed(2)) }));
             return;
        }

        if (name === 'discountValue') {
             const val = Number(value);
             const pct = formData.packageValue > 0 ? (val / formData.packageValue) * 100 : 0;
             setFormData(prev => ({ ...prev, discountValue: val, discountPercent: Number(pct.toFixed(2)) }));
             return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: numericFields.includes(name) ? Number(value) : value
        }));
    };

    const generateFinancialPackage = (config: {
        packageValue: number;
        installmentsCount: number;
        dueDay: number;
        firstDueDate?: string;
        courseName?: string;
        discountValue?: number;
    }) => {
        const installments: Installment[] = [];
        const count = config.installmentsCount > 0 ? config.installmentsCount : 1;
        
        const baseValue = config.packageValue; 
        const parcelValue = baseValue / count;
        
        const today = new Date();
        let startDate = today;
        if (config.firstDueDate) {
            startDate = parseDate(config.firstDueDate);
        }

        for(let i = 0; i < count; i++) {
             // Calculate dates based on first due date or due day
             let d: Date;
             if (config.firstDueDate) {
                 d = new Date(startDate);
                 d.setMonth(d.getMonth() + i);
             } else {
                 let targetMonth = today.getMonth() + (today.getDate() > config.dueDay ? 1 : 0) + i;
                 d = new Date(today.getFullYear(), targetMonth, config.dueDay);
             }
             
             const year = d.getFullYear();
             const month = String(d.getMonth() + 1).padStart(2, '0');
             const day = String(d.getDate()).padStart(2, '0');
             const dueDateStr = `${year}-${month}-${day}`;
             
             const historyPrefix = config.courseName ? `${config.courseName}` : 'Mensalidade';

             installments.push({
                 id: Math.random().toString(36).substr(2,9),
                 documentNumber: `${new Date().getFullYear()}${String(Math.floor(Math.random()*1000)).padStart(3, '0')}`,
                 history: `${historyPrefix} - ${String(i+1).padStart(2, '0')}/${String(count).padStart(2, '0')}`,
                 dueDate: dueDateStr,
                 amount: parseFloat(parcelValue.toFixed(2)),
                 originalAmount: parseFloat(parcelValue.toFixed(2)),
                 bonus: 0,
                 status: PaymentStatus.PENDING
             });
        }
        
        // Adjust last penny
        const currentTotal = installments.reduce((sum, i) => sum + i.amount, 0);
        const diff = baseValue - currentTotal;
        if (Math.abs(diff) > 0.001) {
            installments[installments.length - 1].amount += diff;
            installments[installments.length - 1].originalAmount += diff;
        }

        return installments;
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Contract Total = (Package - Discount) + Material + Registration
        const netPackageValue = formData.packageValue - formData.discountValue;
        const totalContractValue = netPackageValue + formData.materialFee + formData.registrationFee;
        
        const installments = generateFinancialPackage({
            packageValue: formData.packageValue,
            installmentsCount: formData.installmentsCount,
            dueDay: formData.dueDay,
            courseName: formData.courseClass,
            discountValue: formData.discountValue
        });

        // Add registration fee as separate installment if > 0
        if (formData.registrationFee > 0) {
             installments.unshift({
                 id: Math.random().toString(36).substr(2,9),
                 documentNumber: `MAT-${Math.floor(Math.random()*1000)}`,
                 history: `Taxa de Matrícula - ${formData.courseClass}`,
                 dueDate: new Date().toISOString().split('T')[0], // Due today
                 amount: formData.registrationFee,
                 originalAmount: formData.registrationFee,
                 status: PaymentStatus.PENDING
             });
        }

        // Add material fee logic could be here, but for now user requested simple fee
        if (formData.materialFee > 0) {
             installments.push({
                 id: Math.random().toString(36).substr(2,9),
                 documentNumber: `MATER-${Math.floor(Math.random()*1000)}`,
                 history: `Material Didático - ${formData.courseClass}`,
                 dueDate: new Date().toISOString().split('T')[0],
                 amount: formData.materialFee,
                 originalAmount: formData.materialFee,
                 status: PaymentStatus.PENDING
             });
        }

        localStorage.setItem('lastCourseClass', formData.courseClass);

        const newStudent: Student = {
            id: Math.random().toString(36).substr(2,9),
            fullName: formData.fullName,
            cpf: formData.cpf,
            rg: formData.rg,
            rgIssuer: formData.rgIssuer,
            birthDate: formData.birthDate,
            // Guardian logic verified
            guardianName: isMinor(formData.birthDate) ? formData.guardianName : undefined,
            guardianCpf: isMinor(formData.birthDate) ? formData.guardianCpf : undefined,
            guardianPhone: isMinor(formData.birthDate) ? formData.guardianPhone : undefined,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            addressNumber: formData.addressNumber,
            neighborhood: formData.neighborhood,
            city: formData.city,
            enrollmentDate: new Date().toISOString().split('T')[0],
            courseClass: formData.courseClass,
            status: StudentStatus.ACTIVE,
            observations: formData.observations,
            contractNumber: `${new Date().getFullYear()}-${Math.floor(Math.random()*10000)}`,
            totalValue: totalContractValue,
            earlyPaymentDiscount: formData.earlyPaymentDiscount,
            paymentMethod: formData.paymentMethod,
            installments,
            classType: formData.classType as 'Turma' | 'Interativa',
            hoursPerWeek: formData.hoursPerWeek,
            registrationFee: formData.registrationFee,
            packageValue: formData.packageValue,
            materialFee: formData.materialFee,
            isMaterialIncluded: formData.isMaterialIncluded,
            isScholarship: formData.isScholarship,
            agreement: formData.agreement,
            discountPercent: formData.discountPercent,
            discountValue: formData.discountValue,
            attendant: formData.attendant,
            seller: formData.seller,
            knowledgeSource: formData.knowledgeSource,
            referrer: formData.referrer
        };

        onAddStudent(newStudent);
        setShowModal(false);
        setActiveTab('student');
        setFormData({ ...formData, fullName: '', cpf: '' }); // Reset minimal
    };

    const excluirAluno = (id: string, e?: React.MouseEvent) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (role !== UserRole.ADMIN) {
            alert('ACESSO NEGADO: Apenas administradores podem excluir alunos.');
            return;
        }
        if (window.confirm("Tem certeza que deseja excluir este aluno? Esta ação é permanente.")) {
             onDeleteStudent(id);
             if (selectedStudentId === id) setSelectedStudentId(null);
        }
    };

    // --- ACTION HANDLERS ---

    const handleOpenEnrollmentModal = () => {
        if (!selectedStudent) return;
        
        let discountPercent = selectedStudent.discountPercent || 0;
        const pkgVal = selectedStudent.packageValue || 0;
        const installments = selectedStudent.installments.filter(i => i.history && i.history.includes('/')).length || 1;
        const monthlyFee = pkgVal / (installments || 1);
        
        let discountPct = 0;
        if (monthlyFee > 0 && selectedStudent.earlyPaymentDiscount) {
            discountPct = (selectedStudent.earlyPaymentDiscount / monthlyFee) * 100;
        }

        setEnrollmentForm({ 
            ...selectedStudent, 
            installmentsCount: installments, 
            dueDay: 10, // Default fallback
            registrationFee: selectedStudent.registrationFee || 0,
            materialFee: selectedStudent.materialFee || 0,
            packageValue: pkgVal,
            packageBonus: selectedStudent.packageBonus || 0,
            materialInstallments: selectedStudent.materialInstallments || 1,
            materialBonus: selectedStudent.materialBonus || 0,
            isMaterialIncluded: selectedStudent.isMaterialIncluded || false,
            isScholarship: selectedStudent.isScholarship || false,
            classType: selectedStudent.classType || 'Interativa',
            paymentPlan: selectedStudent.paymentPlan || '',
            hoursPerWeek: selectedStudent.hoursPerWeek || 1,
            earlyPaymentDiscount: selectedStudent.earlyPaymentDiscount || 0,
            discountPercent: Number(discountPct.toFixed(2)), 
        });
        setEnrollmentMode('replace'); 
        setEnrollmentActionModalOpen(true);
    };

    const handleEnrollmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setEnrollmentForm(prev => ({ ...prev, [name]: checked }));
            return;
        }
        
        const numVal = Number(value);
        let updates: any = { [name]: value }; 

        const numericFields = ['installmentsCount', 'dueDay', 'registrationFee', 'materialFee'];
        if (numericFields.includes(name)) {
            updates[name] = numVal;
        }

        // --- CALCULATOR LOGIC ---
        const currentTotal = name === 'packageValue' ? numVal : (enrollmentForm.packageValue || 0);
        const currentInstallments = name === 'installmentsCount' ? (numVal || 1) : (enrollmentForm.installmentsCount || 1);
        const currentMonthlyFee = currentTotal / currentInstallments;
        
        if (name === 'packageValue') {
            updates.packageValue = numVal;
            const pct = enrollmentForm.discountPercent || 0;
            const newMonthlyFee = numVal / currentInstallments;
            const newDiscountAmount = newMonthlyFee * (pct / 100);
            updates.earlyPaymentDiscount = Number(newDiscountAmount.toFixed(2));
        }
        
        if (name === 'installmentsCount') {
            const newCount = numVal || 1;
            updates.installmentsCount = newCount;
            const pct = enrollmentForm.discountPercent || 0;
            const newMonthlyFee = currentTotal / newCount;
            const newDiscountAmount = newMonthlyFee * (pct / 100);
            updates.earlyPaymentDiscount = Number(newDiscountAmount.toFixed(2));
        }

        if (name === 'customMonthlyFee') {
             const newTotal = numVal * currentInstallments;
             updates.packageValue = Number(newTotal.toFixed(2));
             const pct = enrollmentForm.discountPercent || 0;
             const newDiscountAmount = numVal * (pct / 100);
             updates.earlyPaymentDiscount = Number(newDiscountAmount.toFixed(2));
        }

        if (name === 'customDiscountedValue') {
             const diff = Math.max(0, currentMonthlyFee - numVal);
             updates.earlyPaymentDiscount = Number(diff.toFixed(2));
             
             const newPct = currentMonthlyFee > 0 ? (diff / currentMonthlyFee) * 100 : 0;
             updates.discountPercent = Number(newPct.toFixed(2));
        }

        if (name === 'discountPercent') {
             updates.discountPercent = numVal;
             const newDiscountAmount = currentMonthlyFee * (numVal / 100);
             updates.earlyPaymentDiscount = Number(newDiscountAmount.toFixed(2));
        }

        if (name === 'firstDueDate') {
            updates.firstDueDate = value;
        }

        setEnrollmentForm(prev => ({ ...prev, ...updates }));
    };

    const handleSaveEnrollmentAction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        let updated = { ...selectedStudent, ...enrollmentForm } as Student;

        if (enrollmentMode === 'add') {
            if (!enrollmentForm.packageValue || !enrollmentForm.courseClass) {
                 return alert("Para adicionar novo pacote, preencha o Pacote e Valor Total.");
            }
             const newInstallments = generateFinancialPackage({
                 packageValue: enrollmentForm.packageValue,
                 installmentsCount: enrollmentForm.installmentsCount || 1,
                 dueDay: enrollmentForm.dueDay || 10,
                 firstDueDate: enrollmentForm.firstDueDate,
                 courseName: enrollmentForm.courseClass
             });
             updated.installments = [...selectedStudent.installments, ...newInstallments];
             updated.totalValue = (selectedStudent.totalValue || 0) + (enrollmentForm.packageValue || 0);
             updated.courseClass = enrollmentForm.courseClass;
             alert(`Novo pacote financeiro "${enrollmentForm.courseClass}" adicionado com ${newInstallments.length} parcelas.`);
        } else {
             if (confirm("Deseja recalcular/substituir as parcelas pendentes com estes novos valores?")) {
                  const keptInstallments = selectedStudent.installments.filter(i => i.status === PaymentStatus.PAID);
                  const newInstallments = generateFinancialPackage({
                     packageValue: enrollmentForm.packageValue || 0,
                     installmentsCount: enrollmentForm.installmentsCount || 1,
                     dueDay: enrollmentForm.dueDay || 10,
                     firstDueDate: enrollmentForm.firstDueDate,
                     courseName: enrollmentForm.courseClass
                 });
                 if (keptInstallments.length > 0) {
                     alert("Atenção: Existem parcelas pagas. Elas serão mantidas, e o novo pacote será adicionado como complemento.");
                     updated.installments = [...keptInstallments, ...newInstallments];
                 } else {
                     updated.installments = newInstallments;
                 }
             }
             alert("Dados da matrícula atualizados!");
        }

        onUpdateStudent(updated);
        setEnrollmentActionModalOpen(false);
    };

    const handleStartCourse = () => {
        if (!selectedStudent) return;
        onUpdateStatus(selectedStudent.id, StudentStatus.ACTIVE);
    };

    const handleCancelCourse = () => {
        if (!selectedStudent) return;
        const reason = window.prompt("Para cancelar o contrato, informe o motivo:");
        if (reason !== null) {
            const timestamp = new Date().toLocaleString('pt-BR');
            const newObs = selectedStudent.observations 
                ? `${selectedStudent.observations}\n[CANCELAMENTO - ${timestamp}] Motivo: ${reason}`
                : `[CANCELAMENTO - ${timestamp}] Motivo: ${reason}`;
            onUpdateStudent({ ...selectedStudent, status: StudentStatus.DROPOUT, observations: newObs });
        }
    };

    // --- AUTOMATIC CONTRACT GENERATION ---
    const handleGenerateContract = () => {
        if (!selectedStudent) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) { alert('Pop-up bloqueado. Por favor, permita pop-ups para este site.'); return; }

        const company = school?.companyInfo || { name: 'ESCOLA MODELO', cnpj: '00.000.000/0001-00', address: 'Endereço da Escola', email: '', phone: '' };
        
        const linkedPackage = school?.packages?.find(p => p.name === selectedStudent.courseClass);
        const customTemplate = linkedPackage?.contractTemplate;

        let finalContent = '';

        if (customTemplate) {
            finalContent = customTemplate
                .replace(/{NOME_ALUNO}/g, selectedStudent.fullName)
                .replace(/{CPF_ALUNO}/g, selectedStudent.cpf)
                .replace(/{RG_ALUNO}/g, selectedStudent.rg)
                .replace(/{ENDERECO_ALUNO}/g, selectedStudent.address)
                .replace(/{CIDADE_ALUNO}/g, selectedStudent.city)
                .replace(/{NOME_CURSO}/g, selectedStudent.courseClass)
                .replace(/{VALOR_TOTAL}/g, selectedStudent.totalValue.toFixed(2))
                .replace(/{NOME_EMPRESA}/g, company.name)
                .replace(/{CNPJ_EMPRESA}/g, company.cnpj)
                .replace(/{ENDERECO_EMPRESA}/g, company.address)
                .replace(/{DATA_ATUAL}/g, new Date().toLocaleDateString('pt-BR', {day:'numeric', month:'long', year:'numeric'}));
        } else {
            finalContent = `
                <html>
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
                    <div class="section"><p><span class="bold">CONTRATADA:</span> ${company.name}, inscrita no CNPJ sob nº ${company.cnpj}.</p><p><span class="bold">CONTRATANTE:</span> ${selectedStudent.fullName}, CPF nº ${selectedStudent.cpf}.</p></div>
                    <div class="section"><p><span class="bold">OBJETO:</span> Curso/pacote <span class="bold">"${selectedStudent.courseClass}"</span>.</p></div>
                    <div class="section"><p><span class="bold">VALOR:</span> R$ ${selectedStudent.totalValue.toFixed(2)}.</p></div>
                    <div class="signature-box"><div class="sign-line">CONTRATANTE</div><div class="sign-line">CONTRATADA</div></div>
                </body>
                </html>
            `;
        }

        printWindow.document.write(finalContent);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); }, 1000);
    };

    // --- PAYMENT HANDLERS ---
    const handleActionReceive = () => {
        if(selectedInstallmentIds.length !== 1) return; 
        const inst = selectedStudent?.installments.find(i => i.id === selectedInstallmentIds[0]);
        if(inst) {
            if(inst.status === PaymentStatus.PAID) return;
            const calc = calculateFinancials(inst, selectedStudent?.earlyPaymentDiscount);
            setPaymentData({
                installmentId: inst.id,
                originalAmount: inst.originalAmount,
                fineInterest: calc.fine + calc.interest,
                discount: calc.discount,
                finalAmount: calc.total,
                paymentDate: new Date().toISOString().split('T')[0],
                paymentMethod: 'Pix',
                observation: inst.observation || ''
            });
            setPaymentModalOpen(true);
        }
    };

    const handleConfirmPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        const details = `[Desc: R$ ${paymentData.discount.toFixed(2)} | Juros: R$ ${paymentData.fineInterest.toFixed(2)}]`;
        const finalObs = paymentData.observation ? `${paymentData.observation} ${details}` : details;
        onTogglePayment(selectedStudent.id, paymentData.installmentId, paymentData.finalAmount, paymentData.paymentDate, paymentData.paymentMethod, finalObs);
        setPaymentModalOpen(false);
    };

    const updatePaymentCalculations = (field: string, value: number) => {
        let newData = { ...paymentData };
        if (field === 'fineInterest') { newData.fineInterest = value; newData.finalAmount = newData.originalAmount + value - newData.discount; } 
        else if (field === 'discount') { newData.discount = value; newData.finalAmount = newData.originalAmount + newData.fineInterest - value; } 
        else if (field === 'originalAmount') { newData.originalAmount = value; newData.finalAmount = value + newData.fineInterest - newData.discount; } 
        else if (field === 'finalAmount') { newData.finalAmount = value; const impliedDiscount = newData.originalAmount + newData.fineInterest - value; newData.discount = parseFloat(impliedDiscount.toFixed(2)); }
        setPaymentData(newData);
    };

    // --- INSTALLMENT MANAGEMENT (EDIT/DELETE/INSERT) ---
    
    const handleSaveInstallment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        
        let updatedInstallments = [...selectedStudent.installments];
        
        if (editingInstallmentId) {
            updatedInstallments = updatedInstallments.map(i => i.id === editingInstallmentId ? { ...i, ...installmentForm } as Installment : i);
        } else {
            const newInstallment: Installment = {
                id: Math.random().toString(36).substr(2, 9),
                status: PaymentStatus.PENDING,
                amount: Number(installmentForm.amount),
                originalAmount: Number(installmentForm.amount),
                dueDate: installmentForm.dueDate || new Date().toISOString().split('T')[0],
                history: installmentForm.history || (selectedFinancialCourse ? `${selectedFinancialCourse} - Avulso` : 'Parcela Avulsa'),
                documentNumber: installmentForm.documentNumber || '0000',
                bonus: 0
            };
            updatedInstallments.push(newInstallment);
        }

        const updatedStudent = { ...selectedStudent, installments: updatedInstallments };
        onUpdateStudent(updatedStudent);
        setInstallmentModalOpen(false);
        setEditingInstallmentId(null);
        setInstallmentForm({ amount: 0, originalAmount: 0, dueDate: '', history: '', documentNumber: '' });
    };

    const handleDeleteInstallmentClick = () => {
         if (selectedInstallmentIds.length === 0) return;
         if (!selectedStudent) return;
         
         if (confirm(`Tem certeza que deseja excluir ${selectedInstallmentIds.length} parcela(s)?`)) {
             const updatedInstallments = selectedStudent.installments.filter(i => !selectedInstallmentIds.includes(i.id));
             const updatedStudent = { ...selectedStudent, installments: updatedInstallments };
             onUpdateStudent(updatedStudent);
             setSelectedInstallmentIds([]);
         }
    };

    // --- NEW FUNCTIONALITIES: CARD & RECURRING ---
    
    const handleToggleRecurring = () => {
        if (!selectedStudent) return;
        const newValue = !selectedStudent.isRecurring;
        onUpdateStudent({ ...selectedStudent, isRecurring: newValue });
    };

    const handleOpenCardModal = () => {
         if (selectedInstallmentIds.length === 0) return; 
         const hasPaid = selectedStudent?.installments.some(i => selectedInstallmentIds.includes(i.id) && i.status === PaymentStatus.PAID);
         if (hasPaid) return; 
         
         setCardInstallments(1);
         setCardModalOpen(true);
    };

    const handleConfirmCardPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        const updatedInstallments = selectedStudent.installments.map(i => {
            if (selectedInstallmentIds.includes(i.id)) {
                 const obs = i.observation ? `${i.observation} | Pago no Cartão (${cardInstallments}x)` : `Pago no Cartão (${cardInstallments}x)`;
                 return {
                     ...i,
                     status: PaymentStatus.PAID,
                     amount: i.originalAmount, 
                     paidDate: new Date().toISOString().split('T')[0],
                     paymentMethod: PaymentMethod.CREDIT_CARD,
                     observation: obs
                 };
            }
            return i;
        });

        onUpdateStudent({ ...selectedStudent, installments: updatedInstallments });
        setCardModalOpen(false);
        setSelectedInstallmentIds([]);
    };

    // --- PERSONAL DATA HANDLERS ---
    const handleSavePersonalData = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        onUpdateStudent({ ...selectedStudent, ...personalForm });
        setIsEditingPersonal(false);
    };

    useEffect(() => {
        if (selectedStudent && detailTab === 'personal') {
            setPersonalForm(selectedStudent);
        }
    }, [selectedStudent, detailTab]);

    // --- PRINTING (BRANDED) ---
    const handlePrintCarnet = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) { alert("Pop-up bloqueado."); return; }
        
        const companyName = school?.companyInfo?.name || "ESCOLA";
        const bankInfo = school?.bankInfo;
        const pixInfo = bankInfo?.pixKey ? `<br/>Pix: ${bankInfo.pixKey}` : '';

        // If filtering by course, only print visible installments
        const listToPrint = filteredInstallments.length > 0 ? filteredInstallments : selectedStudent.installments;

        const installmentsHtml = listToPrint.map((inst) => `
            <div style="margin-bottom:10px; border:1px solid #ccc; padding:10px; font-family: monospace;">
                <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #ccc; padding-bottom:5px; margin-bottom:5px;">
                     <span><strong>${companyName}</strong>${pixInfo}</span>
                     <span>Vencimento: <strong>${new Date(inst.dueDate).toLocaleDateString('pt-BR')}</strong></span>
                </div>
                <strong>Parcela ${inst.documentNumber || 'N/A'}</strong> - Valor: R$ ${inst.originalAmount.toFixed(2)}<br/>
                Histórico: ${inst.history || 'Mensalidade'}
            </div>`).join('');
        
        printWindow.document.write(`<html><body style="font-family:sans-serif; padding: 20px;"><h2>Carnê - ${selectedStudent.fullName}</h2>${installmentsHtml}<script>setTimeout(() => { window.print(); }, 800);</script></body></html>`);
        printWindow.document.close();
    };

    const handlePrintReceipt = () => {
         if(selectedInstallmentIds.length === 0) return;
         const installmentsToPrint = selectedStudent?.installments.filter(i => selectedInstallmentIds.includes(i.id) && i.status === PaymentStatus.PAID) || [];
         if(installmentsToPrint.length === 0) { alert('Selecione parcelas pagas.'); return; }

         const printWindow = window.open('', '_blank');
         if (!printWindow) return;

         const company = school?.companyInfo || { name: "ESCOLA", cnpj: "", address: "", phone: "" };
         const receiptsHtml = installmentsToPrint.map(inst => `
             <div style="border: 2px solid #000; padding: 20px; margin-bottom: 30px;">
                <h1 style="text-align:center; margin: 0 0 10px 0; font-size: 18px;">RECIBO DE PAGAMENTO</h1>
                <p style="margin: 5px 0;"><strong>EMPRESA:</strong> ${company.name} | <strong>CNPJ:</strong> ${company.cnpj}</p>
                <hr/>
                <p>Recebemos de <strong>${selectedStudent?.fullName}</strong> a importância de <strong>R$ ${inst.amount.toFixed(2)}</strong>.</p>
                <p>Referente a: ${inst.history}</p>
                <p>Data do Pagamento: ${new Date(inst.paidDate!).toLocaleDateString('pt-BR')}</p>
                <br/><p style="text-align:center">___________________________________________<br/>Assinatura</p>
             </div>`).join('');
         printWindow.document.write(`<html><body style="font-family:sans-serif; padding: 20px; max-width: 700px; margin: 0 auto;">${receiptsHtml}<script>setTimeout(() => { window.print(); }, 1000);</script></body></html>`);
         printWindow.document.close();
    };

    const handlePrintBoleto = () => {
        if(selectedInstallmentIds.length === 0) return;
        const installmentsToPrint = selectedStudent?.installments.filter(i => selectedInstallmentIds.includes(i.id)) || [];
        if(installmentsToPrint.length === 0) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        
        const company = school?.companyInfo || { name: "ESCOLA", cnpj: "", address: "" };
        const bank = school?.bankInfo || { bankName: "BANCO EMISSOR", agency: "0000", accountNumber: "00000-0" };

        const boletosHtml = installmentsToPrint.map(inst => `
            <div class="boleto" style="page-break-after: always;"><div class="header"><div class="bank-logo">001-9</div><div class="line-digit">00190.50095 40144.816069 06809.350314 3 373700000${(inst.amount * 100).toString().padStart(5,'0')}</div></div>
                <div class="row"><div class="col" style="flex:4"><div class="label">Local de Pagamento</div><div class="value">PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO</div></div><div class="col" style="flex:1"><div class="label">Vencimento</div><div class="value">${new Date(inst.dueDate).toLocaleDateString('pt-BR')}</div></div></div>
                <div class="row"><div class="col" style="flex:4"><div class="label">Beneficiário</div><div class="value">${company.name} - CNPJ: ${company.cnpj}</div></div><div class="col" style="flex:1"><div class="label">Agência/Código</div><div class="value">${bank.agency} / ${bank.accountNumber}</div></div></div>
                <div class="row"><div class="col"><div class="label">Data Doc</div><div class="value">${new Date().toLocaleDateString('pt-BR')}</div></div><div class="col"><div class="label">Número Doc</div><div class="value">${inst.documentNumber}</div></div><div class="col"><div class="label">Espécie</div><div class="value">DM</div></div><div class="col"><div class="label">Aceite</div><div class="value">N</div></div><div class="col"><div class="label">Processamento</div><div class="value">${new Date().toLocaleDateString('pt-BR')}</div></div></div>
                <div class="row"><div class="col" style="flex:4"><div class="label">Instruções</div><div class="value">MULTA DE R$ ${settings.fineAmount.toFixed(2)} APÓS VENCIMENTO.<br/>JUROS DE ${settings.dailyInterestRate}% AO DIA.</div></div><div class="col" style="flex:1"><div class="label">(=) Valor Cobrado</div><div class="value">R$ ${inst.amount.toFixed(2)}</div></div></div>
                <div class="row" style="border-bottom:none;"><div class="col" style="border-right:none;"><div class="label">Pagador</div><div class="value">${selectedStudent?.fullName}<br/>CPF: ${selectedStudent?.cpf}</div></div></div>
            </div><div style="max-width:800px; margin:10px auto 40px; font-family:monospace; font-size:10px; text-align:center;">|| ||||| ||| || |||| || ||||| |||| || ||| |||| ||||| ||| |||| ||||| ||||</div>`).join('<hr style="margin: 40px 0; border: 0;" />');

        printWindow.document.write(`<html><head><style>body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; } .boleto { border: 1px solid #000; width: 100%; max-width: 800px; margin: 0 auto; } .header { display: flex; border-bottom: 1px solid #000; padding: 5px; } .bank-logo { width: 100px; font-weight: bold; font-size: 20px; border-right: 1px solid #000; padding-right: 10px; margin-right: 10px; display:flex; align-items:center; justify-content:center;} .line-digit { font-weight: bold; font-size: 16px; flex: 1; text-align: right; align-self: center; } .row { display: flex; border-bottom: 1px solid #000; } .col { flex: 1; border-right: 1px solid #000; padding: 4px; } .col:last-child { border-right: none; } .label { font-size: 9px; color: #333; margin-bottom: 2px; } .value { font-weight: bold; } @media print { .boleto { page-break-inside: avoid; } }</style></head><body>${boletosHtml}<script>setTimeout(() => { window.print(); }, 1000);</script></body></html>`);
        printWindow.document.close();
    };


    // --- HELPERS ---
    const activeCourses = useMemo(() => {
        if (!selectedStudent) return [];
        const coursesSet = new Set<string>();
        // Add the primary course
        if (selectedStudent.courseClass) coursesSet.add(selectedStudent.courseClass);
        // Extract from History "CourseName - 01/10"
        selectedStudent.installments.forEach(inst => {
            if (inst.history && inst.history.includes('-')) {
                const possibleName = inst.history.split('-')[0].trim();
                if (possibleName.length > 2 && !possibleName.toLowerCase().includes('taxa') && !possibleName.toLowerCase().includes('material')) {
                    coursesSet.add(possibleName);
                }
            }
        });
        return Array.from(coursesSet);
    }, [selectedStudent]);

    // Ensure we reset selection if student changes
    useEffect(() => {
        if (selectedStudent) setSelectedFinancialCourse('');
        setSelectedInstallmentIds([]);
    }, [selectedStudent]);

    const filteredInstallments = useMemo(() => {
        if (!selectedStudent) return [];
        let list = selectedStudent.installments;
        
        // 1. Filter by Course (Main Request)
        if (selectedFinancialCourse) {
            list = list.filter(i => {
                // Heuristic: Check if history starts with the course name or contains it strongly
                // Or if it's the primary course and the installment is 'Mensalidade' without prefix?
                // Assuming "CourseName - XX/XX" format generated by new logic.
                if (!i.history) return false;
                return i.history.toLowerCase().startsWith(selectedFinancialCourse.toLowerCase()) || 
                       (selectedFinancialCourse === selectedStudent.courseClass && i.history.toLowerCase().includes('mensalidade'));
            });
        }

        // 2. Additional Status Filters (Legacy)
        if (receiptFilterStatus === 'Em Aberto') list = list.filter(i => i.status !== PaymentStatus.PAID);
        else if (receiptFilterStatus === 'Quitada') list = list.filter(i => i.status === PaymentStatus.PAID);
        
        return list.sort((a, b) => parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime());
    }, [selectedStudent, receiptFilterStatus, selectedFinancialCourse]);

    const handleSelectInstallment = (id: string) => setSelectedInstallmentIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [id]); // Single select for editing, Multi for delete

    // --- AGGREGATIONS FOR FINANCIAL FOOTER ---
    const financials = useMemo(() => {
        let totalReceived = 0;
        let totalToReceive = 0;
        let totalOverdue = 0;
        let interestFine = 0; 
        
        // Stats for Course Dashboard
        let totalCourseValue = 0;
        let totalInstallmentsCount = filteredInstallments.length;
        let discountValue = selectedStudent?.earlyPaymentDiscount || 0;

        filteredInstallments.forEach(i => {
            if (i.status === PaymentStatus.PAID) {
                totalReceived += i.amount;
            } else {
                totalToReceive += i.originalAmount;
                if (i.status === PaymentStatus.OVERDUE) {
                    totalOverdue += i.originalAmount;
                    const calc = calculateFinancials(i);
                    interestFine += (calc.fine + calc.interest);
                }
            }
            totalCourseValue += i.originalAmount;
        });

        // Determine Monthly Fee (approx)
        const monthlyFee = totalInstallmentsCount > 0 ? (totalCourseValue / totalInstallmentsCount) : 0;

        return { totalReceived, totalToReceive, totalOverdue, interestFine, totalCourseValue, monthlyFee, discountValue };
    }, [filteredInstallments, selectedStudent]);


    // --- RENDER ---
    let filteredStudents = students.filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.cpf.includes(searchTerm) || s.courseClass.toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter !== 'Todos') filteredStudents = filteredStudents.filter(s => s.status === statusFilter);
    const getStatusColor = (status: StudentStatus) => {
        switch (status) {
            case StudentStatus.ACTIVE: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
            case StudentStatus.LATE: return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
            case StudentStatus.DROPOUT: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
            default: return 'bg-slate-700 text-slate-300';
        }
    };
    
    const selectedInstallmentObjs = useMemo(() => 
        selectedStudent?.installments.filter(i => selectedInstallmentIds.includes(i.id)) || [], 
        [selectedStudent, selectedInstallmentIds]
    );

    const hasSelection = selectedInstallmentObjs.length > 0;
    const isSingleSelection = selectedInstallmentObjs.length === 1;
    const hasAnyPaid = hasSelection && selectedInstallmentObjs.some(i => i.status === PaymentStatus.PAID);
    const canReceive = isSingleSelection && !hasAnyPaid; 
    const canPayCard = hasSelection && !hasAnyPaid; 
    const canPrintReceipt = hasSelection && hasAnyPaid; 
    const canEdit = isSingleSelection;

    // --- COURSE-SPECIFIC ACTION HANDLERS ---
    const handleEditInstallmentClick = () => {
        if (!canEdit) return;
        const inst = selectedInstallmentObjs[0];
        setInstallmentForm(inst);
        setEditingInstallmentId(inst.id);
        setInstallmentModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-white">Alunos Matriculados</h2>
                <button onClick={() => { setShowModal(true); setActiveTab('student'); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                    <Plus size={20} /><span>Matricular Aluno</span>
                </button>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" placeholder="Buscar por nome, CPF ou turma..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="w-full md:w-56">
                     <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                        <option value="Todos">Todos os Status</option>
                        {Object.values(StudentStatus).map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/50 text-slate-400 uppercase font-medium"><tr><th className="px-6 py-4">Aluno</th><th className="px-6 py-4">Turma</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Financeiro</th><th className="px-6 py-4 text-right">Ações</th></tr></thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredStudents.map(student => {
                            const isLate = student.installments.some(i => i.status === PaymentStatus.OVERDUE);
                            const actualStatus = isLate && student.status === StudentStatus.ACTIVE ? StudentStatus.LATE : student.status;
                            return (
                                <tr key={student.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4"><div><p className="font-semibold text-white">{student.fullName}</p><div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5"><span>CPF: {student.cpf}</span></div></div></td>
                                    <td className="px-6 py-4"><div className="flex items-center gap-2"><BookOpen size={14} className="text-slate-500" />{student.courseClass}</div></td>
                                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(actualStatus)}`}>{actualStatus}</span></td>
                                    <td className="px-6 py-4"><div className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-200">Total: R$ {student.packageValue?.toLocaleString('pt-BR')}</span>{isLate && <span className="text-[10px] text-red-400 font-bold flex items-center gap-1"><AlertCircle size={10}/> Pendências</span>}</div></td>
                                    <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2">
                                        <button onClick={() => { setSelectedStudentId(student.id); setDetailTab('enrollment'); }} className="p-2 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-600/20 hover:bg-blue-600/20 transition-colors"><User size={18} /></button>
                                        <button onClick={() => { setSelectedStudentId(student.id); setDetailTab('financial'); }} className="p-2 bg-emerald-600/10 text-emerald-400 rounded-lg border border-emerald-600/20 hover:bg-emerald-600/20 transition-colors"><DollarSign size={18} /></button>
                                        {role === UserRole.ADMIN && (<button onClick={(e) => excluirAluno(student.id, e)} className="p-2 bg-red-600/10 text-red-400 rounded-lg border border-red-600/20 hover:bg-red-600/20 transition-colors"><Trash2 size={18} /></button>)}
                                    </div></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* NEW STUDENT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-fade-in overflow-y-auto">
                     <div className="bg-slate-900 rounded-2xl w-full max-w-5xl border border-slate-700 shadow-2xl my-8 flex flex-col max-h-[95vh]">
                        <div className="p-6 border-b border-slate-800"><h3 className="text-xl font-bold text-white">Nova Matrícula</h3></div>
                        <div className="flex px-6 gap-6 border-b border-slate-800 bg-slate-950">
                            <button onClick={() => setActiveTab('student')} className={`py-3 text-sm font-bold border-b-2 ${activeTab === 'student' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent'}`}>1. Dados do Aluno</button>
                            <button onClick={() => setActiveTab('course')} className={`py-3 text-sm font-bold border-b-2 ${activeTab === 'course' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent'}`}>2. Matrícula e Valores</button>
                        </div>

                        <form onSubmit={handleAdd} className="p-6 overflow-y-auto custom-scrollbar flex-1">
                             {activeTab === 'student' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2"><label className="block text-xs text-slate-400 font-bold uppercase mb-1">Nome Completo</label><input required name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" /></div>
                                        <div>
                                            <label className="block text-xs text-slate-400 font-bold uppercase mb-1">CPF {cpfError && <span className="text-red-500 float-right">Inválido</span>}</label>
                                            <input required name="cpf" value={formData.cpf} onChange={handleInputChange} onBlur={handleCpfBlur} className={`w-full bg-slate-950 border rounded p-2 text-white ${cpfError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'}`} placeholder="000.000.000-00" />
                                        </div>
                                        <div><label className="block text-xs text-slate-400 font-bold uppercase mb-1">RG</label><input required name="rg" value={formData.rg} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" /></div>
                                        <div><label className="block text-xs text-slate-400 font-bold uppercase mb-1">Orgão Emissor</label><input name="rgIssuer" value={formData.rgIssuer} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" placeholder="SSP/SP" /></div>
                                        <div><label className="block text-xs text-slate-400 font-bold uppercase mb-1">Data Nascimento</label><input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" /></div>
                                        <div><label className="block text-xs text-slate-400 font-bold uppercase mb-1">Telefone</label><input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" /></div>
                                        <div className="md:col-span-2"><label className="block text-xs text-slate-400 font-bold uppercase mb-1">E-mail</label><input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" /></div>
                                    </div>
                                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                        <h4 className="text-xs font-bold text-slate-300 uppercase mb-3 flex items-center gap-2"><MapPin size={14} /> Endereço</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-3"><label className="block text-xs text-slate-500 font-bold mb-1">Rua / Logradouro</label><input name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" /></div>
                                            <div><label className="block text-xs text-slate-500 font-bold mb-1">Número</label><input name="addressNumber" value={formData.addressNumber} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" /></div>
                                            <div className="md:col-span-2"><label className="block text-xs text-slate-500 font-bold mb-1">Bairro</label><input name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" /></div>
                                            <div className="md:col-span-2"><label className="block text-xs text-slate-500 font-bold mb-1">Cidade</label><input name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" /></div>
                                        </div>
                                    </div>
                                    {isMinor(formData.birthDate) && (
                                        <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/30">
                                            <h4 className="text-xs font-bold text-amber-400 uppercase mb-3 flex items-center gap-2"><Baby size={14} /> Dados do Responsável (Menor de Idade)</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="md:col-span-2"><label className="block text-xs text-slate-400 font-bold mb-1">Nome do Responsável</label><input required name="guardianName" value={formData.guardianName} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" /></div>
                                                <div><label className="block text-xs text-slate-400 font-bold mb-1">CPF Responsável</label><input required name="guardianCpf" value={formData.guardianCpf} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" /></div>
                                                <div><label className="block text-xs text-slate-400 font-bold mb-1">Telefone Responsável</label><input required name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" /></div>
                                            </div>
                                        </div>
                                    )}
                                    <div><label className="block text-xs text-slate-400 font-bold uppercase mb-1">Observações</label><textarea name="observations" value={formData.observations} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white h-20 resize-none" placeholder="Anotações gerais sobre o aluno..." /></div>
                                </div>
                            )}

                            {activeTab === 'course' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-xs text-slate-400 font-bold mb-2 uppercase">Pacote / Curso Base</label>
                                                <select name="courseClass" value={formData.courseClass} onChange={handleInputChange} className="w-full bg-white text-slate-900 border border-slate-400 rounded p-3 text-sm font-bold shadow-sm">
                                                    <option value="">-- SELECIONE O PACOTE --</option>
                                                    {availableOptions.map((opt, idx) => (
                                                        <option key={idx} value={opt.name}>[{opt.type}] {opt.name} - Base: R$ {opt.value.toFixed(2)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                                <h4 className="text-xs font-bold text-slate-300 uppercase mb-4 border-b border-slate-700 pb-2">Personalizar Taxas e Descontos</h4>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs text-slate-500 font-bold mb-1">Taxa Matrícula</label>
                                                        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">R$</span><input type="number" name="registrationFee" value={formData.registrationFee} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 pl-8 text-white text-sm" /></div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-slate-500 font-bold mb-1">Taxa Material</label>
                                                        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">R$</span><input type="number" name="materialFee" value={formData.materialFee} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 pl-8 text-white text-sm" /></div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-emerald-500 font-bold mb-1">Desc. Pontualidade</label>
                                                        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs">R$</span><input type="number" name="earlyPaymentDiscount" value={formData.earlyPaymentDiscount} onChange={handleInputChange} className="w-full bg-slate-900 border border-emerald-500/30 rounded p-2 pl-8 text-emerald-400 text-sm font-bold" /></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">Detalhes da Turma</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><label className="block text-xs text-slate-500 font-bold mb-1">Tipo</label><select name="classType" value={formData.classType} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs"><option>Interativa</option><option>Turma</option><option>VIP</option></select></div>
                                                    <div><label className="block text-xs text-slate-500 font-bold mb-1">Horas/Semana</label><input type="number" name="hoursPerWeek" value={formData.hoursPerWeek} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs" /></div>
                                                </div>
                                                <input name="batch" value={formData.batch} onChange={handleInputChange} placeholder="Nome da Turma (Opcional)" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs mt-2" />
                                            </div>
                                        </div>
                                        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col h-full">
                                            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Calculator size={16} className="text-emerald-500"/> Calculadora de Mensalidade</h4>
                                            <div className="space-y-4 flex-1">
                                                <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Valor Base (Pacote)</span><span className="text-white font-medium">R$ {formData.packageValue.toFixed(2)}</span></div>
                                                <div className="bg-slate-900 p-3 rounded border border-slate-800">
                                                    <label className="block text-xs text-slate-500 font-bold mb-2 uppercase">Aplicar Desconto</label>
                                                    <div className="flex gap-3">
                                                        <div className="flex-1 relative"><input type="number" name="discountPercent" value={formData.discountPercent} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2 pr-8 text-white text-right" placeholder="0" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">%</span></div>
                                                        <div className="flex-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">R$</span><input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2 pl-8 text-white text-right" placeholder="0.00" /></div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-800"><span className="text-slate-300">Valor Líquido (Curso)</span><span className="text-emerald-400 font-bold">R$ {(formData.packageValue - formData.discountValue).toFixed(2)}</span></div>
                                                <div className="grid grid-cols-2 gap-3 pt-2">
                                                    <div><label className="block text-xs text-slate-500 font-bold mb-1">Parcelas</label><input type="number" min="1" name="installmentsCount" value={formData.installmentsCount} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-center text-white font-bold" /></div>
                                                    <div><label className="block text-xs text-slate-500 font-bold mb-1">Dia Venc.</label><input type="number" min="1" max="31" name="dueDay" value={formData.dueDay} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-center text-white" /></div>
                                                </div>
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-slate-800">
                                                <div className="flex justify-between items-end mb-1"><span className="text-sm text-slate-400">Valor da Mensalidade</span><span className="text-2xl font-bold text-white">R$ {formData.installmentsCount > 0 ? ((formData.packageValue - formData.discountValue) / formData.installmentsCount).toFixed(2) : '0.00'}</span></div>
                                                {formData.earlyPaymentDiscount > 0 && (<div className="flex justify-between items-center bg-emerald-500/10 p-2 rounded mt-2 border border-emerald-500/20"><span className="text-xs text-emerald-400 font-medium">Pagando em dia (Desc. R$ {formData.earlyPaymentDiscount})</span><span className="text-lg font-bold text-emerald-400">R$ {Math.max(0, ((formData.packageValue - formData.discountValue) / formData.installmentsCount) - formData.earlyPaymentDiscount).toFixed(2)}</span></div>)}
                                                <div className="text-xs text-slate-500 text-right mt-2">+ Matrícula R$ {formData.registrationFee.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/20">Confirmar Matrícula</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DETAILED STUDENT MODAL */}
            {selectedStudentId && selectedStudent && (
                 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-slate-900 w-full max-w-6xl h-[90vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    {selectedStudent.fullName}
                                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(selectedStudent.status)}`}>{selectedStudent.status}</span>
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Matrícula: {selectedStudent.contractNumber || 'N/A'} | Turma: {selectedStudent.courseClass}</p>
                            </div>
                            <button onClick={() => setSelectedStudentId(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-800 bg-slate-900">
                             <button onClick={() => setDetailTab('enrollment')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${detailTab === 'enrollment' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}>Matrícula / Cursos</button>
                             <button onClick={() => setDetailTab('financial')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${detailTab === 'financial' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}>Financeiro</button>
                             <button onClick={() => setDetailTab('personal')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${detailTab === 'personal' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-white'}`}>Dados do Aluno</button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
                            {detailTab === 'personal' && (
                                <div className="max-w-4xl mx-auto space-y-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-white">Dados Pessoais</h3>
                                        <div className="flex gap-2">
                                            {!isEditingPersonal ? (
                                                <button onClick={() => setIsEditingPersonal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                                                    <Edit2 size={16} /> Editar
                                                </button>
                                            ) : (
                                                 <button onClick={handleSavePersonalData} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                                                    <Save size={16} /> Salvar
                                                </button>
                                            )}
                                            <button onClick={() => excluirAluno(selectedStudent.id)} className="bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                                                <Trash2 size={16} /> Excluir Aluno
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4 bg-slate-950 p-6 rounded-xl border border-slate-800">
                                            <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-2">
                                                <UserCheck size={18} /> <span className="text-xs font-bold uppercase">Identificação</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2"><label className="block text-xs text-slate-500 font-bold mb-1">Nome Completo</label>
                                                <input disabled={!isEditingPersonal} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm disabled:opacity-60" value={isEditingPersonal ? personalForm.fullName : selectedStudent.fullName} onChange={e => setPersonalForm({...personalForm, fullName: e.target.value})} /></div>
                                                
                                                <div><label className="block text-xs text-slate-500 font-bold mb-1">CPF</label>
                                                <input disabled={!isEditingPersonal} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm disabled:opacity-60" value={isEditingPersonal ? personalForm.cpf : selectedStudent.cpf} onChange={e => setPersonalForm({...personalForm, cpf: e.target.value})} /></div>
                                                
                                                <div><label className="block text-xs text-slate-500 font-bold mb-1">Data Nascimento</label>
                                                <input type="date" disabled={!isEditingPersonal} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm disabled:opacity-60" value={isEditingPersonal ? personalForm.birthDate : selectedStudent.birthDate} onChange={e => setPersonalForm({...personalForm, birthDate: e.target.value})} /></div>
                                                
                                                <div><label className="block text-xs text-slate-500 font-bold mb-1">RG</label>
                                                <input disabled={!isEditingPersonal} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm disabled:opacity-60" value={isEditingPersonal ? personalForm.rg : selectedStudent.rg} onChange={e => setPersonalForm({...personalForm, rg: e.target.value})} /></div>
                                                <div><label className="block text-xs text-slate-500 font-bold mb-1">Orgão Emissor</label>
                                                <input disabled={!isEditingPersonal} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm disabled:opacity-60" value={isEditingPersonal ? personalForm.rgIssuer : (selectedStudent.rgIssuer || '')} onChange={e => setPersonalForm({...personalForm, rgIssuer: e.target.value})} /></div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 bg-slate-950 p-6 rounded-xl border border-slate-800">
                                            <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-2">
                                                <MapPin size={18} /> <span className="text-xs font-bold uppercase">Endereço e Contato</span>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="col-span-2"><label className="block text-xs text-slate-500 font-bold mb-1">Endereço</label>
                                                    <input disabled={!isEditingPersonal} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm disabled:opacity-60" value={isEditingPersonal ? personalForm.address : selectedStudent.address} onChange={e => setPersonalForm({...personalForm, address: e.target.value})} /></div>
                                                    <div><label className="block text-xs text-slate-500 font-bold mb-1">Número</label>
                                                    <input disabled={!isEditingPersonal} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm disabled:opacity-60" value={isEditingPersonal ? personalForm.addressNumber : selectedStudent.addressNumber} onChange={e => setPersonalForm({...personalForm, addressNumber: e.target.value})} /></div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><label className="block text-xs text-slate-500 font-bold mb-1">Bairro</label>
                                                    <input disabled={!isEditingPersonal} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm disabled:opacity-60" value={isEditingPersonal ? personalForm.neighborhood : (selectedStudent.neighborhood || '')} onChange={e => setPersonalForm({...personalForm, neighborhood: e.target.value})} /></div>
                                                    <div><label className="block text-xs text-slate-500 font-bold mb-1">Cidade</label>
                                                    <input disabled={!isEditingPersonal} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm disabled:opacity-60" value={isEditingPersonal ? personalForm.city : selectedStudent.city} onChange={e => setPersonalForm({...personalForm, city: e.target.value})} /></div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                     <div><label className="block text-xs text-slate-500 font-bold mb-1">Telefone</label>
                                                    <input disabled={!isEditingPersonal} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm disabled:opacity-60" value={isEditingPersonal ? personalForm.phone : selectedStudent.phone} onChange={e => setPersonalForm({...personalForm, phone: e.target.value})} /></div>
                                                    <div><label className="block text-xs text-slate-500 font-bold mb-1">Email</label>
                                                    <input disabled={!isEditingPersonal} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm disabled:opacity-60" value={isEditingPersonal ? personalForm.email : selectedStudent.email} onChange={e => setPersonalForm({...personalForm, email: e.target.value})} /></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 bg-slate-950 p-6 rounded-xl border border-slate-800">
                                             <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-2"><FileText size={18} /> <span className="text-xs font-bold uppercase">Observações</span></div>
                                            <textarea disabled={!isEditingPersonal} rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm disabled:opacity-60 resize-none" value={isEditingPersonal ? personalForm.observations : selectedStudent.observations} onChange={e => setPersonalForm({...personalForm, observations: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {detailTab === 'enrollment' && (
                                <div className="max-w-4xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center text-center">
                                            <BookOpen size={32} className="text-blue-500 mb-4" />
                                            <h3 className="text-lg font-bold text-white">{selectedStudent.courseClass}</h3>
                                            <p className="text-slate-400 text-sm">Curso Atual</p>
                                            <span className="mt-2 bg-blue-600/20 text-blue-400 px-3 py-1 rounded text-xs">{selectedStudent.classType}</span>
                                        </div>
                                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center text-center">
                                            <Calendar size={32} className="text-emerald-500 mb-4" />
                                            <h3 className="text-lg font-bold text-white">{new Date(selectedStudent.enrollmentDate).toLocaleDateString('pt-BR')}</h3>
                                            <p className="text-slate-400 text-sm">Data de Matrícula</p>
                                        </div>
                                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center text-center">
                                            <DollarSign size={32} className="text-amber-500 mb-4" />
                                            <h3 className="text-lg font-bold text-white">R$ {selectedStudent.packageValue?.toLocaleString('pt-BR')}</h3>
                                            <p className="text-slate-400 text-sm">Valor do Contrato</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 justify-center">
                                        <button onClick={handleGenerateContract} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors border border-slate-600">
                                            <FileSignature size={20} /> Imprimir Contrato
                                        </button>
                                        <button onClick={handleOpenEnrollmentModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                                            <RefreshCw size={20} /> Gerenciamento de Matrícula
                                        </button>
                                        {selectedStudent.status === StudentStatus.ACTIVE && (
                                            <button onClick={handleCancelCourse} className="bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                                                <Ban size={20} /> Cancelar Curso
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {detailTab === 'financial' && (
                                <div>
                                    {/* COURSE SELECTOR HEADER */}
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex-1 w-full">
                                            <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Selecionar Curso/Pacote</label>
                                            <div className="relative">
                                                <select 
                                                    value={selectedFinancialCourse} 
                                                    onChange={(e) => setSelectedFinancialCourse(e.target.value)} 
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white appearance-none focus:ring-2 focus:ring-blue-500 font-semibold"
                                                >
                                                    <option value="">-- Selecione para ver o financeiro --</option>
                                                    {activeCourses.map((c, idx) => (
                                                        <option key={idx} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                        
                                        {selectedFinancialCourse && (
                                            <div className="flex gap-4 items-center">
                                                 <div className="text-right">
                                                     <p className="text-[10px] text-slate-500 uppercase font-bold">Status do Curso</p>
                                                     {financials.totalOverdue > 0 ? (
                                                         <span className="text-red-400 font-bold text-sm flex items-center gap-1 justify-end"><AlertCircle size={12}/> Pendente</span>
                                                     ) : financials.totalToReceive > 0 ? (
                                                         <span className="text-blue-400 font-bold text-sm flex items-center gap-1 justify-end"><Clock size={12}/> Em Andamento</span>
                                                     ) : (
                                                         <span className="text-emerald-400 font-bold text-sm flex items-center gap-1 justify-end"><CheckCircle size={12}/> Quitado</span>
                                                     )}
                                                 </div>
                                            </div>
                                        )}
                                    </div>

                                    {!selectedFinancialCourse ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-800/50 rounded-xl border border-slate-800 border-dashed">
                                            <Wallet size={48} className="mb-4 opacity-20" />
                                            <p className="text-lg font-medium">Selecione um curso acima para gerenciar o financeiro.</p>
                                            <p className="text-sm">Cada curso possui sua gestão financeira independente.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* COURSE DASHBOARD */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                                                    <div className="absolute right-2 top-2 opacity-10"><DollarSign size={40} /></div>
                                                    <p className="text-xs text-slate-500 uppercase font-bold">Valor Total</p>
                                                    <p className="text-xl font-bold text-white">R$ {financials.totalCourseValue.toFixed(2)}</p>
                                                </div>
                                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                                                    <div className="absolute right-2 top-2 opacity-10"><CalendarDays size={40} /></div>
                                                    <p className="text-xs text-slate-500 uppercase font-bold">Mensalidade (Base)</p>
                                                    <p className="text-xl font-bold text-white">R$ {financials.monthlyFee.toFixed(2)}</p>
                                                </div>
                                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                                                     <div className="absolute right-2 top-2 opacity-10"><Percent size={40} /></div>
                                                    <p className="text-xs text-emerald-500 uppercase font-bold">C/ Desconto</p>
                                                    <p className="text-xl font-bold text-emerald-400">R$ {(financials.monthlyFee - financials.discountValue).toFixed(2)}</p>
                                                </div>
                                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                                                    <div className="absolute right-2 top-2 opacity-10"><Layers size={40} /></div>
                                                    <p className="text-xs text-slate-500 uppercase font-bold">Parcelas</p>
                                                    <p className="text-xl font-bold text-white">{filteredInstallments.length}</p>
                                                </div>
                                            </div>

                                            {/* ACTIONS TOOLBAR */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <button 
                                                    onClick={handleActionReceive} 
                                                    disabled={!canReceive}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${canReceive ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
                                                >
                                                    <DollarSign size={18} /> Receber Mensalidade
                                                </button>
                                                
                                                <button 
                                                    onClick={handleEditInstallmentClick}
                                                    disabled={!canEdit}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${canEdit ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
                                                >
                                                    <Edit2 size={18} /> Editar Mensalidade
                                                </button>

                                                <div className="h-8 w-px bg-slate-700 mx-2 self-center hidden md:block"></div>

                                                <button onClick={handlePrintCarnet} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 hover:bg-slate-700 transition-colors font-medium">
                                                    <Printer size={18} /> Gerar Carnê
                                                </button>

                                                <button onClick={handlePrintReceipt} disabled={!canPrintReceipt} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors ${canPrintReceipt ? 'bg-slate-800 text-white border-slate-600 hover:bg-slate-700' : 'bg-slate-900 text-slate-700 border-slate-800 cursor-not-allowed'}`}>
                                                    <Receipt size={18} /> Gerar Comprovante
                                                </button>

                                                <button onClick={() => setInstallmentModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-blue-400 border border-blue-900 hover:bg-blue-900/20 transition-colors font-medium ml-auto">
                                                    <SettingsIcon size={18} /> Editar Parcelas
                                                </button>
                                            </div>

                                            {/* Installments List */}
                                            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                                                <table className="w-full text-left text-sm text-slate-300">
                                                    <thead className="bg-slate-950 text-slate-400">
                                                        <tr>
                                                            <th className="p-4 w-10"><div className="w-4 h-4 border border-slate-600 rounded bg-slate-900"></div></th>
                                                            <th className="p-4">Vencimento</th>
                                                            <th className="p-4">Histórico</th>
                                                            <th className="p-4 text-right">Valor Original</th>
                                                            <th className="p-4 text-right">Valor Atual</th>
                                                            <th className="p-4 text-center">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-700">
                                                        {filteredInstallments.map(inst => {
                                                            const isSelected = selectedInstallmentIds.includes(inst.id);
                                                            const calc = calculateFinancials(inst, selectedStudent.earlyPaymentDiscount);
                                                            return (
                                                                <tr key={inst.id} className={`hover:bg-slate-700/40 transition-colors cursor-pointer ${isSelected ? 'bg-blue-900/10' : ''}`} onClick={() => handleSelectInstallment(inst.id)}>
                                                                    <td className="p-4">
                                                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-slate-900'}`}>
                                                                            {isSelected && <CheckCircle size={12} className="text-white" />}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-4 font-medium text-white">{new Date(inst.dueDate).toLocaleDateString('pt-BR')}</td>
                                                                    <td className="p-4">
                                                                        {inst.history}
                                                                        {inst.observation && <span className="block text-xs text-slate-500 italic mt-1">{inst.observation}</span>}
                                                                    </td>
                                                                    <td className="p-4 text-right text-slate-500 decoration-slate-600">R$ {inst.originalAmount.toFixed(2)}</td>
                                                                    <td className="p-4 text-right font-bold text-white">R$ {inst.amount.toFixed(2)}</td>
                                                                    <td className="p-4 text-center">
                                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                                            inst.status === PaymentStatus.PAID ? 'bg-green-500/20 text-green-400' :
                                                                            inst.status === PaymentStatus.OVERDUE ? 'bg-red-500/20 text-red-400' :
                                                                            'bg-blue-500/20 text-blue-400'
                                                                        }`}>
                                                                            {inst.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                        {filteredInstallments.length === 0 && (
                                                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nenhuma parcela encontrada para este curso.</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Footer Summary */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                                    <p className="text-xs text-slate-500 uppercase font-bold">Total Recebido</p>
                                                    <p className="text-xl font-bold text-green-400">R$ {financials.totalReceived.toFixed(2)}</p>
                                                </div>
                                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                                    <p className="text-xs text-slate-500 uppercase font-bold">A Receber</p>
                                                    <p className="text-xl font-bold text-blue-400">R$ {financials.totalToReceive.toFixed(2)}</p>
                                                </div>
                                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                                    <p className="text-xs text-slate-500 uppercase font-bold">Em Atraso</p>
                                                    <p className="text-xl font-bold text-red-400">R$ {financials.totalOverdue.toFixed(2)}</p>
                                                </div>
                                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                                    <p className="text-xs text-slate-500 uppercase font-bold">Juros/Multa Est.</p>
                                                    <p className="text-xl font-bold text-amber-400">R$ {financials.interestFine.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                 </div>
             )}

             {/* Other Modals - ensure they are rendered */}
             {paymentModalOpen && (
                 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 animate-fade-in">
                    <div className="bg-slate-900 p-6 rounded-xl max-w-md w-full border border-slate-700 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">Confirmar Recebimento</h3>
                        <form onSubmit={handleConfirmPayment} className="space-y-3">
                             <div><label className="text-xs text-slate-400 font-bold">Valor Original</label><input disabled value={paymentData.originalAmount} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" /></div>
                             <div className="grid grid-cols-2 gap-3">
                                 <div><label className="text-xs text-slate-400 font-bold">Multa/Juros</label><input type="number" step="0.01" value={paymentData.fineInterest} onChange={e => updatePaymentCalculations('fineInterest', Number(e.target.value))} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white" /></div>
                                 <div><label className="text-xs text-slate-400 font-bold">Desconto</label><input type="number" step="0.01" value={paymentData.discount} onChange={e => updatePaymentCalculations('discount', Number(e.target.value))} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white" /></div>
                             </div>
                             <div><label className="text-xs text-emerald-400 font-bold">Valor Final (Recebido)</label><input type="number" step="0.01" value={paymentData.finalAmount} onChange={e => updatePaymentCalculations('finalAmount', Number(e.target.value))} className="w-full bg-slate-800 border border-emerald-500 rounded p-2 text-white font-bold text-lg" /></div>
                             <div><label className="text-xs text-slate-400 font-bold">Data Pagamento</label><input type="date" value={paymentData.paymentDate} onChange={e => setPaymentData({...paymentData, paymentDate: e.target.value})} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white" /></div>
                             <div><label className="text-xs text-slate-400 font-bold">Forma Pagamento</label><select value={paymentData.paymentMethod} onChange={e => setPaymentData({...paymentData, paymentMethod: e.target.value})} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white"><option>Pix</option><option>Dinheiro</option><option>Transferência</option></select></div>
                             <div><label className="text-xs text-slate-400 font-bold">Obs</label><input value={paymentData.observation} onChange={e => setPaymentData({...paymentData, observation: e.target.value})} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white" /></div>
                             <div className="flex justify-end gap-2 mt-4">
                                 <button type="button" onClick={() => setPaymentModalOpen(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                                 <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold">Confirmar</button>
                             </div>
                        </form>
                    </div>
                 </div>
             )}

             {cardModalOpen && (
                 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 animate-fade-in">
                    <div className="bg-slate-900 p-6 rounded-xl max-w-sm w-full border border-slate-700 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CardIcon /> Parcelamento Cartão</h3>
                        <form onSubmit={handleConfirmCardPayment} className="space-y-4">
                            <p className="text-sm text-slate-300">Serão quitadas <strong>{selectedInstallmentIds.length} parcelas</strong> selecionadas.</p>
                            <div>
                                <label className="text-xs text-slate-400 font-bold block mb-1">Número de Vezes (Maquininha)</label>
                                <select value={cardInstallments} onChange={e => setCardInstallments(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white">
                                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n}x</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                 <button type="button" onClick={() => setCardModalOpen(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                                 <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold">Registrar</button>
                            </div>
                        </form>
                    </div>
                 </div>
             )}
             
             {installmentModalOpen && (
                 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 animate-fade-in">
                    <div className="bg-slate-900 p-6 rounded-xl max-w-md w-full border border-slate-700 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">{editingInstallmentId ? 'Editar Parcela' : 'Adicionar Parcela Avulsa'}</h3>
                        <form onSubmit={handleSaveInstallment} className="space-y-3">
                            <div><label className="text-xs text-slate-400 font-bold">Histórico/Descrição</label><input value={installmentForm.history} onChange={e => setInstallmentForm({...installmentForm, history: e.target.value})} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs text-slate-400 font-bold">Vencimento</label><input type="date" value={installmentForm.dueDate} onChange={e => setInstallmentForm({...installmentForm, dueDate: e.target.value})} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white" /></div>
                                <div><label className="text-xs text-slate-400 font-bold">Valor (R$)</label><input type="number" step="0.01" value={installmentForm.amount} onChange={e => setInstallmentForm({...installmentForm, amount: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white" /></div>
                            </div>
                            <div><label className="text-xs text-slate-400 font-bold">Nº Documento</label><input value={installmentForm.documentNumber} onChange={e => setInstallmentForm({...installmentForm, documentNumber: e.target.value})} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white" /></div>
                             <div className="flex justify-end gap-2 mt-4">
                                 <button type="button" onClick={() => setInstallmentModalOpen(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                                 <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-bold">Salvar</button>
                            </div>
                        </form>
                    </div>
                 </div>
             )}

             {enrollmentActionModalOpen && (
                 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 animate-fade-in">
                    <div className="bg-slate-900 p-6 rounded-xl max-w-3xl w-full border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4">Gerenciamento de Matrícula</h3>
                        
                        <div className="flex gap-4 mb-6">
                             <button type="button" onClick={() => setEnrollmentMode('replace')} className={`text-sm font-bold pb-2 transition-colors ${enrollmentMode === 'replace' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>Editar Atual</button>
                             <button type="button" onClick={() => setEnrollmentMode('add')} className={`text-sm font-bold pb-2 transition-colors ${enrollmentMode === 'add' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>Adicionar Novo Pacote</button>
                        </div>

                        <form onSubmit={handleSaveEnrollmentAction} className="space-y-6">
                            
                            <div>
                                <label className="block text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">Pacote / Curso Base</label>
                                <select name="courseClass" value={enrollmentForm.courseClass} onChange={handleEnrollmentChange} className="w-full bg-slate-950 border border-slate-600 rounded-lg p-3 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">-- SELECIONE --</option>
                                    {availableOptions.map((opt, idx) => (
                                        <option key={idx} value={opt.name}>[{opt.type}] {opt.name} - R$ {opt.value.toFixed(2)}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                                        <Layers size={16} className="text-blue-500"/> Configuração do Pacote
                                    </h4>
                                    
                                    <div>
                                        <label className="text-xs text-slate-400 font-bold mb-1 block">Valor total do curso (R$)</label>
                                        <input type="number" step="0.01" name="packageValue" value={enrollmentForm.packageValue} onChange={handleEnrollmentChange} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white font-mono text-lg" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold mb-1 block">Qtd. Parcelas</label>
                                            <input type="number" min="1" name="installmentsCount" value={enrollmentForm.installmentsCount} onChange={handleEnrollmentChange} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white text-center font-bold" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold mb-1 block">Mensalidade (R$)</label>
                                            <input type="number" step="0.01" name="customMonthlyFee" value={enrollmentForm.installmentsCount ? (enrollmentForm.packageValue! / enrollmentForm.installmentsCount).toFixed(2) : '0.00'} onChange={handleEnrollmentChange} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white text-right font-mono" />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs text-slate-400 font-bold mb-1 block">Dia de Vencimento</label>
                                        <div className="flex items-center gap-2">
                                             <input type="number" min="1" max="31" name="dueDay" value={enrollmentForm.dueDay} onChange={handleEnrollmentChange} className="w-20 bg-slate-950 border border-slate-600 rounded p-2 text-white text-center" />
                                            <span className="text-xs text-slate-500">de todo mês</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                                        <Percent size={16} className="text-emerald-500"/> Desconto de Pontualidade
                                    </h4>

                                    <div>
                                        <label className="text-xs text-slate-400 font-bold mb-1 block">Pagar até (Data Limite)</label>
                                        <input type="date" name="firstDueDate" value={enrollmentForm.firstDueDate || ''} onChange={handleEnrollmentChange} className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white" />
                                        <p className="text-[10px] text-slate-500 mt-1">Define o primeiro vencimento. Os próximos seguem o dia.</p>
                                    </div>

                                    <div className="bg-emerald-900/10 p-4 rounded-lg border border-emerald-900/30 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs text-emerald-400 font-bold">% de Desconto</label>
                                            <div className="relative w-24">
                                                <input type="number" step="0.01" name="discountPercent" value={enrollmentForm.discountPercent} onChange={handleEnrollmentChange} className="w-full bg-slate-900 border border-emerald-500/30 rounded p-1 text-right text-emerald-400 text-sm pr-6" />
                                                <span className="absolute right-2 top-1.5 text-xs text-emerald-600">%</span>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="text-xs text-emerald-400 font-bold mb-1 block">Valor com desconto (pagamento em dia)</label>
                                            <input type="number" step="0.01" name="customDiscountedValue" value={((enrollmentForm.packageValue! / (enrollmentForm.installmentsCount || 1)) - (enrollmentForm.earlyPaymentDiscount || 0)).toFixed(2)} onChange={handleEnrollmentChange} className="w-full bg-slate-900 border border-emerald-500 rounded p-2 text-emerald-400 font-bold text-lg text-right" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
                                <div className="text-center md:text-left">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Valor Mensalidade</p>
                                    <p className="text-xl font-bold text-white">R$ {(enrollmentForm.packageValue! / (enrollmentForm.installmentsCount || 1)).toFixed(2)}</p>
                                </div>
                                <ArrowRight className="hidden md:block text-slate-600" />
                                <div className="text-center md:text-left">
                                    <p className="text-xs text-emerald-500 uppercase font-bold mb-1">Com Desconto</p>
                                    <p className="text-2xl font-bold text-emerald-400">R$ {((enrollmentForm.packageValue! / (enrollmentForm.installmentsCount || 1)) - (enrollmentForm.earlyPaymentDiscount || 0)).toFixed(2)}</p>
                                </div>
                                <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
                                    <p className="text-[10px] text-slate-400 uppercase">Economia Mensal</p>
                                    <p className="text-sm font-bold text-emerald-400">R$ {enrollmentForm.earlyPaymentDiscount?.toFixed(2)}</p>
                                </div>
                                <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
                                    <p className="text-[10px] text-slate-400 uppercase">1º Vencimento</p>
                                    <p className="text-sm font-bold text-white">{enrollmentForm.firstDueDate ? new Date(enrollmentForm.firstDueDate).toLocaleDateString('pt-BR') : '--/--/----'}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                 <button type="button" onClick={() => setEnrollmentActionModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                                 <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/20">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                 </div>
             )}
        </div>
    );
};
