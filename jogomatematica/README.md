# Jogo de Matemática

Este é um jogo de matemática interativo por seleção de resposta (click-to-select), com múltiplos modos de jogo, ranking local, conquistas e suporte a PWA (funciona offline).

## 🚀 Tecnologias Utilizadas

O projeto foi desenvolvido utilizando as seguintes tecnologias:

- **HTML5**: Estrutura da página.
- **CSS3**: Estilização customizada.
- **JavaScript (ES Modules)**: Lógica do jogo, sem framework, dividida em módulos por responsabilidade.
- **Bootstrap 5.3.0**: Framework CSS para layout responsivo (cópia local em `vendor/`, funciona offline).
- **Service Worker + Web App Manifest**: Instalação como PWA e cache para uso offline.

## 📂 Estrutura do Projeto

O projeto consiste nos seguintes arquivos e pastas:

- `index.html`: Ponto de entrada da aplicação, com as telas de menu, jogo e fim de jogo.
- `style.css`: Estilos base (reset, variáveis, estilos compartilhados).
- `manifest.json`: Manifesto da PWA.
- `service-worker.js`: Cache offline (estratégia cache-first).
- `js/`: Módulos ES da lógica do jogo — `main.js` (ponto de entrada), `estado.js`, `perguntas.js`, `hud.js`, `timer.js`, `validacao.js`, `respostas.js`, `ranking.js`, `duelo.js`, `desafio-diario.js`, módulos de engajamento (`conquistas.js`, `xp.js`, `confete.js`, `avatares.js`, `compartilhar.js`, `som.js`, `acessibilidade.js`) e os modos de pergunta em `js/modos/` (`contagem`, `maior-menor`, `operacao-inversa`, `fracoes`, `sequencias`, `encadeadas`).
- `vendor/`: Cópia local do Bootstrap (fallback offline).
- `assets/icones/`: Ícones da PWA.

## 🎮 Como Funciona

O jogo é um quiz de matemática com seleção por clique, composto por três telas: **Menu**, **Jogo** e **Fim de Jogo**.

### Menu Inicial
- Escolha modos matemáticos: **Adição**, **Subtração**, **Multiplicação**, **Divisão**, **Misto**, **Contagem**, **Maior/Menor**, **Operação Inversa**, **Frações**, **Sequências** e **Encadeadas**.
- Escolha o modo de jogo: **Clássico**, **Relâmpago**, **Vidas**, **Diário** ou **Duelo**.
- Escolha avatar e nome do jogador; o ranking local salva os recordes no dispositivo.
- Selecione a dificuldade:
  - **Fácil**: números até 10, 60s de jogo
  - **Médio**: números até 25, 45s de jogo
  - **Difícil**: números até 50, 30s de jogo

### Jogo
1.  **Pergunta**: Uma operação aleatória é exibida (ex: `7 × 3 =`).
2.  **Clique**: Três opções de resposta são geradas; o usuário clica na que considera correta.
3.  **Validação**: Ao clicar, o jogo preenche o campo de resposta e verifica se está certa.
    - ✅ **Acerto**: +10 pontos + bônus de sequência (até +20). A sequência de acertos aumenta.
    - ❌ **Erro**: a sequência zera e a resposta correta é revelada.
4.  **Feedback Visual**: borda verde/pulse no acerto, shake vermelho no erro, mensagem instantânea.
5.  **Timer**: contagem regressiva no canto superior; fica vermelho e pulsante nos últimos 10 segundos.
6.  **HUD**: exibe pontuação, tempo, vidas (quando aplicável), acertos, erros, sequência atual e barra de XP.

### Acessibilidade e Mobile
- Respostas podem ser selecionadas por mouse/toque ou teclado.
- Use as setas para navegar entre respostas e `Enter`/`Espaço` para responder.
- Controles `A-` e `A+` ajustam o tamanho do texto e ficam salvos no navegador.
- Feedback de acerto/erro usa regiões `aria-live` para leitores de tela.

### Fim de Jogo
- Dispara quando o tempo chega a zero ou ao voltar manualmente ao menu.
- Mostra pontuação final, acertos, erros e maior sequência.
- Sistema de estrelas (⭐ a ⭐⭐⭐) baseado na taxa de acerto.
- Permite compartilhar o resultado; no PC copia para a área de transferência, no mobile usa compartilhamento nativo quando disponível.

### Detalhes técnicos
- Divisões sempre resultam em números inteiros; subtrações nunca geram negativos.
- Distratores são gerados próximos ao valor correto.
- Conquistas, avatar, ranking e preferências são persistidos via localStorage.

## 🛠️ Como Executar

### Desenvolvimento (local)

ES modules exigem servir via HTTP (não `file://`):

```bash
python -m http.server 8000
# ou
npx serve .
```

Abrir `http://localhost:8000` no navegador.

### Produção

O jogo é uma aplicação estática e está integrado ao índice principal do projeto.
No GitHub Pages, acesse-o pelo item **Jogo de Matemática** no menu lateral.

## 📝 Próximos Passos

- [ ] Implementar testes automatizados.
- [ ] Painel do professor com turmas e ranking centralizado.
- [ ] Sincronização de progresso entre dispositivos.
- [ ] Melhorias de acessibilidade avançadas.
