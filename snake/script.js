const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menuScreen = document.getElementById('menuScreen');
const gameContainer = document.getElementById('gameContainer');
const score1Element = document.getElementById('score1');
const score2Element = document.getElementById('score2');
const winnerDisplay = document.getElementById('winnerDisplay');
const winnerText = document.getElementById('winnerText');
const singlePlayerBtn = document.getElementById('singlePlayerBtn');
const versusBtn = document.getElementById('versusBtn');
const menuBtn = document.getElementById('menuBtn');

const gridSize = 20;
let gameMode = 'single';
let snake1 = [];
let snake2 = [];
let food = {};
let direction1 = 'right';
let direction2 = 'left';
let score1 = 0;
let score2 = 0;
let isGameOver = false;
let gameRunning = false;
let gameLoop = null;
let direction1ChangedThisTick = false;
let direction2ChangedThisTick = false;

function initGame() {
    snake1 = [{ x: 5, y: 10 }];
    direction1 = 'right';
    direction1ChangedThisTick = false;
    score1 = 0;
    score1Element.textContent = 'P1: 0';
    
    snake2 = [{ x: 15, y: 5 }];
    direction2 = 'left';
    direction2ChangedThisTick = false;
    score2 = 0;
    score2Element.textContent = 'P2: 0';
    
    isGameOver = false;
    generateFood();
    updateScoreDisplay();
}

function generateFood() {
    let validPosition = false;
    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize))
        };
        
        validPosition = !snake1.some(seg => seg.x === food.x && seg.y === food.y) &&
                       !snake2.some(seg => seg.x === food.x && seg.y === food.y);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < snake1.length; i++) {
        ctx.fillStyle = i === 0 ? '#4CAF50' : '#8BC34A';
        ctx.fillRect(snake1[i].x * gridSize, snake1[i].y * gridSize, gridSize - 2, gridSize - 2);
    }
    
    if (gameMode === 'versus') {
        for (let i = 0; i < snake2.length; i++) {
            ctx.fillStyle = i === 0 ? '#FF5722' : '#FF8A65';
            ctx.fillRect(snake2[i].x * gridSize, snake2[i].y * gridSize, gridSize - 2, gridSize - 2);
        }
    }
    
    ctx.fillStyle = '#FFEB3B';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function moveSnake(snake, direction) {
    const head = { x: snake[0].x, y: snake[0].y };
    
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    if (head.x < 0) head.x = canvas.width / gridSize - 1;
    if (head.x >= canvas.width / gridSize) head.x = 0;
    if (head.y < 0) head.y = canvas.height / gridSize - 1;
    if (head.y >= canvas.height / gridSize) head.y = 0;
    
    snake.unshift(head);
    return head;
}

function checkCollisionWithSnake(head, otherSnake) {
    for (let i = 0; i < otherSnake.length; i++) {
        if (head.x === otherSnake[i].x && head.y === otherSnake[i].y) {
            return true;
        }
    }
    return false;
}

function checkSelfCollision(snake) {
    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function getScoreWinner() {
    if (score1 > score2) return 1;
    if (score2 > score1) return 2;
    return 0;
}

function update() {
    if (isGameOver) return;

    const previousHead1 = { x: snake1[0].x, y: snake1[0].y };
    const head1 = moveSnake(snake1, direction1);
    
    if (checkSelfCollision(snake1)) {
        endGame(2);
        return;
    }
    
    if (gameMode === 'versus') {
        const previousHead2 = { x: snake2[0].x, y: snake2[0].y };
        const head2 = moveSnake(snake2, direction2);
        
        if (checkSelfCollision(snake2)) {
            endGame(1);
            return;
        }
        
        if (head1.x === head2.x && head1.y === head2.y) {
            endGame(getScoreWinner());
            return;
        }

        const swappedHeads = head1.x === previousHead2.x &&
            head1.y === previousHead2.y &&
            head2.x === previousHead1.x &&
            head2.y === previousHead1.y;

        if (swappedHeads) {
            endGame(getScoreWinner());
            return;
        }
        
        if (checkCollisionWithSnake(head1, snake2)) {
            endGame(2);
            return;
        }
        
        if (checkCollisionWithSnake(head2, snake1)) {
            endGame(1);
            return;
        }
    }
    
    if (head1.x === food.x && head1.y === food.y) {
        score1++;
        score1Element.textContent = `P1: ${score1}`;
        generateFood();
    } else {
        snake1.pop();
    }
    
    if (gameMode === 'versus') {
        if (snake2[0].x === food.x && snake2[0].y === food.y) {
            score2++;
            score2Element.textContent = `P2: ${score2}`;
            generateFood();
        } else {
            snake2.pop();
        }
    }
    
    draw();
    direction1ChangedThisTick = false;
    direction2ChangedThisTick = false;
}

function endGame(winner) {
    isGameOver = true;
    gameRunning = false;
    
    if (gameMode === 'single') {
        winnerText.textContent = `Game Over! Pontuação: ${score1}`;
    } else {
        if (winner === 0) {
            winnerText.textContent = 'Empate!';
        } else if (winner === 1) {
            winnerText.textContent = 'Jogador 1 Venceu!';
        } else {
            winnerText.textContent = 'Jogador 2 Venceu!';
        }
    }
    
    winnerDisplay.classList.remove('hidden');
}

function updateScoreDisplay() {
    if (gameMode === 'single') {
        score2Element.classList.add('hidden');
    } else {
        score2Element.classList.remove('hidden');
    }
}

function startGame(mode) {
    gameMode = mode;
    menuScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    winnerDisplay.classList.add('hidden');
    
    initGame();
    draw();
    
    if (gameLoop) clearInterval(gameLoop);
    gameRunning = true;
    gameLoop = setInterval(update, 100);
}

function showMenu() {
    gameContainer.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    winnerDisplay.classList.add('hidden');
    
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    gameRunning = false;
}

function canChangeDirection(currentDirection, nextDirection) {
    return !(
        (currentDirection === 'up' && nextDirection === 'down') ||
        (currentDirection === 'down' && nextDirection === 'up') ||
        (currentDirection === 'left' && nextDirection === 'right') ||
        (currentDirection === 'right' && nextDirection === 'left')
    );
}

function changeDirection1(event) {
    const keyPressed = event.key;
    const directions = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right'
    };
    const nextDirection = directions[keyPressed];

    if (!direction1ChangedThisTick && nextDirection && canChangeDirection(direction1, nextDirection)) {
        direction1 = nextDirection;
        direction1ChangedThisTick = true;
    }
}

function changeDirection2(event) {
    const keyPressed = event.key.toLowerCase();
    const directions = {
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right'
    };
    const nextDirection = directions[keyPressed];

    if (!direction2ChangedThisTick && nextDirection && canChangeDirection(direction2, nextDirection)) {
        direction2 = nextDirection;
        direction2ChangedThisTick = true;
    }
}

function handleKeyDown(event) {
    if (!gameRunning) return;
    
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
        event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        changeDirection1(event);
    }
    
    if (gameMode === 'versus') {
        const key = event.key.toLowerCase();
        if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
            changeDirection2(event);
        }
    }
}

singlePlayerBtn.addEventListener('click', () => startGame('single'));
versusBtn.addEventListener('click', () => startGame('versus'));
menuBtn.addEventListener('click', showMenu);
document.addEventListener('keydown', handleKeyDown);
