# Fase E: Acessibilidade & Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Melhorar acessibilidade, teclado e experiência mobile/tablet sem alterar as regras de jogo.

**Architecture:** Criar módulo `js/acessibilidade.js` para navegação por teclado, live regions e controles de fonte. Ajustar HTML com ARIA e botões A-/A+. Atualizar CSS para foco visível, touch targets maiores e layout mobile mais confortável.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript (ES modules), localStorage, PWA service worker.

## Global Constraints

- **Stack**: HTML5, CSS3, vanilla JavaScript (ES modules)
- **Idioma**: português em UI, comentários e documentação.
- **Sem build system**: servir via HTTP (`python -m http.server 8000`).
- **Sem dependências novas**.

---

### Task 1: Keyboard Selection

**Files:**
- Create: `js/acessibilidade.js`
- Modify: `js/main.js`
- Modify: `js/hud.js`

**Interfaces:**
- Produces: `initAcessibilidade()`, `focarPrimeiraResposta()`.
- Consumes: `.drag-resposta` rendered by `renderizarPergunta()`.

- [ ] Create `js/acessibilidade.js` with keyboard handling: ArrowLeft/ArrowRight moves focus between answers, Enter/Space clicks focused answer.
- [ ] Call `initAcessibilidade()` in `js/main.js`.
- [ ] Call `focarPrimeiraResposta()` after rendering each question.

### Task 2: ARIA And Live Regions

**Files:**
- Modify: `index.html`
- Modify: `js/hud.js`

- [ ] Add `role="status"`, `aria-live="polite"` to feedback.
- [ ] Add labels to menu groups and response area.
- [ ] Render answers as keyboard-focusable buttons (`role="button"`, `tabindex="0"`, `aria-label`).

### Task 3: Font Size Controls

**Files:**
- Modify: `index.html`
- Modify: `js/acessibilidade.js`
- Modify: `style.css`

- [ ] Add A-/A+ controls in menu.
- [ ] Persist font scale in localStorage.
- [ ] Apply CSS class/variable to body.

### Task 4: Mobile/Tablet Polish

**Files:**
- Modify: `style.css`

- [ ] Increase tap targets and reduce visual crowding on small screens.
- [ ] Improve mode selector wrapping and final screen readability.
- [ ] Prevent fixed avatar from covering content on mobile.

### Task 5: Service Worker, Docs, Verification

**Files:**
- Modify: `service-worker.js`
- Modify: `README.md`

- [ ] Add `js/acessibilidade.js` to SW cache and bump cache version.
- [ ] Update README with keyboard/mobile accessibility notes.
- [ ] Run `node --check` on all JS files.
- [ ] Commit.
