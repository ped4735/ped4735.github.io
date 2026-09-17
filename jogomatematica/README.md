# Jogo de Matemática

Este é um projeto simples de um jogo de matemática interativo que utiliza funcionalidades de arrastar e soltar (Drag and Drop) para responder a questões matemáticas.

## 🚀 Tecnologias Utilizadas

O projeto foi desenvolvido utilizando as seguintes tecnologias:

- **HTML5**: Estrutura da página.
- **CSS3**: Estilização customizada.
- **Bootstrap 5.3.0**: Framework CSS para layout responsivo.
- **Interact.js**: Biblioteca JavaScript para lidar com interações de arrastar e soltar.

## 📂 Estrutura do Projeto

O projeto consiste nos seguintes arquivos:

- `index.html`: Ponto de entrada da aplicação, contendo a estrutura da questão e das opções de resposta.
- `style.css`: Definições visuais para a zona de drop (dropzone) e para os elementos arrastáveis.
- `gamemtm.js`: Lógica de interação utilizando a biblioteca Interact.js.

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
