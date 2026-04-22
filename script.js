const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const linesEl = document.getElementById("lines");
const missionTitleEl = document.getElementById("mission-title");
const missionProgressEl = document.getElementById("mission-progress");
const restartButton = document.getElementById("restart");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const resumeButton = document.getElementById("resume");

const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnRotate = document.getElementById("btn-rotate");
const btnDown = document.getElementById("btn-down");
const btnDrop = document.getElementById("btn-drop");
const btnPause = document.getElementById("btn-pause");

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
const MISSIONS = [
  { title: "줄 2개 지우기", target: 2, metric: "lines" },
  { title: "한 번에 2줄 지우기", target: 2, metric: "singleClear" },
  { title: "점수 1,500점 달성", target: 1500, metric: "score" },
  { title: "레벨 4 달성", target: 4, metric: "level" },
  { title: "줄 12개 지우기", target: 12, metric: "lines" },
];

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
let clearAnimation;
let missionIndex;
let missionValue;

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function getRandomPiece() {
  const types = Object.keys(SHAPES);
  const type = types[Math.floor(Math.random() * types.length)];
  const matrix = SHAPES[type].map((row) => [...row]);
  return spawnPosition({ type, matrix, x: 0, y: 0 });
}

function spawnPosition(piece) {
  return {
    ...piece,
    x: Math.floor(COLS / 2) - Math.ceil(piece.matrix[0].length / 2),
    y: 0,
  };
}

function resetGame() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  missionIndex = 0;
  missionValue = 0;
  dropInterval = 1000;
  dropCounter = 0;
  lastTime = 0;
  isPaused = false;
  isGameOver = false;
  clearAnimation = null;
  current = getRandomPiece();
  nextPiece = getRandomPiece();
  hideOverlay();
  updateHUD();
  updateMissionUI();

  if (collides(current)) {
    endGame();
  }

  if (animationId) cancelAnimationFrame(animationId);
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

function drawGarlicCell(targetCtx, x, y, size, color, peeled = false, popProgress = 0) {
  const px = x * size;
  const py = y * size;
  const centerX = px + size / 2;
  const centerY = py + size * 0.58;
  const bulbOffset = size * 0.17;
  const bulbRadius = size * 0.24 * (1 - popProgress * 0.32);
  const stemWidth = size * 0.13 * (1 - popProgress * 0.45);
  const stemHeight = size * 0.18 * (1 - popProgress * 0.4);

  targetCtx.save();
  targetCtx.globalAlpha = 1 - popProgress * 0.8;

  if (!peeled) {
    targetCtx.fillStyle = "rgba(0, 0, 0, 0.2)";
    targetCtx.beginPath();
    targetCtx.ellipse(centerX, py + size * 0.9, size * 0.33, size * 0.09, 0, 0, Math.PI * 2);
    targetCtx.fill();
  }

  targetCtx.fillStyle = peeled ? "#fff8eb" : color;
  targetCtx.beginPath();
  targetCtx.arc(centerX - bulbOffset, centerY, bulbRadius, 0, Math.PI * 2);
  targetCtx.arc(centerX, centerY, bulbRadius * 1.08, 0, Math.PI * 2);
  targetCtx.arc(centerX + bulbOffset, centerY, bulbRadius, 0, Math.PI * 2);
  targetCtx.fill();

  targetCtx.strokeStyle = peeled ? "rgba(181, 156, 104, 0.45)" : "rgba(117, 97, 61, 0.55)";
  targetCtx.lineWidth = Math.max(1, size * 0.06);
  targetCtx.beginPath();
  targetCtx.moveTo(centerX, py + size * 0.34);
  targetCtx.lineTo(centerX, py + size * 0.74);
  targetCtx.moveTo(centerX - size * 0.1, py + size * 0.46);
  targetCtx.lineTo(centerX - size * 0.1, py + size * 0.74);
  targetCtx.moveTo(centerX + size * 0.1, py + size * 0.46);
  targetCtx.lineTo(centerX + size * 0.1, py + size * 0.74);
  targetCtx.stroke();

  targetCtx.fillStyle = peeled ? "#f0d8a2" : "#bfa170";
  drawRoundedRect(targetCtx, centerX - stemWidth / 2, py + size * 0.08, stemWidth, stemHeight, size * 0.06);
  targetCtx.fill();
  targetCtx.restore();
}

function drawCell(x, y, type, peeled = false, popProgress = 0) {
  drawGarlicCell(ctx, x, y, BLOCK, COLORS[type], peeled, popProgress);
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const type = board[y][x];
      if (!type) continue;

      let peeled = false;
      let popProgress = 0;
      if (clearAnimation?.rows.includes(y)) {
        peeled = true;
        popProgress = Math.min(1, clearAnimation.elapsed / clearAnimation.duration);
      }
      drawCell(x, y, type, peeled, popProgress);
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
      drawGarlicCell(
        nextCtx,
        (offsetX / blockSize) + x,
        (offsetY / blockSize) + y,
        blockSize,
        COLORS[nextPiece.type],
      );
    });
  });
}

function drawPiece(piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return;
      drawCell(piece.x + x, piece.y + y, piece.type);
    });
  });
}

function collides(piece) {
  return piece.matrix.some((row, y) => row.some((value, x) => {
    if (!value) return false;
    const nextX = piece.x + x;
    const nextY = piece.y + y;

    if (nextX < 0 || nextX >= COLS || nextY >= ROWS) return true;
    if (nextY < 0) return false;
    return board[nextY][nextX] !== null;
  }));
}

