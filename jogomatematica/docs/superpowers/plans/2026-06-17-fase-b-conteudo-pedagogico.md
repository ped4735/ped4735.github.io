# Fase B: Conteúdo Pedagógico — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adicionar 6 novos modos de jogo (contagem, maior/menor, operação inversa, frações, sequências, operações encadeadas) e dificuldade adaptativa, sem alterar a experiência visual base.

**Architecture:** Refatorar `perguntas.js` para um padrão de dispatch: cada modo exporta `gerar(dificuldade)` retornando um objeto de pergunta unificado `{ tipo, enunciado, respostaCorreta, opcoes }`. Os 4 modos originais continuam em `perguntas.js`; os 6 novos ficam em `js/modos/`. A dificuldade adaptativa ajusta `maxNum` dinamicamente conforme acertos/erros consecutivos.

**Tech Stack:** Vanilla JS (ES modules), sem novas dependências.

## Interface Unificada de Pergunta

Todos os geradores de modo retornam:
```js
{
  tipo: string,              // identificador do modo
  enunciado: string,         // texto exibido em #pergunta-texto
  respostaCorreta: number|string,  // resposta correta
  opcoes: Array<number|string>,    // 3 opções embaralhadas
}
```

## Global Constraints

- **Idioma**: português em todo conteúdo e comentários.
- **Sem comentários** salvo onde o código original já tinha.
- **Indentação**: 2 espaços.
- **Commit por tarefa**, mensagem em português, prefixo `feat:`/`refactor:`.

---

### Task 1: Refatorar perguntas.js para interface unificada + dispatch

**Files:**
- Modify: `js/perguntas.js`
- Modify: `js/hud.js` (renderizarPergunta usa perguntaAtual.opcoes)
- Modify: `js/validacao.js` (comparação universal)

- [ ] **Step 1: Refatorar perguntas.js — 4 modos originais retornam objeto unificado**

Substituir conteúdo de `js/perguntas.js`:
```javascript
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

function gerarOperacao(max) {
  const modos = ['adicao', 'subtracao', 'multiplicacao', 'divisao'];
  const modo = modos[randomInt(0, modos.length - 1)];
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
  adicao: (max) => gerarOperacao(max),
  subtracao: (max) => gerarOperacao(max),
  multiplicacao: (max) => gerarOperacao(max),
  divisao: (max) => gerarOperacao(max),
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
```

- [ ] **Step 2: Atualizar hud.js — renderizarPergunta usa perguntaAtual.opcoes**

Em `js/hud.js`, substituir `renderizarPergunta` por:
```javascript
export function renderizarPergunta() {
  gerarPergunta();

  document.getElementById('pergunta-texto').textContent = estado.perguntaAtual.enunciado;

  const badge = document.getElementById('modo-atual');
  badge.textContent = NOMES_MODOS[estado.modo];
  badge.style.background = CORES_MODOS[estado.modo];

  const dz = document.getElementById('dropzone');
  dz.className = 'dropzone';
  dz.innerHTML = '<span class="dropzone-placeholder">Solte aqui</span>';

  const container = document.getElementById('respostas-container');
  container.innerHTML = '';

  estado.perguntaAtual.opcoes.forEach((valor) => {
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

Remover import de `gerarOpcoes` (não existe mais). Importar apenas `gerarPergunta`.

- [ ] **Step 3: Atualizar validacao.js — comparação universal**

Em `js/validacao.js`, trocar a linha de comparação:
```javascript
const correto = String(valor) === String(estado.respostaCorreta);
```

- [ ] **Step 4: Verificar sintaxe**

Run: `node --check js/perguntas.js`, `node --check js/hud.js`, `node --check js/validacao.js`

- [ ] **Step 5: Commit**

```powershell
git add js/perguntas.js js/hud.js js/validacao.js
git commit -m "refactor: unificar interface de pergunta e dispatch por modo"
```

---

### Task 2: Adicionar campo adaptativo ao estado

**Files:**
- Modify: `js/estado.js`
- Modify: `js/validacao.js` (ajustar maxNumAjustado)

- [ ] **Step 1: Adicionar campos ao estado em js/estado.js**

Adicionar ao objeto `estado`:
```javascript
  adaptativo: true,
  maxNumAjustado: null,
  acertosSeguidos: 0,
  errosSeguidos: 0,
```

- [ ] **Step 2: Em validacao.js, atualizar maxNumAjustado após acerto/erro**

Após incrementar sequência (acerto), adicionar:
```javascript
    estado.acertosSeguidos++;
    estado.errosSeguidos = 0;
    ajustarDificuldade();
```

Após erro, adicionar:
```javascript
    estado.errosSeguidos++;
    estado.acertosSeguidos = 0;
    ajustarDificuldade();
```

Adicionar função `ajustarDificuldade` e exportá-la:
```javascript
import { CONFIG } from './estado.js';

