// @ts-nocheck
import { GameBase } from "./games.js";
import { registerWidget } from "../widgets/widgets.js";
import { getThemeVar } from "../main-features/appearance/themes.js";
import { GameOption } from "./games.js";

const PLAYER_WIDTH = 36;
const PLAYER_HEIGHT = 8;
const PLAYER_MARGIN_BOTTOM = 18;
const BULLET_WIDTH = 3;
const BULLET_HEIGHT = 8;
const ENEMY_WIDTH = 16;
const ENEMY_HEIGHT = 10;
const ENEMY_PADDING_X = 12;
const ENEMY_PADDING_Y = 10;
const MAX_BULLETS_ON_SCREEN = 2;

class SpaceInvadersWidget extends GameBase {
  #playerX;
  #leftPressed;
  #rightPressed;
  #bullets;
  #enemies;
  #enemyDir;
  #enemyMoveTimer;
  #enemyMoveDelay;
  #shotCooldown;
  #autoShotTimer;
  #autoShotInterval;
  #rowCount;
  #colCount;

  get title() {
    return "Space Invaders++";
  }

  get options() {
    return [GameOption.slider("speed", "Speed:", 10, 300, 100)];
  }

  async onGameStart() {
    this.#leftPressed = false;
    this.#rightPressed = false;
    this.#shotCooldown = 0;
    this.#autoShotTimer = 0;
    this.#enemyMoveTimer = 0;

    this.#playerX = (this.canvas.width - PLAYER_WIDTH) / 2;
    this.#bullets = [];

    this.#rowCount = 4;
    this.#colCount = 7;
    this.#enemyDir = 1;
    this.#autoShotInterval = this.#getAutoShotInterval();

    this.#spawnWave();
    this.#updateEnemyDelay();
  }

