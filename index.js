// I/O
require("readline").emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

var IO = {
  log: process.stdout.write.bind(process.stdout),
  clear: () =>
    process.stdout.write(
      process.platform === "win32" ? "\x1B[2J\x1B[0f" : "\x1B[2J\x1B[3J\x1B[H"
    ),
  buffer: [],
  render: matrix => {
    IO.clear();
    GAME.input(IO.buffer.shift());
    matrix.forEach(a =>
      IO.log(a.reduce((l, c) => `${l}${c > 0 ? "▓▓" : "░░"}`, "") + "\n")
    );
  }
};

const arrEq = (a1, a2) => JSON.stringify(a1) === JSON.stringify(a2);

// game
var GAME = {
  board: Array(16)
    .fill(null)
    .map(el => Array(16).fill(0)),
  set: (x, y, val) => {
    GAME.board[y][x] = val;
  },
  DIRECTIONS: { E: [0, 1], W: [0, -1], N: [-1, 0], S: [1, 0] },
  snake: { loc: [0, 2], dir: [0, 1], nextDir: [0, 1], next: null },
  at: loc => GAME.board[loc[0]][loc[1]],
  snakeContains: (loc, node = GAME.snake) => {
    if (arrEq(loc, node.loc)) return true;
    return node.next ? GAME.snakeContains(loc, node.next) : false;
  },
  nextLoc: n => [n.loc[0] + n.nextDir[0], n.loc[1] + n.nextDir[1]],
  outOfBounds: (y, x) =>
    x < 0 || x >= GAME.board[0].length || y < 0 || y >= GAME.board.length,
  placeFood: () => {
    let [x, y] = [
      Math.floor(Math.random() * GAME.board[0].length),
      Math.floor(Math.random() * GAME.board.length)
    ];

    if (GAME.snakeContains([y, x])) GAME.placeFood();
    else GAME.board[y][x] = 2;
  },
  moveSnake: node => {
    if (!node) return;

    if (
      GAME.outOfBounds(...GAME.nextLoc(node)) ||
      GAME.snakeContains(GAME.nextLoc(node))
    )
      process.exit();

    if (node.next) node.next.nextDir = node.dir;

    // eat food
    if (GAME.at(GAME.nextLoc(node)) > 1) {
      GAME.snake = { ...node, loc: GAME.nextLoc(node), dir: node.nextDir };
      GAME.snake.next = node;
      return GAME.placeFood();
    }

    node.dir = node.nextDir;
    GAME.board[node.loc[0]][node.loc[1]] = 0;
    node.loc = [...GAME.nextLoc(node)];
    GAME.board[node.loc[0]][node.loc[1]] = 1;
    GAME.moveSnake(node.next);
  },
  refresh: function() {
    GAME.moveSnake(GAME.snake);
    IO.render(GAME.board);
    setTimeout(() => GAME.refresh(), 150);
  },
  input: input => {
    const { N, S, E, W } = GAME.DIRECTIONS;
    const dir = GAME.snake.dir;
    if (input === "left" && !arrEq(dir, E)) GAME.snake.nextDir = W;
    if (input === "right" && !arrEq(dir, W)) GAME.snake.nextDir = E;
    if (input === "up" && !arrEq(dir, S)) GAME.snake.nextDir = N;
    if (input === "down" && !arrEq(dir, N)) GAME.snake.nextDir = S;
  }
};

// driver
GAME.placeFood();
GAME.refresh();
process.stdin.on("keypress", function(ch, key) {
  IO.buffer.push(key.name);
  if (IO.buffer.length > 2) IO.buffer.shift();
  if (key && key.ctrl && key.name == "c") {
    IO.log("\n");
    process.exit();
  }
});
