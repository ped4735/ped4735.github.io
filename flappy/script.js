const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValueDisplay = document.getElementById('scoreValue');
const highScoreDisplay = document.getElementById('highScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const finalHighScoreDisplay = document.getElementById('finalHighScore');
const restartButton = document.getElementById('restartButton');

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;
const GROUND_HEIGHT = 62;
const STORAGE_KEY = 'flappyBirdHighScore';

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const settings = {
    gravity: 0.36,
    lift: -7.2,
    pipeSpeed: 2.25,
    pipeWidth: 58,
    pipeGap: 130,
    pipeInterval: 96,
    pipeTopMin: 48,
    playableBottom: CANVAS_HEIGHT - GROUND_HEIGHT,
};

function getStorage() {
    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

function readHighScore(storage = getStorage()) {
    if (!storage) return 0;

    try {
        const value = Number.parseInt(storage.getItem(STORAGE_KEY), 10);
        return Number.isFinite(value) && value > 0 ? value : 0;
    } catch {
        return 0;
    }
}

function saveHighScore(storage = getStorage(), score = 0) {
    const previous = readHighScore(storage);
    const next = Math.max(previous, Math.max(0, Math.floor(score)));

    if (storage && next > previous) {
        try {
            storage.setItem(STORAGE_KEY, String(next));
        } catch {
            return next;
        }
    }

    return next;
}

function createInitialState(storage = getStorage()) {
    return {
        status: 'ready',
        frame: 0,
        score: 0,
        highScore: readHighScore(storage),
        groundOffset: 0,
        cloudOffset: 0,
        bird: {
            x: 58,
            y: CANVAS_HEIGHT / 2 - 16,
            width: 36,
            height: 32,
            velocityY: 0,
        },
        pipes: [],
    };
}

let state = createInitialState();
let animationFrameId = null;
let birdSprite = createBirdSprite();

function createBirdSprite() {
    if (!document.createElement) return null;

    const sprite = document.createElement('canvas');
    sprite.width = 72;
    sprite.height = 64;
    const spriteCtx = sprite.getContext('2d');

    spriteCtx.fillStyle = '#f9d84a';
    spriteCtx.strokeStyle = '#7b5f13';
    spriteCtx.lineWidth = 3;
    spriteCtx.beginPath();
    spriteCtx.ellipse(34, 34, 25, 19, -0.08, 0, Math.PI * 2);
    spriteCtx.fill();
    spriteCtx.stroke();

    spriteCtx.fillStyle = '#ffe873';
    spriteCtx.beginPath();
    spriteCtx.ellipse(25, 38, 12, 9, -0.5, 0, Math.PI * 2);
    spriteCtx.fill();

    spriteCtx.fillStyle = '#fff';
    spriteCtx.beginPath();
    spriteCtx.arc(45, 27, 7, 0, Math.PI * 2);
    spriteCtx.fill();

    spriteCtx.fillStyle = '#16262a';
    spriteCtx.beginPath();
    spriteCtx.arc(48, 27, 3, 0, Math.PI * 2);
    spriteCtx.fill();

    spriteCtx.fillStyle = '#f28c28';
    spriteCtx.strokeStyle = '#8a3d12';
    spriteCtx.lineWidth = 2;
    spriteCtx.beginPath();
    spriteCtx.moveTo(57, 34);
    spriteCtx.lineTo(70, 28);
    spriteCtx.lineTo(70, 40);
    spriteCtx.closePath();
    spriteCtx.fill();
    spriteCtx.stroke();

    return sprite;
}

function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, settings.playableBottom);
    sky.addColorStop(0, '#57b9df');
    sky.addColorStop(0.62, '#b9eff4');
    sky.addColorStop(1, '#eaf9d7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawCloud(48 - state.cloudOffset % 380, 78, 0.85);
    drawCloud(198 - state.cloudOffset % 420, 135, 0.62);
    drawCloud(335 - state.cloudOffset % 380, 62, 0.75);

    ctx.fillStyle = '#88c96a';
    ctx.beginPath();
    ctx.moveTo(0, settings.playableBottom - 30);
    ctx.quadraticCurveTo(70, settings.playableBottom - 70, 145, settings.playableBottom - 32);
    ctx.quadraticCurveTo(225, settings.playableBottom + 4, 320, settings.playableBottom - 44);
    ctx.lineTo(320, settings.playableBottom);
    ctx.lineTo(0, settings.playableBottom);
    ctx.closePath();
    ctx.fill();
}

function drawCloud(x, y, scale) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.beginPath();
    ctx.arc(x, y, 18 * scale, 0, Math.PI * 2);
    ctx.arc(x + 20 * scale, y - 8 * scale, 25 * scale, 0, Math.PI * 2);
    ctx.arc(x + 46 * scale, y, 20 * scale, 0, Math.PI * 2);
    ctx.rect(x - 1 * scale, y, 48 * scale, 16 * scale);
    ctx.fill();
}

function drawGround() {
    const groundY = settings.playableBottom;
    ctx.fillStyle = '#d9b45f';
    ctx.fillRect(0, groundY, CANVAS_WIDTH, GROUND_HEIGHT);

    ctx.fillStyle = '#6bbf50';
    ctx.fillRect(0, groundY, CANVAS_WIDTH, 14);

    ctx.fillStyle = '#b98f45';
    for (let x = -40 - state.groundOffset; x < CANVAS_WIDTH + 40; x += 34) {
        ctx.fillRect(x, groundY + 24, 18, 5);
        ctx.fillRect(x + 12, groundY + 43, 24, 5);
    }
}

