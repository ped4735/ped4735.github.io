import { randomInt, embaralhar } from '../utilidades.js';

export function gerar(max) {
  const a = randomInt(1, max);
  const b = randomInt(1, max);

  let correta;
  if (a > b) correta = '>';
  else if (a < b) correta = '<';
  else correta = '=';

  return {
    tipo: 'maior-menor',
    enunciado: `${a}  ?  ${b}`,
    respostaCorreta: correta,
    opcoes: embaralhar(['>', '<', '=']),
  };
}
