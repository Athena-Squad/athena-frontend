import { supabase } from './supabase-client.js';

// Função para a tela "Base de Alunos"
export async function buscarTodosOsAlunos() {
    const { data, error } = await supabase.from('perfis').select('*').eq('tipo', 'ALUNO');
    if (error) throw error;
    return data;
}

// Função para a tela "Painel do Aluno"
export async function buscarFichaAtiva(alunoId) {
    const { data, error } = await supabase.from('fichas').select('*, exercicios(*)').eq('aluno_id', alunoId);
    if (error) throw error;
    return data;
}