import { randomInt, embaralhar } from '../utilidades.js';

export function gerar(max) {
  const inicio = randomInt(1, Math.max(2, Math.floor(max / 2)));
  const passo = randomInt(1, 5);
  const termos = [inicio, inicio + passo, inicio + 2 * passo, inicio + 3 * passo];
  const resposta = inicio + 4 * passo;

  const enunciado = termos.join(', ') + ', ?';

  const opcoes = new Set([resposta]);
  while (opcoes.size < 3) {
    const offset = randomInt(1, Math.max(2, passo + 2));
    opcoes.add(resposta + offset);
  }

  return {
    tipo: 'sequencias',
    enunciado,
    respostaCorreta: resposta,
    opcoes: embaralhar(Array.from(opcoes)),
  };
}
