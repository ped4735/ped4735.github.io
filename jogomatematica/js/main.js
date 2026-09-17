import { initMenuListeners } from './telas.js';
import { initRespostas } from './respostas.js';
import { initAvatar } from './avatares.js';
import { renderizarRanking } from './ranking.js';
import { initAcessibilidade } from './acessibilidade.js';
import { registrarModo } from './perguntas.js';
import { gerar as gerarContagem } from './modos/contagem.js';
import { gerar as gerarMaiorMenor } from './modos/maior-menor.js';
import { gerar as gerarOperacaoInversa } from './modos/operacao-inversa.js';
import { gerar as gerarFracoes } from './modos/fracoes.js';
import { gerar as gerarSequencias } from './modos/sequencias.js';
import { gerar as gerarEncadeadas } from './modos/encadeadas.js';

registrarModo('contagem', gerarContagem);
registrarModo('maior-menor', gerarMaiorMenor);
registrarModo('operacao-inversa', gerarOperacaoInversa);
registrarModo('fracoes', gerarFracoes);
registrarModo('sequencias', gerarSequencias);
registrarModo('encadeadas', gerarEncadeadas);

function init() {
  initAvatar();
  initMenuListeners();
  initRespostas();
  initAcessibilidade();
  renderizarRanking();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
