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
    matrix.forEach(arr =>
      IO.log(
        arr.reduce((line, cell) => `${line}${cell > 0 ? "▓▓" : "░░"}`, "") +
          "\n"
      )
    );
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
  DIRECTIONS: { E: [0, 1], W: [0, -1], N: [-1, 0], S: [1, 0] },
  snake: {
    loc: [0, 2],
    direction: [0, 1],
    nextDirection: [0, 1]
    // next: {
    //   loc: [0, 1],
    //   direction: [0, 1],
    //   nextDirection: [0, 1],
    //   next: {
    //     loc: [0, 0],
    //     direction: [0, 1],
    //     nextDirection: [0, 1],
    //     next: {
    //       loc: [0, -1],
    //       direction: [0, 1],
    //       nextDirection: [0, 1]
    //     }
    //   }
    // }
  },
  nextLoc: n => [n.loc[0] + n.direction[0], n.loc[1] + n.direction[1]],
  outOfBounds: (y, x) =>
    x < 0 || x >= GAME.board[0].length || y < 0 || y >= GAME.board.length,
  moveSnake: node => {
    if (!node) return;
    if (node.next) node.next.nextDirection = node.direction;
    node.direction = node.nextDirection;

    if (GAME.outOfBounds(...GAME.nextLoc(node))) process.exit();

    GAME.board[node.loc[0]][node.loc[1]] = 0;
    node.loc = [...GAME.nextLoc(node)];
    GAME.board[node.loc[0]][node.loc[1]] = 1;
    GAME.moveSnake(node.next);
  },
  refresh: function() {
    GAME.moveSnake(GAME.snake);
    IO.render(GAME.board);
    setTimeout(() => GAME.refresh(), 300);
  }
};
const arrEq = (a1, a2) => JSON.stringify(a1) === JSON.stringify(a2);

// driver
GAME.refresh();

IO.on("left", () => {
  if (!arrEq(GAME.snake.direction, GAME.DIRECTIONS.E))
    GAME.snake.nextDirection = GAME.DIRECTIONS.W;
});

IO.on("right", () => {
  if (!arrEq(GAME.snake.direction, GAME.DIRECTIONS.W))
    GAME.snake.nextDirection = GAME.DIRECTIONS.E;
});

IO.on("up", () => {
  if (!arrEq(GAME.snake.direction, GAME.DIRECTIONS.S))
    GAME.snake.nextDirection = GAME.DIRECTIONS.N;
});

IO.on("down", () => {
  if (!arrEq(GAME.snake.direction, GAME.DIRECTIONS.N))
    GAME.snake.nextDirection = GAME.DIRECTIONS.S;
});
