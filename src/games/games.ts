import { WidgetBase } from "../widgets/widgets.js";

const GAME_OPTION_TYPE_SLIDER = 0;

export type GameSettings = {
  score: number;
  options: Record<string, number>;
};

type OptionElements = {
  display: HTMLSpanElement;
  input: HTMLInputElement;
};

export class GameOption {
  name = "";
  title = "";
  type = GAME_OPTION_TYPE_SLIDER;
  min = 0;
  max = 0;
  def = 0;

  static slider(
    name: string,
    title: string,
    min = 0,
    max = 0,
    def = 0
  ): GameOption {
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

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
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
}

export class GameBase extends WidgetBase {
  // canvas and menu are created in createContent(), before a game can start
  canvas!: HTMLCanvasElement;
  menu!: HTMLDivElement;
  score = 0;
  playing = false;
  hasPlayedAtLeastOnce = false;
  #hiScore = 0;
  #requestStopGame = false;
  #optionValues: Record<string, number> = {};
  #optionElements: Record<string, OptionElements> = {};
  #lastTs: number | undefined;
  #ctx: CanvasRenderingContext2D | null = null;

  #scoreEl: HTMLSpanElement | undefined;
  #buttonEl: HTMLButtonElement | undefined;

  override get category(): string {
    return "games";
  }

  constructor() {
    super();
    document.addEventListener("keydown", async (e) => {
      if (e.repeat) {
        return;
      }
      if (this.playing) {
        await this.onKeyDown(e);
      } else if (this.hasPlayedAtLeastOnce) {
        if (e.code === "Space") {
          await this.#startGame();
        }
      }
    });
    document.addEventListener("keyup", async (e) => {
      if (this.playing) {
        await this.onKeyUp(e);
      }
    });
  }

  // Start Protected (Use these functions in sub classes)
  getOpt(name: string): number {
    return this.#optionValues[name] ?? 0;
  }

  stopGame() {
    this.#requestStopGame = true;
    if (this.score > this.#hiScore) {
      this.#hiScore = this.score;
    }
  }

  get gameSettings(): GameSettings {
    return this.settings;
  }
  // End protected

  #updateOpt(name: string, value: number) {
    const elements = this.#optionElements[name];
    if (!elements) return;
    const { display: displayEl, input: inputEl } = elements;
    inputEl.value = String(value);

    let displayValue = Math.round(value / 10) / 10;
    displayEl.innerText =
      (Number.isInteger(displayValue)
        ? displayValue.toFixed(1)
        : String(displayValue)) + "x";
    displayEl.classList.add("game-option-value");

    this.#optionValues[name] = value;
  }

  #updateScore() {
    if (this.#scoreEl) {
      this.#scoreEl.innerText = "High Score: " + this.#hiScore;
    }
  }

  #draw(ts: number) {
    if (this.#lastTs === undefined) {
      this.#lastTs = ts;
    }
    const deltaTime = ts - this.#lastTs;
    this.#lastTs = ts;
    if (this.#ctx) {
      this.onGameDraw(this.#ctx, deltaTime);
    }
    if (this.#requestStopGame) {
      setTimeout(async () => {
        this.playing = false;
        this.setSetting("score", this.#hiScore);

        this.canvas.style.display = "none";
        this.menu.style.display = "flex";
        if (this.#buttonEl) {
          this.#buttonEl.innerText = "Try Again (Space)";
        }
        this.hasPlayedAtLeastOnce = true;
        this.#lastTs = undefined;
      }, 500);
      return;
    }

    if (this.playing) {
      requestAnimationFrame((ts) => {
        this.#draw(ts);
      });
    }
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

  override defaultSettings(): GameSettings {
    return { score: 0, options: {} };
  }

  override async createContent(): Promise<HTMLDivElement> {
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
        slider.min = String(opt.min);
        slider.max = String(opt.max);
        slider.value = "0";
        slider.classList.add("game-slider");
        sliderCont.appendChild(slider);

        let display = document.createElement("span");
        sliderCont.appendChild(display);
        this.#optionElements[opt.name] = { display: display, input: slider };

        slider.addEventListener("input", () => {
          this.#updateOpt(opt.name, Number(slider.value));
        });
        slider.addEventListener("change", async () => {
          await this.setSetting("options", this.#optionValues);
        });

        menuBottom.appendChild(sliderCont);
      }
    }

    this.#buttonEl = document.createElement("button");
    this.#buttonEl.classList.add("game-button");
    this.#buttonEl.innerText = "Play";
    this.#buttonEl.addEventListener("click", async () => {
      await this.#startGame();
    });
    menuBottom.appendChild(this.#buttonEl);

    menu.appendChild(menuTop);
    menu.appendChild(menuBottom);
    this.menu = menu;
    div.appendChild(menu);
    this.onSettingsChange();
    return div;
  }

  // Moves high scores and speeds saved in localStorage by very old versions
  // (e.g. "snakehighscore") into the widget settings.
  async #migrateLegacyStorage(prefix: string) {
    const storage = window.localStorage;
    const legacyScore = storage.getItem(`${prefix}highscore`);
    if (legacyScore === null) {
      return;
    }
    const legacySpeed = storage.getItem(`${prefix}speed`);
    storage.removeItem(`${prefix}highscore`);
    storage.removeItem(`${prefix}speed`);
    storage.removeItem(`${prefix}speedmultiplier`);

    const settings = this.gameSettings;
    settings.score = Math.max(settings.score, Number(legacyScore) || 0);
    if (legacySpeed !== null && Number(legacySpeed)) {
      settings.options["speed"] = Number(legacySpeed);
    }
    // setSetting saves the whole settings object, including the options above
    await this.setSetting("score", settings.score);
  }

  override async onSettingsChange() {
    if (this.constructor.name == "SnakeWidget") {
      await this.#migrateLegacyStorage("snake");
    } else if (this.constructor.name == "FlappyWidget") {
      await this.#migrateLegacyStorage("flappy");
    }
    for (let opt of this.options) {
      let value = this.gameSettings.options[opt.name];
      if (!value) {
        value = opt.def;
      }
      this.#updateOpt(opt.name, value);
    }

    this.#hiScore = this.gameSettings.score;
    this.#updateScore();
  }
  override async createPreview(): Promise<HTMLDivElement> {
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
  onGameDraw(_ctx: CanvasRenderingContext2D, _deltaTime: number) {}
  async onKeyDown(_e: KeyboardEvent) {}
  async onKeyUp(_e: KeyboardEvent) {}
  async onMouse(_e: MouseEvent) {}

  get tickSpeed(): number {
    return 60;
  }

  get options(): GameOption[] {
    return [];
  }
}
