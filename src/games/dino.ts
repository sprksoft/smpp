import { GameBase, GameOption } from "./games.js";
import { registerWidget } from "../widgets/widgets.js";
import { getThemeVar } from "../main-features/appearance/themes.js";

const FLOOR_H = 22;
const DINO_X = 50;
const DINO_W = 24;
const DINO_H = 30;
const DINO_DUCK_H = 15;
const GRAVITY = 0.0027;
const JUMP_VEL = -0.78;
const BASE_SPEED = 0.225;
const SPEEDUP = 0.00018;
const CACTUS_W = 12;
const BIRD_W = 21;
const BIRD_H = 12;
const SCORE_RATE = 0.01;

function themeColor(varName: string): string {
  return getThemeVar(varName) ?? "#000";
}

type Box = { x: number; y: number; w: number; h: number };
type Obstacle =
  | { type: "cactus"; x: number; w: number; h: number }
  | { type: "bird"; x: number; y: number; flap: number };

class DinoWidget extends GameBase {
  dinoY = 0;
  dinoVel = 0;
  ducking = false;
  jumpQueued = false;
  obstacles: Obstacle[] = [];
  spawnTimer = 0;
  scoreAcc = 0;
  bgX = 0;
  legTimer = 0;
  legUp = false;

  override get title(): string {
    return "Dino++";
  }
  override get options(): GameOption[] {
    return [GameOption.slider("speed", "Start speed:", 100, 200, 100)];
  }

