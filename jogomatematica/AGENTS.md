# AGENTS.md — Jogo de Matemática

## Project Overview

Small vanilla frontend math click-to-select game. All content and comments are in **Portuguese**.

- **Stack**: HTML5, CSS3, vanilla JavaScript (ES modules)
- **Dependencies**: Bootstrap 5.3.0 (local em `vendor/`, offline)
- **PWA**: manifest.json + service-worker.js (funciona offline após primeiro acesso)
- **Deploy**: site estático integrado ao GitHub Pages do projeto principal
- **No build system**: serve via HTTP (`python -m http.server 8000`)

## Running the Project

No install or build step. ES modules exigem servir via HTTP (não `file://`):

```bash
python -m http.server 8000
# ou
npx serve .
```

Abrir `http://localhost:8000` no navegador.

## Deploy

O jogo é publicado como parte do projeto estático principal no GitHub Pages.
A PWA continua instalável e funciona offline após o primeiro acesso.

## File Structure

| File | Purpose |
|------|---------|
| `index.html` | Single page with three screens (menu, game, end), mode selectors, ranking and clickable answer options |
| `manifest.json` | PWA manifest |
| `service-worker.js` | Offline cache (cache-first strategy) |
| `style.css` | Base styles (reset, variables, shared) |
| `js/` | ES modules: main, estado, utilidades, perguntas, hud, timer, validacao, fim, telas, respostas, ranking, duelo, social/engagement modules |
| `vendor/` | Bootstrap local copy (offline fallback) |
| `assets/` | Icons, sprites, sounds |
| `README.md` | Project docs (Portuguese) |

## Architecture & Data Flow

The game is a single-page app with no state management library, structured around three screens (telas) toggled via a `.ativa` CSS class.

1. **Menu screen** (`#tela-menu`) — user selects math mode, game mode (`classico`, `relampago`, `vidas`, `diario`, `duelo`), avatar, player name and difficulty. Selections are stored in the global `estado` object.
2. **Game screen** (`#tela-jogo`) — a random question is generated (`gerarPergunta`), three answer options are rendered as clickable `.drag-resposta` elements, and clicking an option fills `#dropzone` and validates immediately.
3. **End screen** (`#tela-fim`) — shown when timer/lives/daily/duel conditions end; displays stats, stars and sharing button.

### Game state
All state lives in the `estado` object (`js/estado.js`): mode/difficulty, scoring, timer, adaptive difficulty, audio/avatar settings, lives, daily challenge and duel state. The `processando` flag locks input during the 1.4s feedback window after each answer click.

### Question & answer generation
- `gerarPergunta()` (`js/perguntas.js`) dispatches to original arithmetic modes or one of the modules in `js/modos/`.
- Each mode returns `{ tipo, enunciado, respostaCorreta, opcoes }`. Options are rendered by `renderizarPergunta()` in `js/hud.js`.

### Scoring
Correct answer: `10 + min(sequencia * 2, 20)` points. Wrong answer: resets `sequencia` to 0. Star rating at end is based on hit rate (≥80% → 3 stars, ≥50% → 2 stars, >0 → 1 star).

### Click-to-select answers
- `js/respostas.js` uses event delegation on `.drag-resposta` elements.
- Clicking an option fills `#dropzone`, disables all options, and calls `validarResposta(valor)`.
- Visual feedback is class-driven: `tem-resposta`, `selecionada`, `desativada`, `acerto`, `erro`.

## Important Gotchas

### Dynamic answer options
Answer spans are created at runtime in `renderizarPergunta()`. Click handling is delegated at document level in `js/respostas.js`, so new options work without re-initialization per question.

### `processando` Flag Prevents Double-Submission
While `true` (during the 1.4s post-answer feedback window), `validarResposta` exits early. Answer options are also marked `.desativada` after the first click.

### Mixed Inline and External Styles
`index.html` contains a few inline `style` attributes (e.g. dynamic badge background color set via JS in `renderizarPergunta`). Prefer keeping styles in `style.css` for consistency.

### No Tests
No test framework is configured. Manual testing only: open `index.html` and play through the game.

## Planned Features (from README)

- Automated tests
- Teacher dashboard with centralized class rankings
- Sync progress across devices
- Advanced accessibility improvements
