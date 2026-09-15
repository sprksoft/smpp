import { GameBase, GameOption } from "./games.js";
import { registerWidget } from "../widgets/widgets.js";
import { getThemeVar } from "../main-features/appearance/themes.js";

const BIRD_RADIUS = 5;
const BIRD_X = 50;
const FLOOR_H = 15;
const PIPE_GAP = 50;
const PIPE_SPEED = 0.2;
const TERMVEL = 0.3;
const PIPE_W = 10;
const GRAVITY = 0.0005;

type Pipe = { x: number; y: number; checked: boolean };

function themeColor(varName: string): string {
  return getThemeVar(varName) ?? "#000";
}

class FlappyWidget extends GameBase {
  bgX = 0;
  birdY = 0;
  birdVel = 0;
  jump = false;
  pipe: Pipe = { x: 0, y: 0, checked: false };

  override get title(): string {
    return "Flappy++";
  }
  override get options(): GameOption[] {
    return [GameOption.slider("speed", "Speed:", 10, 300, 100)];
  }

  #drawGround(ctx: CanvasRenderingContext2D) {
    let w = this.canvas.width;
    let h = this.canvas.height;
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.moveTo(0, h - FLOOR_H);
    ctx.lineTo(w, h - FLOOR_H);
    ctx.stroke();

    ctx.fillStyle = themeColor("--color-accent");
    ctx.strokeStyle = themeColor("--color-base01");
    ctx.fillRect(0, h - FLOOR_H, w, FLOOR_H);
    ctx.strokeRect(0, h - FLOOR_H, w, FLOOR_H);

    for (let i = 0; i < (w / 20) * 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 20 + this.bgX, h - FLOOR_H);
      ctx.lineTo(i * 20 + this.bgX + FLOOR_H, h);
      ctx.stroke();
    }
  }

  #calcGap(): number {
    return Math.max(
      PIPE_GAP * this.getOpt("speed") * 0.01,
      BIRD_RADIUS * 2 + 5
    );
  }

  #drawPipe(ctx: CanvasRenderingContext2D, pipe: Pipe) {
    const gap_size = this.#calcGap();
    ctx.fillStyle = themeColor("--color-accent");
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.roundRect(
      pipe.x,
      -PIPE_W,
      PIPE_W,
      pipe.y + PIPE_W - gap_size / 2,
      PIPE_W
    );
    ctx.fill();
    ctx.beginPath();
    const botStartY = pipe.y + gap_size * 0.5;
    ctx.roundRect(
      pipe.x,
      botStartY,
      PIPE_W,
      this.canvas.height - botStartY + PIPE_W,
      PIPE_W
    );
    ctx.fill();
  }
  #updatePipe(pipe: Pipe, dt: number) {
    pipe.x -= this.getOpt("speed") * 0.01 * dt * PIPE_SPEED;
    if (pipe.x < -PIPE_W) {
      this.#resetPipe(pipe);
    }

    if (
      pipe.x <= BIRD_X + BIRD_RADIUS &&
      pipe.x + PIPE_W > BIRD_X - BIRD_RADIUS
    ) {
      const gap_size = this.#calcGap();
      const gapTop = pipe.y - gap_size * 0.5;
      const gapBot = pipe.y + gap_size * 0.5;
      if (this.birdY >= gapTop && this.birdY < gapBot) {
        if (!pipe.checked) {
          pipe.checked = true;
          this.score++;
        }
      } else {
        if (pipe.checked) {
          this.score--; // undo the point.
          pipe.checked = false;
        }
        this.stopGame();
      }
    }
  }
  #resetPipe(pipe: Pipe) {
    const gap_size = this.#calcGap();
    pipe.x = this.canvas.width + PIPE_W;
    const MARGIN = gap_size * 0.5 + FLOOR_H + 10;
    pipe.y = Math.random() * (this.canvas.height - MARGIN * 2) + MARGIN;
    pipe.checked = false;
  }

  #drawBird(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = themeColor("--color-accent");
    ctx.beginPath();
    ctx.arc(BIRD_X, this.birdY, BIRD_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
  }

  override async onGameStart() {
    this.bgX = 0;
    this.jump = false;
    this.birdY = this.canvas.height / 2.0;
    this.birdVel = 0;
    this.pipe = { x: 0, y: 0, checked: false };
    this.#resetPipe(this.pipe);
  }

  override onGameDraw(ctx: CanvasRenderingContext2D, dt: number) {
    ctx.fillStyle = themeColor("--color-base01");
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.birdY += this.birdVel * dt;
    this.birdVel = Math.min(
      this.birdVel + GRAVITY * this.getOpt("speed") * 0.01 * dt,
      TERMVEL * this.getOpt("speed") * 0.01
    );
    if (this.jump) {
      this.jump = false;
      this.birdVel = -0.4 * this.getOpt("speed") * 0.01 * 0.4; //Math.min(this.birdVel-0.2, -0.2);
    }
    if (this.birdY > this.canvas.height - FLOOR_H - BIRD_RADIUS) {
      this.birdY = this.canvas.height - FLOOR_H - BIRD_RADIUS;
      this.stopGame();
    }

    this.bgX =
      (this.bgX - this.getOpt("speed") * 0.01 * PIPE_SPEED * dt) %
      this.canvas.width;
    this.#updatePipe(this.pipe, dt);

    this.#drawBird(ctx);
    this.#drawPipe(ctx, this.pipe);
    this.#drawGround(ctx);
  }

  override async onMouse(_e: MouseEvent) {
    this.jump = true;
  }

  override async onKeyDown(e: KeyboardEvent) {
    if (e.code === "Space" || e.code === "ArrowUp") {
      this.jump = true;
      e.preventDefault();
    }
  }
}
registerWidget(new FlappyWidget());
