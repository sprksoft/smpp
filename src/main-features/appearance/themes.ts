import { widgetSystemNotifyThemeChange } from "../../widgets/widgets.js";
import {
  browser,
  getExtensionImage,
  isValidHexColor,
} from "../../common/utils.js";
import { colord } from "colord";
import { copySvg, doneSvg, editIconSvg } from "../../fixes-utils/svgs.js";
import type { Image } from "../modules/images.js";
import { BaseWindow } from "../modules/windows.js";

export let currentThemeName: string;
export let currentTheme: Theme;

export type Theme = {
  displayName: string;
  cssProperties: { [key: string]: string };
};

export type Themes = {
  [key: string]: Theme;
};

export async function getTheme(name: string): Promise<Theme> {
  let theme = (await browser.runtime.sendMessage({
    action: "getTheme",
    name: name,
  })) as Theme;
  return theme;
}

export async function setTheme(themeName: string) {
  const style = document.documentElement.style;
  currentThemeName = themeName;
  currentTheme = await getTheme(themeName);
  Object.entries(currentTheme.cssProperties).forEach(([key, value]) => {
    style.setProperty(key, value);
  });

  await widgetSystemNotifyThemeChange();
}

export function getThemeQueryString(theme: Theme) {
  let query = "";
  Object.entries(theme.cssProperties).forEach(([key, value]) => {
    query += `&${key}=${value.startsWith("#") ? value.substring(1) : value}`;
  });
  return query;
}

export function getThemeVar(varName: string) {
  return currentTheme.cssProperties[varName];
}

export async function exampleSaveCustomTheme() {
  let testCustomTheme: Theme = {
    displayName: "testTheme",
    cssProperties: {
      "--color-accent": "#4d5da2",
      "--color-text": "#1c1916",
      "--color-base00": "#f5fefe",
      "--color-base01": "#eef7f7",
      "--color-base02": "#dde6e6",
      "--color-base03": "#cfd7d7",
      "--color-homepage-sidebars-bg": "rgba(100, 100, 100, 0.2)",
      "--darken-background": "rgba(215, 215, 215, 0.40)",
      "--color-splashtext": "#120500",
    },
  };
  let id = await browser.runtime.sendMessage({
    action: "saveCustomTheme",
    data: testCustomTheme,
  });

  let data = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });
  data.appearance.theme = id;
  await browser.runtime.sendMessage({
    action: "setSettingsData",
    data: data,
  });
}

class ColorCursor {
  element: HTMLElement = document.createElement("div");
  visibleElement: HTMLElement = document.createElement("div");
  xPos = 50;
  yPos = 50;
  enableX: boolean;
  enableY: boolean;
  parentContainer: HTMLElement;

  constructor(
    parentContainer: HTMLElement,
    enableX: boolean = true,
    enableY: boolean = true
  ) {
    this.parentContainer = parentContainer;
    this.enableX = enableX;
    this.enableY = enableY;
    this.element.appendChild(this.visibleElement);

    let isDragging = false;
    this.parentContainer.addEventListener("mousedown", (e) => {
      isDragging = true;
      this.handlePointerEvent(e);
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        this.handlePointerEvent(e);
      }
    });
    this.updateCursorPosition();
  }

  handlePointerEvent(e: MouseEvent) {
    const rect = this.parentContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    if (this.enableX) this.xPos = Math.max(0, Math.min(100, xPercent));
    if (this.enableY) this.yPos = Math.max(0, Math.min(100, yPercent));

    this.updateCursorPosition();
    this.onDrag();
  }

  // Overwrite this if needed
  onDrag() {}

  updateCursorPosition() {
    this.element.style.left = `${this.xPos}%`;
    this.element.style.top = `${this.yPos}%`;
  }
}

export class ColorPicker {
  currentColor = colord("#72b6c0ff");
  width: string;
  element = document.createElement("div");
  hueContainer = document.createElement("div");
  fieldContainer = document.createElement("div");

  hueCursor: ColorCursor;
  fieldCursor: ColorCursor;

  constructor(width = "20rem") {
    this.width = width;
    this.hueCursor = this.createHueCursor();
    this.hueCursor.onDrag = () => {
      this.readColor();
    };
    this.fieldCursor = this.createFieldCursor();
    this.fieldCursor.onDrag = () => {
      this.readColor();
    };
  }

