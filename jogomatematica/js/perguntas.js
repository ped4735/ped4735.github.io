import { estado, CONFIG } from './estado.js';
import { randomInt, embaralhar } from './utilidades.js';

function gerarOpcoesNumericas(correta) {
  const opcoes = new Set([correta]);
  const variacao = Math.max(2, Math.floor(correta * 0.4));
  while (opcoes.size < 3) {
    const offset = randomInt(1, variacao);
    const sinal = Math.random() > 0.5 ? 1 : -1;
    const val = correta + offset * sinal;
    if (val >= 0) opcoes.add(val);
  }
  return embaralhar(Array.from(opcoes));
}

function gerarOperacao(max, modoForcado) {
  const modos = ['adicao', 'subtracao', 'multiplicacao', 'divisao'];
  const modo = modoForcado || modos[randomInt(0, modos.length - 1)];
  let a, b, operador, resultado;

  switch (modo) {
    case 'adicao':
      a = randomInt(1, max);
      b = randomInt(1, max);
      resultado = a + b;
      operador = '+';
      break;
    case 'subtracao':
      a = randomInt(2, max);
      b = randomInt(1, a - 1);
      resultado = a - b;
      operador = '-';
      break;
    case 'multiplicacao':
      a = randomInt(2, Math.max(2, Math.floor(max / 2)));
      b = randomInt(2, Math.max(2, Math.floor(max / 2)));
      resultado = a * b;
      operador = '×';
      break;
    case 'divisao':
      b = randomInt(2, Math.max(2, Math.floor(max / 3)));
      resultado = randomInt(1, Math.max(1, Math.floor(max / b)));
      a = b * resultado;
      operador = '÷';
      break;
  }

  return {
    tipo: modo,
    enunciado: `${a} ${operador} ${b} =`,
    respostaCorreta: resultado,
    opcoes: gerarOpcoesNumericas(resultado),
  };
}

const GERADORES = {
  adicao: (max) => gerarOperacao(max, 'adicao'),
  subtracao: (max) => gerarOperacao(max, 'subtracao'),
  multiplicacao: (max) => gerarOperacao(max, 'multiplicacao'),
  divisao: (max) => gerarOperacao(max, 'divisao'),
};

export const TODOS_MODOS = ['adicao', 'subtracao', 'multiplicacao', 'divisao'];

export function registrarModo(nome, gerarFn) {
  GERADORES[nome] = gerarFn;
  TODOS_MODOS.push(nome);
}

export function gerarPergunta() {
  const max = CONFIG[estado.dificuldade].maxNum;
  const maxAjustado = estado.adaptativo && estado.maxNumAjustado
    ? estado.maxNumAjustado
    : max;

  const modos = estado.modo === 'misto'
    ? TODOS_MODOS
    : [estado.modo];

  const modoEscolhido = modos[randomInt(0, modos.length - 1)];
  const gerar = GERADORES[modoEscolhido];
  const pergunta = gerar(maxAjustado);
  pergunta.modoAtual = modoEscolhido;

  estado.perguntaAtual = pergunta;
  estado.respostaCorreta = pergunta.respostaCorreta;

  return pergunta;
}
