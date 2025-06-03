const BALL_RADIUS = 4;
const PADDLE_WIDTH = 40;
const PADDLE_HEIGHT = 5;
const BRICK_ROWS = 4;
const BRICK_COLS = 8;
const BRICK_WIDTH = 30;
const BRICK_HEIGHT = 10;
const BRICK_PADDING = 4;
const PADDLE_SPEED = 0.2;
const BALL_SPEED = 0.1;

class BreakoutWidget extends GameBase {
  ball;
  paddleX;
  leftPressed = false;
  rightPressed = false;
  bricks;
  score = 0;

  get title() {
    return "Breakout++";
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
      dx: BALL_SPEED * this.getOpt("speed") * 0.01,
      dy: -BALL_SPEED * this.getOpt("speed") * 0.01,
    };
    this.paddleX = (w - PADDLE_WIDTH) / 2;
    this.leftPressed = false;
    this.rightPressed = false;
    this.score = 0;

    this.bricks = [];
    for (let c = 0; c < BRICK_COLS; c++) {
      for (let r = 0; r < BRICK_ROWS; r++) {
        this.bricks.push({
          x: c * (BRICK_WIDTH + BRICK_PADDING) + 10,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + 10,
          status: 1,
        });
      }
    }
  }

  onGameDraw(ctx, dt) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = getThemeVar("--color-base01");
    ctx.fillRect(0, 0, w, h);

    const speed = PADDLE_SPEED * this.getOpt("speed") * 0.01;
    if (this.leftPressed) this.paddleX -= speed * dt;
    if (this.rightPressed) this.paddleX += speed * dt;
    this.paddleX = Math.max(0, Math.min(w - PADDLE_WIDTH, this.paddleX));

    let ball = this.ball;
    ball.x += ball.dx * dt;
    ball.y += ball.dy * dt;

    if (ball.x < BALL_RADIUS) {
      ball.x = BALL_RADIUS;
      ball.dx *= -1;
    }
    if (ball.x > w - BALL_RADIUS) {
      ball.x = w - BALL_RADIUS;
      ball.dx *= -1;
    }
    if (ball.y < BALL_RADIUS) {
      ball.y = BALL_RADIUS;
      ball.dy *= -1;
    }

    if (
      ball.y > h - PADDLE_HEIGHT - BALL_RADIUS &&
      ball.x > this.paddleX &&
      ball.x < this.paddleX + PADDLE_WIDTH
    ) {
      ball.dy *= -1;
      ball.y = h - PADDLE_HEIGHT - BALL_RADIUS;
    }

    if (ball.y > h + BALL_RADIUS) {
      this.stopGame();
    }

    for (let b of this.bricks) {
      if (b.status === 1) {
        if (
          ball.x > b.x &&
          ball.x < b.x + BRICK_WIDTH &&
          ball.y > b.y &&
          ball.y < b.y + BRICK_HEIGHT
        ) {
          b.status = 0;
          ball.dy *= -1;
          this.score++;
          break;
        }
      }
    }

    ctx.fillStyle = getThemeVar("--color-accent");
    ctx.fillRect(this.paddleX, h - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, 2 * Math.PI);
    ctx.fill();

    for (let b of this.bricks) {
      if (b.status === 1) {
        ctx.fillRect(b.x, b.y, BRICK_WIDTH, BRICK_HEIGHT);
      }
    }
  }

  onKeyDown(e) {
    if (e.code === "ArrowLeft") this.leftPressed = true;
    else if (e.code === "ArrowRight") this.rightPressed = true;
  }

  onKeyUp(e) {
    if (e.code === "ArrowLeft") this.leftPressed = false;
    else if (e.code === "ArrowRight") this.rightPressed = false;
  }
}

registerWidget(new BreakoutWidget());
