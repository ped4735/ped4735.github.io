import { estado } from './estado.js';

const NIVEIS = [
  { nome: 'Aprendiz', min: 0 },
  { nome: 'Explorador', min: 50 },
  { nome: 'Mestre', min: 150 },
  { nome: 'Gênio', min: 300 },
  { nome: 'Lenda', min: 500 },
];

export function calcularNivel(pontos) {
  let idx = 0;
  for (let i = 0; i < NIVEIS.length; i++) {
    if (pontos >= NIVEIS[i].min) idx = i;
  }
  const atual = NIVEIS[idx];
  const proximo = NIVEIS[idx + 1];
  const progresso = proximo
    ? Math.min(100, ((pontos - atual.min) / (proximo.min - atual.min)) * 100)
    : 100;
  return {
    nivel: idx + 1,
    nome: atual.nome,
    progresso,
    proximoNivel: proximo ? proximo.nome : null,
    pontosProximo: proximo ? proximo.min - pontos : 0,
  };
}

export function atualizarBarraXP() {
  const info = calcularNivel(estado.pontos);
  const barra = document.getElementById('barra-xp');
  const texto = document.getElementById('xp-texto');
  const preenchimento = document.getElementById('xp-preenchimento');
  if (!barra) return;
  texto.textContent = proximoTexto(info);
  preenchimento.style.width = info.progresso + '%';
}

function proximoTexto(info) {
  if (info.proximoNivel) {
    return `Nível ${info.nivel} - ${info.nome} (faltam ${info.pontosProximo} pts para ${info.proximoNivel})`;
  }
  return `Nível Máximo - ${info.nome} ⭐`;
}
