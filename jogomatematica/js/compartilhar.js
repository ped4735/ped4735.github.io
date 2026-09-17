import { estado } from './estado.js';
import { textoResultadoDuelo } from './duelo.js';
import { NOMES_MODOS } from './estado.js';
import { MODOS_JOGO } from './modos-jogo.js';

const NOMES_DIFICULDADES = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

export async function compartilharResultado() {
  const duelo = textoResultadoDuelo();
  const contexto = `${NOMES_MODOS[estado.modo]} • ${MODOS_JOGO[estado.modoJogo]?.nome || 'Clássico'} • ${NOMES_DIFICULDADES[estado.dificuldade]}`;
  const texto = duelo
    ? `${duelo} (${contexto})`
    : `${estado.nomeJogador || 'Aluno'} fez ${estado.pontos} pontos no Jogo de Matemática! ⭐ Acertos: ${estado.acertos} (${contexto})`;
  if (navigator.share) {
    await navigator.share({ title: 'Jogo de Matemática', text: texto });
    return;
  }
  await navigator.clipboard.writeText(texto);
  const btn = document.getElementById('btn-compartilhar');
  if (btn) {
    const original = btn.textContent;
    btn.textContent = '✅ Copiado!';
    setTimeout(() => { btn.textContent = original; }, 1600);
  }
}
