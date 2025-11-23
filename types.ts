
export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN', // Dono do sistema (Legacy)
    ADMIN = 'ADMIN', // Diretor da escola
    COORDINATOR = 'COORDINATOR' // Coordenador
}

export enum SystemRole {
  MASTER_ADMIN = "MASTER_ADMIN",
  SCHOOL_ADMIN = "SCHOOL_ADMIN",
  COORDENATOR = "COORDENATOR",
}

export enum StudentStatus {
    ACTIVE = 'Ativo',
    LATE = 'Em Atraso',
    DROPOUT = 'Desistente',
    BREACH = 'Quebra de Contrato',
    COMPLETED = 'Quitado'
}

export enum PaymentMethod {
    PIX = 'Pix',
    CREDIT_CARD = 'Cartão de Crédito',
    CASH = 'Dinheiro'
}

export enum PaymentStatus {
    PAID = 'Pago',
    PENDING = 'Pendente',
    OVERDUE = 'Vencido'
}

export interface Installment {
    id: string;
    documentNumber?: string; // "Documento"
    history?: string; // "Histórico" e.g., "01/12 Mensalidade"
    dueDate: string; // ISO Date YYYY-MM-DD
    amount: number; // Current total amount (Base + Penalty - Discount)
    originalAmount: number; // Base amount
    bonus?: number; // "Bônus"
    penaltyAmount?: number; // Fixed fine
    interestAmount?: number; // Calculated interest
    discountApplied?: number; // Discount for early payment
    status: PaymentStatus;
    paidDate?: string;
    daysLate?: number;
    studentName?: string; // Helper for flattened lists
    studentClass?: string; // Helper for flattened lists
    studentId?: string; // Helper for flattened lists
    observation?: string; // "Ocorrência"
    paymentMethod?: string; // Meio de pagamento da parcela específica
}

export interface Student {
    id: string;
    fullName: string;
    rg: string;
    rgIssuer?: string; // New: Orgão Emissor
    cpf: string;
    birthDate: string;
    
    // Guardian Info (for minors)
    guardianName?: string;
    guardianCpf?: string;
    guardianPhone?: string;

    phone: string;
    email: string;
    
    // Address Details
    address: string; // Street
    addressNumber: string;
    neighborhood?: string; // New: Bairro
    city: string;

    enrollmentDate: string;
    courseClass: string; // Turma
    status: StudentStatus;
    observations?: string;
    
    // Financials & Contract
    contractNumber?: string; // New: Nº Contrato
    totalValue: number; // Valor Total do Contrato (Pacote + Material + Taxa)
    earlyPaymentDiscount?: number; // Desconto Pontualidade (R$)
    installments: Installment[];
    paymentMethod: PaymentMethod;

    // New Fields (Detailed Enrollment)
    classType?: 'Interativa' | 'Turma' | 'Presencial' | 'EAD';
    hoursPerWeek?: number;
    registrationFee?: number; // Taxa de Matrícula
    packageValue?: number; // Valor do Pacote (Curso)
    packageBonus?: number; // Bônus do Pacote
    
    materialFee?: number; // Valor do Material
    materialInstallments?: number; // Parcelas do Material
    materialBonus?: number; // Bônus do Material
    isMaterialIncluded?: boolean; // Material Incluso?
    
    isScholarship?: boolean; // Bolsa?
    agreement?: string; // Convênio
    discountPercent?: number;
    discountValue?: number;
    
    // Staff / Sales Info
    attendant?: string; // Atendente
    seller?: string; // Vendedor
    knowledgeSource?: string; // Forma de Conhecimento
    promotion?: string; // Promoção/Divulgação
    referrer?: string; // Quem indicou
    paymentPlan?: string; // Plano de Pagamento
    batch?: string; // Turma especifica
    
    isRecurring?: boolean; // Pagamento Recorrente
    endDate?: string; // Previsão de Término
    isSigned?: boolean; // Assinatura Eletrônica
}

export interface Expense {
    id: string;
    description: string;
    category: 'Professores' | 'Infraestrutura' | 'Marketing' | 'Outros';
    amount: number;
    date: string;
    beneficiary: string; // New
    paymentMethod: string; // New
    notes?: string; // New
    proofUrl?: string; // Simulated URL
}

export interface User {
    id: string;
    name: string;
    username: string; // Login username
    password?: string; // For mock purposes only
    role: UserRole | SystemRole;
}

export interface FinancialConfig {
    fineAmount: number; // Multa fixa (R$)
    dailyInterestRate: number; // Juros ao dia (%)
    gracePeriodDays: number; // Dias de carência
}

// --- NEW INTERFACES FOR SETTINGS ---

export interface CompanyInfo {
    name: string;
    cnpj: string;
    address: string;
    phone: string;
    email: string;
    logoUrl?: string;
    openingHours?: string;
}

export interface BankInfo {
    bankName: string;
    accountType: 'Pix' | 'Conta Corrente' | 'Poupança';
    pixKey: string;
    agency: string;
    accountNumber: string;
    holderName: string;
}

export interface Course {
    id: string;
    name: string;
    totalValue: number;
    installments: number; // Default installments
    duration: string; // e.g., "60 horas"
    modality: 'Presencial' | 'Online' | 'Híbrido';
    category: string;
    description?: string;
    isActive: boolean;
    
    // Defaults for Enrollment
    registrationFee?: number;
    materialFee?: number;
    defaultBonus?: number;
    hoursPerWeek?: number;
}

export interface EducationPackage {
    id: string;
    name: string;
    includedCourseIds: string[]; // IDs of courses in this package
    totalValue: number;
    promotionalValue?: number;
    installments: number;
    validity?: string; // e.g., "12 meses"
    
    // Defaults
    registrationFee?: number;
    materialFee?: number;
    contractTemplate?: string; // HTML Template for the contract
}

export interface School {
    id: string; // 4 digits, e.g. "1023"
    name: string;
    users: User[];
    students: Student[];
    expenses: Expense[];
    settings: FinancialConfig;
    
    // New fields for Settings Tab
    companyInfo?: CompanyInfo;
    bankInfo?: BankInfo;
    courses?: Course[];
    packages?: EducationPackage[];
}