// I/O
require("readline").emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const keyEvents = {};

process.stdin.on("keypress", function(ch, key) {
  if (keyEvents[key.name]) keyEvents[key.name]();
  if (key && key.ctrl && key.name == "c") {
    IO.log("\n");
    process.exit();
  }
});

const IO = {
  log: process.stdout.write.bind(process.stdout),
  clear: () =>
    process.stdout.write(
      process.platform === "win32" ? "\x1B[2J\x1B[0f" : "\x1B[2J\x1B[3J\x1B[H" // from react-dev-utils/clearConsole.js
    ),
  on: (key, cb) => {
    keyEvents[key] = cb;
  },
  render: matrix => {
    IO.clear();
    matrix.forEach(arr => IO.log(JSON.stringify(arr) + "\n"));
  }
};

// game
const GAME = {
  board: Array(8)
    .fill(null)
    .map(el => Array(8).fill(0)),
  set: (x, y, val) => {
    GAME.board[y][x] = val;
  },
  snake: { location: [0, 0], direction: [0, 1], next: null },
  DIRECTIONS: { E: [0, 1], W: [0, -1], N: [-1, 0], S: [1, 0] },
  moveSnake: node => {
    if (!node) return;
    GAME.board[node.location[0]][node.location[1]] = 0;
    node.location = [
      node.location[0] + node.direction[0],
      node.location[1] + node.direction[1]
    ];
    GAME.board[node.location[0]][node.location[1]] = 1;
    GAME.moveSnake(node.next);
  },
  playing: true,
  refresh: function() {
    GAME.moveSnake(GAME.snake);
    IO.render(GAME.board);
    if (GAME.playing) setTimeout(() => GAME.refresh(), 300);
  }
};

// driver
GAME.refresh();

IO.on("left", () => {
  GAME.snake.direction = GAME.DIRECTIONS.W;
});

IO.on("right", () => {
  GAME.snake.direction = GAME.DIRECTIONS.E;
});

IO.on("up", () => {
  GAME.snake.direction = GAME.DIRECTIONS.N;
});

IO.on("down", () => {
  GAME.snake.direction = GAME.DIRECTIONS.S;
});
