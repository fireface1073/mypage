const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const linesEl = document.getElementById("lines");
const restartButton = document.getElementById("restart");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const COLORS = {
  I: "#f9f4e5",
  J: "#f2ead5",
  L: "#efe4cb",
  O: "#fff6df",
  S: "#ece3d2",
  T: "#f6eedf",
  Z: "#f0e6d0",
};

const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

const SCORE_BY_LINES = [0, 100, 300, 500, 800];

let board;
let current;
let nextPiece;
let score;
let lines;
let level;
let dropInterval;
let dropCounter;
let lastTime;
let isPaused;
let isGameOver;
let animationId;

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function getRandomPiece() {
  const types = Object.keys(SHAPES);
  const type = types[Math.floor(Math.random() * types.length)];
  const matrix = SHAPES[type].map((row) => [...row]);
  return spawnPosition({
    type,
    matrix,
    x: 0,
    y: 0,
  });
}

function spawnPosition(piece) {
  const target = piece;
  target.x = Math.floor(COLS / 2) - Math.ceil(target.matrix[0].length / 2);
  target.y = 0;
  return {
    ...target,
  };
}

function resetGame() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  dropInterval = 1000;
  dropCounter = 0;
  lastTime = 0;
  isPaused = false;
  isGameOver = false;
  current = getRandomPiece();
  nextPiece = getRandomPiece();
  hideOverlay();
  updateHUD();

  if (collides(current)) {
    endGame();
  }

  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  animationId = requestAnimationFrame(update);
}

function drawRoundedRect(targetCtx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  targetCtx.beginPath();
  targetCtx.moveTo(x + r, y);
  targetCtx.lineTo(x + width - r, y);
  targetCtx.quadraticCurveTo(x + width, y, x + width, y + r);
  targetCtx.lineTo(x + width, y + height - r);
  targetCtx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  targetCtx.lineTo(x + r, y + height);
  targetCtx.quadraticCurveTo(x, y + height, x, y + height - r);
  targetCtx.lineTo(x, y + r);
  targetCtx.quadraticCurveTo(x, y, x + r, y);
  targetCtx.closePath();
}

function drawGarlicCell(targetCtx, x, y, size, color) {
  const px = x * size;
  const py = y * size;
  const padding = Math.max(2, size * 0.1);
  const tileSize = size - padding * 2;
  const tileX = px + padding;
  const tileY = py + padding;
  const gradient = targetCtx.createLinearGradient(tileX, tileY, tileX, tileY + tileSize);
  gradient.addColorStop(0, "#fffdf8");
  gradient.addColorStop(1, color);

  drawRoundedRect(targetCtx, tileX, tileY, tileSize, tileSize, tileSize * 0.2);
  targetCtx.fillStyle = gradient;
  targetCtx.fill();
  targetCtx.strokeStyle = "rgba(140, 122, 92, 0.6)";
  targetCtx.lineWidth = Math.max(1, size * 0.07);
  targetCtx.stroke();
}

function drawCell(x, y, color) {
  drawGarlicCell(ctx, x, y, BLOCK, color);
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const type = board[y][x];
      if (type) {
        drawCell(x, y, COLORS[type]);
      }
    }
  }
}

function drawNextPiece() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const matrix = nextPiece.matrix;
  const blockSize = Math.floor(nextCanvas.width / 5);
  const pieceWidth = matrix[0].length * blockSize;
  const pieceHeight = matrix.length * blockSize;
  const offsetX = (nextCanvas.width - pieceWidth) / 2;
  const offsetY = (nextCanvas.height - pieceHeight) / 2;

  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return;
      drawGarlicCell(nextCtx, (offsetX / blockSize) + x, (offsetY / blockSize) + y, blockSize, COLORS[nextPiece.type]);
    });
  });
}

function drawPiece(piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return;
      drawCell(piece.x + x, piece.y + y, COLORS[piece.type]);
    });
  });
}

function collides(piece) {
  return piece.matrix.some((row, y) => {
    return row.some((value, x) => {
      if (!value) return false;
      const nextX = piece.x + x;
      const nextY = piece.y + y;

      if (nextX < 0 || nextX >= COLS || nextY >= ROWS) {
        return true;
      }

      if (nextY < 0) {
        return false;
      }

      return board[nextY][nextX] !== null;
    });
  });
}

function mergePiece(piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return;
      const boardY = piece.y + y;
      if (boardY >= 0) {
        board[boardY][piece.x + x] = piece.type;
      }
    });
  });
}

function clearLines() {
  let cleared = 0;

  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (board[y].every((cell) => cell !== null)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared += 1;
      y += 1;
    }
  }

  if (cleared > 0) {
    lines += cleared;
    score += SCORE_BY_LINES[cleared] * level;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(120, 1000 - (level - 1) * 80);
    updateHUD();
  }
}

function spawnPiece() {
  current = spawnPosition(nextPiece);
  nextPiece = getRandomPiece();
  if (collides(current)) {
    endGame();
  }
}

function hardDrop() {
  if (isPaused || isGameOver) return;

  while (!collides({ ...current, y: current.y + 1 })) {
    current.y += 1;
  }

  lockPiece();
}

function lockPiece() {
  mergePiece(current);
  clearLines();
  spawnPiece();
}

function movePiece(direction) {
  if (isPaused || isGameOver) return;

  current.x += direction;
  if (collides(current)) {
    current.x -= direction;
  }
}

function dropPiece() {
  if (isPaused || isGameOver) return;

  current.y += 1;
  if (collides(current)) {
    current.y -= 1;
    lockPiece();
  }
  dropCounter = 0;
}

function rotateMatrix(matrix) {
  const size = matrix.length;
  const rotated = Array.from({ length: size }, () => Array(size).fill(0));

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      rotated[x][size - 1 - y] = matrix[y][x];
    }
  }

  return rotated;
}

function rotatePiece() {
  if (isPaused || isGameOver) return;

  const rotated = rotateMatrix(current.matrix);
  const originalX = current.x;
  const kicks = [0, -1, 1, -2, 2];

  for (const offset of kicks) {
    const candidate = {
      ...current,
      x: originalX + offset,
      matrix: rotated,
    };

    if (!collides(candidate)) {
      current = candidate;
      return;
    }
  }
}

function updateHUD() {
  scoreEl.textContent = score.toLocaleString("ko-KR");
  levelEl.textContent = String(level);
  linesEl.textContent = String(lines);
}

function showOverlay(message) {
  overlayText.textContent = message;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

function endGame() {
  isGameOver = true;
  showOverlay("게임 오버! 다시 시작 버튼을 눌러주세요.");
}

function togglePause() {
  if (isGameOver) return;
  isPaused = !isPaused;

  if (isPaused) {
    showOverlay("일시정지 (P 키로 재개)");
  } else {
    hideOverlay();
  }
}

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;

  if (!isPaused && !isGameOver) {
    dropCounter += delta;
    if (dropCounter >= dropInterval) {
      dropPiece();
    }
  }

  drawBoard();
  drawNextPiece();
  if (!isGameOver) {
    drawPiece(current);
  }

  animationId = requestAnimationFrame(update);
}

window.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "ArrowLeft":
      movePiece(-1);
      break;
    case "ArrowRight":
      movePiece(1);
      break;
    case "ArrowDown":
      dropPiece();
      break;
    case "ArrowUp":
      rotatePiece();
      break;
    case "Space":
      event.preventDefault();
      hardDrop();
      break;
    case "KeyP":
      togglePause();
      break;
    default:
      break;
  }
});

restartButton.addEventListener("click", resetGame);

resetGame();
