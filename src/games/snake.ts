import { GameBase, GameOption, type GameSettings } from "./games.js";
import { registerWidget } from "../widgets/widgets.js";
import { getThemeVar } from "../main-features/appearance/themes.js";

type SnakeSettings = GameSettings & { enableGrid: boolean };

function themeColor(varName: string): string {
  return getThemeVar(varName) ?? "#000";
}

class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y);
  }
  equal(other: Point): boolean {
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
  #targetDir = DIR_DOWN;
  #curDir = DIR_DOWN;
  #counter = 0;
  #snake: Point[] = [];
  #food = new Point(0, 0);

  #backgroundCanvas: HTMLCanvasElement | undefined;

  override get title(): string {
    return "Snake++";
  }
  override get options(): GameOption[] {
    return [
      GameOption.slider("speed", "Speed:", 10, 300, 100),
      GameOption.slider("size", "Size:", 100, 500, 100),
    ];
  }

  #tick() {
    this.#curDir = this.#targetDir;
    const head = this.#snake[this.#snake.length - 1];
    if (!head) return;
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

  #calcCelRad(): number {
    return this.canvas.width / (this.#getCellCount() * 2);
  }

  #getRandomFieldPos(): Point {
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

  override defaultSettings(): SnakeSettings {
    return { ...super.defaultSettings(), enableGrid: true };
  }

  override async onGameStart() {
    const cellCount = this.#getCellCount();
    if (!this.#backgroundCanvas) {
      const bg = document.createElement("canvas");
      bg.height = this.canvas.width;
      bg.width = this.canvas.width;
      this.#backgroundCanvas = bg;
    }
    // redraw background in case of slider change.
    const bgctx = this.#backgroundCanvas.getContext("2d", { alpha: false });
    if (bgctx) this.#drawBg(bgctx);

    this.#counter = 0;
    this.#curDir = DIR_DOWN;
    this.#targetDir = DIR_DOWN;
    this.#snake = [
      new Point(Math.floor(cellCount / 2), Math.floor(cellCount / 2)),
    ];
    this.#spawnFood();
  }

  override async onThemeChange() {
    if (!this.#backgroundCanvas) {
      return;
    }
    const bgctx = this.#backgroundCanvas.getContext("2d", { alpha: false });
    if (bgctx) this.#drawBg(bgctx);
  }

  #drawDot(ctx: CanvasRenderingContext2D, dot: Point) {
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

  #getCellCount(): number {
    return Math.round(CELL_COUNT * Math.sqrt(this.getOpt("size") * 0.01));
  }

  #drawBg(ctx: CanvasRenderingContext2D) {
    const cellCount = this.#getCellCount();
    const celRad = this.#calcCelRad();
    ctx.fillStyle = themeColor("--color-base01");
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if ((this.settings as SnakeSettings).enableGrid) {
      for (let y = 0; y < cellCount; y++) {
        for (let x = 0; x < cellCount; x++) {
          if ((x + y) % 2 == 0) {
            ctx.fillStyle = `${themeColor("--color-base03")}50`;
          } else {
            ctx.fillStyle = `${themeColor("--color-base02")}50`;
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

  override onGameDraw(ctx: CanvasRenderingContext2D, dt: number) {
    this.#counter += dt;
    if (this.#counter * this.getOpt("speed") * 0.02 >= FRAME_TIME) {
      this.#tick();
      this.#counter = 0;
    }
    if (this.#backgroundCanvas) {
      ctx.drawImage(this.#backgroundCanvas, 0, 0);
    }

    ctx.fillStyle = themeColor("--color-text");
    for (let part of this.#snake) {
      this.#drawDot(ctx, part);
    }
    ctx.fillStyle = themeColor("--color-accent");
    this.#drawDot(ctx, this.#food);
  }
  override async onKeyDown(e: KeyboardEvent) {
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