  #groundY(): number {
    return this.canvas.height - FLOOR_H;
  }

  #gameSpeed(): number {
    return Math.min(
      BASE_SPEED * 2,
      BASE_SPEED * (this.getOpt("speed") * 0.01) + this.score * SPEEDUP,
    );
  }

  #drawGround(ctx: CanvasRenderingContext2D) {
    let w = this.canvas.width;
    let h = this.canvas.height;
    ctx.fillStyle = themeColor("--color-accent");
    ctx.strokeStyle = themeColor("--color-base01");
    ctx.lineWidth = 1;
    ctx.fillRect(0, h - FLOOR_H, w, FLOOR_H);
    ctx.strokeRect(0, h - FLOOR_H, w, FLOOR_H);

    for (let i = 0; i < (w / 30) * 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 30 + this.bgX, h - FLOOR_H);
      ctx.lineTo(i * 30 + this.bgX + FLOOR_H, h);
      ctx.stroke();
    }
  }

  #dinoHitbox(): Box {
    const h = this.ducking && this.#onGround() ? DINO_DUCK_H : DINO_H;
    return {
      x: DINO_X,
      y: this.dinoY - h,
      w: DINO_W,
      h: h,
    };
  }

  #onGround(): boolean {
    return this.dinoY >= this.#groundY();
  }

  #drawDino(ctx: CanvasRenderingContext2D) {
    const box = this.#dinoHitbox();
    ctx.fillStyle = themeColor("--color-accent");


    ctx.fillRect(box.x, box.y, box.w, box.h - 6);
    ctx.fillRect(box.x + box.w - 9, box.y - 6, 12, 9);
    ctx.fillStyle = themeColor("--color-base01");
    ctx.fillRect(box.x + box.w - 2, box.y - 4, 3, 3);
    ctx.fillStyle = themeColor("--color-accent");
    ctx.fillRect(box.x - 6, box.y + 3, 6, 6);
    if (this.#onGround()) {
      if (this.legUp) {
        ctx.fillRect(box.x + 3, box.y + box.h - 6, 4, 6);
      } else {
        ctx.fillRect(box.x + box.w - 8, box.y + box.h - 6, 4, 6);
      }
    } else {
      ctx.fillRect(box.x + 3, box.y + box.h - 6, 4, 6);
      ctx.fillRect(box.x + box.w - 8, box.y + box.h - 6, 4, 6);
    }
  }

  #spawnObstacle() {
    const canBird = this.score > 100;
    if (canBird && Math.random() < 0.3) {
      const high = Math.random() < 0.5;
      const y = high
        ? this.#groundY() - DINO_H - 3
        : this.#groundY() - BIRD_H;
      this.obstacles.push({ type: "bird", x: this.canvas.width, y: y, flap: 0 });
    } else {
      const count = 1 + Math.floor(Math.random() * 3);
      const h = 21 + Math.random() * 15;
      this.obstacles.push({
        type: "cactus",
        x: this.canvas.width,
        w: CACTUS_W * count + (count - 1) * 3,
        h: h,
      });
    }

    const speed = this.#gameSpeed();
    this.spawnTimer = (180 + Math.random() * 360) / speed;
  }

  #drawObstacle(ctx: CanvasRenderingContext2D, ob: Obstacle) {
    ctx.fillStyle = themeColor("--color-accent");
    if (ob.type === "cactus") {
      const y = this.#groundY() - ob.h;
      for (let x = ob.x; x < ob.x + ob.w; x += CACTUS_W + 3) {
        ctx.fillRect(x + 3, y, CACTUS_W - 6, ob.h);
        // arms
        ctx.fillRect(x, y + 6, 3, 9);
        ctx.fillRect(x + CACTUS_W - 3, y + 10, 3, 9);
      }
    } else {
      ctx.fillRect(ob.x, ob.y, BIRD_W, 6);
      ctx.fillRect(ob.x + BIRD_W - 6, ob.y - 3, 9, 4);
      if (ob.flap < 150) {
        ctx.fillRect(ob.x + 6, ob.y - 8, 6, 8);
      } else {
        ctx.fillRect(ob.x + 6, ob.y + 6, 6, 8);
      }
    }
  }

  #obstacleHitbox(ob: Obstacle): Box {
    if (ob.type === "cactus") {
      return { x: ob.x, y: this.#groundY() - ob.h, w: ob.w, h: ob.h };
    }
    return { x: ob.x, y: ob.y - 3, w: BIRD_W, h: BIRD_H };
  }

  #collides(a: Box, b: Box): boolean {
    return (
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    );
  }

  override async onGameStart() {
    this.dinoY = this.#groundY();
    this.dinoVel = 0;
    this.ducking = false;
    this.jumpQueued = false;
    this.obstacles = [];
    this.spawnTimer = 500;
    this.scoreAcc = 0;
    this.bgX = 0;
    this.legTimer = 0;
    this.legUp = false;
  }

  override onGameDraw(ctx: CanvasRenderingContext2D, dt: number) {
    ctx.fillStyle = themeColor("--color-base01");
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const speed = this.#gameSpeed();

    if (this.jumpQueued && this.#onGround()) {
      this.dinoVel = JUMP_VEL;
      this.dinoY += this.dinoVel * dt;
    }
    this.jumpQueued = false;
    if (!this.#onGround()) {
      this.dinoVel += GRAVITY * dt * (this.ducking ? 3 : 1);
      this.dinoY = Math.min(this.dinoY + this.dinoVel * dt, this.#groundY());
    }

    this.legTimer += dt;
    if (this.legTimer > 100) {
      this.legTimer = 0;
      this.legUp = !this.legUp;
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.#spawnObstacle();
    }
    const dinoBox = this.#dinoHitbox();
    for (let ob of this.obstacles) {
      ob.x -= speed * dt;
      if (ob.type === "bird") {
        ob.x -= speed * dt * 0.2;
        ob.flap = (ob.flap + dt) % 300;
      }
      if (this.#collides(dinoBox, this.#obstacleHitbox(ob))) {
        this.stopGame();
      }
    }
    this.obstacles = this.obstacles.filter((ob) => ob.x > -BIRD_W * 3);

    this.scoreAcc += dt * SCORE_RATE;
    if (this.scoreAcc >= 1) {
      this.score += Math.floor(this.scoreAcc);
      this.scoreAcc -= Math.floor(this.scoreAcc);
    }

    this.bgX = (this.bgX - speed * dt) % this.canvas.width;

    this.#drawObstacles(ctx);
    this.#drawDino(ctx);
    this.#drawGround(ctx);
  }

  #drawObstacles(ctx: CanvasRenderingContext2D) {
    for (let ob of this.obstacles) {
      this.#drawObstacle(ctx, ob);
    }
  }

  override async onMouse(_e: MouseEvent) {
    this.jumpQueued = true;
  }

  override async onKeyDown(e: KeyboardEvent) {
    if (e.code === "Space" || e.code === "ArrowUp") {
      this.jumpQueued = true;
      e.preventDefault();
    } else if (e.code === "ArrowDown") {
      this.ducking = true;
      e.preventDefault();
    }
  }

  override async onKeyUp(e: KeyboardEvent) {
    if (e.code === "ArrowDown") {
      this.ducking = false;
    }
  }
}
registerWidget(new DinoWidget());