function drawPipe(pipe) {
    drawPipePart(pipe.x, 0, pipe.topHeight, true);
    drawPipePart(
        pipe.x,
        pipe.topHeight + settings.pipeGap,
        settings.playableBottom - pipe.topHeight - settings.pipeGap,
        false
    );
}

function drawPipePart(x, y, height, isTop) {
    if (height <= 0) return;

    const pipeGradient = ctx.createLinearGradient(x, 0, x + settings.pipeWidth, 0);
    pipeGradient.addColorStop(0, '#277d3a');
    pipeGradient.addColorStop(0.28, '#60c559');
    pipeGradient.addColorStop(0.7, '#43a64b');
    pipeGradient.addColorStop(1, '#1f6b32');

    ctx.fillStyle = pipeGradient;
    ctx.strokeStyle = '#14522a';
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, settings.pipeWidth, height);
    ctx.strokeRect(x, y, settings.pipeWidth, height);

    const capHeight = 18;
    const capY = isTop ? y + height - capHeight : y;
    ctx.fillStyle = '#58bd51';
    ctx.fillRect(x - 5, capY, settings.pipeWidth + 10, capHeight);
    ctx.strokeRect(x - 5, capY, settings.pipeWidth + 10, capHeight);
}

function drawBird() {
    const bird = state.bird;
    const angle = Math.max(-0.55, Math.min(0.85, bird.velocityY * 0.08));

    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(angle);

    if (birdSprite) {
        ctx.drawImage(birdSprite, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    } else {
        ctx.fillStyle = '#f9d84a';
        ctx.beginPath();
        ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawScene() {
    drawBackground();
    state.pipes.forEach(drawPipe);
    drawGround();
    drawBird();
}

function updateBird() {
    state.bird.velocityY += settings.gravity;
    state.bird.y += state.bird.velocityY;

    if (state.bird.y < -4 || state.bird.y + state.bird.height > settings.playableBottom) {
        endGame();
    }
}

function spawnPipe() {
    const maxTop = settings.playableBottom - settings.pipeGap - 76;
    const topHeight = settings.pipeTopMin + Math.random() * (maxTop - settings.pipeTopMin);

    state.pipes.push({
        x: CANVAS_WIDTH + 8,
        topHeight,
        passed: false,
    });
}

function updatePipes() {
    state.frame += 1;

    if (state.frame === 35 || state.frame % settings.pipeInterval === 0) {
        spawnPipe();
    }

    state.pipes.forEach((pipe) => {
        pipe.x -= settings.pipeSpeed;

        if (!pipe.passed && pipe.x + settings.pipeWidth < state.bird.x) {
            pipe.passed = true;
            state.score += 1;
            state.highScore = Math.max(state.highScore, state.score);
            updateScoreDisplay();
        }
    });

    state.pipes = state.pipes.filter((pipe) => pipe.x + settings.pipeWidth > -10);
}

function checkCollisions() {
    const hitbox = {
        x: state.bird.x + 6,
        y: state.bird.y + 5,
        width: state.bird.width - 12,
        height: state.bird.height - 10,
    };

    for (const pipe of state.pipes) {
        const withinX = hitbox.x < pipe.x + settings.pipeWidth && hitbox.x + hitbox.width > pipe.x;
        const hitsTop = hitbox.y < pipe.topHeight;
        const hitsBottom = hitbox.y + hitbox.height > pipe.topHeight + settings.pipeGap;

        if (withinX && (hitsTop || hitsBottom)) {
            endGame();
            return;
        }
    }
}

function updateParallax() {
    state.groundOffset = (state.groundOffset + settings.pipeSpeed) % 34;
    state.cloudOffset = (state.cloudOffset + 0.22) % 420;
}

function updateScoreDisplay() {
    scoreValueDisplay.textContent = `Score: ${state.score}`;
    highScoreDisplay.textContent = `Recorde: ${state.highScore}`;
}

function gameLoop() {
    if (state.status !== 'playing') return;

    updateParallax();
    updateBird();
    updatePipes();
    checkCollisions();
    drawScene();

    if (state.status === 'playing') {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function flap() {
    state.bird.velocityY = settings.lift;
}

function startGame() {
    cancelAnimationFrame(animationFrameId);
    state = createInitialState();
    state.status = 'playing';
    flap();

    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    updateScoreDisplay();
    drawScene();

    animationFrameId = requestAnimationFrame(gameLoop);
}

function endGame() {
    if (state.status === 'over') return;

    state.status = 'over';
    cancelAnimationFrame(animationFrameId);
    state.highScore = saveHighScore(getStorage(), state.score);
    updateScoreDisplay();

    finalScoreDisplay.textContent = state.score;
    finalHighScoreDisplay.textContent = state.highScore;
    gameOverScreen.style.display = 'block';
}

function handleInput() {
    if (state.status === 'playing') {
        flap();
        return;
    }

    startGame();
}

function showInitialScreen() {
    state = createInitialState();
    updateScoreDisplay();
    drawScene();
    startScreen.style.display = 'block';
    gameOverScreen.style.display = 'none';
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        handleInput();
    }
});

canvas.addEventListener('click', handleInput);
canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    handleInput();
}, { passive: false });

restartButton.addEventListener('click', startGame);

showInitialScreen();

if (typeof module !== 'undefined') {
    module.exports = {
        createInitialState,
        readHighScore,
        saveHighScore,
        STORAGE_KEY,
    };
}
