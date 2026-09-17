# Fase C: Engajamento — Implementation Plan

**Goal:** Adicionar camada de engajamento: avatares, conquistas, sons, confete, XP/níveis e dois modos de jogo extras (Relâmpago e Vidas).

**Architecture:** Novos módulos em `js/`: `som.js`, `conquistas.js`, `avatares.js`, `confete.js`, `xp.js`, `modos-jogo.js`. Persistência em localStorage. Web Audio API para sons (sem arquivos pesados). Canvas para confete.

## Global Constraints
- Idioma português, 2 espaços, sem comentários, commit por tarefa.

---

### Task 1: Criar módulo som.js (Web Audio API)

- [ ] Criar `js/som.js` com função `tocar(tipo)` onde tipo ∈ ['acerto','erro','conquista','critico']. Toggle `somLigado` em estado. Tons gerados via OscillatorNode.
- [ ] Adicionar `somLigado: true` ao estado.
- [ ] Commit.

### Task 2: Integrar som na validação e timer

- [ ] Em `validacao.js`: importar `tocar`, chamar `tocar('acerto')`/`tocar('erro')` no acerto/erro.
- [ ] Em `timer.js`: quando `tempoRestante <= 10`, chamar `tocar('critico')` a cada tick.
- [ ] Commit.

### Task 3: Criar módulo confete.js (Canvas)

- [ ] Criar `js/confete.js` com `dispararConfete()` que cria canvas temporário full-screen, anima partículas por 2s, remove canvas.
- [ ] Commit.

### Task 4: Integrar confete em sequência

- [ ] Em `validacao.js`: importar `dispararConfete`, chamar quando `estado.sequencia % 5 === 0 && estado.sequencia > 0`.
- [ ] Commit.

### Task 5: Criar módulo xp.js (sistema de níveis)

- [ ] Criar `js/xp.js` com `calcularNivel(pontos)` retornando `{ nivel, nome, progresso, proximoNivel }`. Níveis: Aprendiz(0), Explorador(50), Mestre(150), Gênio(300), Lenda(500).
- [ ] Criar função `atualizarBarraXP()` que renderiza barra no HUD.
- [ ] Adicionar elemento barra XP no index.html (topo da tela de jogo).
- [ ] Adicionar CSS da barra.
- [ ] Commit.

### Task 6: Integrar XP no jogo

- [ ] Em `validacao.js`: chamar `atualizarBarraXP()` após atualizar pontos.
- [ ] Commit.

### Task 7: Criar módulo conquistas.js

- [ ] Criar `js/conquistas.js` com lista de conquistas, `verificarConquistas()` chamada após cada acerto/erro, persiste desbloqueadas em localStorage, mostra notificação.
- [ ] Commit.

### Task 8: Integrar conquistas na validação

- [ ] Em `validacao.js`: importar `verificarConquistas`, chamar após cada validação.
- [ ] Commit.

### Task 9: Criar módulo avatares.js

- [ ] Criar `js/avatares.js` com lista de avatares (emoji + nome), seleção no menu, persistência localStorage, reação no acerto/erro (emoji muda).
- [ ] Adicionar seletor de avatar no index.html.
- [ ] Adicionar avatar na tela de jogo.
- [ ] CSS.
- [ ] Commit.

### Task 10: Criar modos de jogo (Relâmpago e Vidas)

- [ ] Criar `js/modos-jogo.js` com config de modos: Clássico (atual), Relâmpago (30s), Vidas (3 vidas).
- [ ] Adicionar seletor de modo de jogo no index.html.
- [ ] Ajustar `validacao.js` e `timer.js` para vidas.
- [ ] Commit.

### Task 11: Botão de mudo e atualizar service worker

- [ ] Adicionar botão de mudo no index.html.
- [ ] Atualizar service-worker.js com novos arquivos (v4).
- [ ] Commit.

### Task 12: Verificação final
