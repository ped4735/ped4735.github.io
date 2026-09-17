import { randomInt, embaralhar } from '../utilidades.js';

const EMOJIS = ['🍎', '🍌', '⭐', '🐶', '🎈', '🌸', '🚗', '🐟'];

export function gerar(max) {
  const n = randomInt(1, Math.min(max, 20));
  const emoji = EMOJIS[randomInt(0, EMOJIS.length - 1)];
  const enunciado = emoji.repeat(n);

  const opcoes = new Set([n]);
  while (opcoes.size < 3) {
    opcoes.add(randomInt(1, n + 5));
  }

  return {
    tipo: 'contagem',
    enunciado,
    respostaCorreta: n,
    opcoes: embaralhar(Array.from(opcoes)),
  };
}