  createFieldCursor() {
    let fieldCursor = new ColorCursor(this.fieldContainer);
    fieldCursor.element.classList.add("color-cursor-wrapper");
    fieldCursor.visibleElement.classList.add("color-cursor");
    return fieldCursor;
  }

  createHueCursor() {
    let hueCursor = new ColorCursor(this.hueContainer, true, false);
    hueCursor.element.classList.add("color-cursor-wrapper");
    hueCursor.visibleElement.classList.add("color-cursor");
    return hueCursor;
  }

  createHueContainer() {
    this.hueContainer.classList.add("hue-picker");
    this.hueContainer.appendChild(this.hueCursor.element);
    return this.hueContainer;
  }

  createFieldContainer() {
    this.fieldContainer.classList.add("color-picker-field");
    let horizontalContainer = document.createElement("div");
    horizontalContainer.style.background = `linear-gradient(to left, var(--max-sat) 0%, rgba(255, 255, 255, 1) 100%)`;

    let verticalContainer = document.createElement("div");
    verticalContainer.style.background =
      "linear-gradient(to top, black, transparent)";

    this.fieldContainer.appendChild(horizontalContainer);
    this.fieldContainer.append(verticalContainer);

    this.fieldContainer.appendChild(this.fieldCursor.element);
    return this.fieldContainer;
  }

  copyHexToClipBoard() {
    navigator.clipboard.writeText(this.currentColor.toHex());
  }

  createBottomContainer() {
    let createCopyButton = () => {
      let button = document.createElement("button");
      button.innerHTML = copySvg;
      button.classList.add("copy-hex-button");
      button.addEventListener("click", () => {
        this.copyHexToClipBoard();
        let svg = button.querySelector("svg");
        if (!svg) return;
        svg.style.fill = "var(--color-text)";
        button.innerHTML = doneSvg;

        setTimeout(() => {
          svg.style.fill = "none";
          button.innerHTML = copySvg;
        }, 1000);
      });
      return button;
    };

    let createHexInput = () => {
      let hexInput = document.createElement("input");
      hexInput.classList.add("smpp-text-input");
      hexInput.addEventListener("change", () => {
        this.readColorInput();
      });
      hexInput.type = "text";
      hexInput.value = this.currentColor.toHex();
      return hexInput;
    };

    function createColorPreview() {
      let colorPreview = document.createElement("div");
      colorPreview.classList.add("color-preview");
      return colorPreview;
    }

    let bottomContainer = document.createElement("div");
    bottomContainer.classList.add("smpp-color-picker-bottom-container");
    bottomContainer.appendChild(createColorPreview());
    bottomContainer.appendChild(createHexInput());
    bottomContainer.appendChild(createCopyButton());

    return bottomContainer;
  }

  render() {
    this.element.classList.add("smpp-color-picker");

    this.element.style.width = this.width;
    this.element.appendChild(this.createFieldContainer());
    this.element.appendChild(this.createHueContainer());
    this.element.appendChild(this.createBottomContainer());

    this.updateColorPicker();
    return this.element;
  }

  readColorInput() {
    let hexInput = this.element.querySelector("input");
    if (hexInput) {
      if (isValidHexColor(hexInput.value)) {
        this.currentColor = colord(hexInput.value);
      } else {
        hexInput.value = this.currentColor.toHex();
      }
    }

    this.hueCursor.xPos = this.currentColor.hue() / 3.6;
    this.fieldCursor.xPos = this.currentColor.toHsv().s;
    this.fieldCursor.yPos = 100 - this.currentColor.toHsv().v;
    this.hueCursor.updateCursorPosition();
    this.fieldCursor.updateCursorPosition();
    this.updateColorPicker();
  }

  readColor() {
    let hue = this.hueCursor.xPos * 3.6;
    let saturation = this.fieldCursor.xPos;
    let value = 100 - this.fieldCursor.yPos;

    this.currentColor = colord({ h: hue, s: saturation, v: value });
    this.updateColorPicker();
  }

  updateColorPicker() {
    let maxSatColor = colord({ h: this.hueCursor.xPos * 3.6, s: 100, v: 100 });
    this.element.style.setProperty("--max-sat", maxSatColor.toHex());
    this.element.style.setProperty(
      "--current-color",
      this.currentColor.toHex()
    );
    let hexInput = this.element.querySelector("input");
    if (hexInput) {
      hexInput.value = this.currentColor.toHex();
    }
    this.onChange();
  }

