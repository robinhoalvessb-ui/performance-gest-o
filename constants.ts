import { Student, StudentStatus, PaymentMethod, PaymentStatus, UserRole, Expense, FinancialConfig, School, User, SystemRole } from './types';

export const DEFAULT_SETTINGS: FinancialConfig = {
    fineAmount: 10.00, // R$ 10.00 fixo
    dailyInterestRate: 0.33, // ~1% ao mês (approx 0.033 ao dia)
    gracePeriodDays: 3
};

// Legacy Super Admin (Optional - keeping for backward compat if needed, but Master Admin replaces it)
export const SUPER_ADMIN_USER: User = {
    id: 'super-1',
    name: 'Administrador Geral',
    username: 'admin',
    password: 'admin', 
    role: UserRole.SUPER_ADMIN
};

export const MASTER_ADMIN: User = {
    id: 'master-001',
    name: 'Master Administrator',
    username: "rober.adm",
    password: "735750", // Em produção usar hash/env
    role: SystemRole.MASTER_ADMIN
};

const SAMPLE_STUDENTS: Student[] = [
    {
        id: 's1',
        fullName: 'Carlos Eduardo Silva',
        rg: '1234567',
        cpf: '111.222.333-44',
        birthDate: '1995-05-12',
        phone: '(11) 99999-8888',
        email: 'carlos@email.com',
        address: 'Rua das Flores',
        addressNumber: '123',
        city: 'São Paulo',
        enrollmentDate: '2024-01-15',
        courseClass: 'Delta 2024',
        status: StudentStatus.ACTIVE,
        totalValue: 2400,
        packageValue: 2400,
        registrationFee: 0,
        materialFee: 0,
        classType: 'Turma',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        isRecurring: true,
        contractNumber: '2024-001464',
        endDate: '2024-12-15',
        isSigned: true,
        installments: [
            { 
                id: 'i1', 
                documentNumber: '1001',
                history: '01/12 Mensalidade',
                dueDate: '2024-02-15', 
                amount: 200, 
                originalAmount: 200, 
                bonus: 0,
                status: PaymentStatus.PAID, 
                paidDate: '2024-02-14',
                observation: 'Pago com desconto pontualidade'
            },
            { 
                id: 'i2', 
                documentNumber: '1002',
                history: '02/12 Mensalidade',
                dueDate: '2024-03-15', 
                amount: 200, 
                originalAmount: 200, 
                bonus: 0,
                status: PaymentStatus.PAID, 
                paidDate: '2024-03-15' 
            },
            { 
                id: 'i3', 
                documentNumber: '1003',
                history: '03/12 Mensalidade',
                dueDate: '2024-04-15', 
                amount: 200, 
                originalAmount: 200, 
                bonus: 0,
                status: PaymentStatus.PENDING 
            },
        ]
    },
    {
        id: 's2',
        fullName: 'Ana Beatriz Souza',
        rg: '7654321',
        cpf: '555.444.333-22',
        birthDate: '1998-10-20',
        phone: '(21) 98888-7777',
        email: 'ana@email.com',
        address: 'Av. Central',
        addressNumber: '500',
        city: 'Rio de Janeiro',
        enrollmentDate: '2024-02-01',
        courseClass: 'Alfa 2024',
        status: StudentStatus.LATE,
        totalValue: 3000,
        packageValue: 3000,
        registrationFee: 0,
        classType: 'Interativa',
        paymentMethod: PaymentMethod.PIX,
        contractNumber: '2024-002050',
        isSigned: false,
        installments: [
            { 
                id: 'i4', 
                documentNumber: '2001',
                history: '01/10 Curso',
                dueDate: '2024-03-01', 
                amount: 300, 
                originalAmount: 300, 
                status: PaymentStatus.PAID, 
                paidDate: '2024-03-01' 
            },
            { 
                id: 'i5', 
                documentNumber: '2002',
                history: '02/10 Curso',
                dueDate: '2024-04-01', 
                amount: 300, 
                originalAmount: 300, 
                status: PaymentStatus.OVERDUE 
            },
            { 
                id: 'i6', 
                documentNumber: '2003',
                history: '03/10 Curso',
                dueDate: '2024-05-01', 
                amount: 300, 
                originalAmount: 300, 
                status: PaymentStatus.PENDING 
            },
        ]
    }
];

const SAMPLE_EXPENSES: Expense[] = [
    { id: 'e1', description: 'Pagamento Prof. Matemática', category: 'Professores', amount: 1500, date: '2024-03-05', beneficiary: 'Prof. Ricardo', paymentMethod: 'Pix', notes: 'Aulas extras' },
    { id: 'e2', description: 'Conta de Luz', category: 'Infraestrutura', amount: 450, date: '2024-03-10', beneficiary: 'Enel SP', paymentMethod: 'Boleto' },
    { id: 'e3', description: 'Campanha Instagram', category: 'Marketing', amount: 300, date: '2024-03-15', beneficiary: 'Meta Ads', paymentMethod: 'Cartão de Crédito' },
];

const DEFAULT_SCHOOL_FIELDS = {
    companyInfo: { name: '', cnpj: '', address: '', phone: '', email: '' },
    bankInfo: { bankName: '', accountType: 'Pix' as any, pixKey: '', agency: '', accountNumber: '', holderName: '' },
    courses: [],
    packages: []
};

export const INITIAL_SCHOOLS: School[] = [
    {
        id: '3550',
        name: 'Performance Sede',
        settings: DEFAULT_SETTINGS,
        students: SAMPLE_STUDENTS,
        expenses: SAMPLE_EXPENSES,
        users: [
            { id: 'u-master-local', name: 'Rober Admin Local', username: 'rober.adm', password: '123', role: UserRole.ADMIN }
        ],
        ...DEFAULT_SCHOOL_FIELDS
    },
    {
        id: '1023',
        name: 'Escola Modelo - Centro',
        settings: DEFAULT_SETTINGS,
        students: [],
        expenses: [],
        users: [
            { id: 'u1', name: 'Diretor Admin', username: 'diretor.modelo', password: '123', role: UserRole.ADMIN },
            { id: 'u2', name: 'Coord. João', username: 'coord.joao', password: '123', role: UserRole.COORDINATOR }
        ],
        ...DEFAULT_SCHOOL_FIELDS
    },
    {
        id: '2050',
        name: 'Instituto Avançado - Zona Sul',
        settings: DEFAULT_SETTINGS,
        students: [],
        expenses: [],
        users: [
            { id: 'u3', name: 'Diretora Maria', username: 'diretora.maria', password: '123', role: UserRole.ADMIN }
        ],
        ...DEFAULT_SCHOOL_FIELDS
    }
];