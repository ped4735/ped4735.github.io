# Fase A: Fundação & Deploy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modularizar o jogo existente em ES modules, adicionar fallback offline de dependências (vendor/), criar PWA instalável e configurar deploy via Docker + nginx na VPS Hostinger — sem alterar funcionalmente o jogo.

**Architecture:** O `gamemtm.js` monolítico (421 linhas) é dividido em módulos ES (`js/*.js`) com responsabilidades únicas, orquestrados por `js/main.js`. Dependências CDN (Interact.js, Bootstrap) são baixadas para `vendor/`. PWA com `manifest.json` + `service-worker.js`. Deploy via `Dockerfile` (nginx:alpine) + `docker-compose.yml`.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript (ES modules), Interact.js, Bootstrap 5.3.0, nginx:alpine, Docker.

## Global Constraints

- **Sem build system**: ES modules nativos, `<script type="module">`.
- **Sem CDN**: todas as dependências em `vendor/`, carregadas localmente.
- **Offline-first**: Service Worker cacheia todos os estáticos.
- **Idioma**: todo conteúdo, comentários e textos em português (conforme AGENTS.md).
- **Sem testes automatizados**: verificação manual conforme AGENTS.md ("No test framework is configured. Manual testing only: open `index.html` and play through the game.").
- **Servir via HTTP**: ES modules exigem `python -m http.server 8000` (não `file://`).
- **Indentação**: 2 espaços (JS/CSS), seguir padrões existentes.
- **Não adicionar comentários** salvo onde o código original já tinha.
- **Mensagem de commit em português**, prefixo `feat:`/`refactor:`/`chore:`.

---

## File Structure (após Fase A)

```
jogomatematica/
├── index.html                 (modificado: carrega vendor + type="module")
├── manifest.json              (novo: PWA)
├── service-worker.js          (novo: cache offline)
├── style.css                  (inalterado nesta fase)
├── js/
│   ├── main.js                (novo: orquestra init)
│   ├── estado.js              (novo: estado + CONFIG + constantes)
│   ├── utilidades.js          (novo: randomInt, embaralhar)
│   ├── perguntas.js            (novo: gerarPergunta, gerarOpcoes)
│   ├── timer.js               (novo: iniciarTimer, pararTimer)
│   ├── validacao.js           (novo: validarResposta)
│   ├── fim.js                 (novo: finalizarJogo)
│   ├── hud.js                 (novo: atualizarHUD, mostrarFeedback, renderizarPergunta)
│   ├── telas.js               (novo: mostrarTela, initMenuListeners)
│   └── dragdrop.js            (novo: config Interact.js)
├── vendor/
│   ├── interact.min.js        (novo: baixado do CDN)
│   └── bootstrap/
│       └── bootstrap.min.css  (novo: baixado do CDN)
├── assets/
│   └── icones/
│       ├── icon-192.png        (novo: placeholder)
│       └── icon-512.png        (novo: placeholder)
├── Dockerfile                 (novo)
├── docker-compose.yml         (novo)
├── nginx.conf                 (novo)
└── gamemtm.js                 (deletado ao fim — conteúdo movido para js/)
```

---

### Task 1: Baixar dependências para vendor/

**Files:**
- Create: `vendor/interact.min.js`
- Create: `vendor/bootstrap/bootstrap.min.css`

**Interfaces:**
- Produces: arquivos locais que `index.html` referenciará via caminho relativo.