function ajustarDificuldade() {
  if (!estado.adaptativo) {
    estado.maxNumAjustado = null;
    return;
  }
  const base = CONFIG[estado.dificuldade].maxNum;
  if (estado.maxNumAjustado === null) estado.maxNumAjustado = base;

  if (estado.acertosSeguidos >= 3) {
    estado.maxNumAjustado = Math.min(base * 2, estado.maxNumAjustado + Math.ceil(base * 0.2));
    estado.acertosSeguidos = 0;
  } else if (estado.errosSeguidos >= 2) {
    estado.maxNumAjustado = Math.max(Math.ceil(base * 0.5), estado.maxNumAjustado - Math.ceil(base * 0.2));
    estado.errosSeguidos = 0;
  }
}
```

Adicionar `CONFIG` ao import de estado.js em validacao.js.

Em `iniciarJogo`, resetar: `estado.acertosSeguidos = 0; estado.errosSeguidos = 0; estado.maxNumAjustado = null;`

- [ ] **Step 3: Verificar sintaxe**

Run: `node --check js/estado.js`, `node --check js/validacao.js`

- [ ] **Step 4: Commit**

```powershell
git add js/estado.js js/validacao.js
git commit -m "feat: adicionar dificuldade adaptativa"
```

---

### Task 3: Criar modo contagem

**Files:**
- Create: `js/modos/contagem.js`
- Modify: `js/main.js` (registrar modo)

- [ ] **Step 1: Criar js/modos/contagem.js**

```javascript
import { randomInt, embaralhar } from '../utilidades.js';

const EMOJIS = ['🍎', '🍌', '⭐', '🐶', '🎈', '🌸', '🚗', '🐟'];

export function gerar(max) {
  const n = randomInt(1, Math.min(max, 20));
  const emoji = EMOJIS[randomInt(0, EMOJIS.length - 1)];
  const enunciado = emoji.repeat(n);

  const opcoes = new Set([n]);
  while (opcoes.size < 3) {
    opcoes.add(randomInt(1, n + 5));
  }

  return {
    tipo: 'contagem',
    enunciado,
    respostaCorreta: n,
    opcoes: embaralhar(Array.from(opcoes)),
  };
}
```

- [ ] **Step 2: Registrar em main.js**

```javascript
import { registrarModo } from './perguntas.js';
import { gerar as gerarContagem } from './modos/contagem.js';
registrarModo('contagem', gerarContagem);
```

- [ ] **Step 3: Commit**

```powershell
git add js/modos/contagem.js js/main.js
git commit -m "feat: adicionar modo contagem"
```

---

### Task 4: Criar modo maior-menor

**Files:**
- Create: `js/modos/maior-menor.js`
- Modify: `js/main.js`

- [ ] **Step 1: Criar js/modos/maior-menor.js**

```javascript
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
```

- [ ] **Step 2: Registrar em main.js**

- [ ] **Step 3: Commit**

```powershell
git add js/modos/maior-menor.js js/main.js
git commit -m "feat: adicionar modo maior-menor"
```

---

### Task 5: Criar modo operação-inversa

**Files:**
- Create: `js/modos/operacao-inversa.js`
- Modify: `js/main.js`

- [ ] **Step 1: Criar js/modos/operacao-inversa.js**

```javascript
import { randomInt, embaralhar } from '../utilidades.js';

export function gerar(max) {
  const operadores = ['+', '-', '×'];
  const operador = operadores[randomInt(0, operadores.length - 1)];
  let a, b, resultado, resposta, enunciado;

  switch (operador) {
    case '+':
      a = randomInt(1, max);
      b = randomInt(1, max);
      resultado = a + b;
      break;
    case '-':
      a = randomInt(2, max);
      b = randomInt(1, a - 1);
      resultado = a - b;
      break;
    case '×':
      a = randomInt(2, Math.max(2, Math.floor(max / 2)));
      b = randomInt(2, Math.max(2, Math.floor(max / 2)));
      resultado = a * b;
      break;
  }

  if (Math.random() > 0.5) {
    resposta = a;
    enunciado = `${resultado} = ? ${operador} ${b}`;
  } else {
    resposta = b;
    enunciado = `${resultado} = ${a} ${operador} ?`;
  }

  const opcoes = new Set([resposta]);
  while (opcoes.size < 3) {
    opcoes.add(randomInt(1, Math.max(2, resposta + 5)));
  }

  return {
    tipo: 'operacao-inversa',
    enunciado,
    respostaCorreta: resposta,
    opcoes: embaralhar(Array.from(opcoes)),
  };
}
```

- [ ] **Step 2: Registrar em main.js**

- [ ] **Step 3: Commit**

---

### Task 6: Criar modo frações

**Files:**
- Create: `js/modos/fracoes.js`
- Modify: `js/main.js`

- [ ] **Step 1: Criar js/modos/fracoes.js**

```javascript
import { randomInt, embaralhar } from '../utilidades.js';

