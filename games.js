const GAME_OPTION_TYPE_SLIDER = 0;

class GameOption {
  name;
  title;
  type;
  min;
  max;
  def;

  static slider(name, title, min = 0, max = 0, def = 0) {
    let go = new GameOption();
    go.name = name;
    go.title = title;
    go.type = GAME_OPTION_TYPE_SLIDER;
    go.min = min;
    go.def = def;
    go.max = max;
    return go;
  }
}

class GameBase extends WidgetBase {
  canvas;
  menu;
  score;
  playing;
  hasPlayedAtLeastOnce;
  #hiScore;
  #requestStopGame;
  #options;
  #lastTs;
  #ctx;

  #scoreEl;
  #buttonEl;

  get category() {
    return "games";
  }

  // Start Protected (Use these functions in sub classes)
  getOpt(name) {
    return this.#options[name];
  }

  stopGame() {
    this.#requestStopGame = true;
    if (this.score > this.#hiScore) {
      this.#hiScore = this.score;
    }
    this.#updateScore();
  }
  // End protected

  #updateOpt(name, value, displayEl) {
    let displayValue = Math.round(value / 10);
    displayValue /= 10;
    if (displayValue == Math.round(displayValue)) {
      displayValue += ".0";
    }
    displayEl.innerText = displayValue + "x";
    displayEl.classList.add("game-option-value");

    this.#options[name] = value * 1;
  }

  #updateScore() {
    this.#scoreEl.innerText = "High Score: " + this.#hiScore;
  }

  #draw(ts) {
    if (!this.#lastTs) {
      this.#lastTs = ts;
    }
    const deltaTime = ts - this.#lastTs;
    this.#lastTs = ts;
    this.onGameDraw(this.#ctx, deltaTime);
    if (this.#requestStopGame) {
      setTimeout(async () => {
        this.playing = false;
        await this.#saveGameData();

        this.canvas.style.display = "none";
        this.menu.style.display = "flex";
        this.#buttonEl.innerText = "Try Again (Space)";
        this.hasPlayedAtLeastOnce = true;
        this.lastTs = undefined;
      }, 500);
      return;
    }

    if (this.playing) {
      requestAnimationFrame((ts) => {
        this.#draw(ts);
      });
    }
  }
  #tick() {}

  async #saveGameData() {
    await browser.runtime.sendMessage({
      action: "setGameData",
      game: this.constructor.name,
      data: {
        options: this.#options,
        score: this.#hiScore,
      },
    });
  }

  async #startGame() {
    this.canvas.style.display = "block";
    this.menu.style.display = "none";
    this.#requestStopGame = false;
    this.#ctx = this.canvas.getContext("2d");
    this.playing = true;
    this.score = 0;
    await this.onGameStart();

    this.#lastTs = undefined;
    window.requestAnimationFrame((ts) => {
      this.#draw(ts);
    });
  }

  async createContent() {
    let gameData = await browser.runtime.sendMessage({
      action: "getGameData",
      game: this.constructor.name,
    });
    if (!gameData) {
      gameData = {
        options: {},
        score: 0,
      };
    }
    this.#options = {};

    let div = document.createElement("div");
    div.classList.add("game-container");
    document.addEventListener("keydown", async (e) => {
      if (this.playing) {
        await this.onKeyDown(e);
      } else if (this.hasPlayedAtLeastOnce) {
        if (e.code === "Space") {
          await this.#startGame();
        }
      }
    });

    this.canvas = document.createElement("canvas");
    this.canvas.width = 300;
    this.canvas.height = 300;
    this.canvas.classList.add("game-canvas");
    this.canvas.style.display = "none";
    div.appendChild(this.canvas);

    let menuTop = document.createElement("div");
    menuTop.classList.add("game-menu-top");
    let menuBottom = document.createElement("div");
    menuBottom.classList.add("game-menu-bottom");
    let menu = document.createElement("div");
    menu.classList.add("game-menu");

    let title = document.createElement("h2");
    title.classList.add("game-title");
    title.innerText = this.title;
    menuTop.appendChild(title);

    this.#scoreEl = document.createElement("span");
    this.#scoreEl.classList.add("game-score");
    this.#hiScore = gameData.score;
    menuTop.appendChild(this.#scoreEl);

    for (let opt of this.options) {
      let label = document.createElement("label");
      label.classList.add("game-slider-label");
      label.innerText = opt.title;
      menuBottom.appendChild(label);

      let value = gameData.options[opt.name];
      if (!value) {
        value = opt.def;
      }

      if (opt.type == GAME_OPTION_TYPE_SLIDER) {
        let sliderCont = document.createElement("div");
        sliderCont.classList.add("game-slide-container");
        let slider = document.createElement("input");
        slider.type = "range";
        slider.min = opt.min;
        slider.max = opt.max;
        slider.value = value;
        slider.classList.add("game-slider");
        sliderCont.appendChild(slider);

        let display = document.createElement("span");
        this.#updateOpt(opt.name, value, display);
        sliderCont.appendChild(display);

        slider.addEventListener("input", async (e) => {
          this.#updateOpt(opt.name, e.target.value, display);
          await this.#saveGameData();
        });
        this.#updateScore();

        menuBottom.appendChild(sliderCont);
      }
    }

    this.#buttonEl = document.createElement("button");
    this.#buttonEl.classList.add("game-button");
    this.#buttonEl.innerText = "Play";
    this.#buttonEl.addEventListener("click", async (e) => {
      await this.#startGame();
    });
    menuBottom.appendChild(this.#buttonEl);

    menu.appendChild(menuTop);
    menu.appendChild(menuBottom);
    this.menu = menu;
    div.appendChild(menu);

    return div;
  }

  // Override us

  // (required)
  get title() {}

  async onGameStart() {}
  // Called when the game to update (same on all devices)
  onGameTick() {}
  // Called when the game needs to render a new frame (dt is time since last frame)
  onGameDraw(ctx, deltaTime) {}
  async onKeyDown(key) {}

  get tickSpeed() {
    return 60;
  }

  get options() {
    return [];
  }
}

