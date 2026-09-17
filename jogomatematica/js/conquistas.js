import { estado } from './estado.js';
import { tocar } from './som.js';

const CONQUISTAS = [
  { id: 'primeiro_acerto', nome: 'Primeiro Acerto', desc: 'Acerte sua primeira resposta', cond: () => estado.acertos >= 1 },
  { id: 'seq_5', nome: 'Sequência de 5', desc: 'Acerte 5 seguidas', cond: () => estado.maxSequencia >= 5 },
  { id: 'seq_10', nome: 'Sequência de 10', desc: 'Acerte 10 seguidas', cond: () => estado.maxSequencia >= 10 },
  { id: 'pontos_100', nome: 'Centenário', desc: 'Faça 100 pontos', cond: () => estado.pontos >= 100 },
  { id: 'pontos_300', nome: 'Trezentão', desc: 'Faça 300 pontos', cond: () => estado.pontos >= 300 },
  { id: 'acertos_20', nome: 'Dedicado', desc: 'Acerte 20 perguntas', cond: () => estado.acertos >= 20 },
  { id: 'sem_erros', nome: 'Perfeição', desc: 'Jogo sem nenhum erro', cond: () => estado.jogoAtivo === false && estado.erros === 0 && estado.acertos >= 5 },
];

const STORAGE_KEY = 'jm_conquistas';

function carregarDesbloqueadas() {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  } catch {
    return [];
  }
}

function salvarDesbloqueadas(lista) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {}
}

export function verificarConquistas() {
  const desbloqueadas = carregarDesbloqueadas();
  const novas = [];

  CONQUISTAS.forEach(c => {
    if (!desbloqueadas.includes(c.id) && c.cond()) {
      desbloqueadas.push(c.id);
      novas.push(c);
    }
  });

  if (novas.length > 0) {
    salvarDesbloqueadas(desbloqueadas);
    novas.forEach(c => mostrarNotificacao(c));
    tocar('conquista');
  }
}

function mostrarNotificacao(conquista) {
  const div = document.createElement('div');
  div.className = 'notificacao-conquista';
  div.innerHTML = `🏆 <strong>${conquista.nome}</strong><br><span>${conquista.desc}</span>`;
  document.body.appendChild(div);
  setTimeout(() => div.classList.add('visivel'), 10);
  setTimeout(() => {
    div.classList.remove('visivel');
    setTimeout(() => div.remove(), 400);
  }, 3000);
}

export function listarConquistas() {
  const desbloqueadas = carregarDesbloqueadas();
  return CONQUISTAS.map(c => ({ ...c, desbloqueada: desbloqueadas.includes(c.id) }));
}
