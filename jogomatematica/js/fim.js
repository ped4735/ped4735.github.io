import { estado, NOMES_MODOS } from './estado.js';
import { pararTimer } from './timer.js';
import { mostrarTela } from './telas.js';
import { salvarPontuacao } from './ranking.js';
import { textoResultadoDuelo } from './duelo.js';
import { MODOS_JOGO } from './modos-jogo.js';

const NOMES_DIFICULDADES = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

export function finalizarJogo() {
  estado.jogoAtivo = false;
  pararTimer();

  const total = estado.acertos + estado.erros;
  const taxa = total > 0 ? estado.acertos / total : 0;
  let estrelas = '';
  if (taxa >= 0.8) estrelas = '⭐⭐⭐';
  else if (taxa >= 0.5) estrelas = '⭐⭐';
  else if (taxa > 0) estrelas = '⭐';
  else estrelas = '💫';

  const resultadoDuelo = textoResultadoDuelo();
  document.getElementById('fim-titulo').textContent = resultadoDuelo ||
    (estado.tempoRestante <= 0 ? '⏱️ Tempo Esgotado!' : '🎉 Fim de Jogo!');
  document.getElementById('fim-estrelas').textContent = estrelas;
  document.getElementById('fim-contexto').innerHTML = `
    <span>Modo: <strong>${NOMES_MODOS[estado.modo]}</strong></span>
    <span>Jogo: <strong>${MODOS_JOGO[estado.modoJogo]?.nome || 'Clássico'}</strong></span>
    <span>Dificuldade: <strong>${NOMES_DIFICULDADES[estado.dificuldade]}</strong></span>
  `;
  document.getElementById('fim-pontos').textContent = estado.pontos;
  document.getElementById('fim-acertos').textContent = estado.acertos;
  document.getElementById('fim-erros').textContent = estado.erros;
  document.getElementById('fim-sequencia').textContent = estado.maxSequencia;
  document.getElementById('fim-aproveitamento').textContent = `${Math.round(taxa * 100)}%`;

  salvarPontuacao();

  mostrarTela('tela-fim');
}