  onChange() {}
}

export class CustomThemeCreator extends BaseWindow {}

export class Tile {
  element = document.createElement("div");

  // Overide in de implementation
  async onClick() {}

  async render() {
    this.element.classList.add("theme-tile");
    this.element.addEventListener("click", async () => {
      await this.onClick();
    });
    await this.createContent();
    return this.element;
  }

  // Overide this in the implementation
  async createContent() {}
}

export class ThemeTile extends Tile {
  name: string;
  isCustom: boolean;

  constructor(name: string, isCustom = false) {
    super();
    this.name = name;
    this.isCustom = isCustom;
  }

  async getBackgroundImage() {
    let image = document.createElement("img");
    image.classList.add("theme-tile-image");
    let result = (await browser.runtime.sendMessage({
      action: "getImage",
      id: this.name,
    })) as Image;

    if (result.type == "default") {
      result.imageData = await getExtensionImage(
        "theme-backgrounds/" + this.name + ".jpg"
      );
    }
    image.src = result.imageData;
    return image;
  }

  getBottomContainer(theme: Theme) {
    let bottomContainer = document.createElement("div");
    bottomContainer.classList.add("theme-tile-bottom");

    let title = document.createElement("span");
    title.innerText = theme.displayName;
    title.classList.add("theme-tile-title");
    bottomContainer.appendChild(title);

    let duplicateButton = document.createElement("button");
    duplicateButton.classList.add("bottom-container-button");
    duplicateButton.innerHTML = copySvg;
    duplicateButton.addEventListener("click", async () => {
      await this.onDuplicate();
    });
    bottomContainer.appendChild(duplicateButton);

    if (this.isCustom) {
      let editButton = document.createElement("button");
      editButton.classList.add("bottom-container-button");
      editButton.innerHTML = editIconSvg;
      editButton.addEventListener("click", async () => {
        await this.onEdit();
      });
      bottomContainer.appendChild(editButton);
    }

    return bottomContainer;
  }

  async createContent() {
    this.element.appendChild(await this.getBackgroundImage());
    let theme = await getTheme(this.name);
    Object.keys(theme.cssProperties).forEach((key) => {
      this.element.style.setProperty(
        `${key}-local`,
        theme.cssProperties[key] as string
      );
    });
    this.element.appendChild(this.getBottomContainer(theme));
  }

  async onClick() {
    await browser.runtime.sendMessage({
      action: "setSetting",
      name: "appearance.theme",
      data: this.name,
    });
    setTheme(this.name);
  }

  // Overide in de implementation
  async onEdit() {}

  // Overide in de implementation
  async onDuplicate() {}
}

export class ThemeFolder extends Tile {
  category: string;
  constructor(category: string) {
    super();
    this.category = category;
  }

  getBottomContainer() {
    let bottomContainer = document.createElement("div");
    bottomContainer.classList.add("theme-tile-bottom");

    let title = document.createElement("span");
    title.innerText = this.category;
    title.classList.add("theme-tile-title");
    bottomContainer.appendChild(title);

    return bottomContainer;
  }

  async createContent() {
    let themes = (await browser.runtime.sendMessage({
      action: "getThemes",
      categories: [this.category],
      includeHidden: true,
    })) as {
      [key: string]: Theme;
    } | null;

    if (!themes) return;
    let theme = themes[0];
    if (!theme) return;

    Object.keys(theme.cssProperties).forEach((key) => {
      this.element.style.setProperty(
        `${key}-local`,
        theme.cssProperties[key] as string
      );
    });
    this.element.appendChild(this.getBottomContainer());
  }
}

type Tiles = Tile[];

export class ThemeSelector {
  element = document.createElement("div");

  render() {
    return this.element;
  }

  renderTiles(tiles: Tiles) {
    let content = document.createElement("div");
    tiles.forEach(async (tile) => {
      content.appendChild(await tile.render());
    });
  }

  async openFolder(category: string) {
    let themes = (await browser.runtime.sendMessage({
      action: "getThemes",
      categories: [category],
      includeHidden: true,
    })) as {
      [key: string]: Theme;
    };
    if (!themes) return;
    // TIME TO MAP TIME TO MAP!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    Object.keys(themes).forEach(async (name: string) => {
      let tile = new ThemeTile(name);
    });
  }
}
