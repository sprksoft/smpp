import { Vibrant } from "node-vibrant/browser";
import type { Palette, Swatch } from "@vibrant/color";
import { Colord, colord, extend } from "colord";
import lchPlugin from "colord/plugins/lch";
import mixPlugin from "colord/plugins/mix";

extend([lchPlugin, mixPlugin]);

import { widgetSystemNotifyThemeChange } from "../../widgets/widgets.js";
import {
  browser,
  getExtensionImage,
  isValidHexColor,
} from "../../common/utils.js";

import {
  chevronLeftSvg,
  copySvg,
  doneSvg,
  editIconSvg,
  heartSvg,
  folderSvg,
  loadingSpinnerSvg,
  magicWandSvg,
  moonSvg,
  pineSvg,
  playSvg,
  plusSVG,
  sunSvg,
  trashSvg,
  wandSvg,
  brokenHeartSvg,
} from "../../fixes-utils/svgs.js";
import {
  getImageURL,
  ImageSelector,
  type SMPPImage,
} from "../modules/images.js";
import { BaseWindow } from "../modules/windows.js";
import {
  openSettingsWindow,
  settingsWindow,
  type Settings,
} from "../settings/main-settings.js";
import { loadQuickSettings } from "../settings/quick-settings.js";
import { applyAppearance, isFirefox } from "../main.js";
import { createHoverTooltip, createTextInput } from "./ui.js";
import { isValidImage } from "../../fixes-utils/utils.js";
import { recreateGlobalChat } from "../globalchat.js";

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
  recreateGlobalChat();
}

