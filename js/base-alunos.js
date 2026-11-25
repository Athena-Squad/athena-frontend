import { supabase } from './supabase-client.js';

const $ = (selector, root = document) => root.querySelector(selector);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const initials = (name) => String(name || '').trim().split(/\s+/).filter(Boolean).map((part, i, parts) => i === 0 || i === parts.length - 1 ? part[0] : '').join('').toLocaleUpperCase('pt-BR') || '??';
const state = { perfil: null, alunos: [], fichas: [], exercicios: [], execucoes: [], modalAluno: null };

function ensureModal() {
  let host = $('#athena-modal-host');
  if (!host) { host = document.createElement('div'); host.id = 'athena-modal-host'; document.body.append(host); }
  return host;
}
function modal(title, body, onSubmit) {
  const host = ensureModal();
  host.innerHTML = `<div class="athena-backdrop"><section class="athena-modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header><h2>${esc(title)}</h2><button type="button" class="athena-close" aria-label="Fechar">×</button></header><div class="athena-modal-body">${body}</div></section></div>`;
  const close = () => { host.replaceChildren(); };
  $('.athena-close', host).addEventListener('click', close);
  $('.athena-backdrop', host).addEventListener('click', (event) => { if (event.target.classList.contains('athena-backdrop')) close(); });
  $('.athena-modal', host).addEventListener('submit', async (event) => {
    if (!event.target.matches('form')) return;
    event.preventDefault();
    const submit = event.target.querySelector('[type=submit]');
    if (submit) { submit.disabled = true; submit.textContent = 'Salvando…'; }
    try { await onSubmit(event.target, close); }
    catch (error) { console.error('Falha ao salvar:', error); alert(error.message || 'N�o foi possível salvar.'); if (submit) { submit.disabled = false; submit.textContent = 'Salvar'; } }
  });
  document.addEventListener('keydown', function escape(event) { if (event.key === 'Escape') { close(); document.removeEventListener('keydown', escape); } }, { once: true });
  return host;
}