const FRACOES = [
  { num: 1, den: 2 },
  { num: 1, den: 3 },
  { num: 1, den: 4 },
  { num: 2, den: 3 },
  { num: 3, den: 4 },
  { num: 2, den: 5 },
];

export function gerar(max) {
  const frac = FRACOES[randomInt(0, FRACOES.length - 1)];
  const k = randomInt(2, 4);

  const resposta = frac.num * k;
  const novoDen = frac.den * k;

  const opcoes = new Set([resposta]);
  while (opcoes.size < 3) {
    const offset = randomInt(1, Math.max(2, Math.floor(resposta * 0.5)));
    const val = resposta + offset * (Math.random() > 0.5 ? 1 : -1);
    if (val > 0) opcoes.add(val);
  }

  return {
    tipo: 'fracoes',
    enunciado: `${frac.num}/${frac.den} = ?/${novoDen}`,
    respostaCorreta: resposta,
    opcoes: embaralhar(Array.from(opcoes)),
  };
}
```

- [ ] **Step 2: Registrar em main.js**

- [ ] **Step 3: Commit**

---

### Task 7: Criar modo sequências

**Files:**
- Create: `js/modos/sequencias.js`
- Modify: `js/main.js`

- [ ] **Step 1: Criar js/modos/sequencias.js**

```javascript
import { randomInt, embaralhar } from '../utilidades.js';

export function gerar(max) {
  const inicio = randomInt(1, Math.max(2, Math.floor(max / 2)));
  const passo = randomInt(1, 5);
  const termos = [inicio, inicio + passo, inicio + 2 * passo, inicio + 3 * passo];
  const resposta = inicio + 4 * passo;

  const enunciado = termos.join(', ') + ', ?';

  const opcoes = new Set([resposta]);
  while (opcoes.size < 3) {
    const offset = randomInt(1, Math.max(2, passo + 2));
    opcoes.add(resposta + offset);
  }

  return {
    tipo: 'sequencias',
    enunciado,
    respostaCorreta: resposta,
    opcoes: embaralhar(Array.from(opcoes)),
  };
}
```

- [ ] **Step 2: Registrar em main.js**

- [ ] **Step 3: Commit**

---

### Task 8: Criar modo operações encadeadas

**Files:**
- Create: `js/modos/encadeadas.js`
- Modify: `js/main.js`

- [ ] **Step 1: Criar js/modos/encadeadas.js**

```javascript
import { randomInt, embaralhar } from '../utilidades.js';

export function gerar(max) {
  const m = Math.max(4, Math.floor(max / 2));
  const usaParenteses = Math.random() > 0.5;
  let a, b, c, enunciado, resultado;

  if (usaParenteses) {
    a = randomInt(1, m);
    b = randomInt(1, m);
    c = randomInt(2, Math.max(2, Math.floor(m / 2)));
    enunciado = `(${a} + ${b}) × ${c} =`;
    resultado = (a + b) * c;
  } else {
    a = randomInt(1, m);
    b = randomInt(2, Math.max(2, Math.floor(m / 2)));
    c = randomInt(1, m);
    enunciado = `${a} + ${b} × ${c} =`;
    resultado = a + b * c;
  }

  const opcoes = new Set([resultado]);
  while (opcoes.size < 3) {
    const offset = randomInt(1, Math.max(2, Math.floor(resultado * 0.4)));
    const sinal = Math.random() > 0.5 ? 1 : -1;
    const val = resultado + offset * sinal;
    if (val >= 0) opcoes.add(val);
  }

  return {
    tipo: 'encadeadas',
    enunciado,
    respostaCorreta: resultado,
    opcoes: embaralhar(Array.from(opcoes)),
  };
}
```

- [ ] **Step 2: Registrar em main.js**

- [ ] **Step 3: Commit**

---

### Task 9: Atualizar constantes e menu UI

**Files:**
- Modify: `js/estado.js` (NOMES_MODOS, CORES_MODOS)
- Modify: `index.html` (novos botões de modo + toggle adaptativo)
- Modify: `style.css` (cores dos novos modos + toggle)

- [ ] **Step 1: Adicionar entradas em NOMES_MODOS e CORES_MODOS em js/estado.js**

```javascript
export const NOMES_MODOS = {
  adicao: 'Adição',
  subtracao: 'Subtração',
  multiplicacao: 'Multiplicação',
  divisao: 'Divisão',
  misto: 'Misto',
  contagem: 'Contagem',
  'maior-menor': 'Maior/Menor',
  'operacao-inversa': 'Operação Inversa',
  fracoes: 'Frações',
  sequencias: 'Sequências',
  encadeadas: 'Operações Encadeadas',
};