export function getThemeQueryString(theme: Theme) {
  let query = "";
  Object.entries(theme.cssProperties).forEach(([key, value]) => {
    query += `&${key.slice(2)}=${value.startsWith("#") ? value.substring(1) : value}`;
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

  await updateTheme(id);
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
  onDrag() { }

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
    this.hueCursor.onDrag = async () => {
      await this.readColor();
    };
    this.fieldCursor = this.createFieldCursor();
    this.fieldCursor.onDrag = async () => {
      await this.readColor();
    };
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
    this.updateFields();
    this.updateColorPicker();
  }

  async readColor() {
    let hue = this.hueCursor.xPos * 3.6;
    let saturation = this.fieldCursor.xPos;
    let value = 100 - this.fieldCursor.yPos;

    this.currentColor = colord({ h: hue, s: saturation, v: value });
    await this.updateColorPicker();
  }

  async updateColorPicker() {
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
    await this.onChange();
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

  updateFields() {
    this.hueCursor.xPos = this.currentColor.hue() / 3.6;
    this.fieldCursor.xPos = this.currentColor.toHsv().s;
    this.fieldCursor.yPos = 100 - this.currentColor.toHsv().v;
    this.hueCursor.updateCursorPosition();
    this.fieldCursor.updateCursorPosition();
  }

  render() {
    this.element.classList.add("smpp-color-picker");

    this.element.style.width = this.width;
    this.element.appendChild(this.createFieldContainer());
    this.element.appendChild(this.createHueContainer());
    this.element.appendChild(this.createBottomContainer());

    this.updateFields();

    this.updateColorPicker();
    return this.element;
  }

  async onChange() { }
}

export class Tile {
  element = document.createElement("div");

  async render() {
    this.element.classList.add("theme-tile");
    this.element.style.height = "104px";
    this.element.style.width = "168px";
    this.element.addEventListener("click", async (e) => {
      await this.onClick(e);
    });
    this.updateSelection();
    await this.createContent();
    return this.element;
  }

  async updateImage(currentTheme: string, forceReload = false) { }

  // Overide this in the implementation
  updateSelection() { }
  // Overide in de implementation
  async onClick(e: MouseEvent) { }

  // Overide this in the implementation
  async createContent() { }
}

export class ThemeTile extends Tile {
  name: string;
  isFavorite: boolean;
  isCustom: boolean;
  currentCategory: string;
  titleElement = document.createElement("span");

  constructor(
    name: string,
    currentCategory: string,
    isFavorite: boolean,
    isCustom = false
  ) {
    super();
    this.name = name;
    this.currentCategory = currentCategory;
    this.isFavorite = isFavorite;
    this.isCustom = isCustom;
  }

  async updateCSS() {
    let theme = await getTheme(this.name);
    Object.keys(theme.cssProperties).forEach((key) => {
      this.element.style.setProperty(
        `${key}-local`,
        theme.cssProperties[key] as string
      );
    });
  }

  async updateTitle() {
    let theme = await getTheme(this.name);
    this.titleElement.innerText = theme.displayName;
  }

  async createContent() {
    this.element.appendChild(this.createImageContainer());
    this.element.appendChild(this.getBottomContainer());
    await this.updateTitle();
    await this.updateCSS();
  }

  getBottomContainer() {
    let bottomContainer = document.createElement("div");
    bottomContainer.classList.add("theme-tile-bottom");

    this.titleElement.classList.add("theme-tile-title");
    bottomContainer.appendChild(this.titleElement);

    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("theme-button-container");

    let duplicateButton = document.createElement("button");
    duplicateButton.classList.add("bottom-container-button");
    duplicateButton.innerHTML = copySvg;
    duplicateButton.addEventListener("click", async () => {
      await this.duplicate();
    });
    buttonContainer.appendChild(duplicateButton);

    if (this.isCustom) {
      let editButton = document.createElement("button");
      editButton.classList.add("bottom-container-button");
      editButton.innerHTML = editIconSvg;
      editButton.addEventListener("click", async () => {
        await this.edit();
      });
      buttonContainer.appendChild(editButton);
    }

    let favoriteButton = document.createElement("button");
    favoriteButton.classList.add("bottom-container-button");
    favoriteButton.innerHTML = heartSvg;
    favoriteButton.addEventListener("click", async () => {
      await this.favoriteToggle();
    });
    if (this.isFavorite) this.element.classList.add("is-favorite");
    buttonContainer.appendChild(favoriteButton);

    bottomContainer.appendChild(buttonContainer);

    return bottomContainer;
  }

  createImageContainer() {
    let imageContainer = document.createElement("div");
    imageContainer.classList.add("image-container");
    return imageContainer;
  }

  updateSelection() {
    if (currentThemeName == this.name) {
      this.element.classList.add("is-selected");
    } else {
      this.element.classList.remove("is-selected");
    }
  }

  async updateImage(currentTheme: string, forceReload = false) {
    if (this.name == currentTheme || forceReload) {
      let imageURL = await getImageURL(
        this.name,
        async () => {
          return await getExtensionImage(
            "theme-backgrounds/compressed/" + this.name + ".jpg"
          );
        },
        true
      );
      if (await isValidImage(await imageURL.url)) {
        this.element.style.setProperty(
          "--background-image-local",
          `url(${await imageURL.url})`
        );
      } else {
        console.log(imageURL.url, "is not valdid");
        this.element.style.setProperty("--background-image-local", `url()`);
      }

      if (isFirefox && imageURL.type == "file") {
        let imageContainer = this.element.querySelector(".image-container");
        if (!imageContainer) return;

        let stupidImageContainer = document.createElement("img");
        stupidImageContainer.classList.add(
          "image-container",
          "firefox-container"
        );
        if (await isValidImage(imageURL.url)) {
          stupidImageContainer.src = imageURL.url;
        } else {
          stupidImageContainer.src = "";
        }

        let bottomContainer = this.element.querySelector(".theme-tile-bottom");
        if (!bottomContainer) return;
        imageContainer.remove();
        this.element.prepend(stupidImageContainer);
      } else if (isFirefox) {
        let firefoxImageContainer =
          this.element.querySelector(".firefox-container");
        if (firefoxImageContainer) {
          firefoxImageContainer.remove();
          this.element.prepend(this.createImageContainer());
          await this.updateImage(currentTheme, forceReload);
        }
      }
    }
  }

  async onClick(e: Event) {
    if (e.target instanceof HTMLElement) {
      const targetElement = e.target;
      if (targetElement.classList.contains("heart-icon")) return;
    }
    await updateTheme(this.name);
    await settingsWindow.loadPage(false);
    await loadQuickSettings();
  }

  async favoriteToggle() {
    this.isFavorite = !this.isFavorite;
    console.log(this.isFavorite);
    let data = (await browser.runtime.sendMessage({
      action: "getSettingsData",
    })) as Settings;
    let quickSettingsThemes = data.appearance.quickSettingsThemes;

    if (this.isFavorite) {
      quickSettingsThemes.push(this.name);
    } else {
      quickSettingsThemes = quickSettingsThemes.filter((name: string) => {
        return name != this.name;
      });
      if (this.currentCategory == "quickSettings") {
        this.element.classList.add("being-removed");
      }
    }
    await browser.runtime.sendMessage({
      action: "setSetting",
      name: "appearance.quickSettingsThemes",
      data: quickSettingsThemes,
    });
    console.log(quickSettingsThemes);
    this.element.classList.toggle("is-favorite");
    this.onFavoriteToggle();
  }

  async edit() {
    startCustomThemeCreator(await getTheme(this.name), this.name);
  }

  async duplicate() {
    let newThemeName = await browser.runtime.sendMessage({
      action: "saveCustomTheme",
      data: await getTheme(this.name),
    });
    let result = (await browser.runtime.sendMessage({
      action: "getImage",
      id: this.name,
    })) as SMPPImage;
    let compressedResult = (await browser.runtime.sendMessage({
      action: "getImage",
      id: "compressed-" + this.name,
    })) as SMPPImage;

    if (result.type == "default") {
      result.imageData = await getExtensionImage(
        "theme-backgrounds/" + this.name + ".jpg"
      );
      compressedResult.imageData = await getExtensionImage(
        "theme-backgrounds/compressed/" + this.name + ".jpg"
      );
      if (!this.isCustom) {
        result.type = "link";
        result.link = this.name + ".jpg";

        compressedResult.type = "link";
        compressedResult.link = this.name + ".jpg";
      }
    }

    if (await isValidImage(result.imageData)) {
      await browser.runtime.sendMessage({
        action: "setImage",
        id: newThemeName,
        data: result,
      });
    }
    if (await isValidImage(compressedResult.imageData)) {
      await browser.runtime.sendMessage({
        action: "setImage",
        id: "compressed-" + newThemeName,
        data: compressedResult,
      });
    }
    this.onDuplicate(newThemeName);
  }

  // Overide in de implementation
  async onFavoriteToggle() { }

  // Overide in de implementation
  async onDuplicate(newThemeName: string) { }
}

async function updateTheme(name: string) {
  await browser.runtime.sendMessage({
    action: "setSetting",
    name: "appearance.theme",
    data: name,
  });
  let data = (await browser.runtime.sendMessage({
    action: "getSettingsData",
  })) as Settings;
  applyAppearance(data.appearance);
}

export class ThemeFolder extends Tile {
  category: string;
  constructor(category: string) {
    super();
    this.category = category;
  }

  async createContent() {
    let firstThemeInCategory = (await browser.runtime.sendMessage({
      action: "getFirstThemeInCategory",
      category: this.category,
      includeHidden: true,
    })) as string;

    if (!firstThemeInCategory) return;
    let theme = (await browser.runtime.sendMessage({
      action: "getTheme",
      name: firstThemeInCategory,
    })) as Theme;

    Object.keys(theme.cssProperties).forEach((key) => {
      this.element.style.setProperty(
        `${key}-local`,
        theme.cssProperties[key] as string
      );
    });

    if (this.category == "custom" || this.category == "quickSettings") {
      this.element.classList.add("use-default-colors");
    }

    this.element.style.setProperty("--background-image-local", `url()`);
    this.element.appendChild(this.createImageContainer());
    this.element.appendChild(this.createBottomContainer());
  }

  createBottomContainer() {
    let bottomContainer = document.createElement("div");
    bottomContainer.classList.add("theme-tile-bottom");

    let title = document.createElement("span");
    title.innerText = getFancyCategoryName(this.category);
    if (this.category == "quickSettings") {
      title.innerText = "Favorites";
    }

    title.classList.add("theme-tile-title");
    bottomContainer.appendChild(title);

    return bottomContainer;
  }

  createImageContainer() {
    let imageContainer = document.createElement("div");
    let svg: string;

    switch (this.category) {
      case "quickSettings":
        svg = heartSvg;
        break;
      case "light":
        svg = sunSvg;
        break;
      case "dark":
        svg = moonSvg;
        break;
      case "seasonal":
        svg = pineSvg;
        break;
      case "custom":
        svg = editIconSvg;
        break;
      default:
        svg = folderSvg;
        break;
    }
    imageContainer.innerHTML = svg;
    imageContainer.classList.add("image-container");
    return imageContainer;
  }
}

type Tiles = Tile[] &
  ThemeTile[] &
  ThemeFolder[] &
  AddCustomTheme[] &
  noThemes[];

function getFancyCategoryName(name: string) {
  let fancyName = name.charAt(0).toUpperCase() + name.slice(1);
  return fancyName;
}

class AddCustomTheme extends Tile {
  createImageContainer() {
    let imageContainer = document.createElement("div");
    let svg = plusSVG;

    imageContainer.innerHTML = svg;
    imageContainer.classList.add("image-container");
    return imageContainer;
  }

  createBottomContainer() {
    let bottomContainer = document.createElement("div");
    bottomContainer.classList.add("theme-tile-bottom");

    let title = document.createElement("span");
    title.classList.add("theme-tile-title");
    title.innerText = "Create theme";
    bottomContainer.appendChild(title);

    return bottomContainer;
  }

  async onClick() {
    let newTheme = await browser.runtime.sendMessage({
      action: "saveCustomTheme",
      data: await getTheme("defaultCustom"),
    });

    await settingsWindow.themeSelector.updateSelectorContent();
    await settingsWindow.loadPage(false);
    await loadQuickSettings();

    await updateTheme(newTheme);
    startCustomThemeCreator(await getTheme("defaultCustom"), newTheme);
  }

  async createContent() {
    this.element.classList.add("use-default-colors");
    this.element.classList.add("create-theme-button");
    this.element.appendChild(this.createImageContainer());
    this.element.appendChild(this.createBottomContainer());
  }
}

class noThemes extends Tile {
  createImageContainer() {
    let imageContainer = document.createElement("div");
    let svg = brokenHeartSvg;

    imageContainer.innerHTML = svg;
    imageContainer.classList.add("image-container");
    return imageContainer;
  }

  createBottomContainer() {
    let bottomContainer = document.createElement("div");
    bottomContainer.classList.add("theme-tile-bottom");

    let title = document.createElement("span");
    title.classList.add("theme-tile-title");
    title.innerText = "No themes";
    bottomContainer.appendChild(title);

    return bottomContainer;
  }
  async createContent() {
    this.element.classList.add("use-default-colors");
    this.element.classList.add("no-themes");
    this.element.appendChild(this.createImageContainer());
    this.element.appendChild(this.createBottomContainer());
  }
}

export class ThemeSelector {
  element = document.createElement("div");
  content = document.createElement("div");
  topContainer = document.createElement("div");
  currentCategory: string = "all";
  currentTiles: Tiles = [];
  contentWidth = 0;

  createTopContainer() {
    this.topContainer = document.createElement("div");
    this.topContainer.classList.add("theme-top-container");
  }

  render() {
    this.element.innerHTML = "";
    this.createTopContainer();
    this.createContentContainer();
    window.addEventListener("resize", () => {
      this.updateSizes();
      this.updateContentHeight();
    });

    this.element.appendChild(this.topContainer);

    this.renderSelectorContent();
    return this.element;
  }

  async updateImages(forceReload = false) {
    this.currentTiles.forEach(async (tile: Tile) => {
      await tile.updateImage(currentThemeName, forceReload);
    });
  }

  updateSizes() {
    this.contentWidth = this.content.getBoundingClientRect().width;
  }

  async renderSelectorContent() {
    this.content.innerHTML = "";

    this.element.appendChild(this.content);

    this.updateTopContainer();

    if (this.currentCategory == "all") {
      await this.renderFolderTiles();
    } else {
      await this.renderThemeTiles();
    }
    this.updateSizes();
    this.updateContentHeight();
  }

  // this is used if some of the correct content is already loaded
  async updateSelectorContent() {
    if (this.currentCategory == "all") {
      await this.renderFolderTiles();
      return;
    }
    console.log("updating selector");

    await this.updateThemeTiles();
    this.updateImages();
  }

  async updateThemeTiles() {
    let themes = (await browser.runtime.sendMessage({
      action: "getThemes",
      categories: [this.currentCategory],
      includeHidden: true,
    })) as {
      [key: string]: Theme;
    };
    let data = (await browser.runtime.sendMessage({
      action: "getSettingsData",
    })) as Settings;

    let visibleThemeTiles = this.content.querySelectorAll(".theme-tile");
    let visibleThemeTilesArray: HTMLDivElement[] = [];
    visibleThemeTiles.forEach((element) => {
      visibleThemeTilesArray.push(element as HTMLDivElement);
    });
    let visibleThemeNames = visibleThemeTilesArray.map((element) => {
      if (element.dataset["name"]) return element.dataset["name"];
    }) as string[];

    let correctThemeNames = Object.keys(themes).map((themeName) => {
      return themeName;
    });

    let addMissingTiles = async (
      visibleThemeNames: string[],
      correctThemeNames: string[]
    ) => {
      let customThemes = (await browser.runtime.sendMessage({
        action: "getThemes",
        categories: ["custom"],
        includeHidden: true,
      })) as {
        [key: string]: Theme;
      };
      console.log(customThemes);
      correctThemeNames.forEach(async (themeName) => {
        if (!visibleThemeNames.includes(themeName)) {
          let isFavorite =
            data.appearance.quickSettingsThemes.includes(themeName);
          let newTile = this.createThemeTile(
            themeName,
            isFavorite,
            Object.keys(customThemes).includes(themeName)
          );
          let createThemeButton = this.content.querySelector(
            ".create-theme-button"
          );
          if (createThemeButton) {
            createThemeButton.insertAdjacentElement(
              "beforebegin",
              await newTile.render()
            );
          } else {
            this.content.appendChild(await newTile.render());
          }
          this.currentTiles.push(newTile);
          this.updateContentHeight();
        }
      });
    };

    let removeIncorrectTiles = async (
      visibleThemeNames: string[],
      correctThemeNames: string[]
    ) => {
      visibleThemeNames.forEach(async (themeName) => {
        if (!correctThemeNames.includes(themeName)) {
          let element = visibleThemeTilesArray.find((element) => {
            if (element.dataset["name"] == themeName) return element;
          });
          if (!element) return;
          if (element.classList.contains("create-theme-button")) return;
          this.content.removeChild(element);
          this.currentTiles = this.currentTiles.filter((tile) => {
            if (tile instanceof AddCustomTheme) return true;
            if (tile instanceof ThemeTile) return tile.name != themeName;
          }) as Tiles;
        }
        this.updateContentHeight();
      });
    };

    let updateLocalCSS = async () => {
      this.currentTiles.forEach((tile: ThemeTile) => {
        if (tile.name == currentThemeName) {
          tile.updateCSS();
          tile.updateTitle();
        }
      });
    };
    if (Object.keys(themes).length == 0 && this.currentCategory != "custom") {
      this.currentTiles.push(new noThemes());
      await this.renderTiles(this.currentTiles);
    }

    await addMissingTiles(visibleThemeNames, correctThemeNames);
    await removeIncorrectTiles(visibleThemeNames, correctThemeNames);
    updateLocalCSS();
  }

  updateTopContainer() {
    this.topContainer.innerHTML = "";
    let title = document.createElement("h2");
    title.classList.add("current-category");

    if (this.currentCategory != "all") {
      let backButton = document.createElement("button");
      backButton.innerHTML = chevronLeftSvg;
      backButton.addEventListener("click", () => this.changeCategory("all"));
      this.topContainer.appendChild(backButton);
    }

    title.innerText = getFancyCategoryName(this.currentCategory) + " themes";
    if (this.currentCategory == "quickSettings") {
      title.innerText = "Favorite themes";
    }
    this.topContainer.appendChild(title);
  }

  async renderTiles(tiles: Tiles) {
    const renderedElements = await Promise.all(
      tiles.map((tile) => tile.render())
    );

    const fragment = document.createDocumentFragment();
    renderedElements.forEach((element) => {
      fragment.appendChild(element);
    });

    this.content.appendChild(fragment);
  }

  createContentContainer() {
    this.content = document.createElement("div");
    this.content.classList.add("theme-tiles");
  }

  calculateContentHeight(tiles: Tiles) {
    const TILE_HEIGHT = parseFloat(tiles[0]?.element.style.height || "0");
    const TILE_WIDTH = parseFloat(tiles[0]?.element.style.width || "0"); // Was .height, should be .width
    const GAP = 6;
    const totalWidth = this.contentWidth;
    const tileAmount = tiles.length;
    const tilesPerRow = Math.floor((totalWidth + GAP) / (TILE_WIDTH + GAP));
    const numRows = Math.ceil(tileAmount / tilesPerRow);
    const totalHeight = numRows * TILE_HEIGHT + (numRows - 1) * GAP;
    return totalHeight;
  }

  async renderFolderTiles() {
    let categories = (await browser.runtime.sendMessage({
      action: "getThemeCategories",
      includeEmpty: true,
      includeHidden: true,
    })) as {
      [key: string]: string[];
    };

    let tiles = Object.keys(categories).map((category) => {
      let tile = new ThemeFolder(category);
      tile.onClick = async () => {
        this.changeCategory(category);
      };
      return tile;
    }) as Tiles;
    this.currentTiles = tiles;

    await this.renderTiles(tiles);
  }

  updateContentHeight() {
    this.content.style.height =
      String(this.calculateContentHeight(this.currentTiles)) + "px";
  }

  createThemeTile(name: string, isFavorite: boolean, isCustom: boolean) {
    let tile = new ThemeTile(name, this.currentCategory, isFavorite, isCustom);
    tile.element.dataset["name"] = name;

    tile.onDuplicate = async (newThemeName: string) => {
      if (isCustom) {
        await this.updateSelectorContent();
      }
      await updateTheme(newThemeName);
      await this.changeCategory("custom");
      Promise.all([settingsWindow.loadPage(false), loadQuickSettings()]);

      startCustomThemeCreator(await getTheme(newThemeName), newThemeName);
    };
    tile.onFavoriteToggle = async () => {
      await settingsWindow.loadPage(false);
      await loadQuickSettings();
      console.log(this.currentCategory);
      if (this.currentCategory == "quickSettings") {
        await this.updateSelectorContent();
      }
    };
    return tile;
  }

  async renderThemeTiles() {
    let themes = (await browser.runtime.sendMessage({
      action: "getThemes",
      categories: [this.currentCategory],
      includeHidden: true,
    })) as {
      [key: string]: Theme;
    };
    let customThemes = (await browser.runtime.sendMessage({
      action: "getThemes",
      categories: ["custom"],
      includeHidden: true,
    })) as {
      [key: string]: Theme;
    };
    let data = (await browser.runtime.sendMessage({
      action: "getSettingsData",
    })) as Settings;

    let tiles = Object.keys(themes).map((name) => {
      let isFavorite = data.appearance.quickSettingsThemes.includes(name);
      let isCustom = Object.keys(customThemes).includes(name);
      return this.createThemeTile(name, isFavorite, isCustom);
    }) as Tiles;
    if (this.currentCategory == "custom") {
      tiles.push(new AddCustomTheme());
    }
    this.currentTiles = tiles;

    if (Object.keys(themes).length == 0 && this.currentCategory != "custom") {
      this.currentTiles.push(new noThemes());
      console.log(this.currentTiles);
    }

    await this.renderTiles(this.currentTiles);
    await this.updateImages(true);
  }

  async changeCategory(category: string) {
    this.currentCategory = category;
    await this.renderSelectorContent();
  }
}

async function startCustomThemeCreator(theme: Theme, name: string) {
  let themeEditor = new CustomThemeCreator(theme, name);
  settingsWindow.hide();
  await themeEditor.create();
  themeEditor.show();
}

type ThemeProperty =
  | "--color-accent"
  | "--color-text"
  | "--color-base00"
  | "--color-base01"
  | "--color-base02"
  | "--color-base03";

type colordPalette = {
  Vibrant: Colord;
  DarkVibrant: Colord;
  LightVibrant: Colord;
  Muted: Colord;
  DarkMuted: Colord;
  LightMuted: Colord;
};

function convertColorPalette(vibrantPalette: Palette) {
  function convertSwatchToColord(swatch: Swatch | null) {
    if (!swatch) return colord("#000");
    return colord(swatch.hex);
  }
  let colordPalette: colordPalette;
  colordPalette = {
    Vibrant: convertSwatchToColord(vibrantPalette.Vibrant),
    DarkVibrant: convertSwatchToColord(vibrantPalette.DarkVibrant),
    LightVibrant: convertSwatchToColord(vibrantPalette.LightVibrant),
    Muted: convertSwatchToColord(vibrantPalette.Muted),
    DarkMuted: convertSwatchToColord(vibrantPalette.DarkMuted),
    LightMuted: convertSwatchToColord(vibrantPalette.LightMuted),
  };
  return colordPalette;
}

export class CustomThemeCreator extends BaseWindow {
  theme: Theme;
  name: string;
  editableValues: string[];
  colorPreviews: {
    [key: string]: HTMLDivElement;
  }[];
  backgroundImageInput: ImageSelector;
  backgroundImagePreview: HTMLImageElement;
  themeGeneratorIsOpen: boolean = false;
  imagePreviewContainer: HTMLDivElement;

  getEditableValues(cssProperties: Theme["cssProperties"]) {
    let nonEditableValues = [
      "--color-homepage-sidebars-bg",
      "--darken-background",
      "--color-splashtext",
    ];
    let editableValues = Object.keys(cssProperties).filter((property) => {
      return !nonEditableValues.includes(property);
    });
    return editableValues;
  }

  createColorPreview(name: string) {
    let colorPreview = document.createElement("div");
    colorPreview.classList.add("color-preview-bubble");
    if (this.theme.cssProperties[name]) {
      colorPreview.style.setProperty(
        "--current-color",
        this.theme.cssProperties[name]
      );
    }
    colorPreview.dataset["name"] = name;
    colorPreview.addEventListener("click", (e: Event) => {
      if (!colorPreview.parentElement?.querySelector(".floating-picker")) {
        this.openColorPicker(name, colorPreview, e);
      }
    });
    return colorPreview;
  }

  updateColorPreviews() {
    this.colorPreviews.forEach((preview) => {
      let previewName = Object.keys(preview)[0];
      let element = Object.values(preview)[0];
      if (previewName && element) {
        let newValue = this.theme.cssProperties[previewName];
        if (newValue) element.style.setProperty("--current-color", newValue);
      }
    });
  }

  generateColorPreviews(editableValues: string[]) {
    let colorPreviews = editableValues.map((colorName) => {
      let colorPreview: { [key: string]: HTMLDivElement } = {};
      colorPreview[colorName] = this.createColorPreview(colorName);
      return colorPreview;
    });

    return colorPreviews;
  }

  convertPropertyName(name: ThemeProperty): string {
    const propertyNames: Record<ThemeProperty, string> = {
      "--color-accent": "Accent Color",
      "--color-text": "Text Color",
      "--color-base00": "Background",
      "--color-base01": "Secondary Background",
      "--color-base02": "Tertiary Background",
      "--color-base03": "Border Color",
    };
    return propertyNames[name];
  }

  constructor(theme: Theme, name: string) {
    super("customThemeCreator", true);
    this.theme = theme;
    this.name = name;
    this.editableValues = this.getEditableValues(theme.cssProperties);
    this.colorPreviews = this.generateColorPreviews(this.editableValues);
    this.backgroundImageInput = new ImageSelector(this.name);
    this.backgroundImageInput.id = this.name;
    this.imagePreviewContainer = document.createElement("div");
    this.backgroundImageInput.onStore = () => {
      updateTheme(this.name);
      this.updateBackgroundImagePreview();
    };
    this.backgroundImagePreview = this.createBackgroundImagePreview();
  }

  content = document.createElement("div");
  displayNameInput = document.createElement("input");

  openColorPicker(name: string, colorPreview: HTMLDivElement, e: Event) {
    let colorPicker = new ColorPicker();

    colorPicker.element.style.position = "absolute";
    colorPicker.element.classList.add("floating-picker");

    let _docEventHandler = (docEvent: Event) => {
      if (docEvent === e) return;

      if (!(docEvent.target instanceof Node)) return;
      if (docEvent.target == colorPreview) return;
      const targetElement = docEvent.target as HTMLElement;
      const parentElement = targetElement.parentElement;

      if (colorPicker.element.contains(targetElement)) return;

      const isIconClick =
        targetElement.classList?.contains("copy-svg") ||
        targetElement.classList?.contains("done-icon") ||
        parentElement?.classList?.contains("copy-svg") ||
        parentElement?.classList?.contains("done-icon");

      if (isIconClick) return;

      colorPicker.element.remove();
      document.removeEventListener("mousedown", _docEventHandler);
    };

    document.addEventListener("mousedown", _docEventHandler);

    if (this.theme.cssProperties[name]) {
      colorPicker.currentColor = colord(this.theme.cssProperties[name]);
    }
    colorPicker.onChange = async () => {
      colorPreview.style.setProperty(
        "--current-color",
        colorPicker.currentColor.toHex()
      );
      await this.saveThemeData();
      setTheme(this.name);
    };
    colorPreview.parentElement?.appendChild(colorPicker.render());
  }

  async saveThemeData() {
    this.colorPreviews.forEach((preview) => {
      let colorPreview = Object.values(preview)[0];
      if (!colorPreview) return;
      let colorName = colorPreview.dataset["name"];
      if (!colorName) return;
      this.theme.cssProperties[colorName] =
        colorPreview.style.getPropertyValue("--current-color");
    });
    this.theme.displayName = this.displayNameInput.value;
    if (
      this.theme.cssProperties["--color-base00"] &&
      this.theme.cssProperties["--color-base02"] &&
      this.theme.cssProperties["--color-text"]
    ) {
      let base00 = colord(this.theme.cssProperties["--color-base00"]);
      let darkenColor: Colord;
      let splashColor: Colord;
      if (base00.brightness() > 0.5) {
        darkenColor = colord("rgba(228, 228, 228, 0.4)");
        darkenColor = darkenColor
          .mix(this.theme.cssProperties["--color-base02"], 0.5)
          .alpha(0.4);
      } else {
        darkenColor = colord("rgba(0,0,0,0.2)");
        darkenColor = darkenColor
          .mix(this.theme.cssProperties["--color-base00"], 0.5)
          .alpha(0.3);
      }
      splashColor = colord(this.theme.cssProperties["--color-text"]);
      this.theme.cssProperties["--color-splashtext"] = splashColor.toHex();
      this.theme.cssProperties["--darken-background"] = darkenColor.toHex();
      this.theme.cssProperties["--color-homepage-sidebars-bg"] = darkenColor
        .alpha(0.1)
        .toHex();
    }
    await browser.runtime.sendMessage({
      action: "saveCustomTheme",
      data: this.theme,
      id: this.name,
    });
  }

  createRemoveButton() {
    let button = document.createElement("button");
    button.classList.add("remove-custom-theme");
    button.innerHTML = "Remove theme" + trashSvg;
    button.addEventListener("click", () => {
      this.onRemoveTheme();
    });
    return button;
  }

  createDisplayNameInput() {
    this.displayNameInput = createTextInput("", "Name");
    this.displayNameInput.classList.add("theme-name-input");
    this.displayNameInput.addEventListener("change", async () => {
      await this.saveThemeData();
    });
    return this.displayNameInput;
  }

  createMakeThemeButton() {
    let button = document.createElement("button");
    button.classList.add("make-theme-button", "generate-theme-control");
    button.innerHTML = playSvg;
    button.addEventListener("click", async () => {
      if (await isValidImage(this.backgroundImagePreview.src)) {
        button.innerHTML = loadingSpinnerSvg;
        button.classList.add("loading");
        await this.generateTheme().then(() => {
          button.innerHTML = playSvg;
          button.classList.remove("loading");
        });
      }
    });
    return button;
  }

  createBackgroundImagePreview() {
    let img = document.createElement("img");
    img.classList.add("theme-creator-preview-image");
    return img;
  }

  async updateBackgroundImagePreview() {
    console.log("updating");
    let result = (await browser.runtime.sendMessage({
      action: "getImage",
      id: this.name,
    })) as SMPPImage;

    if (result.type == "default") {
      result.imageData = await getExtensionImage(
        "theme-backgrounds/compressed/" + this.name + ".jpg"
      );
    }
    if (await isValidImage(result.imageData)) {
      let url = await getImageURL(
        this.name,
        () => {
          return "a";
        },
        true
      );
      this.backgroundImagePreview.src = url.url;
      this.content.classList.remove("no-image-available");
    } else {
      this.backgroundImagePreview.src = "";
      this.content.classList.add("no-image-available");
    }
  }

  async getImageColors() {
    let vibrantTester = new Vibrant(this.backgroundImagePreview.src, {
      quality: 1,
      colorCount: 256,
    });
    let palette = await vibrantTester.getPalette();
    return palette;
  }

  readUserChoice() {
    let brightnessButton = document.getElementById(
      "brightness-control"
    ) as HTMLInputElement;
    let saturationButton = document.getElementById(
      "saturation-control"
    ) as HTMLInputElement;
    if (!(brightnessButton && saturationButton)) return;
    let choice = {
      mode: brightnessButton.checked,
      saturation: saturationButton.checked,
    };
    return choice;
  }

  async generateTheme() {
    let swatchPalette = await this.getImageColors();
    let colordPalette = convertColorPalette(swatchPalette);

    let choice = this.readUserChoice();
    if (!choice) return;

    let base00: Colord;
    let base01: Colord;
    let base02: Colord;
    let base03: Colord;
    let accent: Colord;
    let textcolor: Colord;
    let darkenColor: Colord;

    if (choice.mode) {
      // Dark mode
      if (choice.saturation) {
        base00 = colordPalette.DarkVibrant.darken(0.2);
        base01 = colordPalette.DarkVibrant.darken(0.1);
        base02 = colordPalette.DarkVibrant;
        base03 = colordPalette.DarkVibrant.lighten(0.1);
        accent = colordPalette.Vibrant;
        textcolor = colordPalette.LightVibrant;
      } else {
        base00 = colordPalette.DarkMuted.darken(0.2);
        base01 = colordPalette.DarkMuted.darken(0.1);
        base02 = colordPalette.DarkMuted;
        base03 = colordPalette.DarkMuted.lighten(0.1);
        accent = colordPalette.Muted;
        textcolor = colordPalette.LightMuted;
      }

      darkenColor = colord("rgba(0,0,0,0.2)")
        .mix(base00.toHex(), 0.5)
        .alpha(0.3);
    } else {
      // Light mode
      if (choice.saturation) {
        base00 = colordPalette.LightVibrant.lighten(0.1);
        base01 = colordPalette.LightVibrant.lighten(0.05);
        base02 = colordPalette.LightVibrant;
        base03 = colordPalette.LightVibrant.darken(0.1);
        accent = colordPalette.Vibrant;
        textcolor = colordPalette.DarkVibrant;
      } else {
        base00 = colordPalette.LightMuted.lighten(0.1);
        base01 = colordPalette.LightMuted.lighten(0.05);
        base02 = colordPalette.LightMuted;
        base03 = colordPalette.LightMuted.darken(0.1);
        accent = colordPalette.Muted;
        textcolor = colordPalette.DarkMuted;
      }
      darkenColor = colord("rgba(228, 228, 228, 0.4)")
        .mix(base02.toHex(), 0.5)
        .alpha(0.4);
    }

    this.theme = {
      displayName: this.theme.displayName,
      cssProperties: {
        ...this.theme.cssProperties,
        "--color-accent": accent.toHex(),
        "--color-text": textcolor.toHex(),
        "--color-base00": base00.toHex(),
        "--color-base01": base01.toHex(),
        "--color-base02": base02.toHex(),
        "--color-base03": base03.toHex(),
        "--darken-background": darkenColor.toHex(),
        "--color-homepage-sidebars-bg": darkenColor.alpha(0.1).toHex(),
        "--color-splashtext": textcolor.toHex(),
      },
    };
    await browser.runtime.sendMessage({
      action: "saveCustomTheme",
      data: this.theme,
      id: this.name,
    });
    this.updateColorPreviews();
    await updateTheme(this.name);
  }

  createThemeGenerationControls() {
    class themeGenerationControl {
      id: string;
      element: HTMLInputElement;
      label: HTMLLabelElement;

      constructor(id: string) {
        this.id = id;
        const { input, label } = this.createThemeGenerationControl(this.id);
        this.element = input;
        this.label = label;
      }

      createThemeGenerationControl(id: string) {
        let input = document.createElement("input");
        input.type = "checkbox";
        input.id = id;
        input.classList.add("theme-maker-input");

        let label = document.createElement("label");
        label.htmlFor = id;
        label.classList.add("theme-maker-label", "generate-theme-control");

        input.addEventListener("click", () => {
          this.updateLogo(this.label, this.element.checked);
        });

        return { input, label };
      }

      updateLogo(element: HTMLLabelElement, state: boolean) { }

      load() {
        this.updateLogo(this.label, this.element.checked);
      }

      createWrapper() {
        let wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.display = "flex";
        wrapper.appendChild(this.element);
        wrapper.appendChild(this.label);
        return wrapper;
      }
    }

    function createSmallThemeGenerationContainer() {
      let container = document.createElement("div");
      container.classList.add("theme-generation-sub-container");
      return container;
    }

    let container = document.createElement("div");
    container.classList.add("theme-controls-container");

    let brightnessButton = new themeGenerationControl("brightness-control");
    brightnessButton.updateLogo = (e, s) => {
      let tooltip = e.parentElement?.querySelector(".smpp-tooltip");
      if (s) {
        if (tooltip) {
          tooltip.innerHTML = "Dark";
        }
        e.innerHTML = moonSvg;
      } else {
        if (tooltip) {
          tooltip.innerHTML = "Light";
        }
        e.innerHTML = sunSvg;
      }
    };

    let saturationButton = new themeGenerationControl("saturation-control");
    saturationButton.updateLogo = (e, s) => {
      let tooltip = e.parentElement?.querySelector(".smpp-tooltip");
      if (s) {
        if (tooltip) {
          tooltip.innerHTML = "Vibrant";
        }
        e.innerHTML = magicWandSvg;
      } else {
        if (tooltip) {
          tooltip.innerHTML = "Muted";
        }
        e.innerHTML = wandSvg;
      }
    };

    let firstSubContainer = createSmallThemeGenerationContainer();

    let brightnessButtonWrapper = brightnessButton.createWrapper();
    brightnessButtonWrapper.appendChild(
      createHoverTooltip("Brightness", "horizontal")
    );
    let saturationButtonWrapper = saturationButton.createWrapper();
    saturationButtonWrapper.appendChild(
      createHoverTooltip("Saturation", "horizontal")
    );
    firstSubContainer.appendChild(brightnessButtonWrapper);
    firstSubContainer.appendChild(saturationButtonWrapper);

    let secondSubContainer = createSmallThemeGenerationContainer();
    secondSubContainer.appendChild(this.createMakeThemeButton());
    container.appendChild(firstSubContainer);
    container.appendChild(secondSubContainer);

    brightnessButton.load();
    saturationButton.load();
    return container;
  }

  createColorPickers() {
    let colorPickerElement = document.createElement("div");
    colorPickerElement.classList.add("custom-theme-color-picker-container");
    this.colorPreviews.forEach((preview) => {
      let colorPreviewWrapper = document.createElement("div");
      colorPreviewWrapper.classList.add("color-picker-preview-wrapper");
      let colorPreview = Object.values(preview)[0];
      if (colorPreview) colorPreviewWrapper.appendChild(colorPreview);
      let colorName = Object.keys(preview)[0];
      if (colorName)
        colorPreviewWrapper.appendChild(
          createHoverTooltip(
            this.convertPropertyName(colorName as ThemeProperty),
            "vertical"
          )
        );

      colorPickerElement.appendChild(colorPreviewWrapper);
    });
    return colorPickerElement;
  }

  createFileInputContainer() {
    let fileInputContainer = document.createElement("div");
    fileInputContainer.classList.add("file-and-theme-button-container");
    fileInputContainer.appendChild(
      this.backgroundImageInput.createFullFileInput()
    );
    let divider = document.createElement("div");
    divider.classList.add("file-input-theme-button-divider");
    fileInputContainer.appendChild(divider);
    fileInputContainer.appendChild(this.createOpenThemeMakerButton());
    return fileInputContainer;
  }

  updateThemeGenerator() {
    if (this.themeGeneratorIsOpen) {
      this.imagePreviewContainer.classList.add("open");
    } else {
      this.imagePreviewContainer.classList.remove("open");
    }
  }

  createOpenThemeMakerButton() {
    let button = document.createElement("button");
    button.classList.add("open-theme-editor-button");
    button.innerHTML = "Auto";
    button.addEventListener("click", async () => {
      this.themeGeneratorIsOpen = !this.themeGeneratorIsOpen;
      this.updateThemeGenerator();
    });
    return button;
  }

  createImagePreviewContainer() {
    this.imagePreviewContainer.classList.add("preview-image-container");
    let imageWrapper = document.createElement("div");
    imageWrapper.classList.add("preview-image-wrapper");
    imageWrapper.appendChild(this.backgroundImagePreview);
    this.imagePreviewContainer.appendChild(imageWrapper);
    this.imagePreviewContainer.appendChild(
      this.createThemeGenerationControls()
    );

    return this.imagePreviewContainer;
  }

  async renderContent() {
    this.content.classList.add("custom-theme-maker");

    this.content.appendChild(this.createDisplayNameInput());

    this.content.appendChild(this.createImagePreviewContainer());

    this.content.appendChild(this.createFileInputContainer());
    this.content.appendChild(this.createColorPickers());

    this.content.appendChild(this.createRemoveButton());
    await this.updateBackgroundImagePreview();
    this.load(this.theme);

    this.element.appendChild(this.content);
    return this.element;
  }

  async load(theme: Theme) {
    this.displayNameInput.value = theme.displayName;
    this.updateColorPreviews();
    await this.backgroundImageInput.loadImageData();
  }

  onClosed(): void {
    document.body.removeChild(this.element);
    settingsWindow.themeSelector.updateSelectorContent();
    settingsWindow.loadPage();
    loadQuickSettings();
    openSettingsWindow(null);
  }

  async onRemoveTheme() {
    await browser.runtime.sendMessage({
      action: "removeCustomTheme",
      id: this.name,
    });
    await updateTheme("default");
    await settingsWindow.loadPage(true);
    await loadQuickSettings();
    this.hide();
  }
}
