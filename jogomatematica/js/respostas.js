import { validarResposta } from './validacao.js';

export function initRespostas() {
  document.addEventListener('click', (event) => {
    const opcao = event.target.closest('.drag-resposta');
    if (!opcao || opcao.classList.contains('desativada')) return;

    const valor = opcao.getAttribute('data-valor');

    const dropzone = document.getElementById('dropzone');
    dropzone.innerHTML = '';
    const valorEl = document.createElement('span');
    valorEl.textContent = valor;
    valorEl.style.fontSize = '1.4rem';
    valorEl.style.fontWeight = '700';
    valorEl.style.color = '#4a4a8a';
    dropzone.appendChild(valorEl);
    dropzone.classList.add('tem-resposta');

    document.querySelectorAll('.drag-resposta').forEach(o => o.classList.add('desativada'));
    opcao.classList.add('selecionada');

    validarResposta(valor);
  });
}
