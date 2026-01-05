import { GameBase } from "./games.js"
import { registerWidget } from "../widgets/widgets.js"

class Point {
  x;
  y;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    return new Point(this.x + other.x, this.y + other.y);
  }
  equal(other) {
    return this.x === other.x && this.y === other.y;
  }
}

const DIR_UP = new Point(0, -1);
const DIR_LEFT = new Point(-1, 0);
const DIR_RIGHT = new Point(1, 0);
const DIR_DOWN = new Point(0, 1);

const CELL_COUNT = 15;
const FRAME_TIME = 400;
class SnakeWidget extends GameBase {
  #targetDir;
  #curDir;
  #counter;
  #snake;
  #food;

  #backgroundCanvas;

  constructor() {
    super();
  }

  get title() {
    return "Snake++";
  }
  get options() {
    return [
      GameOption.slider("speed", "Speed:", 10, 300, 100),
      GameOption.slider("size", "Size:", 100, 500, 100),
    ];
  }

  #tick() {
    this.#curDir = this.#targetDir;
    const head = this.#snake[this.#snake.length - 1];
    const newHead = head.add(this.#curDir);

    // bounds check
    if (
      newHead.x < 0 ||
      newHead.y < 0 ||
      newHead.x >= this.#getCellCount() ||
      newHead.y >= this.#getCellCount()
    ) {
      this.stopGame();
      return;
    }
    // check if we hit ourselves
    if (this.#snake.find((p) => p.equal(newHead))) {
      this.stopGame();
      return;
    }

    if (newHead.equal(this.#food)) {
      this.#spawnFood();
      this.score += 1;
    } else {
      this.#snake.shift(); // remove tail
    }

    // add new head
    this.#snake.push(newHead);
  }

  #calcCelRad() {
    return this.canvas.width / (this.#getCellCount() * 2);
  }

  #getRandomFieldPos() {
    const cellCount = this.#getCellCount();
    return new Point(
      Math.floor(Math.random() * cellCount),
      Math.floor(Math.random() * cellCount)
    );
  }

  #spawnFood() {
    this.#food = this.#getRandomFieldPos();
    while (this.#snake.find((p) => p.equal(this.#food))) {
      this.#food = this.#getRandomFieldPos();
    }
  }

  defaultSettings() {
    return { score: 0, options: [], enableGrid: true };
  }

  async onGameStart() {
    const cellCount = this.#getCellCount();
    if (!this.#backgroundCanvas) {
      const bg = document.createElement("canvas");
      bg.height = this.canvas.width;
      bg.width = this.canvas.width;
      this.#backgroundCanvas = bg;
    }
    // redraw background in case of slider change.
    const bgctx = this.#backgroundCanvas.getContext("2d", { alpha: false });

    this.#drawBg(bgctx);

    this.#counter = 0;
    this.#curDir = DIR_DOWN;
    this.#targetDir = DIR_DOWN;
    this.#snake = [
      new Point(Math.floor(cellCount / 2), Math.floor(cellCount / 2)),
    ];
    this.#spawnFood();
  }

  async onThemeChange() {
    if (!this.#backgroundCanvas) {
      return;
    }
    const bgctx = this.#backgroundCanvas.getContext("2d", { alpha: false });
    this.#drawBg(bgctx);
  }

  #drawDot(ctx, dot) {
    ctx.strokeWidth = 0;
    ctx.beginPath();
    const celRad = this.#calcCelRad();
    ctx.arc(
      Math.floor(celRad + dot.x * celRad * 2.0),
      Math.floor(celRad + dot.y * celRad * 2.0),
      celRad * 0.9,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  #getCellCount() {
    return Math.round(CELL_COUNT * Math.sqrt(this.getOpt("size") * 0.01));
  }

  #drawBg(ctx) {
    const cellCount = this.#getCellCount();
    const celRad = this.#calcCelRad();
    ctx.strokeWidth = 0;
    ctx.fillStyle = getThemeVar("--color-base01");
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.settings.enableGrid) {
      for (let y = 0; y < cellCount; y++) {
        for (let x = 0; x < cellCount; x++) {
          if ((x + y) % 2 == 0) {
            ctx.fillStyle = `${getThemeVar("--color-base03")}50`;
          } else {
            ctx.fillStyle = `${getThemeVar("--color-base02")}50`;
          }
          ctx.beginPath();
          ctx.arc(
            celRad + x * celRad * 2,
            celRad + y * celRad * 2,
            celRad * 0.7,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  }

  onGameDraw(ctx, dt) {
    this.#counter += dt;
    if (this.#counter * this.getOpt("speed") * 0.02 >= FRAME_TIME) {
      this.#tick();
      this.#counter = 0;
    }
    ctx.drawImage(this.#backgroundCanvas, 0, 0);

    ctx.fillStyle = getThemeVar("--color-text");
    for (let part of this.#snake) {
      this.#drawDot(ctx, part);
    }
    ctx.fillStyle = getThemeVar("--color-accent");
    this.#drawDot(ctx, this.#food);
  }
  onKeyDown(e) {
    switch (e.key) {
      case "ArrowUp":
        if (this.#curDir !== DIR_DOWN) {
          this.#targetDir = DIR_UP;
        }
        break;
      case "ArrowDown":
        if (this.#curDir !== DIR_UP) {
          this.#targetDir = DIR_DOWN;
        }
        break;
      case "ArrowLeft":
        if (this.#curDir !== DIR_RIGHT) {
          this.#targetDir = DIR_LEFT;
        }
        break;
      case "ArrowRight":
        if (this.#curDir !== DIR_LEFT) {
          this.#targetDir = DIR_RIGHT;
        }
        break;
    }
  }
}
registerWidget(new SnakeWidget());
