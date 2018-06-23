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
  },
  displayOn: true,
  display: matrix => {
    IO.render(matrix);
    if (IO.displayOn) setTimeout(() => IO.display(matrix), 100);
  }
};

// game
const GAME = {
  board: Array(5)
    .fill(null)
    .map(el => Array(4).fill(0)),
  set: (x, y, val) => {
    GAME.board[y][x] = val;
  }
};

// driver
IO.display(GAME.board);

IO.on("left", () => {
  GAME.set(0, 0, "L");
});

IO.on("right", () => {
  GAME.set(0, 0, "R");
});

IO.on("up", () => {
  GAME.set(0, 0, "U");
});

IO.on("down", () => {
  GAME.set(0, 0, "D");
});
