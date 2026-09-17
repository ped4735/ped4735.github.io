import { estado, CONFIG } from './estado.js';
import { atualizarHUD } from './hud.js';
import { finalizarJogo } from './fim.js';
import { tocar } from './som.js';

export function iniciarTimer() {
  estado.tempoRestante = CONFIG[estado.dificuldade].tempo;
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

export function pararTimer() {
  if (estado.timerId) {
    clearInterval(estado.timerId);
    estado.timerId = null;
  }
}
