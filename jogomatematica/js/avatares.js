import { estado } from './estado.js';

const AVATARES = [
  { emoji: '🦊', nome: 'Raposo' },
  { emoji: '🐱', nome: 'Gatinho' },
  { emoji: '🐶', nome: 'Cachorro' },
  { emoji: '🦁', nome: 'Leãozinho' },
  { emoji: '🐼', nome: 'Panda' },
  { emoji: '🦄', nome: 'Unicórnio' },
  { emoji: '🐸', nome: 'Sapo' },
  { emoji: '🤖', nome: 'Robô' },
  { emoji: '👾', nome: 'Alien' },
  { emoji: '🦉', nome: 'Coruja' },
];

const STORAGE_KEY = 'jm_avatar';

export function initAvatar() {
  const salvo = localStorage.getItem(STORAGE_KEY);
  if (salvo) estado.avatar = salvo;
  renderizarSeletor();
  atualizarAvatarJogo();
}

export function renderizarSeletor() {
  const container = document.getElementById('avatar-seletor');
  if (!container) return;
  container.innerHTML = '';
  AVATARES.forEach(av => {
    const btn = document.createElement('button');
    btn.className = 'avatar-btn';
    btn.textContent = av.emoji;
    btn.title = av.nome;
    btn.setAttribute('data-avatar', av.emoji);
    if (av.emoji === estado.avatar) btn.classList.add('selecionado');
    btn.addEventListener('click', () => {
      estado.avatar = av.emoji;
      localStorage.setItem(STORAGE_KEY, av.emoji);
      document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
      atualizarAvatarJogo();
    });
    container.appendChild(btn);
  });
}

export function atualizarAvatarJogo(reacao) {
  const el = document.getElementById('avatar-jogo');
  if (!el) return;
  if (reacao === 'acerto') {
    el.textContent = '😍';
    setTimeout(() => { el.textContent = estado.avatar; }, 1200);
  } else if (reacao === 'erro') {
    el.textContent = '😢';
    setTimeout(() => { el.textContent = estado.avatar; }, 1200);
  } else {
    el.textContent = estado.avatar;
  }
}