function mergePiece(piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return;
      const boardY = piece.y + y;
      if (boardY >= 0) board[boardY][piece.x + x] = piece.type;
    });
  });
}

function clearLines() {
  const rows = [];
  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (board[y].every((cell) => cell !== null)) rows.push(y);
  }

  if (rows.length === 0) return false;
  clearAnimation = { rows, elapsed: 0, duration: 240 };
  return true;
}

function applyMissionProgress(clearedLines = 0) {
  const mission = MISSIONS[missionIndex];

  switch (mission.metric) {
    case "lines":
      missionValue = lines;
      break;
    case "singleClear":
      missionValue = Math.max(missionValue, clearedLines);
      break;
    case "score":
      missionValue = score;
      break;
    case "level":
      missionValue = level;
      break;
    default:
      break;
  }

  if (missionValue >= mission.target) {
    missionIndex = (missionIndex + 1) % MISSIONS.length;
    missionValue = 0;
    showOverlay("🎉 미션 클리어! 다음 미션 시작!");
    resumeButton.classList.add("hidden");
    window.setTimeout(() => {
      if (!isPaused && !isGameOver) hideOverlay();
      updateMissionUI();
    }, 900);
    return;
  }

  updateMissionUI();
}

function finalizeLineClear() {
  if (!clearAnimation) return;
  const cleared = clearAnimation.rows.length;
  const rowSet = new Set(clearAnimation.rows);

  board = board.filter((_, idx) => !rowSet.has(idx));
  while (board.length < ROWS) board.unshift(Array(COLS).fill(null));

  lines += cleared;
  score += SCORE_BY_LINES[cleared] * level;
  level = Math.floor(lines / 10) + 1;
  dropInterval = Math.max(120, 1000 - (level - 1) * 80);

  updateHUD();
  applyMissionProgress(cleared);
  clearAnimation = null;
  spawnPiece();
}

function spawnPiece() {
  current = spawnPosition(nextPiece);
  nextPiece = getRandomPiece();
  if (collides(current)) endGame();
}

function lockPiece() {
  mergePiece(current);
  const didClear = clearLines();
  if (!didClear) spawnPiece();
}

function movePiece(direction) {
  if (isPaused || isGameOver || clearAnimation) return;
  current.x += direction;
  if (collides(current)) current.x -= direction;
}

function dropPiece() {
  if (isPaused || isGameOver || clearAnimation) return;
  current.y += 1;
  if (collides(current)) {
    current.y -= 1;
    lockPiece();
  }
  dropCounter = 0;
}

function hardDrop() {
  if (isPaused || isGameOver || clearAnimation) return;
  while (!collides({ ...current, y: current.y + 1 })) current.y += 1;
  lockPiece();
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
  if (isPaused || isGameOver || clearAnimation) return;

  const rotated = rotateMatrix(current.matrix);
  const originalX = current.x;
  const kicks = [0, -1, 1, -2, 2];

  for (const offset of kicks) {
    const candidate = { ...current, x: originalX + offset, matrix: rotated };
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

function updateMissionUI() {
  const mission = MISSIONS[missionIndex];
  missionTitleEl.textContent = mission.title;
  missionProgressEl.textContent = `${Math.min(missionValue, mission.target)} / ${mission.target}`;
}

function showOverlay(message) {
  overlayText.textContent = message;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
  resumeButton.classList.add("hidden");
}

function endGame() {
  isGameOver = true;
  resumeButton.classList.add("hidden");
  showOverlay("게임 오버! 다시 시작 버튼을 눌러주세요.");
}

function togglePause() {
  if (isGameOver) return;
  isPaused = !isPaused;

  if (isPaused) {
    showOverlay("일시정지");
    resumeButton.classList.remove("hidden");
  } else {
    hideOverlay();
  }
}

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;

  if (!isPaused && !isGameOver) {
    if (clearAnimation) {
      clearAnimation.elapsed += delta;
      if (clearAnimation.elapsed >= clearAnimation.duration) finalizeLineClear();
    } else {
      dropCounter += delta;
      if (dropCounter >= dropInterval) dropPiece();
    }
  }

  drawBoard();
  drawNextPiece();
  if (!isGameOver) drawPiece(current);

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

function bindControl(button, action, repeat = false) {
  if (!button) return;
  let timer = null;

  const start = (event) => {
    event.preventDefault();
    action();
    if (repeat && !timer) timer = window.setInterval(action, 120);
  };

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  button.addEventListener("mousedown", start);
  button.addEventListener("mouseup", stop);
  button.addEventListener("mouseleave", stop);
  button.addEventListener("touchstart", start, { passive: false });
  button.addEventListener("touchend", stop);
  button.addEventListener("touchcancel", stop);
}

bindControl(btnLeft, () => movePiece(-1), true);
bindControl(btnRight, () => movePiece(1), true);
bindControl(btnRotate, rotatePiece);
bindControl(btnDown, dropPiece, true);
bindControl(btnDrop, hardDrop);
bindControl(btnPause, togglePause);

resumeButton.addEventListener("click", () => {
  if (isPaused && !isGameOver) togglePause();
});
restartButton.addEventListener("click", resetGame);

resetGame();
