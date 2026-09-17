import { estado, NOMES_MODOS } from './estado.js';
import { MODOS_JOGO } from './modos-jogo.js';

const STORAGE_KEY = 'jm_ranking';
const NOMES_DIFICULDADES = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

function carregar() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function salvar(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista.slice(0, 10)));
}

export function salvarPontuacao() {
  const ranking = carregar();
  ranking.push({
    nome: estado.nomeJogador || 'Aluno',
    avatar: estado.avatar,
    pontos: estado.pontos,
    acertos: estado.acertos,
    erros: estado.erros,
    sequencia: estado.maxSequencia,
    modo: estado.modo,
    modoJogo: estado.modoJogo,
    dificuldade: estado.dificuldade,
    data: new Date().toISOString(),
  });
  ranking.sort((a, b) => b.pontos - a.pontos || b.acertos - a.acertos);
  salvar(ranking);
  renderizarRanking();
}

export function renderizarRanking() {
  const lista = document.getElementById('ranking-lista');
  if (!lista) return;
  const ranking = carregar();
  if (ranking.length === 0) {
    lista.innerHTML = '<li>Nenhum recorde ainda.</li>';
    return;
  }
  lista.innerHTML = ranking.map((r, idx) => {
    const modo = NOMES_MODOS[r.modo] || r.modo || 'Modo';
    const modoJogo = MODOS_JOGO[r.modoJogo]?.nome || r.modoJogo || 'Clássico';
    const dificuldade = NOMES_DIFICULDADES[r.dificuldade] || r.dificuldade || 'Dificuldade';
    return `<li><span>${idx + 1}. ${r.avatar || '⭐'} ${r.nome}<small>${modo} • ${modoJogo} • ${dificuldade}</small></span><strong>${r.pontos} pts</strong></li>`;
  }).join('');
}

export function limparRanking() {
  localStorage.removeItem(STORAGE_KEY);
  renderizarRanking();
}
