const STORAGE_KEY = 'jm_font_scale';
const ESCALAS = ['fonte-normal', 'fonte-grande', 'fonte-maior'];

export function initAcessibilidade() {
  aplicarFonteSalva();
  initTecladoRespostas();
  initControlesFonte();
}

export function focarPrimeiraResposta() {
  const primeira = document.querySelector('.drag-resposta:not(.desativada)');
  if (primeira) primeira.focus();
}

function initTecladoRespostas() {
  document.addEventListener('keydown', (event) => {
    const alvo = event.target.closest('.drag-resposta');
    if (!alvo) return;
    const respostas = Array.from(document.querySelectorAll('.drag-resposta:not(.desativada)'));
    const idx = respostas.indexOf(alvo);
    if (idx === -1) return;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      respostas[(idx + 1) % respostas.length].focus();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      respostas[(idx - 1 + respostas.length) % respostas.length].focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      alvo.click();
    }
  });
}

function initControlesFonte() {
  const menor = document.getElementById('btn-fonte-menor');
  const maior = document.getElementById('btn-fonte-maior');
  if (!menor || !maior) return;
  menor.addEventListener('click', () => alterarFonte(-1));
  maior.addEventListener('click', () => alterarFonte(1));
}

function aplicarFonteSalva() {
  const salva = localStorage.getItem(STORAGE_KEY) || 'fonte-normal';
  aplicarFonte(ESCALAS.includes(salva) ? salva : 'fonte-normal');
}

function alterarFonte(delta) {
  const atual = ESCALAS.findIndex(c => document.body.classList.contains(c));
  const idx = Math.max(0, Math.min(ESCALAS.length - 1, (atual === -1 ? 0 : atual) + delta));
  aplicarFonte(ESCALAS[idx]);
  localStorage.setItem(STORAGE_KEY, ESCALAS[idx]);
}

function aplicarFonte(classe) {
  document.body.classList.remove(...ESCALAS);
  document.body.classList.add(classe);
}
