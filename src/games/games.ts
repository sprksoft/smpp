// @ts-nocheck
import { WidgetBase } from "../widgets/widgets.js";
import {
  isStudySessionActive,
  onStudySessionChange,
} from "../widgets/pomodoro.js";

const GAME_OPTION_TYPE_SLIDER = 0;

export class GameOption {
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

export class GameBase extends WidgetBase {
  static lastPlayedGame = null;
  canvas;
  menu;
  score;
  playing;
  hasPlayedAtLeastOnce;
  #hiScore;
  #requestStopGame;
  #optionValues;
  #optionElements = {};
  #lastTs;
  #ctx;

  #scoreEl;
  #buttonEl;
  #buttonWrapperEl;
  #buttonOverlayEl;
  #studyNoticeEl;
  #unsubscribeStudy;

  get category() {
    return "games";
  }

  constructor() {
    document.addEventListener("keydown", async (e) => {
      if (!this.isActive) {
        return;
      }
      if (e.repeat) {
        return;
      }
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "BUTTON" ||
          target.tagName === "SELECT" ||
          target.tagName === "A" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (this.playing) {
        await this.onKeyDown(e);
      } else if (this.hasPlayedAtLeastOnce) {
        if (e.code === "Space") {
          if (GameBase.lastPlayedGame && GameBase.lastPlayedGame !== this) {
            return;
          }
          e.preventDefault();
          if (isStudySessionActive()) {
            this.#showStudyNotice();
            return;
          }
          await this.#startGame();
        }
      }
    });
    document.addEventListener("keyup", async (e) => {
      if (!this.isActive) {
        return;
      }
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "BUTTON" ||
          target.tagName === "SELECT" ||
          target.tagName === "A" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (this.playing) {
        await this.onKeyUp(e);
      }
    });
    super();

    this.#subscribeStudy();
  }

