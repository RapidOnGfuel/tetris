const gameArea = document.getElementById('game-area');
const nextPieceAreas = [
    document.getElementById('next-piece-1'),
    document.getElementById('next-piece-2'),
    document.getElementById('next-piece-3')
];
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const width = 10;
const height = 18;
let score = 0;
let highScore = localStorage.getItem('tetrisHighScore') || 0;
let timerId;
let currentPosition = 4;
let currentRotation = 0;

// Tetrominoes
const tetrominoes = [
    // I
    [[1, width+1, width*2+1, width*3+1], [width, width+1, width+2, width+3]],
    // J
    [[1, width+1, width*2+1, 2], [width, width+1, width+2, width*2+2], [1, width+1, width*2+1, width*2], [width, width*2, width*2+1, width*2+2]],
    // L
    [[1, width+1, width*2+1, 0], [width, width+1, width+2, width*2], [1, width+1, width*2+1, width*2+2], [width, width+1, width+2, 2]],
    // O
    [[0, 1, width, width+1]],
    // S
    [[1, 2, width, width+1], [0, width, width+1, width*2+1]],
    // T
    [[1, width, width+1, width+2], [1, width+1, width+2, width*2+1], [width, width+1, width+2, width*2+1], [1, width, width+1, width*2]],
    // Z
    [[0, 1, width+1, width+2], [1, width, width+1, width*2]]
];

const colors = ['cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'];

let currentTetromino = Math.floor(Math.random() * tetrominoes.length);
let nextTetrominoes = [
    Math.floor(Math.random() * tetrominoes.length),
    Math.floor(Math.random() * tetrominoes.length),
    Math.floor(Math.random() * tetrominoes.length)
];
let current = tetrominoes[currentTetromino][currentRotation];

// Create game grid
for (let i = 0; i < width * height; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    gameArea.appendChild(cell);
}

let cells = Array.from(document.querySelectorAll('.game-area .cell'));

// Initialize high score display
highScoreDisplay.textContent = highScore;

// Draw tetromino
function draw() {
    current.forEach(index => {
        cells[currentPosition + index].classList.add('active');
        cells[currentPosition + index].style.backgroundColor = colors[currentTetromino];
    });
}

// Undraw tetromino
function undraw() {
    current.forEach(index => {
        cells[currentPosition + index].classList.remove('active');
        cells[currentPosition + index].style.backgroundColor = '';
    });
}

// Draw next tetrominoes
function drawNext() {
    nextPieceAreas.forEach((area, i) => {
        area.innerHTML = '';
        const nextTetromino = tetrominoes[nextTetrominoes[i]][0];
        nextTetromino.forEach(index => {
            const x = index % width;
            const y = Math.floor(index / width);
            const block = document.createElement('div');
            block.style.width = '20px';
            block.style.height = '20px';
            block.style.backgroundColor = colors[nextTetrominoes[i]];
            block.style.position = 'absolute';
            block.style.left = `${x * 20}px`;
            block.style.top = `${y * 20}px`;
            area.appendChild(block);
        });
    });
}

// Move down
function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
}

// Freeze
function freeze() {
    if (current.some(index => cells[currentPosition + index + width]?.classList.contains('taken') || currentPosition + index + width >= width * height)) {
        current.forEach(index => cells[currentPosition + index].classList.add('taken'));
        currentTetromino = nextTetrominoes.shift();
        nextTetrominoes.push(Math.floor(Math.random() * tetrominoes.length));
        currentRotation = 0;
        current = tetrominoes[currentTetromino][currentRotation];
        currentPosition = 4;
        draw();
        drawNext();
        addScore();
        gameOver();
    }
}

// Move left
function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
    if (!isAtLeftEdge) currentPosition -= 1;
    if (current.some(index => cells[currentPosition + index].classList.contains('taken'))) {
        currentPosition += 1;
    }
    draw();
}

// Move right
function moveRight() {
    undraw();
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
    if (!isAtRightEdge) currentPosition += 1;
    if (current.some(index => cells[currentPosition + index].classList.contains('taken'))) {
        currentPosition -= 1;
    }
    draw();
}

// Rotate
function rotate() {
    undraw();
    const nextRotation = (currentRotation + 1) % tetrominoes[currentTetromino].length;
    const nextPattern = tetrominoes[currentTetromino][nextRotation];
    
    const isValidRotation = nextPattern.every(index => {
        const x = (currentPosition + index) % width;
        return x >= 0 && x < width && !cells[currentPosition + index]?.classList.contains('taken');
    });

    if (isValidRotation) {
        currentRotation = nextRotation;
        current = nextPattern;
    }
    draw();
}

// Add score
function addScore() {
    for (let i = 0; i < height; i++) {
        const row = Array.from({ length: width }, (_, j) => i * width + j);
        if (row.every(index => cells[index].classList.contains('taken'))) {
            score += 10;
            scoreDisplay.innerHTML = score;
            row.forEach(index => {
                cells[index].classList.remove('taken');
                cells[index].classList.remove('active');
                cells[index].style.backgroundColor = '';
            });
            const cellsRemoved = cells.splice(i * width, width);
            cells = cellsRemoved.concat(cells);
            cells.forEach(cell => gameArea.appendChild(cell));
        }
    }
}

// Game over
function gameOver() {
    if (current.some(index => cells[currentPosition + index].classList.contains('taken'))) {
        clearInterval(timerId);
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('tetrisHighScore', highScore);
            highScoreDisplay.textContent = highScore;
        }
        alert('Game Over');
    }
}

// Control
function control(e) {
    if (e.keyCode === 37) {
        moveLeft();
    } else if (e.keyCode === 38) {
        rotate();
    } else if (e.keyCode === 39) {
        moveRight();
    } else if (e.keyCode === 40) {
        moveDown();
    }
}

document.addEventListener('keydown', control);

drawNext();
timerId = setInterval(moveDown, 1000);