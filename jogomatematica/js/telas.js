import { estado } from './estado.js';
import { iniciarJogo } from './validacao.js';
import { pararTimer } from './timer.js';
import { limparRanking } from './ranking.js';
import { compartilharResultado } from './compartilhar.js';

export function mostrarTela(id) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  document.getElementById(id).classList.add('ativa');
}

export function initMenuListeners() {
  document.querySelectorAll('.btn-modo').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-modo').forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
      estado.modo = btn.dataset.modo;
    });
  });

  document.querySelector('.btn-modo[data-modo="adicao"]').classList.add('selecionado');

  document.querySelectorAll('.btn-dif').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-dif').forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      estado.dificuldade = btn.dataset.dif;
    });
  });

  document.getElementById('btn-jogar').addEventListener('click', iniciarJogo);

  document.getElementById('btn-voltar').addEventListener('click', () => {
    pararTimer();
    estado.jogoAtivo = false;
    mostrarTela('tela-menu');
  });

  document.getElementById('btn-reiniciar').addEventListener('click', iniciarJogo);
  document.getElementById('btn-menu-fim').addEventListener('click', () => {
    mostrarTela('tela-menu');
  });

  document.getElementById('toggle-adaptativo').addEventListener('change', (e) => {
    estado.adaptativo = e.target.checked;
  });

  document.querySelectorAll('.btn-modo-jogo').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-modo-jogo').forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      estado.modoJogo = btn.dataset.modoJogo;
      const dueloNomes = document.getElementById('duelo-nomes');
      const nomeJogador = document.getElementById('nome-jogador');
      const dueloAtivo = estado.modoJogo === 'duelo';
      dueloNomes.style.display = dueloAtivo ? '' : 'none';
      nomeJogador.style.display = dueloAtivo ? 'none' : '';
    });
  });

  document.getElementById('nome-jogador').addEventListener('input', (e) => {
    estado.nomeJogador = e.target.value.trim() || 'Aluno';
  });

  document.getElementById('btn-limpar-ranking').addEventListener('click', limparRanking);
  document.getElementById('btn-compartilhar').addEventListener('click', compartilharResultado);

  const btnMudo = document.getElementById('btn-mudo');
  if (btnMudo) {
    btnMudo.addEventListener('click', () => {
      estado.somLigado = !estado.somLigado;
      btnMudo.textContent = estado.somLigado ? '🔊' : '🔇';
    });
  }
}
