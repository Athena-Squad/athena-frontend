(function () {
// [nome, grupo, séries, repetições, carga (kg), descanso, concluído]
var warm = [
  ['Mobilidade de ombro', 'Mobilidade', 2, '10', null, '30s', true],
  ['Bike ergométrica', 'Cardio', 1, '5 min', null, '—', false]
];
var main = [
  ['Supino reto', 'Peito', 4, '8-10', 80, '90s', false],
  ['Supino inclinado halteres', 'Peito', 3, '10-12', 30, '75s', false],
  ['Crucifixo máquina', 'Peito', 3, '12-15', 45, '60s', false],
  ['Tríceps testa', 'Tríceps', 3, '10-12', 25, '60s', false],
  ['Tríceps corda', 'Tríceps', 3, '12-15', 30, '60s', false],
  ['Mergulho no banco', 'Tríceps', 3, '10-12', null, '60s', false]
];
var all = warm.concat(main);
var $ = function (id) { return document.getElementById(id); };
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

function item(e, i) {
  var load = e[4] ? ' · <b>' + e[4] + ' kg</b>' : ' · —';
  var done = e[6];
  return '<li class="card ex' + (done ? ' done' : '') + '">' +
    '<div><span class="tag">' + esc(e[1]) + '</span><h3>' + esc(e[0]) + '</h3>' +
    '<div class="meta">' + e[2] + ' × ' + esc(e[3]) + load + ' · descanso ' + e[5] + '</div></div>' +
    '<button class="check" type="button" data-i="' + i + '" aria-pressed="' + done + '" aria-label="' + (done ? 'Desmarcar ' : 'Concluir ') + esc(e[0]) + '">' +
    (done ? '<svg class="i"><use href="#i-check"/></svg>' : e[2]) + '</button></li>';
}

function render() {
  $('l-warm').innerHTML = warm.map(function (e, i) { return item(e, i); }).join('');
  $('l-main').innerHTML = main.map(function (e, i) { return item(e, warm.length + i); }).join('');
  var dw = warm.filter(function (e) { return e[6]; }).length;
  var dm = main.filter(function (e) { return e[6]; }).length;
  var total = all.length, d = dw + dm;
  var pct = Math.round(d / total * 100);
  $('c-warm').textContent = dw + '/' + warm.length + ' · 5-10 min';
  $('c-main').textContent = dm + '/' + main.length + ' · ficha Hipertrofia ABC';
  $('s-count').textContent = d + ' de ' + total + ' exercícios';
  $('s-pct').textContent = pct + '%';
  $('s-bar').style.width = pct + '%';
  $('s-track').setAttribute('aria-valuenow', pct);
  $('k-ex').textContent = total;
  $('k-sets').textContent = all.reduce(function (s, e) { return s + e[2]; }, 0);
}

document.addEventListener('click', function (ev) {
  var b = ev.target.closest('.check');
  if (!b) return;
  var e = all[+b.getAttribute('data-i')];
  e[6] = !e[6];
  render();
  var again = document.querySelector('.check[data-i="' + b.getAttribute('data-i') + '"]');
  if (again) again.focus();
});

// Cronômetro do botão "Iniciar treino"
var timer = null, secs = 0;
function fmt(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
$('start').addEventListener('click', function () {
  var btn = $('start');
  if (timer) {
    clearInterval(timer); timer = null;
    btn.classList.remove('on');
    btn.querySelector('use').setAttribute('href', '#i-play');
    $('start-txt').textContent = secs ? 'Retomar treino · ' + fmt(secs) : 'Iniciar treino';
  } else {
    btn.classList.add('on');
    btn.querySelector('use').setAttribute('href', '#i-pause');
    $('start-txt').textContent = 'Pausar · ' + fmt(secs);
    timer = setInterval(function () { secs++; $('start-txt').textContent = 'Pausar · ' + fmt(secs); }, 1000);
  }
});

// Saudação conforme a hora
var h = new Date().getHours();
$('saudacao').textContent = (h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite') + ', Ana 👋';

document.querySelectorAll('.nav a').forEach(function (a) {
  a.addEventListener('click', function (e) { e.preventDefault(); });
});
render();
})();