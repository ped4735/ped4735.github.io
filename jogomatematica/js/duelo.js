import { estado } from './estado.js';

export function iniciarDuelo() {
  const nome1 = document.getElementById('nome-jogador-1')?.value.trim() || 'Jogador 1';
  const nome2 = document.getElementById('nome-jogador-2')?.value.trim() || 'Jogador 2';
  estado.duelo.ativo = estado.modoJogo === 'duelo';
  estado.duelo.jogadorAtual = 0;
  estado.duelo.nomes = [nome1, nome2];
  estado.duelo.pontos = [0, 0];
  estado.duelo.rodada = 1;
  atualizarDueloHUD();
}

export function pontuarDuelo(acertou) {
  if (!estado.duelo.ativo) return;
  if (acertou) estado.duelo.pontos[estado.duelo.jogadorAtual]++;
}

export function avancarDuelo() {
  if (!estado.duelo.ativo) return false;
  if (estado.duelo.rodada >= estado.duelo.maxRodadas) return true;
  estado.duelo.rodada++;
  estado.duelo.jogadorAtual = estado.duelo.jogadorAtual === 0 ? 1 : 0;
  atualizarDueloHUD();
  return false;
}

export function atualizarDueloHUD() {
  const el = document.getElementById('duelo-info');
  if (!el) return;
  if (!estado.duelo.ativo) {
    el.style.display = 'none';
    return;
  }
  const i = estado.duelo.jogadorAtual;
  el.style.display = '';
  el.textContent = `${estado.duelo.nomes[i]} joga | ${estado.duelo.pontos[0]} x ${estado.duelo.pontos[1]} | Rodada ${estado.duelo.rodada}/${estado.duelo.maxRodadas}`;
}

export function textoResultadoDuelo() {
  if (!estado.duelo.ativo) return '';
  const [p1, p2] = estado.duelo.pontos;
  if (p1 === p2) return `Empate no duelo: ${p1} x ${p2}`;
  const vencedor = p1 > p2 ? estado.duelo.nomes[0] : estado.duelo.nomes[1];
  return `${vencedor} venceu o duelo: ${p1} x ${p2}`;
}
