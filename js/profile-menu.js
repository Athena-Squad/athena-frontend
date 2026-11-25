import { obterPerfilLogado, fazerLogout } from './api.js';
import { supabase } from './supabase-client.js';

const initials = (name) => String(name || '').trim().split(/\s+/).filter(Boolean)
  .map((part, index, parts) => index === 0 || index === parts.length - 1 ? part[0] : '').join('').toLocaleUpperCase('pt-BR');
const safeText = (node, value) => { if (node) node.textContent = value; };

function setupNotifications(perfil) {
  const button = document.querySelector('.tools .icon-btn');
  if (!button) return;
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'notifications-popover');
  const dot = button.querySelector('.dot-on');
  if (dot) dot.hidden = true;
  const panel = document.createElement('section');
  panel.id = 'notifications-popover';
  panel.className = 'notifications-popover';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Notificações recentes');
  panel.innerHTML = '<strong>Notificações</strong><div class="notifications-list">Carregando notificações…</div>';
  button.insertAdjacentElement('afterend', panel);

  const seenKey = `athena_notif_seen_${perfil.id}`;
  const observedAt = (id) => {
    const key = `athena_notif_observed_${perfil.id}_${id}`;
    try {
      const previous = localStorage.getItem(key);
      if (previous) return previous;
      const firstSeen = new Date().toISOString();
      localStorage.setItem(key, firstSeen);
      return firstSeen;
    } catch (error) {
      console.warn('N�o foi possível registrar o primeiro aviso deste aluno.', error);
      return new Date().toISOString();
    }
  };
  const markSeen = () => {
    try { localStorage.setItem(seenKey, new Date().toISOString()); } catch (error) { console.warn('N�o foi possível salvar notificações lidas.', error); }
    if (dot) dot.hidden = true;
  };
  button.addEventListener('click', () => {
    const opening = panel.hidden;
    panel.hidden = !opening;
    button.setAttribute('aria-expanded', String(opening));
    if (opening) markSeen();
  });
  document.addEventListener('click', (event) => {
    if (!button.contains(event.target) && !panel.contains(event.target)) {
      panel.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    }
  });

  (async () => {
    const items = [];
    if (perfil.tipo_perfil === 'professor') {
      const { data: newStudents, error: studentsError } = await supabase.from('alunos').select('perfil_id, perfis (nome_completo)').is('professor_id', null);
      if (studentsError) console.error('Falha ao buscar alunos aguardando vínculo:', studentsError);
      (newStudents || []).forEach((student) => {
        const name = Array.isArray(student.perfis) ? student.perfis[0]?.nome_completo : student.perfis?.nome_completo;
        items.push({ at: observedAt(student.perfil_id), text: `${name || 'Novo aluno'} aguarda vínculo` });
      });
      const { data: links, error: linksError } = await supabase.from('alunos').select('perfil_id').eq('professor_id', perfil.id);
      if (linksError) console.error('Falha ao buscar alunos para notificações:', linksError);
      const ids = (links || []).map((row) => row.perfil_id);
      if (ids.length) {
        const { data: executions, error: executionsError } = await supabase.from('historico_execucoes').select('id, aluno_id, nome_exercicio, data_execucao').in('aluno_id', ids).order('data_execucao', { ascending: false }).limit(10);
        if (executionsError) console.error('Falha ao buscar execuções recentes:', executionsError);
        (executions || []).forEach((entry) => items.push({ at: entry.data_execucao, text: `Treino executado: ${entry.nome_exercicio || 'exercício'}` }));
      }
    }
    items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    const list = panel.querySelector('.notifications-list');
    list.replaceChildren();
    if (!items.length) {
      list.textContent = 'Nenhuma notifica��o recente.';
      markSeen();
      return;
    }
    items.slice(0, 10).forEach((item) => {
      const row = document.createElement('div');
      row.className = 'notification-item';
      row.textContent = item.text;
      const time = document.createElement('small');
      const date = new Date(item.at);
      time.textContent = Number.isNaN(date.getTime()) ? '' : date.toLocaleString('pt-BR');
      row.append(time);
      list.append(row);
    });
    let seen = 0;
    try { seen = Date.parse(localStorage.getItem(seenKey) || '') || 0; } catch (error) { console.warn('N�o foi possível ler notificações lidas.', error); }
    const hasUnread = items.some((item) => (Date.parse(item.at) || 0) > seen);
    if (dot) dot.hidden = !hasUnread;
  })().catch((error) => {
    console.error('Falha ao carregar notificações:', error);
    panel.querySelector('.notifications-list').textContent = 'N�o foi possível carregar notificações.';
  });
}

const toggle = document.querySelector('[data-profile-toggle]');
const menu = document.querySelector('[data-profile-menu]');
try {
  const session = await obterPerfilLogado();
  if (!session) {
    location.replace('../index.html');
  } else {
    const { perfil } = session;
    const expectedArea = document.querySelector('[data-profile-area]')?.dataset.profileArea;
    if (expectedArea && perfil.tipo_perfil !== expectedArea) {
      location.replace('../index.html');
    } else {
      const nome = perfil.nome_completo || 'Usuário';
      const cargo = perfil.tipo_perfil === 'professor' ? 'Personal Trainer' : 'Aluno';
      const avatar = document.querySelector('[data-profile-initials]');
      if (avatar) safeText(avatar, initials(nome) || '??');
      document.querySelectorAll('[data-profile-name]').forEach((element) => safeText(element, nome));
      document.querySelectorAll('[data-profile-role]').forEach((element) => safeText(element, cargo));
      safeText(document.querySelector('[data-profile-greeting]'), `Olá, ${nome}!`);
      const shortcut = document.querySelector('[data-profile-shortcut]');
      if (shortcut) {
        safeText(shortcut, perfil.tipo_perfil === 'professor' ? 'Minha base de alunos' : 'Meu treino atual');
        shortcut.href = perfil.tipo_perfil === 'professor' ? './base-alunos.html' : './painel-aluno.html';
      }
      if (toggle && menu) {
        const close = () => { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); };
        toggle.addEventListener('click', () => {
          const opening = toggle.getAttribute('aria-expanded') !== 'true';
          menu.hidden = !opening;
          toggle.setAttribute('aria-expanded', String(opening));
        });
        document.addEventListener('click', (event) => { if (!event.target.closest('[data-profile]')) close(); });
        document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { close(); toggle.focus(); } });
        menu.querySelector('#btn-logout')?.addEventListener('click', fazerLogout);
      }
      setupNotifications(perfil);
      document.dispatchEvent(new CustomEvent('athena:profile-ready', { detail: { perfil } }));
    }
  }
} catch (error) {
  console.error('N�o foi possível carregar o perfil:', error);
  document.querySelectorAll('[data-profile-name]').forEach((element) => safeText(element, 'Perfil indisponível'));
  document.querySelectorAll('[data-profile-role]').forEach((element) => safeText(element, ''));
  safeText(document.querySelector('[data-profile-initials]'), '—');
  safeText(document.querySelector('[data-profile-greeting]'), 'Olá!');
}
