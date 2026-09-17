import { randomInt, embaralhar } from '../utilidades.js';

const FRACOES = [
  { num: 1, den: 2 },
  { num: 1, den: 3 },
  { num: 1, den: 4 },
  { num: 2, den: 3 },
  { num: 3, den: 4 },
  { num: 2, den: 5 },
];

export function gerar(max) {
  const frac = FRACOES[randomInt(0, FRACOES.length - 1)];
  const k = randomInt(2, 4);

  const resposta = frac.num * k;
  const novoDen = frac.den * k;

  const opcoes = new Set([resposta]);
  while (opcoes.size < 3) {
    const offset = randomInt(1, Math.max(2, Math.floor(resposta * 0.5)));
    const val = resposta + offset * (Math.random() > 0.5 ? 1 : -1);
    if (val > 0) opcoes.add(val);
  }

  return {
    tipo: 'fracoes',
    enunciado: `${frac.num}/${frac.den} = ?/${novoDen}`,
    respostaCorreta: resposta,
    opcoes: embaralhar(Array.from(opcoes)),
  };
}
