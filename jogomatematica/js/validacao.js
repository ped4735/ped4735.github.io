import { estado, CONFIG } from './estado.js';
import { atualizarHUD, mostrarFeedback, renderizarPergunta } from './hud.js';
import { mostrarTela } from './telas.js';
import { tocar } from './som.js';
import { dispararConfete } from './confete.js';
import { atualizarBarraXP } from './xp.js';
import { verificarConquistas } from './conquistas.js';
import { atualizarAvatarJogo } from './avatares.js';
import { MODOS_JOGO } from './modos-jogo.js';
import { finalizarJogo } from './fim.js';
import { iniciarDesafioDiario } from './desafio-diario.js';
import { iniciarDuelo, pontuarDuelo, avancarDuelo, atualizarDueloHUD } from './duelo.js';

function ajustarDificuldade() {
  if (!estado.adaptativo) {
    estado.maxNumAjustado = null;
    return;
  }
  const base = CONFIG[estado.dificuldade].maxNum;
  if (estado.maxNumAjustado === null) estado.maxNumAjustado = base;

  if (estado.acertosSeguidos >= 3) {
    estado.maxNumAjustado = Math.min(base * 2, estado.maxNumAjustado + Math.ceil(base * 0.2));
    estado.acertosSeguidos = 0;
  } else if (estado.errosSeguidos >= 2) {
    estado.maxNumAjustado = Math.max(Math.ceil(base * 0.5), estado.maxNumAjustado - Math.ceil(base * 0.2));
    estado.errosSeguidos = 0;
  }
}

export function validarResposta(valor) {
  if (estado.processando || !estado.jogoAtivo) return;
  estado.processando = true;

  const dropzone = document.getElementById('dropzone');
  const correto = String(valor) === String(estado.respostaCorreta);

  if (correto) {
    estado.acertos++;
    estado.sequencia++;
    estado.acertosSeguidos++;
    estado.errosSeguidos = 0;
    ajustarDificuldade();
    if (estado.sequencia > estado.maxSequencia) {
      estado.maxSequencia = estado.sequencia;
    }

    const base = 10;
    const bonus = Math.min(estado.sequencia * 2, 20);
    estado.pontos += base + bonus;
    pontuarDuelo(true);

    dropzone.classList.add('acerto');
    tocar('acerto');
    atualizarAvatarJogo('acerto');
    if (estado.sequencia > 0 && estado.sequencia % 5 === 0) {
      dispararConfete();
    }
    mostrarFeedback('acerto', '✅ Correto! +' + (base + bonus) + ' pts');
  } else {
    estado.erros++;
    estado.sequencia = 0;
    estado.errosSeguidos++;
    estado.acertosSeguidos = 0;
    ajustarDificuldade();

    dropzone.classList.add('erro');
    tocar('erro');
    atualizarAvatarJogo('erro');
    if (MODOS_JOGO[estado.modoJogo]?.vidas !== null) {
      estado.vidas--;
      const vidasEl = document.getElementById('vidas');
      if (vidasEl) vidasEl.textContent = estado.vidas;
    }
    pontuarDuelo(false);
    mostrarFeedback('erro', '❌ Errado! Era ' + estado.respostaCorreta);
  }

  atualizarHUD();
  atualizarBarraXP();
  verificarConquistas();
  estado.perguntasRespondidas++;
  atualizarContadorPerguntas();

  const fimDuelo = avancarDuelo();
  const configModoAtual = MODOS_JOGO[estado.modoJogo] || MODOS_JOGO.classico;
  const fimPorPerguntas = configModoAtual.perguntas !== null
    && estado.perguntasRespondidas >= configModoAtual.perguntas;

  if (MODOS_JOGO[estado.modoJogo]?.vidas !== null && estado.vidas <= 0) {
    setTimeout(() => finalizarJogo(), 100);
  } else if (fimPorPerguntas || fimDuelo) {
    setTimeout(() => finalizarJogo(), 100);
  }

  setTimeout(() => {
    dropzone.classList.remove('acerto', 'erro');
    estado.processando = false;

    if (estado.jogoAtivo) {
      renderizarPergunta();
    }
  }, 1400);
}

export function iniciarJogo() {
  estado.pontos = 0;
  estado.acertos = 0;
  estado.erros = 0;
  estado.sequencia = 0;
  estado.maxSequencia = 0;
  estado.perguntasRespondidas = 0;
  estado.processando = false;
  estado.jogoAtivo = true;
  estado.acertosSeguidos = 0;
  estado.errosSeguidos = 0;
  estado.maxNumAjustado = null;
  estado.desafioDiario.ativo = false;
  estado.duelo.ativo = false;

  if (estado.modoJogo !== 'duelo') {
    const nome = document.getElementById('nome-jogador')?.value.trim();
    estado.nomeJogador = nome || 'Aluno';
  }

  iniciarDesafioDiario();
  iniciarDuelo();
  atualizarDueloHUD();

  const configModo = MODOS_JOGO[estado.modoJogo] || MODOS_JOGO.classico;
  configurarIndicadoresModo(configModo);
  if (configModo.vidas !== null) {
    estado.vidas = configModo.vidas;
    const vidasEl = document.getElementById('vidas');
    if (vidasEl) vidasEl.textContent = estado.vidas;
    document.getElementById('info-vidas').style.display = '';
  } else {
    document.getElementById('info-vidas').style.display = 'none';
  }

  mostrarTela('tela-jogo');
  renderizarPergunta();
  atualizarBarraXP();

  if (configModo.tempo !== null) {
    estado.tempoRestante = configModo.tempo;
    atualizarHUD();
    if (estado.timerId) clearInterval(estado.timerId);
    estado.timerId = setInterval(() => {
      estado.tempoRestante--;
      atualizarHUD();
      if (estado.tempoRestante <= 10 && estado.tempoRestante > 0) {
        tocar('critico');
      }
      if (estado.tempoRestante <= 0) {
        finalizarJogo();
      }
    }, 1000);
  }
}

function configurarIndicadoresModo(configModo) {
  const infoTimer = document.getElementById('info-timer');
  const infoPerguntas = document.getElementById('info-perguntas');
  if (infoTimer) infoTimer.style.display = configModo.tempo !== null ? '' : 'none';
  if (infoPerguntas) {
    infoPerguntas.style.display = configModo.perguntas !== null ? '' : 'none';
    atualizarContadorPerguntas();
  }
}

function atualizarContadorPerguntas() {
  const configModo = MODOS_JOGO[estado.modoJogo] || MODOS_JOGO.classico;
  const el = document.getElementById('perguntas-contador');
  if (!el || configModo.perguntas === null) return;
  el.textContent = `${Math.min(estado.perguntasRespondidas, configModo.perguntas)}/${configModo.perguntas}`;
}
