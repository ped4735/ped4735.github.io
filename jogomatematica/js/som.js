import { estado } from './estado.js';

let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return ctx;
}

function tocarNota(frequencia, duracao, tipo, delay) {
  if (!estado.somLigado) return;
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = tipo;
  osc.frequency.value = frequencia;
  osc.connect(gain);
  gain.connect(ac.destination);
  const t = ac.currentTime + (delay || 0);
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duracao);
  osc.start(t);
  osc.stop(t + duracao);
}

export function tocar(tipo) {
  if (!estado.somLigado) return;
  switch (tipo) {
    case 'acerto':
      tocarNota(523.25, 0.15, 'sine', 0);
      tocarNota(659.25, 0.15, 'sine', 0.1);
      tocarNota(783.99, 0.2, 'sine', 0.2);
      break;
    case 'erro':
      tocarNota(196, 0.3, 'sawtooth', 0);
      tocarNota(146.83, 0.4, 'sawtooth', 0.15);
      break;
    case 'conquista':
      tocarNota(523.25, 0.1, 'square', 0);
      tocarNota(659.25, 0.1, 'square', 0.08);
      tocarNota(783.99, 0.1, 'square', 0.16);
      tocarNota(1046.5, 0.3, 'square', 0.24);
      break;
    case 'critico':
      tocarNota(880, 0.08, 'triangle', 0);
      break;
  }
}