  #subscribeStudy() {
    if (!this.#unsubscribeStudy) {
      this.#unsubscribeStudy = onStudySessionChange((active) => {
        this.#updateStudyBlockState();
        if (active && this.playing) {
          this.stopGame();
        }
      });
    }
  }

  // Start Protected (Use these functions in sub classes)
  getOpt(name) {
    return this.#optionValues[name];
  }

  stopGame() {
    this.#requestStopGame = true;
    if (this.score > this.#hiScore) {
      this.#hiScore = this.score;
    }
  }
  // End protected

  #updateOpt(name, value) {
    const displayEl = this.#optionElements[name].display;
    const inputEl = this.#optionElements[name].input;
    inputEl.value = value;

    let displayValue = Math.round(value / 10);
    displayValue /= 10;
    if (displayValue == Math.round(displayValue)) {
      displayValue += ".0";
    }
    displayEl.innerText = displayValue + "x";
    displayEl.classList.add("game-option-value");

    this.#optionValues[name] = value * 1;
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
        this.setSetting("score", this.#hiScore);

        this.canvas.style.display = "none";
        this.menu.style.display = "flex";
        this.#buttonEl.innerText = "Try Again (Space)";
        this.hasPlayedAtLeastOnce = true;
        this.lastTs = undefined;
        this.#updateStudyBlockState();
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

  async #startGame() {
    if (isStudySessionActive()) {
      this.#showStudyNotice();
      return;
    }
    GameBase.lastPlayedGame = this;
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

  defaultSettings() {
    return { score: 0, options: [] };
  }

  async createContent() {
    this.#optionValues = {};

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
    menuTop.appendChild(this.#scoreEl);

    for (let opt of this.options) {
      let label = document.createElement("label");
      label.classList.add("game-slider-label");
      label.innerText = opt.title;
      menuBottom.appendChild(label);

      if (opt.type == GAME_OPTION_TYPE_SLIDER) {
        let sliderCont = document.createElement("div");
        sliderCont.classList.add("game-slide-container");
        let slider = document.createElement("input");
        slider.type = "range";
        slider.min = opt.min;
        slider.max = opt.max;
        slider.value = 0;
        slider.classList.add("game-slider");
        sliderCont.appendChild(slider);

        let display = document.createElement("span");
        sliderCont.appendChild(display);
        this.#optionElements[opt.name] = { display: display, input: slider };

        slider.addEventListener("input", (e) => {
          this.#updateOpt(opt.name, e.target.value);
        });
        slider.addEventListener("change", async (e) => {
          await this.setSetting("options", this.#optionValues);
        });

        menuBottom.appendChild(sliderCont);
      }
    }

    this.#subscribeStudy();

    let buttonWrapper = document.createElement("div");
    buttonWrapper.classList.add("game-button-wrapper");
    this.#buttonWrapperEl = buttonWrapper;

    this.#buttonEl = document.createElement("button");
    this.#buttonEl.classList.add("game-button");
    this.#buttonEl.innerText = "Play";
    this.#buttonEl.addEventListener("click", async (e) => {
      if (isStudySessionActive()) {
        e.preventDefault();
        e.stopPropagation();
        this.#showStudyNotice();
        return;
      }
      await this.#startGame();
    });

    const originalClick = this.#buttonEl.click.bind(this.#buttonEl);
    this.#buttonEl.click = () => {
      if (isStudySessionActive()) {
        this.#showStudyNotice();
        return;
      }
      originalClick();
    };

    buttonWrapper.appendChild(this.#buttonEl);

    let buttonOverlay = document.createElement("div");
    buttonOverlay.classList.add("game-button-overlay");
    buttonOverlay.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.#showStudyNotice();
    });
    this.#buttonOverlayEl = buttonOverlay;
    buttonWrapper.appendChild(buttonOverlay);

    menuBottom.appendChild(buttonWrapper);

    this.#studyNoticeEl = document.createElement("div");
    this.#studyNoticeEl.classList.add("game-study-notice");
    this.#studyNoticeEl.innerText =
      "Studiemodus actief - concentreer je eerst op je schoolwerk!";
    this.#studyNoticeEl.style.display = "none";
    menuBottom.appendChild(this.#studyNoticeEl);

    this.#updateStudyBlockState();

    menu.appendChild(menuTop);
    menu.appendChild(menuBottom);
    this.menu = menu;
    div.appendChild(menu);
    this.onSettingsChange();
    return div;
  }

  async onSettingsChange() {
    if (this.constructor.name == "SnakeWidget") {
      if (window.localStorage.getItem("snakehighscore")) {
        this.settings = await migrateSnake();
      }
    } else if (this.constructor.name == "FlappyWidget") {
      if (window.localStorage.getItem("flappyhighscore")) {
        this.settings = await migrateFlappy();
      }
    }
    for (let opt of this.options) {
      let value = this.settings.options[opt.name];
      if (!value) {
        value = opt.def;
      }
      this.#updateOpt(opt.name, value);
    }

    this.#hiScore = this.settings.score;
    this.#updateScore();
  }
  async createPreview() {
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
  get title(): string {
    return "";
  }

  async onGameStart() {}
  // Called when the game to update (same on all devices)
  onGameTick() {}
  // Called when the game needs to render a new frame (dt is time since last
  // frame)
  onGameDraw(ctx: CanvasRenderingContext2D, deltaTime: number) {}
  async onKeyDown(e: KeyboardEvent) {}
  async onKeyUp(e: KeyboardEvent) {}
  async onMouse(e: MouseEvent) {}

  get tickSpeed(): number {
    return 60;
  }

  get options(): GameOption[] {
    return [];
  }

  #updateStudyBlockState() {
    const isBlocked = isStudySessionActive();
    if (this.#buttonEl) {
      this.#buttonEl.disabled = isBlocked;
      if (isBlocked) {
        this.#buttonEl.title =
          "Studiemodus actief - concentreer je eerst op je schoolwerk!";
        this.#buttonEl.classList.add("game-button-blocked");
      } else {
        this.#buttonEl.removeAttribute("title");
        this.#buttonEl.classList.remove("game-button-blocked");
      }
    }
    if (this.#buttonWrapperEl) {
      if (isBlocked) {
        this.#buttonWrapperEl.classList.add("blocked");
      } else {
        this.#buttonWrapperEl.classList.remove("blocked");
      }
    }
    if (this.#studyNoticeEl) {
      this.#studyNoticeEl.style.display = isBlocked ? "block" : "none";
    }
  }

  #showStudyNotice() {
    if (this.#studyNoticeEl) {
      this.#studyNoticeEl.innerText =
        "Studiemodus actief - concentreer je eerst op je schoolwerk!";
      this.#studyNoticeEl.style.display = "block";
      this.#studyNoticeEl.classList.remove("game-study-notice-flash");
      void this.#studyNoticeEl.offsetWidth;
      this.#studyNoticeEl.classList.add("game-study-notice-flash");
    }
  }

  async onRemove() {
    if (this.#unsubscribeStudy) {
      this.#unsubscribeStudy();
      this.#unsubscribeStudy = null;
    }
    if (this.playing) {
      this.stopGame();
    }
    this.hasPlayedAtLeastOnce = false;
    if (GameBase.lastPlayedGame === this) {
      GameBase.lastPlayedGame = null;
    }
  }
}
