# Design: Reforma do Jogo de Matemática para Uso Escolar

**Data**: 2026-06-17
**Status**: Aprovado (pending user spec review)
**Arquitetura**: Vanilla JS modular (ES modules), sem build, PWA, deploy via Docker + nginx

## Contexto

Jogo de matemática drag-and-drop já funcional (5 modos, 3 dificuldades, timer, pontuação, estrelas). Objetivo: transformar em produto robusto para uma escola atender do infantil (4-6 anos) ao fundamental (7-12 anos), acessível via PC e tablet/celular, com deploy em VPS Hostinger via Docker.

## Decisões de Arquitetura

- **Stack**: HTML5 + CSS3 + vanilla JS (ES modules). Sem framework, sem build.
- **Offline-first**: dependências (Interact.js, Bootstrap) baixadas para `vendor/`; Service Worker cacheia tudo.
- **PWA**: instalável, com `manifest.json` e service worker.
- **Deploy**: `Dockerfile` (nginx:alpine) + `docker-compose.yml`, reverse proxy só nginx, HTTPS gerenciado pelo painel Hostinger.
- **Versionamento**: repo único, branch `main`. Deploy via `git pull && docker compose up -d --build`.

## Seção 1 — Conteúdo Pedagógico

### Novos modos (somam aos 5 existentes: adição, subtração, multiplicação, divisão, misto)

1. **Contagem** — exibe grupo de objetos (emojis), criança conta e arrasta o número. Público: infantil.
2. **Maior/Menor** — compara dois números, arrasta o símbolo correto (>, <, =). Infantil/início fundamental.
3. **Operação inversa** — "8 = ? + 5", encontra o termo que falta.
4. **Frações simples** — equivalências visuais com pizzas/barras (1/2, 1/4, 3/4). 4º-5º ano.
5. **Sequências/padrões** — "2, 4, 6, ?", raciocínio lógico.
6. **Operações encadeadas** — "3 + 2 × 4 = ?" respeitando precedência, com parênteses. 5º ano.

### Dificuldade adaptativa (toggle no menu, padrão ligado)
- Acertou 3 seguidas → aumenta o range de números.
- Errou 2 seguidas → diminui o range.
- Limites por nível: Fácil 1-10, Médio 1-25, Difícil 1-50. Adaptativo mexe dentro do limite do nível escolhido.
- Professor pode fixar dificuldade (desliga adaptativo) quando quiser padronizar uma atividade.

### Parâmetros
- Não há seleção de idade. O modo + dificuldade (ou adaptativo) define o desafio. Criança joga no nível adequado a ela, independentemente da série.

## Seção 2 — Engajamento & Diversão

### Avatares personalizáveis
- Seleção no menu antes de jogar (animal/robô/herói, SVGs em `assets/avatares/`).
- Avatar aparece na tela de jogo (canto) e reage: sorri no acerto, triste no erro.
- Novos avatares desbloqueados por pontos acumulados (replay value).

### Sistema de conquistas (badges)
- Exemplos: "Primeiro acerto", "Sequência de 10", "100 pontos", "Mestre da multiplicação", "Sem errar nenhuma".
- Exibidas em mural na tela de fim de jogo.
- Quadro de troféus acessível pelo menu principal.
- Persistidas em localStorage.

### Efeitos sonoros (com toggle liga/desliga)
- Acerto: tom alegre curto.
- Erro: som suave "quase" (não punitivo).
- Timer crítico: tic-tac.
- Conquista: fanfarra.
- Botão de mudo sempre visível.
- Implementação preferencial: Web Audio API gerando tons (leve, sem arquivos pesados). Arquivos `.mp3`/`.wav` apenas quando necessário.

### Confete e animações
- Sequência de 5: chuva de confete via Canvas (não DOM, não trava tablet antigo).
- Estrelas no fim pulam e brilham.
- Duração curta, não interrompe o fluxo do jogo.

### Feedback visual de progresso
- Barra de XP no topo, enche a cada acerto.
- Níveis com nomes: Aprendiz → Explorador → Mestre → Gênio.
- Indicador "Faltam X pontos para o próximo nível".

### Modos de jogo adicionais
- **Modo Relâmpago**: responde quantas conseguir em 30s.
- **Modo Vidas**: 3 vidas, errou perde uma, desafio de não errar.
- Modo atual (60s cronometrado) permanece como "Modo Clássico".

## Seção 3 — Robustez Técnica

