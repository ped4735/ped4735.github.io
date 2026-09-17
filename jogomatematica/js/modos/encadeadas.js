import { randomInt, embaralhar } from '../utilidades.js';

export function gerar(max) {
  const m = Math.max(4, Math.floor(max / 2));
  const usaParenteses = Math.random() > 0.5;
  let a, b, c, enunciado, resultado;

  if (usaParenteses) {
    a = randomInt(1, m);
    b = randomInt(1, m);
    c = randomInt(2, Math.max(2, Math.floor(m / 2)));
    enunciado = `(${a} + ${b}) × ${c} =`;
    resultado = (a + b) * c;
  } else {
    a = randomInt(1, m);
    b = randomInt(2, Math.max(2, Math.floor(m / 2)));
    c = randomInt(1, m);
    enunciado = `${a} + ${b} × ${c} =`;
    resultado = a + b * c;
  }

  const opcoes = new Set([resultado]);
  while (opcoes.size < 3) {
    const offset = randomInt(1, Math.max(2, Math.floor(resultado * 0.4)));
    const sinal = Math.random() > 0.5 ? 1 : -1;
    const val = resultado + offset * sinal;
    if (val >= 0) opcoes.add(val);
  }

  return {
    tipo: 'encadeadas',
    enunciado,
    respostaCorreta: resultado,
    opcoes: embaralhar(Array.from(opcoes)),
  };
}
