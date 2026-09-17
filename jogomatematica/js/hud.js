import { estado, NOMES_MODOS, CORES_MODOS } from './estado.js';
import { gerarPergunta } from './perguntas.js';
import { focarPrimeiraResposta } from './acessibilidade.js';

export function atualizarHUD() {
  document.getElementById('pontuacao').textContent = estado.pontos;
  document.getElementById('timer').textContent = estado.tempoRestante;
  document.getElementById('acertos').textContent = estado.acertos;
  document.getElementById('erros').textContent = estado.erros;
  document.getElementById('sequencia').textContent = estado.sequencia;

  const timerEl = document.getElementById('timer');
  if (estado.tempoRestante <= 10) {
    timerEl.classList.add('critico');
  } else {
    timerEl.classList.remove('critico');
  }
}

export function mostrarFeedback(tipo, mensagem) {
  const el = document.getElementById('feedback-msg');
  el.textContent = mensagem;
  el.className = 'feedback-msg visivel ' + tipo;

  setTimeout(() => {
    el.classList.remove('visivel');
  }, 1200);
}

export function renderizarPergunta() {
  gerarPergunta();

  document.getElementById('pergunta-texto').textContent = estado.perguntaAtual.enunciado;

  const badge = document.getElementById('modo-atual');
  badge.textContent = NOMES_MODOS[estado.modo];
  badge.style.background = CORES_MODOS[estado.modo];

  const dz = document.getElementById('dropzone');
  dz.className = 'dropzone';
  dz.innerHTML = '<span class="dropzone-placeholder">Selecione uma resposta</span>';

  const container = document.getElementById('respostas-container');
  container.innerHTML = '';

  estado.perguntaAtual.opcoes.forEach((valor) => {
    const span = document.createElement('span');
    span.className = 'drag-resposta';
    span.textContent = valor;
    span.setAttribute('data-valor', valor);
    span.setAttribute('role', 'button');
    span.setAttribute('tabindex', '0');
    span.setAttribute('aria-label', `Responder ${valor}`);
    container.appendChild(span);
  });

  atualizarHUD();
  focarPrimeiraResposta();
}
