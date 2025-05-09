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

  constructor() {
    document.addEventListener("keydown", async (e) => {
      if (this.playing) {
        await this.onKeyDown(e);
      } else if (this.hasPlayedAtLeastOnce) {
        if (e.code === "Space") {
          await this.#startGame();
        }
      }
    });
    super();
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
    this.#ctx = this.canvas.getContext("2d", { alpha: false });
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
    this.#options = {};

    let div = document.createElement("div");
    div.classList.add("game-container");

    this.canvas = document.createElement("canvas");
    this.canvas.width = 300;
    this.canvas.height = 300;
    this.canvas.classList.add("game-canvas");
    this.canvas.style.display = "none";
    this.canvas.addEventListener("click", async (e) => {
      if (this.playing) {
        await this.onMouse(e);
      }
    });
    div.appendChild(this.canvas);

    let menuTop = document.createElement("div");
    menuTop.classList.add("game-menu-top");
    let menuBottom = document.createElement("div");
    menuBottom.classList.add("game-menu-bottom");
    let menu = document.createElement("div");
    menu.classList.add("game-menu");

    let title = document.createElement("h2");
    title.classList.add("game-title");
    title.innerText = this.title.endsWith("++")
      ? this.title
      : this.title + "++";
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
  async createPreview() {
    let gameData = await browser.runtime.sendMessage({
      action: "getGameData",
      game: this.constructor.name,
    });

    let div = document.createElement("div");
    div.classList.add("game-container");

    let menuTop = document.createElement("div");
    menuTop.classList.add("game-menu-top");
    let menuBottom = document.createElement("div");
    menuBottom.classList.add("game-menu-bottom");
    let menu = document.createElement("div");
    menu.classList.add("game-menu");

    let title = document.createElement("h2");
    title.classList.add("game-title");
    title.innerText = this.title.endsWith("++")
      ? this.title
      : this.title + "++";
    menuTop.appendChild(title);

    let scoreEl = document.createElement("span");
    scoreEl.classList.add("game-score");
    scoreEl.innerText = "Highscore: " + gameData.score;
    menuTop.appendChild(scoreEl);

    let buttonEl = document.createElement("button");
    buttonEl.classList.add("game-button");
    buttonEl.innerText = "Play";

    menuBottom.appendChild(buttonEl);

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
  async onMouse(e) {}

  get tickSpeed() {
    return 60;
  }

  get options() {
    return [];
  }
}