function fichaAtiva(alunoId) { return state.fichas.find((ficha) => ficha.aluno_id === alunoId && ficha.ativa) || null; }
function exerciciosFicha(fichaId) { return state.exercicios.filter((item) => item.ficha_id === fichaId).sort((a, b) => a.ordem - b.ordem); }
function renderAlunos() {
  const query = ($('#q-alunos')?.value || '').trim().toLocaleLowerCase('pt-BR');
  const filter = $('#f-plano-a')?.value || '';
  const tbody = $('#alunos');
  const rows = state.alunos.filter((aluno) => {
    const name = aluno.perfis?.nome_completo || '';
    const matches = `${name} ${aluno.objetivo || ''}`.toLocaleLowerCase('pt-BR').includes(query);
    const active = Boolean(fichaAtiva(aluno.perfil_id));
    return matches && (!filter || (filter === 'com' ? active : !active));
  });
  if (!rows.length) { tbody.innerHTML = '<tr class="empty"><td colspan="6">Nenhum aluno encontrado.</td></tr>'; return; }
  tbody.innerHTML = rows.map((aluno) => {
    const name = aluno.perfis?.nome_completo || 'Sem nome';
    const ficha = fichaAtiva(aluno.perfil_id);
    const exercises = ficha ? exerciciosFicha(ficha.id) : [];
    const done = ficha ? new Set(state.execucoes.filter((row) => row.aluno_id === aluno.perfil_id && row.ficha_id === ficha.id).map((row) => row.exercicio_id)).size : 0;
    const progress = exercises.length ? Math.min(100, Math.round(done / exercises.length * 100)) : 0;
    return `<tr data-student="${esc(aluno.perfil_id)}"><td><div class="who"><span class="avatar">${esc(initials(name))}</span><div><b>${esc(name)}</b><small>${esc(aluno.objetivo || 'Aluno')}</small></div></div></td><td>${esc(aluno.objetivo || 'N�o definido')}</td><td>${esc(ficha?.titulo || 'Sem ficha')}</td><td><span class="pill ok">Ativo</span></td><td><div class="pc"><span>${progress}%</span><div class="track" role="img" aria-label="Progresso ${progress}%"><span style="width:${progress}%"></span></div></div></td><td><div class="acts"><button class="ib" type="button" data-action="view" aria-label="Ver aluno" title="Visualizar">${icon('i-eye')}</button><button class="ib" type="button" data-action="edit" aria-label="Editar objetivo" title="Editar">${icon('i-pencil')}</button><button class="ib" type="button" data-action="more" aria-label="Mais ações" title="Mais ações">${icon('i-more')}</button></div></td></tr>`;
  }).join('');
}
function icon(id) { return `<svg class="i"><use href="#${id}"></use></svg>`; }
function renderFichas() {
  const query = ($('#q-fichas')?.value || '').trim().toLocaleLowerCase('pt-BR');
  const status = $('#f-plano-f')?.value || '';
  const studentFilter = $('#f-aluno-f')?.value || '';
  const items = state.fichas.filter((ficha) => {
    const student = state.alunos.find((aluno) => aluno.perfil_id === ficha.aluno_id);
    const hay = `${ficha.titulo} ${student?.perfis?.nome_completo || ''}`.toLocaleLowerCase('pt-BR');
    return hay.includes(query) && (!status || (status === 'ativa' ? ficha.ativa : !ficha.ativa)) && (!studentFilter || ficha.aluno_id === studentFilter);
  });
  $('#fichas').innerHTML = items.length ? items.map((ficha) => {
    const student = state.alunos.find((aluno) => aluno.perfil_id === ficha.aluno_id);
    const n = exerciciosFicha(ficha.id).length;
    return `<li><article class="ficha"><span class="f-ic">${icon('i-dumbbell')}</span><span><span class="f-title">${esc(ficha.titulo)}</span><span class="f-meta" style="display:block">${esc(student?.perfis?.nome_completo || 'Aluno')} · ${n} ${n === 1 ? 'exercício' : 'exercícios'}</span></span><span class="pill ${ficha.ativa ? 'ok' : ''}">${ficha.ativa ? 'Ativa' : 'Inativa'}</span></article></li>`;
  }).join('') : '<li class="none">Nenhuma ficha encontrada.</li>';
  const studentSelect = $('#f-aluno-f');
  if (studentSelect) {
    const previous = studentSelect.value;
    studentSelect.innerHTML = '<option value="">Todos os alunos</option>' + state.alunos.map((aluno) => `<option value="${esc(aluno.perfil_id)}">${esc(aluno.perfis?.nome_completo || 'Aluno')}</option>`).join('');
    studentSelect.value = previous;
  }
}
function renderKpis() {
  const active = state.fichas.filter((ficha) => ficha.ativa).length;
  const pending = state.alunos.filter((aluno) => !fichaAtiva(aluno.perfil_id)).length;
  const growth = Math.min(100, Math.round(state.alunos.length / 20 * 100));
  const nums = document.querySelectorAll('.stats .stat .v');
  if (nums[0]) nums[0].textContent = state.alunos.length;
  if (nums[1]) nums[1].textContent = active;
  if (nums[2]) nums[2].textContent = pending;
  if (nums[3]) nums[3].textContent = `${growth}%`;
  const track = document.querySelector('.stats .stat .track');
  if (track) { track.setAttribute('aria-label', `${growth}% da meta`); const bar = track.querySelector('span'); if (bar) bar.style.width = `${growth}%`; }
}
async function loadData() {
  const { data: alunos, error: alunosError } = await supabase.from('alunos').select('perfil_id, objetivo, perfis (nome_completo)').eq('professor_id', state.perfil.id);
  if (alunosError) throw alunosError;
  state.alunos = alunos || [];
  const { data: fichas, error: fichasError } = await supabase.from('fichas_treino').select('id, aluno_id, professor_id, titulo, ativa, criado_em').eq('professor_id', state.perfil.id).order('criado_em', { ascending: false });
  if (fichasError) throw fichasError;
  state.fichas = fichas || [];
  const fichaIds = state.fichas.map((row) => row.id);
  state.exercicios = [];
  state.execucoes = [];
  if (fichaIds.length) {
    const { data, error } = await supabase.from('exercicios').select('id, ficha_id, nome, series, repeticoes, ordem, tempo_descanso_seg, carga_sugerida').in('ficha_id', fichaIds);
    if (error) throw error;
    state.exercicios = data || [];
    const ids = state.alunos.map((row) => row.perfil_id);
    if (ids.length) {
      const { data: history, error: historyError } = await supabase.from('historico_execucoes').select('id, aluno_id, ficha_id, exercicio_id, nome_exercicio, data_execucao, feedback_fadiga').in('aluno_id', ids).in('ficha_id', fichaIds);
      if (historyError) throw historyError;
      state.execucoes = history || [];
    }
  }
  renderKpis(); renderAlunos(); renderFichas(); renderGlobalSearch();
}
function showView(aluno) {
  const ficha = fichaAtiva(aluno.perfil_id);
  const exercises = ficha ? exerciciosFicha(ficha.id) : [];
  modal('Detalhes do aluno', `<p><b>Nome:</b> ${esc(aluno.perfis?.nome_completo || 'Sem nome')}</p><p><b>Objetivo:</b> ${esc(aluno.objetivo || 'N�o definido')}</p><p><b>Ficha ativa:</b> ${esc(ficha?.titulo || 'Sem ficha')}</p><h3>Exercícios</h3>${exercises.length ? `<ul>${exercises.map((item) => `<li>${esc(item.nome)} — ${esc(item.series)} séries × ${esc(item.repeticoes)} reps · ${esc(item.carga_sugerida ?? '—')} kg · descanso ${esc(item.tempo_descanso_seg ?? '—')} s</li>`).join('')}</ul>` : '<p>Esta ficha n�o possui exercícios.</p>'}`, () => {});
}
function showEdit(aluno) {
  modal('Editar objetivo', `<form><label>Objetivo<input name="objetivo" maxlength="180" value="${esc(aluno.objetivo || '')}" placeholder="Ex.: condicionamento físico"></label><button class="btn" type="submit">Salvar</button></form>`, async (form, close) => {
    const objetivo = form.elements.objetivo.value.trim() || null;
    const { error } = await supabase.from('alunos').update({ objetivo }).eq('perfil_id', aluno.perfil_id);
    if (error) throw error;
    close(); await loadData();
  });
}
function showMore(aluno, button) {
  document.querySelector('.student-actions-popover')?.remove();
  const pop = document.createElement('div'); pop.className = 'student-actions-popover';
  pop.innerHTML = '<button type="button" data-do="new">Nova ficha para este aluno</button><button type="button" data-do="unlink">Desvincular aluno</button>';
  button.closest('.acts').append(pop);
  pop.addEventListener('click', async (event) => {
    const action = event.target.closest('button')?.dataset.do;
    pop.remove();
    if (action === 'new') openNewFicha(aluno.perfil_id);
    if (action === 'unlink' && confirm(`Desvincular ${aluno.perfis?.nome_completo || 'este aluno'}?`)) {
      const { error } = await supabase.from('alunos').update({ professor_id: null }).eq('perfil_id', aluno.perfil_id);
      if (error) { console.error('Falha ao desvincular aluno:', error); alert(error.message); return; }
      await loadData();
    }
  });
}
function openAddStudent() {
  const run = async () => {
    const { data, error } = await supabase.from('alunos').select('perfil_id, objetivo, perfis (nome_completo)').is('professor_id', null);
    if (error) { console.error('Falha ao buscar alunos disponíveis:', error); alert(error.message); return; }
    const list = data || [];
    const host = modal('Adicionar aluno', `<p>Escolha um aluno que ainda n�o está vinculado.</p>${list.length ? `<ul class="athena-candidate-list">${list.map((aluno) => `<li><span>${esc(aluno.perfis?.nome_completo || 'Sem nome')}</span><button class="btn" type="button" data-link="${esc(aluno.perfil_id)}">Vincular</button></li>`).join('')}</ul>` : '<p>Nenhum aluno disponível no momento.</p>'}<button type="button" class="btn-out" data-copy-signup>Copiar link de cadastro</button>` , () => {});
    host.addEventListener('click', async (event) => {
      const link = event.target.closest('[data-link]');
      if (link) {
        const { error: updateError } = await supabase.from('alunos').update({ professor_id: state.perfil.id }).eq('perfil_id', link.dataset.link);
        if (updateError) { console.error('Falha ao vincular aluno:', updateError); alert(updateError.message); return; }
        host.replaceChildren(); await loadData();
      }
      if (event.target.closest('[data-copy-signup]')) {
        const url = new URL('../cadastro.html', location.href).href;
        try { await navigator.clipboard.writeText(url); alert('Link de cadastro copiado.'); } catch { prompt('Copie o link de cadastro:', url); }
      }
    });
  };
  run();
}
function openNewFicha(selectedId = '') {
  const options = state.alunos.map((aluno) => `<option value="${esc(aluno.perfil_id)}" ${aluno.perfil_id === selectedId ? 'selected' : ''}>${esc(aluno.perfis?.nome_completo || 'Aluno')}</option>`).join('');
  const host = modal('Nova ficha', `<form id="new-workout-form"><label>Aluno<select name="aluno_id" required>${options}</select></label><label>Título da ficha<input name="titulo" required maxlength="100" placeholder="Ex.: Hipertrofia A/B"></label><label class="athena-check"><input type="checkbox" name="ativa" checked> Ficha ativa</label><h3>Exercícios</h3><div class="exercise-rows"></div><button type="button" class="btn-out" data-add-exercise>+ Adicionar exercício</button><button class="btn" type="submit">Salvar</button></form>`, async (form, close) => {
    const exercises = [...form.querySelectorAll('.exercise-row')].map((row) => ({ nome: row.querySelector('[name=nome]').value.trim(), series: Number(row.querySelector('[name=series]').value), repeticoes: row.querySelector('[name=repeticoes]').value.trim(), carga_sugerida: row.querySelector('[name=carga_sugerida]').value === '' ? null : Number(row.querySelector('[name=carga_sugerida]').value), tempo_descanso_seg: Number(row.querySelector('[name=tempo_descanso_seg]').value), ordem: Number(row.dataset.order) })).filter((row) => row.nome);
    const { data: ficha, error } = await supabase.from('fichas_treino').insert({ aluno_id: form.elements.aluno_id.value, professor_id: state.perfil.id, titulo: form.elements.titulo.value.trim(), ativa: form.elements.ativa.checked }).select('id').single();
    if (error) throw error;
    if (exercises.length) { const { error: exerciseError } = await supabase.from('exercicios').insert(exercises.map((row) => ({ ...row, ficha_id: ficha.id }))); if (exerciseError) throw exerciseError; }
    close(); await loadData();
  });
  const rows = $('.exercise-rows', host);
  const addRow = () => {
    const row = document.createElement('fieldset'); row.className = 'exercise-row'; row.dataset.order = String(rows.children.length + 1);
    row.innerHTML = `<legend>Exercício ${rows.children.length + 1}</legend><label>Nome<input name="nome" required></label><label>Séries<input name="series" type="number" min="1" value="3" required></label><label>Repetições<input name="repeticoes" value="10" required></label><label>Carga sugerida (kg)<input name="carga_sugerida" type="number" min="0" step="0.5"></label><label>Descanso (segundos)<input name="tempo_descanso_seg" type="number" min="0" value="60" required></label><button type="button" class="btn-out" data-remove-exercise>Remover</button>`;
    rows.append(row);
  };
  host.addEventListener('click', (event) => {
    if (event.target.closest('[data-add-exercise]')) addRow();
    if (event.target.closest('[data-remove-exercise]')) { event.target.closest('.exercise-row').remove(); [...rows.children].forEach((row, i) => { row.dataset.order = String(i + 1); row.querySelector('legend').textContent = `Exercício ${i + 1}`; }); }
  });
  addRow();
}
let globalTimer;
function renderGlobalSearch() {
  const input = $('#busca-geral');
  if (!input) return;
  let results = $('.global-search-results');
  if (!results) { results = document.createElement('div'); results.className = 'global-search-results'; input.closest('.search').append(results); }
  const query = input.value.trim().toLocaleLowerCase('pt-BR');
  if (!query) { results.hidden = true; return; }
  const hits = [];
  state.alunos.forEach((aluno) => { if (`${aluno.perfis?.nome_completo || ''} ${aluno.objetivo || ''}`.toLocaleLowerCase('pt-BR').includes(query)) hits.push({ type: 'Aluno', label: aluno.perfis?.nome_completo || 'Aluno', id: aluno.perfil_id }); });
  state.fichas.forEach((ficha) => { const name = state.alunos.find((a) => a.perfil_id === ficha.aluno_id)?.perfis?.nome_completo || ''; if (`${ficha.titulo} ${name}`.toLocaleLowerCase('pt-BR').includes(query)) hits.push({ type: 'Ficha', label: `${ficha.titulo} · ${name}`, id: ficha.id }); });
  state.exercicios.forEach((exercise) => { if (exercise.nome.toLocaleLowerCase('pt-BR').includes(query)) hits.push({ type: 'Exercício', label: exercise.nome, id: exercise.ficha_id }); });
  results.innerHTML = hits.length ? hits.slice(0, 12).map((hit) => `<button type="button" data-type="${hit.type}" data-id="${esc(hit.id)}"><small>${hit.type}</small>${esc(hit.label)}</button>`).join('') : '<p>Nenhum resultado encontrado.</p>';
  results.hidden = false;
}
function attachGlobalSearch() {
  const input = $('#busca-geral'); if (!input) return;
  input.addEventListener('input', () => { clearTimeout(globalTimer); globalTimer = setTimeout(renderGlobalSearch, 250); });
  input.closest('.search').addEventListener('click', (event) => {
    const hit = event.target.closest('[data-type]'); if (!hit) return;
    const type = hit.dataset.type;
    if (type === 'Aluno') { const row = $(`[data-student="${CSS.escape(hit.dataset.id)}"]`); row?.scrollIntoView({ behavior: 'smooth', block: 'center' }); row?.classList.add('search-highlight'); }
    if (type === 'Ficha') { $('#q-fichas').value = state.fichas.find((f) => f.id === hit.dataset.id)?.titulo || ''; renderFichas(); $('#fichas').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    if (type === 'Exercício') { const ficha = state.fichas.find((f) => f.id === hit.dataset.id); $('#q-fichas').value = ficha?.titulo || ''; renderFichas(); $('#fichas').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    $('.global-search-results').hidden = true;
  });
}

$('#alunos').addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]'); if (!button) return;
  const aluno = state.alunos.find((row) => row.perfil_id === button.closest('tr').dataset.student); if (!aluno) return;
  if (button.dataset.action === 'view') showView(aluno);
  if (button.dataset.action === 'edit') showEdit(aluno);
  if (button.dataset.action === 'more') showMore(aluno, button);
});
$('#q-alunos').addEventListener('input', renderAlunos);
$('#f-plano-a').addEventListener('change', renderAlunos);
$('#q-fichas').addEventListener('input', renderFichas);
$('#f-plano-f').addEventListener('change', renderFichas);
$('#f-aluno-f').addEventListener('change', renderFichas);
document.querySelectorAll('.sec-head .btn').forEach((button) => button.addEventListener('click', () => button.textContent.includes('Adicionar') ? openAddStudent() : openNewFicha()));
attachGlobalSearch();
document.addEventListener('athena:profile-ready', async (event) => {
  state.perfil = event.detail.perfil;
  if (state.perfil.tipo_perfil !== 'professor') return;
  try { await loadData(); }
  catch (error) {
    console.error('Erro detalhado ao carregar base de alunos:', { message: error.message, code: error.code, details: error.details, hint: error.hint, error });
    $('#alunos').innerHTML = `<tr class="empty"><td colspan="6">Erro ao carregar os dados: ${esc(error.message || 'falha no banco de dados')}</td></tr>`;
    $('#fichas').innerHTML = '<li class="none">N�o foi possível carregar as fichas.</li>';
  }
});
