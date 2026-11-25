import { supabase } from './supabase-client.js';

// ==========================================
// MÓDULO: AUTENTICA��O E SESS�O
// ==========================================
export async function obterUsuarioAtual() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
        return null;
    }
    
    return session.user; // Retorna os dados do utilizador logado no Auth
}

export async function obterPerfilLogado() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) return null;

  const { data: perfil, error: perfilError } = await supabase
    .from('perfis')
    .select('id, auth_id, nome_completo, tipo_perfil')
    .eq('auth_id', session.user.id)
    .maybeSingle();

  if (perfilError) throw perfilError;

  if (!perfil) {
    await supabase.auth.signOut();
    throw new Error('Perfil n�o encontrado na base de dados. Verifique se a conta foi provisionada corretamente.');
  }

  return { user: session.user, perfil };
}

export async function fazerLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : '/index.html';
}

export async function fazerLogin(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (error) throw error;
    return data;
}

export async function cadastrarAluno({ nomeCompleto, email, senha, objetivo }) {
    // 1. Cria o usuário no Auth (Trigger cria automaticamente o registro em public.perfis)
const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password: senha,
  options: {
    data: {
      nome_completo: nomeCompleto,
      tipo_perfil: 'aluno'
    }
  }
});

if (authError) throw authError;
if (!authData.session) {
  throw new Error('Confirme seu e-mail antes de continuar ou desative a confirma��o de e-mail no Supabase.');
}

// 2. Busca o ID real da tabela public.perfis vinculado ao auth_id recém-criado
const { data: perfilCriado, error: perfilError } = await supabase
  .from('perfis')
  .select('id')
  .eq('auth_id', authData.user.id)
  .single();

if (perfilError || !perfilCriado) {
  throw new Error('N�o foi possível localizar o perfil criado pela trigger.');
}

// 3. Insere em public.alunos usando perfilCriado.id (que bate com a policy RLS)
const { error: alunoError } = await supabase
  .from('alunos')
  .insert([{
    perfil_id: perfilCriado.id,
    tipo_perfil: 'aluno',
    professor_id: null,
    objetivo: objetivo || null
  }]);

if (alunoError) throw alunoError;

return authData.user;

}

// ==========================================
// MÓDULO: PROFESSORES & ALUNOS
// ==========================================
export async function buscarAlunosDoProfessor(professorId) {
    const { data, error } = await supabase
        .from('alunos')
        .select('perfil_id, objetivo, perfis (nome_completo)')
        .eq('professor_id', professorId);
        
    if (error) {
      console.error('Falha em buscarAlunosDoProfessor', { professorId, message: error.message, code: error.code, details: error.details, hint: error.hint, error });
      throw error;
    }

  return data ?? [];
}

export async function cadastrarProfessor({ email, senha, nomeCompleto, cref }) {
    // 1. Cria o registo no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: senha,
    });

    if (authError) throw authError;

    // Declara��o explícita do ID do utilizador criado
    const userId = authData.user?.id;

    if (!userId) {
        throw new Error("N�o foi possível obter o ID do utilizador autenticado.");
    }

    // 2. Cria o Perfil base na tabela 'perfis'
    const { error: perfilError } = await supabase
        .from('perfis')
        .insert([{
            id: userId,
            auth_id: userId,
            nome_completo: nomeCompleto,
            tipo_perfil: 'professor'
        }]);

    if (perfilError) throw perfilError;

    // 3. Cria a especializa��o na tabela 'professores'
    const { error: profError } = await supabase
        .from('professores')
        .insert([{
            perfil_id: userId,
            cref: cref
        }]);

    if (profError) throw profError;

    return authData.user;
}

// ==========================================
// MÓDULO: FICHAS DE TREINO
// ==========================================
export async function buscarFichas(professorId) {
    const { data, error } = await supabase
        .from('fichas_treino')
        .select(`
            id, titulo, ativa, criado_em,
            alunos ( perfis (nome_completo) )
        `)
        .eq('professor_id', professorId);

    if (error) {
        console.error("Erro ao buscar fichas:", error.message);
        return [];
    }
    return data;
}
