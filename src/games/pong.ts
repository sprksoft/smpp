import { GameBase, GameOption, drawRoundedRect } from "./games.js";
import { registerWidget } from "../widgets/widgets.js";
import { getThemeVar } from "../main-features/appearance/themes.js";

const PONG_BALL_RADIUS = 4;
const PONG_PADDLE_WIDTH = 5;
const PONG_PADDLE_HEIGHT = 40;
const PONG_PADDLE_SPEED = 0.2;
const PONG_BALL_SPEED = 0.1;

const SPEEDUP_FACTOR = 1.05;
const MAX_SPEED = 0.5;

type Ball = { x: number; y: number; dx: number; dy: number };

function themeColor(varName: string): string {
  return getThemeVar(varName) ?? "#000";
}

class PongWidget extends GameBase {
  ball: Ball = { x: 0, y: 0, dx: 0, dy: 0 };
  leftY = 0;
  rightY = 0;
  leftUp = false;
  leftDown = false;

  override get title(): string {
    return "Pong++";
  }

  override get options(): GameOption[] {
    return [GameOption.slider("speed", "Speed:", 10, 300, 100)];
  }

  override async onGameStart() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ball = {
      x: w / 2,
      y: h / 2,
      dx:
        PONG_BALL_SPEED *
        this.getOpt("speed") *
        0.01 *
        (Math.random() > 0.5 ? 1 : -1),
      dy:
        PONG_BALL_SPEED * this.getOpt("speed") * 0.01 * (Math.random() * 2 - 1),
    };

    this.leftY = (h - PONG_PADDLE_HEIGHT) / 2;
    this.rightY = (h - PONG_PADDLE_HEIGHT) / 2;

    this.leftUp = false;
    this.leftDown = false;
  }

  override onGameDraw(ctx: CanvasRenderingContext2D, dt: number) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    const colorBase = themeColor("--color-base01");
    const colorText = themeColor("--color-text");
    const colorAccent = themeColor("--color-accent");

    ctx.fillStyle = colorBase;
    ctx.fillRect(0, 0, w, h);

    const speed = PONG_PADDLE_SPEED * this.getOpt("speed") * 0.01;
    const paddleDelta = speed * dt;

    if (this.leftUp) this.leftY -= paddleDelta;
    if (this.leftDown) this.leftY += paddleDelta;
    this.leftY = Math.max(0, Math.min(h - PONG_PADDLE_HEIGHT, this.leftY));

    const aiCenter = this.rightY + PONG_PADDLE_HEIGHT / 2;
    const diff = this.ball.y - aiCenter;
    const maxMove = paddleDelta * 0.8;
    if (Math.abs(diff) > maxMove) {
      this.rightY += Math.sign(diff) * maxMove;
    } else {
      this.rightY += diff;
    }
    this.rightY = Math.max(0, Math.min(h - PONG_PADDLE_HEIGHT, this.rightY));

    let b = this.ball;
    b.x += b.dx * dt;
    b.y += b.dy * dt;

    if (b.y < PONG_BALL_RADIUS || b.y > h - PONG_BALL_RADIUS) {
      b.dy *= -1;
      b.y = Math.max(PONG_BALL_RADIUS, Math.min(h - PONG_BALL_RADIUS, b.y));
    }

    // Ball Hit by left paddle
    if (
      b.x < PONG_PADDLE_WIDTH + PONG_BALL_RADIUS &&
      b.y > this.leftY &&
      b.y < this.leftY + PONG_PADDLE_HEIGHT
    ) {
      b.dx *= -1;
      b.x = PONG_PADDLE_WIDTH + PONG_BALL_RADIUS;

      b.dx *= SPEEDUP_FACTOR;
      b.dy *= SPEEDUP_FACTOR;

      b.dx = Math.sign(b.dx) * Math.min(Math.abs(b.dx), MAX_SPEED);
      b.dy = Math.sign(b.dy) * Math.min(Math.abs(b.dy), MAX_SPEED);

      this.score++;
    }

    // Ball Hit by right paddle
    if (
      b.x > w - PONG_PADDLE_WIDTH - PONG_BALL_RADIUS &&
      b.y > this.rightY &&
      b.y < this.rightY + PONG_PADDLE_HEIGHT
    ) {
      b.dx *= -1;
      b.x = w - PONG_PADDLE_WIDTH - PONG_BALL_RADIUS;

      b.dx *= SPEEDUP_FACTOR;
      b.dy *= SPEEDUP_FACTOR;

      b.dx = Math.sign(b.dx) * Math.min(Math.abs(b.dx), MAX_SPEED);
      b.dy = Math.sign(b.dy) * Math.min(Math.abs(b.dy), MAX_SPEED);
    }

    if (b.x < -PONG_BALL_RADIUS) {
      this.stopGame();
    }

    if (b.x > w + PONG_BALL_RADIUS) {
      this.onGameStart();
    }

    ctx.fillStyle = colorText;
    ctx.beginPath();
    ctx.arc(b.x, b.y, PONG_BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colorAccent;
    drawRoundedRect(
      ctx,
      0,
      this.leftY,
      PONG_PADDLE_WIDTH,
      PONG_PADDLE_HEIGHT,
      3
    );
    ctx.fill();
    drawRoundedRect(
      ctx,
      w - PONG_PADDLE_WIDTH,
      this.rightY,
      PONG_PADDLE_WIDTH,
      PONG_PADDLE_HEIGHT,
      3
    );
    ctx.fill();

    ctx.strokeStyle = colorText;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  override async onKeyDown(e: KeyboardEvent) {
    if (e.code === "ArrowUp") this.leftUp = true;
    if (e.code === "ArrowDown") this.leftDown = true;
  }

  override async onKeyUp(e: KeyboardEvent) {
    if (e.code === "ArrowUp") this.leftUp = false;
    if (e.code === "ArrowDown") this.leftDown = false;
  }
}

registerWidget(new PongWidget());