class SnakeWidget extends GameBase {
  get title() {
    return "Snake++";
  }
  get options() {
    return [GameOption.slider("speed", "Speed:", 10, 300, 100)];
  }
}
registerWidget(new SnakeWidget());

const BIRD_RADIUS = 5;
const BIRD_X = 50;
const FLOOR_H = 15;
const PIPE_GAP = 50;
const PIPE_SPEED = 0.2;
const TERMVEL = 0.3;
const PIPE_W = 10;
const GRAVITY = 0.0005;
class FlappyWidget extends GameBase {
  bgX;
  birdY;
  birdVel;
  jump;
  pipe;

  get title() {
    return "Flappy++";
  }
  get options() {
    return [GameOption.slider("speed", "Speed:", 10, 300, 100)];
  }

  #drawGround(ctx) {
    let w = this.canvas.width;
    let h = this.canvas.height;
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.moveTo(0, h - FLOOR_H);
    ctx.lineTo(w, h - FLOOR_H);
    ctx.stroke();

    ctx.fillStyle = getCurThemeVar("--color-accent");
    ctx.strokeStyle = getCurThemeVar("--color-base01");
    ctx.fillRect(0, h - FLOOR_H, w, FLOOR_H);
    ctx.strokeRect(0, h - FLOOR_H, w, FLOOR_H);

    for (let i = 0; i < (w / 20) * 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 20 + this.bgX, h - FLOOR_H);
      ctx.lineTo(i * 20 + this.bgX + FLOOR_H, h);
      ctx.stroke();
    }
  }

  #calcGap() {
    return Math.max(
      PIPE_GAP * this.getOpt("speed") * 0.01,
      BIRD_RADIUS * 2 + 5
    );
  }

  #drawPipe(ctx, pipe) {
    const gap_size = this.#calcGap();
    ctx.fillStyle = getCurThemeVar("--color-accent");
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
  #updatePipe(pipe, dt) {
    pipe.x -= this.getOpt("speed") * 0.01 * dt * PIPE_SPEED;
    if (pipe.x < -PIPE_W) {
      this.#resetPipe(pipe);
    }

    if (pipe.x < BIRD_X + BIRD_RADIUS && !pipe.checked) {
      pipe.checked = true;
      const gap_size = this.#calcGap();
      const gapTop = pipe.y - gap_size * 0.5;
      const gapBot = pipe.y + gap_size * 0.5;
      if (
        this.birdY + BIRD_RADIUS >= gapTop &&
        this.birdY + BIRD_RADIUS < gapBot
      ) {
        this.score++;
      } else {
        this.stopGame();
      }
    }
  }
  #resetPipe(pipe) {
    const gap_size = this.#calcGap();
    pipe.x = this.canvas.width + PIPE_W;
    const MARGIN = gap_size * 0.5 + FLOOR_H + 10;
    pipe.y = Math.random() * (this.canvas.height - MARGIN * 2) + MARGIN;
    pipe.checked = false;
  }

  #drawBird(ctx) {
    ctx.fillStyle = getCurThemeVar("--color-accent");
    ctx.beginPath();
    ctx.arc(BIRD_X, this.birdY, BIRD_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
  }

  async onGameStart() {
    this.bgX = 0;
    this.jump = false;
    this.birdY = this.canvas.height / 2.0;
    this.birdVel = 0;
    this.pipe = { x: 0, y: 0 };
    this.canvas.addEventListener("click", () => {
      this.jump = true;
    });
    this.#resetPipe(this.pipe);
  }

  onGameDraw(ctx, dt) {
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.birdY += this.birdVel * dt;
    this.birdVel = Math.min(
      this.birdVel + GRAVITY * this.getOpt("speed") * 0.01 * dt,
      TERMVEL
    );
    ctx;
    if (this.jump) {
      this.jump = false;
      this.birdVel = -0.2 * this.getOpt("speed") * 0.01; //Math.min(this.birdVel-0.2, -0.2);
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

  async onKeyDown(e) {
    if (e.repeat) {
      return;
    }
    if (e.code === "Space" || e.code === "ArrowUp") {
      this.jump = true;
      e.preventDefault();
    }
  }
}
registerWidget(new FlappyWidget());