export const CORES_MODOS = {
  adicao: '#27ae60',
  subtracao: '#e67e22',
  multiplicacao: '#8e44ad',
  divisao: '#2980b9',
  misto: '#c0392b',
  contagem: '#16a085',
  'maior-menor': '#d35400',
  'operacao-inversa': '#27ae60',
  fracoes: '#8e44ad',
  sequencias: '#2980b9',
  encadeadas: '#c0392b',
};
```

- [ ] **Step 2: Adicionar 6 botões de modo em index.html**

Após o botão misto, adicionar:
```html
                <button class="btn-modo contagem" data-modo="contagem">
                    <span class="modo-icone">🔢</span>
                    <span class="modo-nome">Contagem</span>
                </button>
                <button class="btn-modo maior-menor" data-modo="maior-menor">
                    <span class="modo-icone">⚖️</span>
                    <span class="modo-nome">Maior/Menor</span>
                </button>
                <button class="btn-modo operacao-inversa" data-modo="operacao-inversa">
                    <span class="modo-icone">🔄</span>
                    <span class="modo-nome">Operação Inversa</span>
                </button>
                <button class="btn-modo fracoes" data-modo="fracoes">
                    <span class="modo-icone">🍕</span>
                    <span class="modo-nome">Frações</span>
                </button>
                <button class="btn-modo sequencias" data-modo="sequencias">
                    <span class="modo-icone">📈</span>
                    <span class="modo-nome">Sequências</span>
                </button>
                <button class="btn-modo encadeadas" data-modo="encadeadas">
                    <span class="modo-icone">🔗</span>
                    <span class="modo-nome">Encadeadas</span>
                </button>
```

- [ ] **Step 3: Adicionar toggle de dificuldade adaptativa em index.html**

Após `.seletor-dificuldade`, adicionar:
```html
            <div class="seletor-adaptativo">
                <label class="switch-label">
                    <input type="checkbox" id="toggle-adaptativo" checked>
                    <span class="switch-text">📏 Dificuldade Adaptativa</span>
                </label>
            </div>
```

- [ ] **Step 4: Adicionar CSS para novos modos e toggle em style.css**

Cores dos novos modos:
```css
.btn-modo.contagem.selecionado { border-color: #16a085; background: #e8f8f6; }
.btn-modo.maior-menor.selecionado { border-color: #d35400; background: #fef0e8; }
.btn-modo.operacao-inversa.selecionado { border-color: #27ae60; background: #e8f8f0; }
.btn-modo.fracoes.selecionado { border-color: #8e44ad; background: #f5eef8; }
.btn-modo.sequencias.selecionado { border-color: #2980b9; background: #eaf2f8; }
.btn-modo.encadeadas.selecionado { border-color: #c0392b; background: #fdeaea; }
```

Toggle switch:
```css
.seletor-adaptativo {
  margin-bottom: 24px;
}

.switch-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #555;
}

.switch-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #667eea;
}

.switch-text {
  font-size: 1rem;
}
```

- [ ] **Step 5: Conectar toggle ao estado em js/telas.js**

Adicionar em `initMenuListeners`:
```javascript
  document.getElementById('toggle-adaptativo').addEventListener('change', (e) => {
    estado.adaptativo = e.target.checked;
  });
```

- [ ] **Step 6: Commit**

```powershell
git add js/estado.js index.html style.css js/telas.js
git commit -m "feat: adicionar 6 novos modos no menu e toggle adaptativo"
```

---

### Task 10: Atualizar service-worker.js com novos arquivos

**Files:**
- Modify: `service-worker.js`

- [ ] **Step 1: Adicionar novos arquivos ao cache ASSETS**

Adicionar à lista ASSETS:
```javascript
  './js/modos/contagem.js',
  './js/modos/maior-menor.js',
  './js/modos/operacao-inversa.js',
  './js/modos/fracoes.js',
  './js/modos/sequencias.js',
  './js/modos/encadeadas.js',
```

Bump CACHE_NAME para `'jogo-matematica-v2'`.

- [ ] **Step 2: Commit**

```powershell
git add service-worker.js
git commit -m "chore: atualizar service worker com novos modos"
```

---

### Task 11: Verificação final

- [ ] **Step 1: Verificar sintaxe de todos os arquivos JS**

Run: `node --check` em todos os 16 arquivos JS.

- [ ] **Step 2: Servir local e testar cada modo manualmente**

Run: `python -m http.server 8000`

Testar: adição, subtracao, multiplicacao, divisao, misto, contagem, maior/menor, operação inversa, frações, sequências, encadeadas. Confirmar: pergunta aparece, 3 opções geradas, drag-drop funciona, acerto/erro feedback correto, timer funciona, tela de fim aparece.

- [ ] **Step 3: Commit final se ajustes**

---
