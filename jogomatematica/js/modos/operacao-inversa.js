import { randomInt, embaralhar } from '../utilidades.js';

export function gerar(max) {
  const operadores = ['+', '-', '×'];
  const operador = operadores[randomInt(0, operadores.length - 1)];
  let a, b, resultado, resposta, enunciado;

  switch (operador) {
    case '+':
      a = randomInt(1, max);
      b = randomInt(1, max);
      resultado = a + b;
      break;
    case '-':
      a = randomInt(2, max);
      b = randomInt(1, a - 1);
      resultado = a - b;
      break;
    case '×':
      a = randomInt(2, Math.max(2, Math.floor(max / 2)));
      b = randomInt(2, Math.max(2, Math.floor(max / 2)));
      resultado = a * b;
      break;
  }

  if (Math.random() > 0.5) {
    resposta = a;
    enunciado = `${resultado} = ? ${operador} ${b}`;
  } else {
    resposta = b;
    enunciado = `${resultado} = ${a} ${operador} ?`;
  }

  const opcoes = new Set([resposta]);
  while (opcoes.size < 3) {
    opcoes.add(randomInt(1, Math.max(2, resposta + 5)));
  }

  return {
    tipo: 'operacao-inversa',
    enunciado,
    respostaCorreta: resposta,
    opcoes: embaralhar(Array.from(opcoes)),
  };
}
