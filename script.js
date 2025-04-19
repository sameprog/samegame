const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const cols = 10;
const rows = 15;
const blockSize = 32;
const imageCount = 4;
const images = [];

let board = [];
let score = 0;

// 画像読み込み
for (let i = 0; i < imageCount; i++) {
  const img = new Image();
  img.src = `img${i}.png`; // 例: img0.png〜img3.png
  images.push(img);
}

function initBoard() {
  board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.floor(Math.random() * imageCount))
  );
  score = 0;
  document.getElementById("gameOver").style.display = "none";
  drawBoard();
  checkGameOver();
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  board.forEach((row, y) => {
    row.forEach((imgIndex, x) => {
      if (imgIndex !== null) {
        ctx.drawImage(
          images[imgIndex],
          x * blockSize,
          y * blockSize,
          blockSize,
          blockSize
        );
      }
    });
  });

  document.getElementById("score").textContent = score;
}

function getConnected(x, y, target, visited = {}) {
  if (
    x < 0 || x >= cols || y < 0 || y >= rows ||
    board[y][x] !== target || visited[`${x},${y}`]
  ) return [];

  visited[`${x},${y}`] = true;
  return [
    [x, y],
    ...getConnected(x + 1, y, target, visited),
    ...getConnected(x - 1, y, target, visited),
    ...getConnected(x, y + 1, target, visited),
    ...getConnected(x, y - 1, target, visited)
  ];
}

function removeAndCollapse(connected) {
  connected.forEach(([x, y]) => {
    board[y][x] = null;
  });

  for (let x = 0; x < cols; x++) {
    let col = [];
    for (let y = 0; y < rows; y++) {
      if (board[y][x] !== null) col.push(board[y][x]);
    }
    for (let y = rows - 1; y >= 0; y--) {
      board[y][x] = col.length ? col.pop() : null;
    }
  }

  drawBoard();
  checkGameOver();
}

function hasMoves() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const val = board[y][x];
      if (val === null) continue;
      const connected = getConnected(x, y, val);
      if (connected.length >= 2) return true;
    }
  }
  return false;
}

function checkGameOver() {
  if (!hasMoves()) {
    const message = `🎉 ゲーム終了！あなたのスコアは ${score} 点です 🎉`;
    const gameOverEl = document.getElementById("gameOver");
    gameOverEl.textContent = message;
    gameOverEl.style.display = "block";
  }
}

canvas.addEventListener("click", (e) => {
  const x = Math.floor(e.offsetX / blockSize);
  const y = Math.floor(e.offsetY / blockSize);
  const imgIndex = board[y][x];
  if (imgIndex === null) return;

  const connected = getConnected(x, y, imgIndex);
  if (connected.length >= 2) {
    score += connected.length * connected.length;
    removeAndCollapse(connected);
  }
});

window.onload = () => {
  Promise.all(images.map(img => new Promise(resolve => {
    if (img.complete) {
      resolve(); // すでに読み込まれてたら即resolve
    } else {
      img.onload = () => {
        console.log(`loaded: ${img.src}`);
        resolve();
      };
    }
  }))).then(() => {
    console.log("All images loaded!");
    initBoard();
  });
};