- [ ] **Step 1: Criar diretórios vendor/**

Run:
```powershell
New-Item -ItemType Directory -Path "vendor\bootstrap" -Force
```
Expected: diretório criado sem erro.

- [ ] **Step 2: Baixar Interact.js**

Run:
```powershell
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js" -OutFile "vendor\interact.min.js"
```
Expected: arquivo `vendor\interact.min.js` criado, tamanho > 0. Verificar com `Test-Path vendor\interact.min.js`.

- [ ] **Step 3: Baixar Bootstrap CSS**

Run:
```powershell
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" -OutFile "vendor\bootstrap\bootstrap.min.css"
```
Expected: arquivo `vendor\bootstrap\bootstrap.min.css` criado, tamanho > 0.

- [ ] **Step 4: Verificar downloads**

Run:
```powershell
Get-ChildItem -Recurse vendor | Select-Object FullName, Length
```
Expected: dois arquivos listados com `Length` > 1000.

- [ ] **Step 5: Commit**

```powershell
git add vendor
git commit -m "chore: baixar Interact.js e Bootstrap para vendor/ (offline)"
```

---

### Task 2: Criar módulo estado.js

**Files:**
- Create: `js/estado.js`
- Reference: `gamemtm.js:6-44` (estado, CONFIG, NOMES_MODOS, CORES_MODOS)

**Interfaces:**
- Produces: `estado` (object), `CONFIG` (object), `NOMES_MODOS` (object), `CORES_MODOS` (object) — exportados nomeadamente.

- [ ] **Step 1: Criar js/estado.js com conteúdo extraído de gamemtm.js:6-44**

Create `js/estado.js`:
```javascript
export const estado = {
  modo: 'adicao',
  dificuldade: 'facil',
  pontos: 0,
  acertos: 0,
  erros: 0,
  sequencia: 0,
  maxSequencia: 0,
  tempoRestante: 60,
  timerId: null,
  jogoAtivo: false,
  perguntaAtual: null,
  respostas: [],
  respostaCorreta: null,
  processando: false,
};

export const CONFIG = {
  facil: { tempo: 60, maxNum: 10 },
  medio: { tempo: 45, maxNum: 25 },
  dificil: { tempo: 30, maxNum: 50 },
};

export const NOMES_MODOS = {
  adicao: 'Adição',
  subtracao: 'Subtração',
  multiplicacao: 'Multiplicação',
  divisao: 'Divisão',
  misto: 'Misto',
};

export const CORES_MODOS = {
  adicao: '#27ae60',
  subtracao: '#e67e22',
  multiplicacao: '#8e44ad',
  divisao: '#2980b9',
  misto: '#c0392b',
};
```

- [ ] **Step 2: Commit**

```powershell
git add js/estado.js
git commit -m "refactor: extrair estado e constantes para js/estado.js"
```

---

### Task 3: Criar módulo utilidades.js

**Files:**
- Create: `js/utilidades.js`
- Reference: `gamemtm.js:47-58` (randomInt, embaralhar)

**Interfaces:**
- Produces: `randomInt(min, max)` → number, `embaralhar(array)` → array.

- [ ] **Step 1: Criar js/utilidades.js com conteúdo extraído de gamemtm.js:47-58**

Create `js/utilidades.js`:
```javascript
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function embaralhar(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
```

- [ ] **Step 2: Commit**

```powershell
git add js/utilidades.js
git commit -m "refactor: extrair randomInt e embaralhar para js/utilidades.js"
```

---

### Task 4: Criar módulo perguntas.js

**Files:**
- Create: `js/perguntas.js`
- Reference: `gamemtm.js:61-121` (gerarPergunta, gerarOpcoes)

**Interfaces:**
- Consumes: `estado`, `CONFIG` from `./estado.js`; `randomInt`, `embaralhar` from `./utilidades.js`
- Produces: `gerarPergunta()` → number (também seta `estado.perguntaAtual` e `estado.respostaCorreta`); `gerarOpcoes(correta)` → number[]

- [ ] **Step 1: Criar js/perguntas.js com conteúdo extraído de gamemtm.js:61-121**

Create `js/perguntas.js`:
```javascript
import { estado, CONFIG } from './estado.js';
import { randomInt, embaralhar } from './utilidades.js';

export function gerarPergunta() {
  const max = CONFIG[estado.dificuldade].maxNum;
  let a, b, operador, resultado, texto;

  const modos = estado.modo === 'misto'
    ? ['adicao', 'subtracao', 'multiplicacao', 'divisao']
    : [estado.modo];

  const modoAtual = modos[randomInt(0, modos.length - 1)];

  switch (modoAtual) {
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

  texto = `${a} ${operador} ${b} =`;

  estado.perguntaAtual = { a, b, operador, resultado, texto, modoAtual };
  estado.respostaCorreta = resultado;

  return resultado;
}

export function gerarOpcoes(correta) {
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
```

- [ ] **Step 2: Commit**

```powershell
git add js/perguntas.js
git commit -m "refactor: extrair gerarPergunta e gerarOpcoes para js/perguntas.js"
```

---

### Task 5: Criar módulo hud.js

**Files:**
- Create: `js/hud.js`
- Reference: `gamemtm.js:130-187` (atualizarHUD, mostrarFeedback, renderizarPergunta)

**Interfaces:**
- Consumes: `estado`, `NOMES_MODOS`, `CORES_MODOS` from `./estado.js`; `gerarPergunta`, `gerarOpcoes` from `./perguntas.js`
- Produces: `atualizarHUD()`, `mostrarFeedback(tipo, mensagem)`, `renderizarPergunta()`

- [ ] **Step 1: Criar js/hud.js com conteúdo extraído de gamemtm.js:130-187**

Create `js/hud.js`:
```javascript
import { estado, NOMES_MODOS, CORES_MODOS } from './estado.js';
import { gerarPergunta, gerarOpcoes } from './perguntas.js';

export function atualizarHUD() {
  document.getElementById('pontuacao').textContent = estado.pontos;
  document.getElementById('timer').textContent = estado.tempoRestante;
  document.getElementById('acertos').textContent = estado.acertos;
  document.getElementById('erros').textContent = estado.erros;
  document.getElementById('sequencia').textContent = estado.sequencia;

  const timerEl = document.getElementById('timer');
  if (estado.tempoRestante <= 10) {
    timerEl.classList.add('critico');
  } else {
    timerEl.classList.remove('critico');
  }
}

export function mostrarFeedback(tipo, mensagem) {
  const el = document.getElementById('feedback-msg');
  el.textContent = mensagem;
  el.className = 'feedback-msg visivel ' + tipo;

  setTimeout(() => {
    el.classList.remove('visivel');
  }, 1200);
}

export function renderizarPergunta() {
  const correta = gerarPergunta();
  estado.respostas = gerarOpcoes(correta);

  document.getElementById('pergunta-texto').textContent = estado.perguntaAtual.texto;

  const badge = document.getElementById('modo-atual');
  badge.textContent = NOMES_MODOS[estado.modo];
  badge.style.background = CORES_MODOS[estado.modo];

  const dz = document.getElementById('dropzone');
  dz.className = 'dropzone';
  dz.innerHTML = '<span class="dropzone-placeholder">Solte aqui</span>';

  const container = document.getElementById('respostas-container');
  container.innerHTML = '';

  estado.respostas.forEach((valor) => {
    const span = document.createElement('span');
    span.className = 'drag-resposta';
    span.textContent = valor;
    span.setAttribute('data-valor', valor);
    span.setAttribute('data-x', 0);
    span.setAttribute('data-y', 0);
    container.appendChild(span);
  });

  atualizarHUD();
}
```

- [ ] **Step 2: Commit**

```powershell
git add js/hud.js
git commit -m "refactor: extrair HUD e renderização para js/hud.js"
```

---

### Task 6: Criar módulo fim.js

**Files:**
- Create: `js/fim.js`
- Reference: `gamemtm.js:256-278` (finalizarJogo)

**Interfaces:**
- Consumes: `estado` from `./estado.js`; `pararTimer` from `./timer.js`; `mostrarTela` from `./telas.js`
- Produces: `finalizarJogo()`

**Nota sobre dependência circular:** `timer.js` importa `fim.js` (para chamar `finalizarJogo` quando tempo chega a zero) e `fim.js` importa `timer.js` (para chamar `pararTimer`). Em ES modules isso funciona porque as funções são resolvidas em runtime, não em evaluation time. Para evitar problemas, `fim.js` importa `pararTimer` de `./timer.js` e `timer.js` importa `finalizarJogo` de `./fim.js`.

- [ ] **Step 1: Criar js/fim.js com conteúdo extraído de gamemtm.js:256-278**

Create `js/fim.js`:
```javascript
import { estado } from './estado.js';
import { pararTimer } from './timer.js';
import { mostrarTela } from './telas.js';

export function finalizarJogo() {
  estado.jogoAtivo = false;
  pararTimer();

  const total = estado.acertos + estado.erros;
  const taxa = total > 0 ? estado.acertos / total : 0;
  let estrelas = '';
  if (taxa >= 0.8) estrelas = '⭐⭐⭐';
  else if (taxa >= 0.5) estrelas = '⭐⭐';
  else if (taxa > 0) estrelas = '⭐';
  else estrelas = '💫';

  document.getElementById('fim-titulo').textContent =
    estado.tempoRestante <= 0 ? '⏱️ Tempo Esgotado!' : '🎉 Fim de Jogo!';
  document.getElementById('fim-estrelas').textContent = estrelas;
  document.getElementById('fim-pontos').textContent = estado.pontos;
  document.getElementById('fim-acertos').textContent = estado.acertos;
  document.getElementById('fim-erros').textContent = estado.erros;
  document.getElementById('fim-sequencia').textContent = estado.maxSequencia;

  mostrarTela('tela-fim');
}
```

- [ ] **Step 2: Commit**

```powershell
git add js/fim.js
git commit -m "refactor: extrair finalizarJogo para js/fim.js"
```

---

### Task 7: Criar módulo timer.js

**Files:**
- Create: `js/timer.js`
- Reference: `gamemtm.js:190-211` (iniciarTimer, pararTimer)

**Interfaces:**
- Consumes: `estado`, `CONFIG` from `./estado.js`; `atualizarHUD` from `./hud.js`; `finalizarJogo` from `./fim.js`
- Produces: `iniciarTimer()`, `pararTimer()`

- [ ] **Step 1: Criar js/timer.js com conteúdo extraído de gamemtm.js:190-211**

Create `js/timer.js`:
```javascript
import { estado, CONFIG } from './estado.js';
import { atualizarHUD } from './hud.js';
import { finalizarJogo } from './fim.js';

export function iniciarTimer() {
  estado.tempoRestante = CONFIG[estado.dificuldade].tempo;
  atualizarHUD();

  if (estado.timerId) clearInterval(estado.timerId);

  estado.timerId = setInterval(() => {
    estado.tempoRestante--;
    atualizarHUD();

    if (estado.tempoRestante <= 0) {
      finalizarJogo();
    }
  }, 1000);
}

export function pararTimer() {
  if (estado.timerId) {
    clearInterval(estado.timerId);
    estado.timerId = null;
  }
}
```

- [ ] **Step 2: Commit**

```powershell
git add js/timer.js
git commit -m "refactor: extrair timer para js/timer.js"
```

---

### Task 8: Criar módulo validacao.js

**Files:**
- Create: `js/validacao.js`
- Reference: `gamemtm.js:214-253` (validarResposta), `gamemtm.js:280-293` (iniciarJogo)

**Interfaces:**
- Consumes: `estado` from `./estado.js`; `atualizarHUD`, `mostrarFeedback`, `renderizarPergunta` from `./hud.js`
- Produces: `validarResposta(valor)`, `iniciarJogo()`

- [ ] **Step 1: Criar js/validacao.js com conteúdo extraído de gamemtm.js:214-293**

Create `js/validacao.js`:
```javascript
import { estado } from './estado.js';
import { atualizarHUD, mostrarFeedback, renderizarPergunta } from './hud.js';
import { mostrarTela } from './telas.js';
import { iniciarTimer } from './timer.js';

export function validarResposta(valor) {
  if (estado.processando || !estado.jogoAtivo) return;
  estado.processando = true;

  const dropzone = document.getElementById('dropzone');
  const correto = parseInt(valor, 10) === estado.respostaCorreta;

  if (correto) {
    estado.acertos++;
    estado.sequencia++;
    if (estado.sequencia > estado.maxSequencia) {
      estado.maxSequencia = estado.sequencia;
    }

    const base = 10;
    const bonus = Math.min(estado.sequencia * 2, 20);
    estado.pontos += base + bonus;

    dropzone.classList.add('acerto');
    mostrarFeedback('acerto', '✅ Correto! +' + (base + bonus) + ' pts');
  } else {
    estado.erros++;
    estado.sequencia = 0;

    dropzone.classList.add('erro');
    mostrarFeedback('erro', '❌ Errado! Era ' + estado.respostaCorreta);
  }

  atualizarHUD();

  setTimeout(() => {
    dropzone.classList.remove('acerto', 'erro');
    estado.processando = false;

    if (estado.jogoAtivo) {
      renderizarPergunta();
    }
  }, 1400);
}

export function iniciarJogo() {
  estado.pontos = 0;
  estado.acertos = 0;
  estado.erros = 0;
  estado.sequencia = 0;
  estado.maxSequencia = 0;
  estado.processando = false;
  estado.jogoAtivo = true;

  mostrarTela('tela-jogo');
  renderizarPergunta();
  iniciarTimer();
}
```

- [ ] **Step 2: Commit**

```powershell
git add js/validacao.js
git commit -m "refactor: extrair validacao e iniciarJogo para js/validacao.js"
```

---

### Task 9: Criar módulo telas.js

**Files:**
- Create: `js/telas.js`
- Reference: `gamemtm.js:124-127` (mostrarTela), `gamemtm.js:296-326` (event listeners)

**Interfaces:**
- Produces: `mostrarTela(id)`, `initMenuListeners()` (configura todos os event listeners do menu e botões de navegação)

- [ ] **Step 1: Criar js/telas.js com conteúdo extraído de gamemtm.js:124-127 e 296-326**

Create `js/telas.js`:
```javascript
import { estado } from './estado.js';
import { iniciarJogo } from './validacao.js';
import { pararTimer } from './timer.js';

export function mostrarTela(id) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  document.getElementById(id).classList.add('ativa');
}

export function initMenuListeners() {
  document.querySelectorAll('.btn-modo').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-modo').forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
      estado.modo = btn.dataset.modo;
    });
  });

  document.querySelector('.btn-modo[data-modo="adicao"]').classList.add('selecionado');

  document.querySelectorAll('.btn-dif').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-dif').forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      estado.dificuldade = btn.dataset.dif;
    });
  });

  document.getElementById('btn-jogar').addEventListener('click', iniciarJogo);

  document.getElementById('btn-voltar').addEventListener('click', () => {
    pararTimer();
    estado.jogoAtivo = false;
    mostrarTela('tela-menu');
  });

  document.getElementById('btn-reiniciar').addEventListener('click', iniciarJogo);
  document.getElementById('btn-menu-fim').addEventListener('click', () => {
    mostrarTela('tela-menu');
  });
}
```

- [ ] **Step 2: Commit**

```powershell
git add js/telas.js
git commit -m "refactor: extrair telas e menu listeners para js/telas.js"
```

---

### Task 10: Criar módulo dragdrop.js

**Files:**
- Create: `js/dragdrop.js`
- Reference: `gamemtm.js:328-421` (Interact.js config, dragMoveListener, resetarPosicao)

**Interfaces:**
- Consumes: `validarResposta` from `./validacao.js`; `interact` (global, de `vendor/interact.min.js`)
- Produces: `initDragDrop()` (configura dropzone e draggable), `dragMoveListener(event)`, `resetarPosicao(el)`

- [ ] **Step 1: Criar js/dragdrop.js com conteúdo extraído de gamemtm.js:328-421**

Create `js/dragdrop.js`:
```javascript
import { validarResposta } from './validacao.js';

export function dragMoveListener(event) {
  const target = event.target;
  const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
  const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}

export function resetarPosicao(el) {
  el.style.transition = 'transform 0.3s ease';
  el.style.transform = 'translate(0px, 0px)';
  el.setAttribute('data-x', 0);
  el.setAttribute('data-y', 0);

  setTimeout(() => {
    el.style.transition = '';
  }, 300);
}

export function initDragDrop() {
  interact('.dropzone').dropzone({
    accept: '.drag-resposta',
    overlap: 0.60,

    ondropactivate: function (event) {
      event.target.classList.add('drop-ativo');
    },

    ondragenter: function (event) {
      const dropzone = event.target;
      const draggable = event.relatedTarget;
      dropzone.classList.add('drop-hover');
      draggable.classList.add('pode-soltar');
    },

    ondragleave: function (event) {
      const dropzone = event.target;
      const draggable = event.relatedTarget;
      dropzone.classList.remove('drop-hover');
      draggable.classList.remove('pode-soltar');
    },

    ondrop: function (event) {
      const draggable = event.relatedTarget;
      const dropzone = event.target;
      const valor = draggable.getAttribute('data-valor');

      dropzone.classList.remove('drop-hover');
      draggable.classList.remove('pode-soltar');

      dropzone.innerHTML = '';
      const valorEl = document.createElement('span');
      valorEl.textContent = valor;
      valorEl.style.fontSize = '1.4rem';
      valorEl.style.fontWeight = '700';
      valorEl.style.color = '#4a4a8a';
      dropzone.appendChild(valorEl);
      dropzone.classList.add('tem-resposta');

      validarResposta(valor);
    },

    ondropdeactivate: function (event) {
      event.target.classList.remove('drop-ativo', 'drop-hover');
    }
  });

  interact('.drag-resposta').draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'body',
        endOnly: true
      })
    ],
    autoScroll: true,
    listeners: {
      move: dragMoveListener,
      start: function (event) {
        event.target.classList.add('arrastando');
      },
      end: function (event) {
        event.target.classList.remove('arrastando');
        if (!event.dropzone) {
          resetarPosicao(event.target);
        }
      }
    }
  });
}
```

- [ ] **Step 2: Commit**

```powershell
git add js/dragdrop.js
git commit -m "refactor: extrair drag-and-drop para js/dragdrop.js"
```

---

### Task 11: Criar módulo main.js (orquestrador)

**Files:**
- Create: `js/main.js`

**Interfaces:**
- Consumes: `initMenuListeners` from `./telas.js`; `initDragDrop` from `./dragdrop.js`
- Produces: ponto de entrada do app (importado por `index.html`)

- [ ] **Step 1: Criar js/main.js**

Create `js/main.js`:
```javascript
import { initMenuListeners } from './telas.js';
import { initDragDrop } from './dragdrop.js';

function init() {
  initMenuListeners();
  initDragDrop();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

- [ ] **Step 2: Commit**

```powershell
git add js/main.js
git commit -m "refactor: criar js/main.js como orquestrador"
```

---

### Task 12: Atualizar index.html para vendor + ES modules

**Files:**
- Modify: `index.html` (linhas 8-13 e 124-127)

**Interfaces:**
- Consumes: `vendor/interact.min.js`, `vendor/bootstrap/bootstrap.min.css`, `js/main.js` (type="module")

- [ ] **Step 1: Atualizar links CSS e scripts no index.html**

Substituir as linhas 8-13 (head) por:
```html
    <!-- Bootstrap 5 (local, offline) -->
    <link href="vendor/bootstrap/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="style.css">
```

Substituir as linhas 124-127 (scripts no final do body) por:
```html
    <!-- Interact.js (local, offline) -->
    <script src="vendor/interact.min.js"></script>
    <!-- Game Logic (ES modules) -->
    <script type="module" src="js/main.js"></script>
```

- [ ] **Step 2: Verificar manualmente — iniciar servidor local**

Run:
```powershell
python -m http.server 8000
```
Abrir `http://localhost:8000` no navegador. Esperado: menu aparece, jogo funciona (arrastar e soltar responde), nenhum erro no console.

- [ ] **Step 3: Commit**

```powershell
git add index.html
git commit -m "refactor: index.html carrega vendor local e js/main.js como module"
```

---

### Task 13: Deletar gamemtm.js (conteúdo movido para js/)

**Files:**
- Delete: `gamemtm.js`

- [ ] **Step 1: Deletar gamemtm.js**

Run:
```powershell
Remove-Item -LiteralPath gamemtm.js
```
Expected: arquivo removido.

- [ ] **Step 2: Verificar manualmente — jogo ainda funciona**

Recarregar `http://localhost:8000`. Esperado: tudo funcionando, sem erros 404 no console.

- [ ] **Step 3: Commit**

```powershell
git add -A
git commit -m "refactor: remover gamemtm.js (conteúdo migrado para js/*.js)"
```

---

### Task 14: Criar ícones PWA (placeholders)

**Files:**
- Create: `assets/icones/icon-192.png`
- Create: `assets/icones/icon-512.png`

**Nota:** Placeholder SVG convertido para PNG. Serão substituídos por arte final na Fase C (engajamento).

- [ ] **Step 1: Criar diretório assets/icones/**

Run:
```powershell
New-Item -ItemType Directory -Path "assets\icones" -Force
```

- [ ] **Step 2: Gerar ícones PNG placeholder via PowerShell**

Criar arquivo `assets\icones\gerar-icones.ps1` temporário com:
```powershell
Add-Type -AssemblyName System.Drawing

function CriarIcone($caminho, $tamanho) {
  $bmp = New-Object System.Drawing.Bitmap($tamanho, $tamanho)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point($tamanho, $tamanho)),
    [System.Drawing.Color]::FromArgb(102, 126, 234),
    [System.Drawing.Color]::FromArgb(118, 75, 162)
  )
  $g.FillRectangle($brush, 0, 0, $tamanho, $tamanho)
  $font = New-Object System.Drawing.Font("Arial", ($tamanho * 0.5), [System.Drawing.FontStyle]::Bold)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $g.DrawString("🧮", $font, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF(0, 0, $tamanho, $tamanho)), $sf)
  $bmp.Save($caminho, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

CriarIcone "assets\icones\icon-192.png" 192
CriarIcone "assets\icones\icon-512.png" 512
```

Run:
```powershell
powershell -ExecutionPolicy Bypass -File assets\icones\gerar-icones.ps1
Remove-Item assets\icones\gerar-icones.ps1
```
Expected: dois arquivos PNG criados em `assets/icones/`.

- [ ] **Step 3: Verificar**

Run:
```powershell
Get-ChildItem assets\icones | Select-Object Name, Length
```
Expected: `icon-192.png` e `icon-512.png` com `Length` > 1000.

- [ ] **Step 4: Commit**

```powershell
git add assets
git commit -m "feat: adicionar icones PWA placeholder (192/512)"
```

---

### Task 15: Criar manifest.json

**Files:**
- Create: `manifest.json`

- [ ] **Step 1: Criar manifest.json**

Create `manifest.json`:
```json
{
  "name": "Jogo de Matemática",
  "short_name": "Matemática",
  "description": "Jogo educacional de matemática com arrastar e soltar",
  "start_url": "./index.html",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "assets/icones/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icones/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: Adicionar link do manifest no index.html**

Adicionar dentro de `<head>` (após o link do style.css):
```html
    <!-- PWA Manifest -->
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#667eea">
```

- [ ] **Step 3: Commit**

```powershell
git add manifest.json index.html
git commit -m "feat: adicionar manifest.json para PWA"
```

---

### Task 16: Criar service-worker.js

**Files:**
- Create: `service-worker.js`

**Interfaces:**
- Produces: Service Worker que cacheia todos os estáticos com estratégia cache-first.

- [ ] **Step 1: Criar service-worker.js na raiz**

Create `service-worker.js`:
```javascript
const CACHE_NAME = 'jogo-matematica-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/main.js',
  './js/estado.js',
  './js/utilidades.js',
  './js/perguntas.js',
  './js/hud.js',
  './js/timer.js',
  './js/validacao.js',
  './js/fim.js',
  './js/telas.js',
  './js/dragdrop.js',
  './vendor/interact.min.js',
  './vendor/bootstrap/bootstrap.min.css',
  './assets/icones/icon-192.png',
  './assets/icones/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => cached);
    })
  );
});
```

- [ ] **Step 2: Registrar SW no index.html**

Adicionar antes de `</body>` (antes dos scripts existentes):
```html
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./service-worker.js')
            .catch((err) => console.log('SW register failed:', err));
        });
      }
    </script>
```

- [ ] **Step 3: Verificar manualmente**

Recarregar `http://localhost:8000`. Abrir DevTools → Application → Service Workers. Esperado: SW registrado e ativo. Em Application → Cache Storage, esperar ver `jogo-matematica-v1` com os assets.

- [ ] **Step 4: Commit**

```powershell
git add service-worker.js index.html
git commit -m "feat: adicionar service worker para cache offline"
```

---

### Task 17: Criar nginx.conf

**Files:**
- Create: `nginx.conf`

- [ ] **Step 1: Criar nginx.conf**

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 256;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location = /manifest.json {
        expires 1h;
        add_header Cache-Control "public";
    }

    add_header X-Content-Type-Options "nosniff" always;
}
```

- [ ] **Step 2: Commit**

```powershell
git add nginx.conf
git commit -m "feat: adicionar configuracao nginx"
```

---

### Task 18: Criar Dockerfile

**Files:**
- Create: `Dockerfile`

- [ ] **Step 1: Criar Dockerfile**

Create `Dockerfile`:
```dockerfile
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY manifest.json /usr/share/nginx/html/manifest.json
COPY service-worker.js /usr/share/nginx/html/service-worker.js
COPY js /usr/share/nginx/html/js
COPY css /usr/share/nginx/html/css
COPY vendor /usr/share/nginx/html/vendor
COPY assets /usr/share/nginx/html/assets

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Nota:** O `COPY css` falhará se o diretório `css/` não existir ainda (ele será criado na Fase C). Para esta fase, ajustar para não copiar `css/` ainda — ou criar `css/` vazio agora.

- [ ] **Step 2: Criar css/ vazio para o Dockerfile funcionar**

Run:
```powershell
New-Item -ItemType Directory -Path "css" -Force
Set-Content -Path "css\.gitkeep" -Value ""
```

- [ ] **Step 3: Commit**

```powershell
git add Dockerfile css
git commit -m "feat: adicionar Dockerfile"
```

---

### Task 19: Criar docker-compose.yml

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Criar docker-compose.yml**

Create `docker-compose.yml`:
```yaml
services:
  web:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

- [ ] **Step 2: Commit**

```powershell
git add docker-compose.yml
git commit -m "feat: adicionar docker-compose.yml"
```

---

### Task 20: Atualizar documentação (AGENTS.md e README.md)

**Files:**
- Modify: `AGENTS.md`
- Modify: `README.md`

- [ ] **Step 1: Atualizar AGENTS.md — seção Stack e File Structure**

Em `AGENTS.md`, atualizar a seção "Stack":
```markdown
- **Stack**: HTML5, CSS3, vanilla JavaScript (ES modules)
- **Dependencies**: Bootstrap 5.3.0, Interact.js (ambos em `vendor/`, offline)
- **PWA**: manifest.json + service-worker.js (funciona offline após primeiro acesso)
- **Deploy**: Docker (nginx:alpine) + docker-compose.yml
- **No build system**: serve via HTTP (`python -m http.server 8000`)
```

Atualizar a tabela File Structure:
```markdown
| File | Purpose |
|------|---------|
| `index.html` | Single page with three screens (menu, game, end) and dynamic draggable answer options |
| `manifest.json` | PWA manifest |
| `service-worker.js` | Offline cache (cache-first strategy) |
| `style.css` | Base styles (reset, variables, shared) |
| `js/` | ES modules: main, estado, utilidades, perguntas, hud, timer, validacao, fim, telas, dragdrop |
| `vendor/` | Interact.js + Bootstrap (local copies, offline fallback) |
| `assets/` | Icons, sprites, sounds |
| `Dockerfile` | nginx:alpine image definition |
| `docker-compose.yml` | Container orchestration |
| `nginx.conf` | nginx server config |
| `README.md` | Project docs (Portuguese) |
```

Adicionar nova seção após "Running the Project":
```markdown
## Deploy (VPS Hostinger + Docker)

1. Na VPS: `git pull && docker compose up -d --build`
2. Container expõe porta 8080. Proxy HTTPS gerenciado pelo painel Hostinger.
3. Domínio: apontar subdomínio para a VPS. Crianças acessam pela URL.
4. PWA instalável; após primeiro acesso funciona offline.
```

- [ ] **Step 2: Atualizar README.md — seção "Como Executar"**

Substituir a seção "🛠️ Como Executar" por:
```markdown
## 🛠️ Como Executar

### Desenvolvimento (local)

ES modules exigem servir via HTTP (não `file://`):

```bash
python -m http.server 8000
# ou
npx serve .
```

Abrir `http://localhost:8000` no navegador.

### Produção (Docker)

```bash
docker compose up -d --build
```

Acesse `http://localhost:8080`. Para deploy na VPS Hostinger, ver `AGENTS.md`.
```

- [ ] **Step 3: Commit**

```powershell
git add AGENTS.md README.md
git commit -m "docs: atualizar para arquitetura modular + Docker + PWA"
```

---

### Task 21: Verificação final manual

**Files:** nenhum (verificação apenas)

- [ ] **Step 1: Servir local e jogar uma partida completa**

Run:
```powershell
python -m http.server 8000
```
Abrir `http://localhost:8000`. Verificar:
1. Menu aparece, botões de modo e dificuldade funcionam
2. Clicar "Jogar" vai para tela de jogo
3. Pergunta aparece, 3 opções são geradas
4. Arrastar resposta para dropzone funciona
5. Acerto: feedback verde, pontos sobem, nova pergunta aparece
6. Erro: feedback vermelho, sequência zera, nova pergunta aparece
7. Timer conta regressivamente, fica vermelho nos últimos 10s
8. Tempo zerar leva à tela de fim com estrelas e stats
9. "Jogar Novamente" reinicia; "Voltar ao Menu" volta ao menu
10. DevTools → Application → Service Workers: SW ativo
11. DevTools → Application → Cache Storage: `jogo-matematica-v1` preenchido
12. DevTools → Console: nenhum erro
13. Desligar internet (DevTools → Network → Offline) e recarregar: jogo ainda funciona (offline confirmado)

- [ ] **Step 2: Build Docker e testar container**

Run:
```powershell
docker compose up -d --build
```
Acessar `http://localhost:8080`. Esperado: mesmo comportamento do passo 1.

- [ ] **Step 3: Parar container**

Run:
```powershell
docker compose down
```

- [ ] **Step 4: Commit final (se houver ajustes pendentes)**

Se tudo passou sem ajustes, não há commit. Se ajustes foram feitos:
```powershell
git add -A
git commit -m "fix: ajustes pos-verificacao final fase A"
```

---

## Self-Review Notes

- **Cobertura do spec (Fase A)**: modularização ✅, vendor offline ✅, PWA ✅, Docker/nginx ✅, estrutura de arquivos ✅. Features das seções 1-4 do spec (conteúdo, engajamento, sociais, acessibilidade) são escopo das Fases B-E, não desta fase.
- **Dependência circular timer↔fim**: tratada com imports cruzados resolvidos em runtime. Funciona em ES modules porque as funções são chamadas em eventos, não durante a avaliação do módulo.
- **Dockerfile copia `css/`**: criado `css/.gitkeep` para o COPY funcionar. Será populado na Fase C.
- **Google Fonts via CDN**: permanece via CDN (não é crítica para funcionamento; fallback para sans-serif). Pode ser baixada localmente em fase futura se necessário.