### Offline real
- Interact.js e Bootstrap baixados para `vendor/`.
- `index.html` carrega local, não CDN.
- Service Worker cacheia HTML, CSS, JS, assets, sons.

### PWA
- `manifest.json`: nome, ícones (192/512), cores, orientação.
- Service Worker: estratégia cache-first para estáticos.
- Instalável no tablet/celular do laboratório.

### Responsivo para toque
- Mobile/tablet: opções maiores, dropzone com altura dupla, área de toque confortável.
- Detecção de toque: vibração curta no acerto onde suportado.

### Acessibilidade
- Teclado: setas ← → selecionam opção, Enter solta na dropzone.
- `aria-live` no feedback e timer.
- Contraste validado nas novas telas.
- Tamanho de fonte configurável (A-/A+) no menu.

### Persistência (localStorage)
- Avatar, modo/dificuldade preferidos, som on/off, conquistas, recordes, progresso XP/nível.

### Performance
- Áudios leves (Web Audio API).
- Confete via Canvas.
- Pré-carregar sprites de avatares.

## Seção 4 — Modos Sociais

### Ranking local
- Criança digita nome ou usa avatar como identificador antes de jogar.
- Top 10 pontuações no dispositivo.
- Tela "Recordes" no menu.
- Permite "campeonato de aula": cada criança joga na sua vez, ranking acumula no mesmo dispositivo.

### Modo 2 jogadores (mesmo dispositivo)
- Turnos alternados.
- Quem acerta mais em X rodadas vence.
- Para atividade em duplas no laboratório.

### Desafio diário
- 5 perguntas fixas geradas por data (mesmas para todos no mesmo dia).
- Recorde do dia destacado.
- Cria hábito de retorno.

### Compartilhamento
- Botão "Compartilhar" na tela de fim.
- Gera texto/imagem com "Fiz 120 pontos! ⭐⭐⭐".
- Web Share API no mobile; clipboard no PC.

### Preparação para painel futuro
- Estrutura de score já contém: `{ idTurma, nomeAluno, data, modo, dificuldade, pontos, acertos, erros, maxSequencia }`.
- Por enquanto só localStorage. Quando o painel do professor chegar, basta plugar backend.

## Seção 5 — Estrutura de Arquivos

```
jogomatematica/
├── index.html
├── manifest.json
├── service-worker.js
├── style.css                  (reset, variáveis CSS, base compartilhada)
├── css/                       (estilos por tela, importados via <link>)
│   ├── menu.css
│   ├── jogo.css
│   ├── fim.css
│   └── avatares.css
├── js/
│   ├── main.js
│   ├── estado.js
│   ├── perguntas.js
│   ├── opcoes.js
│   ├── validacao.js
│   ├── timer.js
│   ├── hud.js
│   ├── feedback.js
│   ├── som.js
│   ├── conquistas.js
│   ├── avatares.js
│   ├── dragdrop.js
│   ├── ranking.js
│   └── modos/
│       ├── contagem.js
│       ├── maior-menor.js
│       ├── operacao-inversa.js
│       ├── fracoes.js
│       ├── sequencias.js
│       └── encadeadas.js
├── assets/
│   ├── avatares/
│   ├── icones/
│   ├── sons/
│   └── confete/
├── vendor/
│   ├── interact.min.js
│   └── bootstrap/
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── README.md
```

## Deploy (VPS Hostinger + Docker)

- **Dockerfile**: estágio único `nginx:alpine`, copia estáticos.
- **nginx.conf**: serve estáticos, gzip, cache headers longos para `vendor/` e `assets/`, `try_files` para SPA.
- **docker-compose.yml**: serviço `web`, porta 8080:80, `restart: unless-stopped`.
- **HTTPS**: gerenciado pelo painel Hostinger (proxy reverso deles). Container serve HTTP puro.
- **Fluxo de atualização**: `git pull && docker compose up -d --build` na VPS.
- **Domínio**: subdomínio apontando para a VPS. Crianças acessam pela URL; professor instala como PWA nos tablets.
- **Offline**: após primeiro acesso, service worker garante funcionamento sem internet.

## Escopo de Implementação

Tudo será implementado em um único ciclo (decisão do usuário: "fazer tudo de uma vez"). O plano detalhado será gerado pela skill `writing-plans` em seguida.

## Fora de Escopo (decisões futuras)

- Painel do professor com login/turmas/ranking centralizado (backend).
- Sincronização de progresso entre dispositivos.
- Multiplayer em tempo real pela rede.
- Modo de frações avançadas (além de equivalências simples).
