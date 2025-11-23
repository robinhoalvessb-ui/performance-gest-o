import { GoogleGenAI } from "@google/genai";
import { Student, Expense } from '../types';

// Initialize Gemini client
// Ensure API key is provided in environment variables
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeFinancials = async (students: Student[], expenses: Expense[]) => {
    if (!apiKey) {
        return "Erro: Chave da API Gemini não configurada.";
    }

    // Aggregate data for the prompt
    let totalRevenue = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    let totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    students.forEach(student => {
        student.installments.forEach(inst => {
            if (inst.status === 'Pago') totalRevenue += inst.amount;
            if (inst.status === 'Pendente') totalPending += inst.amount;
            if (inst.status === 'Vencido') totalOverdue += inst.amount;
        });
    });

    const dataSummary = {
        totalRecebido: totalRevenue,
        totalDespesas: totalExpenses,
        lucroLiquido: totalRevenue - totalExpenses,
        totalAReceber: totalPending,
        inadimplencia: totalOverdue,
        numAlunos: students.length,
        numDespesas: expenses.length
    };

    const prompt = `
    Atue como um consultor financeiro sênior para uma escola preparatória de concursos chamada "Performance Gestão".
    Analise os seguintes dados financeiros do mês/período atual:
    ${JSON.stringify(dataSummary, null, 2)}

    Por favor, forneça:
    1. Um resumo executivo da saúde financeira.
    2. Três recomendações estratégicas focadas em aumentar o lucro ou reduzir inadimplência.
    3. Uma análise breve sobre a relação Receita vs Despesa.
    
    Use formatação Markdown. Seja profissional, direto e encorajador. Responda em Português do Brasil.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini analysis failed:", error);
        return "Não foi possível gerar a análise inteligente no momento. Verifique sua conexão ou chave de API.";
    }
};