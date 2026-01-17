import { widgetSystemNotifyThemeChange } from "../../widgets/widgets.js";
import {
  browser,
  getExtensionImage,
  isValidHexColor,
} from "../../common/utils.js";
import { colord } from "colord";
import {
  chevronLeftSvg,
  copySvg,
  doneSvg,
  editIconSvg,
  favoriteFolderSvg,
  folderSvg,
  moonSvg,
  pineSvg,
  plusSVG,
  sunSvg,
  trashSvg,
} from "../../fixes-utils/svgs.js";
import { getImageURL, type Image } from "../modules/images.js";
import { BaseWindow } from "../modules/windows.js";
import {
  openSettingsWindow,
  settingsWindow,
  type Settings,
} from "../settings/main-settings.js";
import { loadQuickSettings } from "../settings/quick-settings.js";
import { applyAppearance, isFirefox } from "../main.js";
import { createTextInput } from "./ui.js";

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

function isBasicEntry(entry: string) {
  let basicEntries = [
    "--color-base00",
    "--color-base01",
    "--color-base02",
    "--color-base03",
    "--color-accent",
    "--color-text",
  ];
  return basicEntries.includes(entry);
}

export function getThemeQueryString(theme: Theme) {
  let query = "";
  Object.entries(theme.cssProperties).forEach(([key, value]) => {
    if (isBasicEntry(key)) {
      query += `&${key.slice(2)}=${
        value.startsWith("#") ? value.substring(1) : value
      }`;
    }
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
    this.hueCursor.onDrag = async () => {
      await this.readColor();
    };
    this.fieldCursor = this.createFieldCursor();
    this.fieldCursor.onDrag = async () => {
      await this.readColor();
    };
  }

  readColorInput() {
    console.log("reading color input");
    let hexInput = this.element.querySelector("input");
    if (hexInput) {
      if (isValidHexColor(hexInput.value)) {
        this.currentColor = colord(hexInput.value);
      } else {
        hexInput.value = this.currentColor.toHex();
      }
    }

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

  render() {
    this.element.classList.add("smpp-color-picker");

    this.element.style.width = this.width;
    this.element.appendChild(this.createFieldContainer());
    this.element.appendChild(this.createHueContainer());
    this.element.appendChild(this.createBottomContainer());

    this.hueCursor.xPos = this.currentColor.hue() / 3.6;
    this.fieldCursor.xPos = this.currentColor.toHsv().s;
    this.fieldCursor.yPos = 100 - this.currentColor.toHsv().v;
    this.hueCursor.updateCursorPosition();
    this.fieldCursor.updateCursorPosition();

    this.updateColorPicker();
    return this.element;
  }

  async onChange() {}
}

export class Tile {
  element = document.createElement("div");

  async render() {
    this.element.classList.add("theme-tile");
    this.element.addEventListener("click", async () => {
      await this.onClick();
    });
    this.updateSelection();
    await this.createContent();
    return this.element;
  }

  async updateImage(currentTheme: string, forceReload = false) {}

  // Overide this in the implementation
  updateSelection() {}
  // Overide in de implementation
  async onClick() {}

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

  async createContent() {
    let theme = await getTheme(this.name);
    Object.keys(theme.cssProperties).forEach((key) => {
      this.element.style.setProperty(
        `${key}-local`,
        theme.cssProperties[key] as string
      );
    });
    this.element.appendChild(this.createImageContainer());
    this.element.appendChild(this.getBottomContainer(theme));
  }

  getBottomContainer(theme: Theme) {
    let bottomContainer = document.createElement("div");
    bottomContainer.classList.add("theme-tile-bottom");

    let title = document.createElement("span");
    title.innerText = theme.displayName;
    title.classList.add("theme-tile-title");
    bottomContainer.appendChild(title);

    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("theme-button-container");

    let duplicateButton = document.createElement("button");
    duplicateButton.classList.add("bottom-container-button");
    duplicateButton.innerHTML = copySvg;
    duplicateButton.addEventListener("click", async () => {
      await this.onDuplicate();
    });
    buttonContainer.appendChild(duplicateButton);

    if (this.isCustom) {
      let editButton = document.createElement("button");
      editButton.classList.add("bottom-container-button");
      editButton.innerHTML = editIconSvg;
      editButton.addEventListener("click", async () => {
        await this.onEdit();
      });
      buttonContainer.appendChild(editButton);
    }
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
      let imageURL = await getImageURL(this.name, async () => {
        return await getExtensionImage(
          "theme-backgrounds/" + this.name + ".jpg"
        );
      });

      this.element.style.setProperty(
        "--background-image-local",
        `url(${await imageURL.url})`
      );
      if (isFirefox && imageURL.type == "file") {
        let imageContainer = this.element.querySelector(".image-container");
        if (!imageContainer) return;

        let stupidImageContainer = document.createElement("img");
        stupidImageContainer.classList.add(
          "image-container",
          "firefox-container"
        );
        stupidImageContainer.src = imageURL.url;

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
          this.updateImage(currentTheme, forceReload);
        }
      }
    }
  }

  async onClick() {
    await updateTheme(this.name);
    await settingsWindow.loadPage(false);
    await loadQuickSettings();
  }

  // Overide in de implementation
  async onEdit() {}

  // Overide in de implementation
  async onDuplicate() {}
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
        svg = favoriteFolderSvg;
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

type Tiles = Tile[] & ThemeTile[] & ThemeFolder[] & AddCustomTheme[];

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
    startCustomThemeCreator(await getTheme("defaultCustom"), "defaultCustom");
  }

  async createContent() {
    this.element.classList.add("use-default-colors");
    this.element.classList.add("create-theme-button");
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

  createTopContainer() {
    this.topContainer = document.createElement("div");
    this.topContainer.classList.add("theme-top-container");
  }

  render() {
    this.element.innerHTML = "";
    this.createTopContainer();
    this.createContentContainer();
    window.addEventListener("resize", () => {
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

  async renderSelectorContent() {
    this.content.innerHTML = "";

    this.element.appendChild(this.content);

    this.updateTopContainer();

    if (this.currentCategory == "all") {
      await this.renderFolderTiles();
    } else {
      await this.renderThemeTiles();
    }
    this.updateContentHeight();
  }

  // this is used if some of the correct content is already loaded
  async updateSelectorContent() {
    if (this.currentCategory == "all") {
      console.log("weird... (this shouldn't really happen you know)");
      await this.renderFolderTiles();
      this.updateContentHeight();
      return;
    }

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
    console.log(themes);
    if (!themes) return;

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
      correctThemeNames.forEach(async (themeName) => {
        if (!visibleThemeNames.includes(themeName)) {
          let newTile = this.createThemeTile(
            themeName,
            this.currentCategory == "custom"
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
      });
    };

    await addMissingTiles(visibleThemeNames, correctThemeNames);
    await removeIncorrectTiles(visibleThemeNames, correctThemeNames);
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
    console.log(tiles);
    const TILE_HEIGHT = tiles[0]?.element.getBoundingClientRect().height || 103;
    const TILE_WIDTH = tiles[0]?.element.getBoundingClientRect().width || 168;
    const GAP = 6;
    const totalWidth = this.content.getBoundingClientRect().width;

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
    console.log("Updating height");
    this.content.style.height =
      String(this.calculateContentHeight(this.currentTiles)) + "px";
  }

  createThemeTile(name: string, isCustom: boolean) {
    let tile = new ThemeTile(name, isCustom);
    tile.element.dataset["name"] = name;

    tile.onDuplicate = async () => {
      let newTheme = await browser.runtime.sendMessage({
        action: "saveCustomTheme",
        data: await getTheme(name),
      });
      let result = (await browser.runtime.sendMessage({
        action: "getImage",
        id: name,
      })) as Image;

      if (result.type == "default") {
        result.imageData = await getExtensionImage(
          "theme-backgrounds/" + name + ".jpg"
        );
        if (!isCustom) {
          result.type = "link";
          result.link = name + ".jpg";
        }
      }

      await browser.runtime.sendMessage({
        action: "setImage",
        id: newTheme,
        data: result,
      });

      if (isCustom) {
        await this.updateSelectorContent();
      }
      startCustomThemeCreator(await getTheme(name), name);
      await updateTheme(newTheme);
      await settingsWindow.loadPage(false);
      await loadQuickSettings();
      await settingsWindow.themeSelector.changeCategory("custom");
    };
    if (isCustom) {
      tile.onEdit = async () => {
        startCustomThemeCreator(await getTheme(name), name);
      };
    }
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
    if (!themes) return;

    let isCustom = this.currentCategory == "custom";
    let tiles = Object.keys(themes).map((name) =>
      this.createThemeTile(name, isCustom)
    ) as Tiles;
    if (isCustom) {
      tiles.push(new AddCustomTheme());
    }
    this.currentTiles = tiles;

    await this.renderTiles(tiles);
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

export class CustomThemeCreator extends BaseWindow {
  theme: Theme;
  name: string;
  editableValues: string[];
  colorPreviews: {
    [key: string]: HTMLDivElement;
  }[];

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
      this.openColorPicker(name, colorPreview, e);
    });
    return colorPreview;
  }

  generateColorPreviews(editableValues: string[]) {
    let colorPreviews = editableValues.map((colorName) => {
      let colorPreview: { [key: string]: HTMLDivElement } = {};
      colorPreview[colorName] = this.createColorPreview(colorName);
      return colorPreview;
    });

    return colorPreviews;
  }

  constructor(theme: Theme, name: string) {
    super("customThemeCreator", true);
    this.theme = theme;
    this.name = name;
    this.editableValues = this.getEditableValues(theme.cssProperties);
    this.colorPreviews = this.generateColorPreviews(this.editableValues);
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
    this.element.appendChild(colorPicker.render());
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
    this.displayNameInput.addEventListener("change", async () => {
      await this.saveThemeData();
    });
    return this.displayNameInput;
  }

  async renderContent() {
    this.colorPreviews.forEach((preview) => {
      let colorPreview = Object.values(preview)[0];
      if (colorPreview) this.content.appendChild(colorPreview);
    });
    this.content.appendChild(this.createDisplayNameInput());
    this.content.appendChild(this.createRemoveButton());
    this.load(this.theme);
    return this.content;
  }

  async load(theme: Theme) {
    this.displayNameInput.value = theme.displayName;
  }

  onClosed(): void {
    document.body.removeChild(this.element);
    settingsWindow.themeSelector.updateSelectorContent();
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