  #getAutoShotInterval() {
    const speed = this.getOpt("speed") * 0.01;
    return Math.max(260, Math.min(520, 430 / Math.max(0.5, speed)));
  }

  #spawnWave() {
    this.#enemies = [];
    const totalWidth =
      this.#colCount * ENEMY_WIDTH + (this.#colCount - 1) * ENEMY_PADDING_X;
    const startX = (this.canvas.width - totalWidth) / 2;
    const startY = 24;

    for (let row = 0; row < this.#rowCount; row++) {
      for (let col = 0; col < this.#colCount; col++) {
        this.#enemies.push({
          x: startX + col * (ENEMY_WIDTH + ENEMY_PADDING_X),
          y: startY + row * (ENEMY_HEIGHT + ENEMY_PADDING_Y),
          alive: true,
        });
      }
    }
  }

  #updateEnemyDelay() {
    const speed = this.getOpt("speed") * 0.01;
    const aliveCount = this.#aliveEnemies().length;
    const waveSize = this.#rowCount * this.#colCount;
    const waveProgress = 1 - aliveCount / waveSize;
    const base = 460 / Math.max(0.4, speed);
    this.#enemyMoveDelay = Math.max(60, base * (1 - 0.55 * waveProgress));
  }

  #aliveEnemies() {
    return this.#enemies.filter((enemy) => enemy.alive);
  }

  #shoot() {
    if (this.#shotCooldown > 0 || this.#bullets.length >= MAX_BULLETS_ON_SCREEN) {
      return;
    }
    this.#bullets.push({
      x: this.#playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
      y: this.canvas.height - PLAYER_MARGIN_BOTTOM - PLAYER_HEIGHT - BULLET_HEIGHT,
      width: BULLET_WIDTH,
      height: BULLET_HEIGHT,
    });
    this.#shotCooldown = 260;
  }

  #moveEnemiesOneStep() {
    const aliveEnemies = this.#aliveEnemies();
    if (!aliveEnemies.length) {
      this.#rowCount = Math.min(6, this.#rowCount + 1);
      this.#spawnWave();
      this.#updateEnemyDelay();
      return;
    }

    let minX = Infinity;
    let maxX = -Infinity;
    for (const enemy of aliveEnemies) {
      minX = Math.min(minX, enemy.x);
      maxX = Math.max(maxX, enemy.x + ENEMY_WIDTH);
    }

    const horizontalStep = 8;
    const verticalStep = 12;
    const nextMinX = minX + horizontalStep * this.#enemyDir;
    const nextMaxX = maxX + horizontalStep * this.#enemyDir;

    if (nextMinX < 8 || nextMaxX > this.canvas.width - 8) {
      this.#enemyDir *= -1;
      for (const enemy of aliveEnemies) {
        enemy.y += verticalStep;
      }
    } else {
      for (const enemy of aliveEnemies) {
        enemy.x += horizontalStep * this.#enemyDir;
      }
    }
  }

  #checkCollisionsAndState() {
    const aliveEnemies = this.#aliveEnemies();

    for (const enemy of aliveEnemies) {
      if (enemy.y + ENEMY_HEIGHT >= this.canvas.height - PLAYER_MARGIN_BOTTOM - PLAYER_HEIGHT) {
        this.stopGame();
        return;
      }
    }

    for (let i = this.#bullets.length - 1; i >= 0; i--) {
      const bullet = this.#bullets[i];
      let hit = false;
      for (const enemy of aliveEnemies) {
        if (!enemy.alive) {
          continue;
        }
        if (
          bullet.x < enemy.x + ENEMY_WIDTH &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + ENEMY_HEIGHT &&
          bullet.y + bullet.height > enemy.y
        ) {
          enemy.alive = false;
          hit = true;
          this.score += 1;
          break;
        }
      }
      if (hit) {
        this.#bullets.splice(i, 1);
      }
    }

    this.#updateEnemyDelay();
  }

  onGameDraw(ctx, dt) {
    const speedScale = this.getOpt("speed") * 0.01;

    if (this.#leftPressed) {
      this.#playerX -= 0.22 * speedScale * dt;
    }
    if (this.#rightPressed) {
      this.#playerX += 0.22 * speedScale * dt;
    }

    this.#playerX = Math.max(8, Math.min(this.canvas.width - PLAYER_WIDTH - 8, this.#playerX));

    this.#shotCooldown = Math.max(0, this.#shotCooldown - dt);
    this.#autoShotTimer += dt;
    this.#autoShotInterval = this.#getAutoShotInterval();
    if (this.#autoShotTimer >= this.#autoShotInterval) {
      this.#autoShotTimer = 0;
      this.#shoot();
    }

    for (let i = this.#bullets.length - 1; i >= 0; i--) {
      const bullet = this.#bullets[i];
      bullet.y -= 0.42 * speedScale * dt;
      if (bullet.y + bullet.height < 0) {
        this.#bullets.splice(i, 1);
      }
    }

    this.#enemyMoveTimer += dt;
    if (this.#enemyMoveTimer >= this.#enemyMoveDelay) {
      this.#enemyMoveTimer = 0;
      this.#moveEnemiesOneStep();
    }

    this.#checkCollisionsAndState();

    ctx.fillStyle = getThemeVar("--color-base01");
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = `${getThemeVar("--color-base03")}44`;
    ctx.fillRect(0, this.canvas.height - 40, this.canvas.width, 1);

    const playerY = this.canvas.height - PLAYER_MARGIN_BOTTOM - PLAYER_HEIGHT;
    ctx.fillStyle = getThemeVar("--color-text");
    ctx.beginPath();
    ctx.roundRect(this.#playerX, playerY, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_HEIGHT / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(this.#playerX + PLAYER_WIDTH / 2 - 3, playerY - 5, 6, 6, 3);
    ctx.fill();

    ctx.fillStyle = getThemeVar("--color-accent");
    for (const enemy of this.#aliveEnemies()) {
      ctx.fillRect(enemy.x, enemy.y, ENEMY_WIDTH, ENEMY_HEIGHT);
      ctx.fillRect(enemy.x + 3, enemy.y + ENEMY_HEIGHT, 3, 3);
      ctx.fillRect(enemy.x + ENEMY_WIDTH - 6, enemy.y + ENEMY_HEIGHT, 3, 3);
    }

    ctx.fillStyle = getThemeVar("--color-text");
    for (const bullet of this.#bullets) {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
  }

  onKeyDown(e) {
    if (e.code === "ArrowLeft") {
      this.#leftPressed = true;
    } else if (e.code === "ArrowRight") {
      this.#rightPressed = true;
    }
  }

  onKeyUp(e) {
    if (e.code === "ArrowLeft") {
      this.#leftPressed = false;
    } else if (e.code === "ArrowRight") {
      this.#rightPressed = false;
    }
  }
}

registerWidget(new SpaceInvadersWidget());
