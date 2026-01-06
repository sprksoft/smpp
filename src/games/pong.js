import { GameBase } from "./games.js";
import { registerWidget } from "../widgets/widgets.js";
import { getThemeVar } from "../main-features/appearance/themes.js";
import { GameOption } from "./games.js";

// Powered by Broodje56's magic sauce
// This code is brought to you by Broodje56, the ultimate breadboss 🥖👑

const PONG_BALL_RADIUS = 4;
const PONG_PADDLE_WIDTH = 5;
const PONG_PADDLE_HEIGHT = 40;
const PONG_PADDLE_SPEED = 0.2;
const PONG_BALL_SPEED = 0.1;

const SPEEDUP_FACTOR = 1.05;
const MAX_SPEED = 0.5;

class PongWidget extends GameBase {
  ball;
  leftY;
  rightY;
  leftUp = false;
  leftDown = false;

  get title() {
    return "Pong++";
  }

  get options() {
    return [GameOption.slider("speed", "Speed:", 10, 300, 100)];
  }

  async onGameStart() {
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

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  onGameDraw(ctx, dt) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = getThemeVar("--color-base01");
    ctx.fillRect(0, 0, w, h);

    const speed = PONG_PADDLE_SPEED * this.getOpt("speed") * 0.01;

    if (this.leftUp) this.leftY -= speed * dt;
    if (this.leftDown) this.leftY += speed * dt;
    this.leftY = Math.max(0, Math.min(h - PONG_PADDLE_HEIGHT, this.leftY));

    const aiCenter = this.rightY + PONG_PADDLE_HEIGHT / 2;
    const diff = this.ball.y - aiCenter;
    const maxMove = speed * dt * 0.8;
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

    if (b.x < 0) {
      this.stopGame();
    }

    if (b.x > w) {
      this.onGameStart();
    }

    ctx.fillStyle = getThemeVar("--color-text");
    ctx.beginPath();
    ctx.arc(b.x, b.y, PONG_BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = getThemeVar("--color-accent");
    this.drawRoundedRect(
      ctx,
      0,
      this.leftY,
      PONG_PADDLE_WIDTH,
      PONG_PADDLE_HEIGHT,
      3
    );
    this.drawRoundedRect(
      ctx,
      w - PONG_PADDLE_WIDTH,
      this.rightY,
      PONG_PADDLE_WIDTH,
      PONG_PADDLE_HEIGHT,
      3
    );

    ctx.strokeStyle = getThemeVar("--color-text");
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  onKeyDown(e) {
    if (e.code === "ArrowUp") this.leftUp = true;
    if (e.code === "ArrowDown") this.leftDown = true;
  }

  onKeyUp(e) {
    if (e.code === "ArrowUp") this.leftUp = false;
    if (e.code === "ArrowDown") this.leftDown = false;
  }
}

registerWidget(new PongWidget());
