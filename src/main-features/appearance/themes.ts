import type { Palette, Swatch } from "@vibrant/color";
import { type Colord, colord, extend } from "colord";
import lchPlugin from "colord/plugins/lch";
import mixPlugin from "colord/plugins/mix";
import { Vibrant } from "node-vibrant/browser";

extend([lchPlugin, mixPlugin]);

import {
  browser,
  convertLinkToBase64,
  delay,
  getExtensionImage,
  isValidHexColor,
} from "../../common/utils.js";
import {
  brokenHeartSvg,
  chevronLeftSvg,
  copySvg,
  doneSvg,
  editIconSvg,
  errorSvg,
  folderSvg,
  heartSvg,
  loadingSpinnerSvg,
  magicWandSvg,
  moonSvg,
  pineSvg,
  playSvg,
  plusSVG,
  shareSvg,
  sunSvg,
  trashSvg,
  wandSvg,
} from "../../fixes-utils/svgs.js";
import { isValidImage, Toast } from "../../fixes-utils/utils.js";
import { widgetSystemNotifyThemeChange } from "../../widgets/widgets.js";
import { recreateGlobalChat } from "../globalchat.js";
import { isFirefox } from "../main.js";
import { getImageURL, ImageSelector, type SMPPImage } from "../modules/images.js";
import { Dialog } from "../modules/windows.js";
import { openSettingsWindow, type Settings, settingsWindow } from "../settings/main-settings.js";
import { loadQuickSettings } from "../settings/quick-settings.js";
import { setBackground } from "./background-image.js";
import { createHoverTooltip, createTextInput } from "./ui.js";

export let currentThemeName: string;
export let currentTheme: Theme;

export type ShareId = string;
export type ThemeId = string;

export type ThemeCategory = [ThemeId];

export interface ThemeCategories {
  [name: string]: ThemeCategory;
}

export interface Theme {
  displayName: string;
  cssProperties: { [key: string]: string };
}

export interface Themes {
  [key: string]: Theme;
}

export async function getTheme(name: ThemeId): Promise<Theme> {
  const theme = (await browser.runtime.sendMessage({
    action: "getTheme",
    name,
  })) as Theme;
  return theme;
}

export async function setTheme(themeName: ThemeId) {
  const style = document.documentElement.style;
  currentThemeName = themeName;
  currentTheme = await getTheme(themeName);
  Object.entries(currentTheme.cssProperties).forEach(([key, value]) => {
    style.setProperty(key, value);
  });

  await widgetSystemNotifyThemeChange();
  recreateGlobalChat();
}

export function updateCurrentThemeName(themeName: string) {
  currentThemeName = themeName;
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
  const testCustomTheme: Theme = {
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
  const id = await browser.runtime.sendMessage({
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

  constructor(parentContainer: HTMLElement, enableX = true, enableY = true) {
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

    if (this.enableX) {
      this.xPos = Math.max(0, Math.min(100, xPercent));
    }
    if (this.enableY) {
      this.yPos = Math.max(0, Math.min(100, yPercent));
    }

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
    const hexInput = this.element.querySelector("input");
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
    const hue = this.hueCursor.xPos * 3.6;
    const saturation = this.fieldCursor.xPos;
    const value = 100 - this.fieldCursor.yPos;

    this.currentColor = colord({ h: hue, s: saturation, v: value });
    await this.updateColorPicker();
  }

  async updateColorPicker() {
    const maxSatColor = colord({ h: this.hueCursor.xPos * 3.6, s: 100, v: 100 });
    this.element.style.setProperty("--max-sat", maxSatColor.toHex());
    this.element.style.setProperty("--current-color", this.currentColor.toHex());
    const hexInput = this.element.querySelector("input");
    if (hexInput) {
      hexInput.value = this.currentColor.toHex();
    }
    await this.onChange();
  }

  createFieldCursor() {
    const fieldCursor = new ColorCursor(this.fieldContainer);
    fieldCursor.element.classList.add("color-cursor-wrapper");
    fieldCursor.visibleElement.classList.add("color-cursor");
    return fieldCursor;
  }

  createHueCursor() {
    const hueCursor = new ColorCursor(this.hueContainer, true, false);
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
    const horizontalContainer = document.createElement("div");
    horizontalContainer.style.background =
      "linear-gradient(to left, var(--max-sat) 0%, rgba(255, 255, 255, 1) 100%)";

    const verticalContainer = document.createElement("div");
    verticalContainer.style.background = "linear-gradient(to top, black, transparent)";

    this.fieldContainer.appendChild(horizontalContainer);
    this.fieldContainer.append(verticalContainer);

    this.fieldContainer.appendChild(this.fieldCursor.element);
    return this.fieldContainer;
  }

  copyHexToClipBoard() {
    navigator.clipboard.writeText(this.currentColor.toHex());
  }

  createBottomContainer() {
    const createCopyButton = () => {
      const button = document.createElement("button");
      button.innerHTML = copySvg;
      button.classList.add("copy-hex-button");
      button.addEventListener("click", () => {
        this.copyHexToClipBoard();
        const svg = button.querySelector("svg");
        if (!svg) {
          return;
        }
        svg.style.fill = "var(--color-text)";
        button.innerHTML = doneSvg;

        setTimeout(() => {
          svg.style.fill = "none";
          button.innerHTML = copySvg;
        }, 1000);
      });
      return button;
    };

    const createHexInput = () => {
      const hexInput = document.createElement("input");
      hexInput.classList.add("smpp-text-input");
      hexInput.addEventListener("change", () => {
        this.readColorInput();
      });
      hexInput.type = "text";
      hexInput.value = this.currentColor.toHex();
      return hexInput;
    };

    function createColorPreview() {
      const colorPreview = document.createElement("div");
      colorPreview.classList.add("color-preview");
      return colorPreview;
    }

    const bottomContainer = document.createElement("div");
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

  async onChange() {}
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

  async updateImage(_currentTheme: string, _forceReload = false) {}

  // Overide this in the implementation
  updateSelection() {}
  // Overide in de implementation
  async onClick(_e: MouseEvent) {}

  // Overide this in the implementation
  async createContent() {}
}

export class ThemeTile extends Tile {
  name: string;
  isFavorite: boolean;
  isCustom: boolean;
  currentCategory: string;
  titleElement = document.createElement("span");

  constructor(name: string, currentCategory: string, isFavorite: boolean, isCustom = false) {
    super();
    this.name = name;
    this.currentCategory = currentCategory;
    this.isFavorite = isFavorite;
    this.isCustom = isCustom;
  }

  async updateCSS() {
    const theme = await getTheme(this.name);
    Object.keys(theme.cssProperties).forEach((key) => {
      this.element.style.setProperty(`${key}-local`, theme.cssProperties[key] as string);
    });
  }

  async updateTitle() {
    const theme = await getTheme(this.name);
    this.titleElement.innerText = theme.displayName;
    if (this.titleElement.innerText.length > 22) {
      this.titleElement.innerText = `${theme.displayName.slice(0, 22)}…`;
    }
  }

  override async createContent() {
    this.element.appendChild(this.createImageContainer());
    this.element.appendChild(this.getBottomContainer());
    await this.updateTitle();
    await this.updateCSS();
  }

  getBottomContainer() {
    const bottomContainer = document.createElement("div");
    bottomContainer.classList.add("theme-tile-bottom");

    this.titleElement.classList.add("theme-tile-title");
    bottomContainer.appendChild(this.titleElement);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("theme-button-container");

    const duplicateButton = document.createElement("button");
    duplicateButton.classList.add("bottom-container-button");
    duplicateButton.innerHTML = copySvg;
    duplicateButton.addEventListener("click", async () => {
      await this.duplicate();
    });

    const favoriteButton = document.createElement("button");
    favoriteButton.classList.add("bottom-container-button");
    favoriteButton.innerHTML = heartSvg;
    favoriteButton.addEventListener("click", async () => {
      await this.favoriteToggle();
    });
    if (this.isFavorite) {
      this.element.classList.add("is-favorite");
    }

    const shareButton = document.createElement("button");
    shareButton.classList.add("bottom-container-button");
    shareButton.innerHTML = shareSvg;
    shareButton.addEventListener("click", async () => {
      await this.share();
    });

    buttonContainer.appendChild(shareButton);
    buttonContainer.appendChild(duplicateButton);
    buttonContainer.appendChild(favoriteButton);
    if (this.isCustom) {
      const editButton = document.createElement("button");
      editButton.classList.add("bottom-container-button");
      editButton.innerHTML = editIconSvg;
      editButton.addEventListener("click", async () => {
        await this.edit();
      });
      buttonContainer.appendChild(editButton);
    }

    bottomContainer.appendChild(buttonContainer);

    return bottomContainer;
  }

  createImageContainer() {
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("image-container");
    return imageContainer;
  }

  override updateSelection() {
    if (currentThemeName === this.name) {
      this.element.classList.add("is-selected");
    } else {
      this.element.classList.remove("is-selected");
    }
  }

  override async updateImage(currentTheme: string, forceReload = false) {
    if (this.name === currentTheme || forceReload) {
      const imageURL = await getImageURL(
        this.name,
        async () => {
          return await getExtensionImage(`theme-backgrounds/compressed/${this.name}.jpg`);
        },
        true,
      );
      if (await isValidImage(await imageURL.url)) {
        this.element.style.setProperty("--background-image-local", `url(${await imageURL.url})`);
      } else {
        this.element.style.setProperty("--background-image-local", "url()");
      }

      if (isFirefox && imageURL.type === "file") {
        const imageContainer = this.element.querySelector(".image-container");
        if (!imageContainer) {
          return;
        }

        const stupidImageContainer = document.createElement("img");
        stupidImageContainer.classList.add("image-container", "firefox-container");
        if (await isValidImage(imageURL.url)) {
          stupidImageContainer.src = imageURL.url;
        } else {
          stupidImageContainer.src = "";
        }

        const bottomContainer = this.element.querySelector(".theme-tile-bottom");
        if (!bottomContainer) {
          return;
        }
        imageContainer.remove();
        this.element.prepend(stupidImageContainer);
      } else if (isFirefox) {
        const firefoxImageContainer = this.element.querySelector(".firefox-container");
        if (firefoxImageContainer) {
          firefoxImageContainer.remove();
          this.element.prepend(this.createImageContainer());
          await this.updateImage(currentTheme, forceReload);
        }
      }
    }
  }

  override async onClick(e: Event) {
    if (e.target instanceof HTMLElement) {
      const target = e.target;

      if (
        target.classList.contains("theme-tile-title") ||
        target.classList.contains("image-container") ||
        target.classList.contains("theme-tile")
      ) {
        await updateTheme(this.name);
        await settingsWindow.loadPage(false);
        await loadQuickSettings();
      }
    }
  }

  async favoriteToggle() {
    this.isFavorite = !this.isFavorite;
    const data = (await browser.runtime.sendMessage({
      action: "getSettingsData",
    })) as Settings;
    const updateFavorite = async () => {
      await browser.runtime.sendMessage({
        action: "setSetting",
        name: "appearance.quickSettingsThemes",
        data: quickSettingsThemes,
      });
      this.element.classList.toggle("is-favorite");
      this.onFavoriteToggle();
    };

    let quickSettingsThemes = data.appearance.quickSettingsThemes;
    if (this.isFavorite) {
      quickSettingsThemes.push(this.name);
      await updateFavorite();
    } else {
      quickSettingsThemes = quickSettingsThemes.filter((name: string) => {
        return name !== this.name;
      });
      if (this.currentCategory === "quickSettings") {
        this.element.addEventListener("animationend", updateFavorite);
        this.element.classList.add("being-removed");
      } else {
        await updateFavorite();
      }
    }
  }

  async edit() {
    await updateTheme(this.name);
    Promise.all([settingsWindow.loadPage(false), loadQuickSettings()]);
    startCustomThemeCreator(await getTheme(this.name), this.name);
  }

  async duplicate() {
    const newThemeName = await browser.runtime.sendMessage({
      action: "saveCustomTheme",
      data: await getTheme(this.name),
    });
    const result = (await browser.runtime.sendMessage({
      action: "getImage",
      id: this.name,
    })) as SMPPImage;
    const compressedResult = (await browser.runtime.sendMessage({
      action: "getImage",
      id: `compressed-${this.name}`,
    })) as SMPPImage;

    if (result.metaData.type === "default") {
      const base64 = await convertLinkToBase64(
        await getExtensionImage(`theme-backgrounds/${this.name}.jpg`),
      );
      if (base64) {
        result.imageData = base64;
      }
      const compressedBase64 = await convertLinkToBase64(
        await getExtensionImage(`theme-backgrounds/compressed/${this.name}.jpg`),
      );
      if (compressedBase64) {
        compressedResult.imageData = compressedBase64;
      }

      if (!this.isCustom) {
        result.metaData.type = "file";
        result.metaData.link = `${this.name}.jpg`;

        compressedResult.metaData.type = "file";
        compressedResult.metaData.link = `${this.name}.jpg`;
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
        id: `compressed-${newThemeName}`,
        data: compressedResult,
      });
    }
    this.onDuplicate(newThemeName);
    new Toast("Theme succesfully duplicated", "succes").render();
  }

  async share() {
    const shareDialog = new Dialog("themeSharing", true);
    const linkOutput = document.createElement("a");
    linkOutput.classList.add("link-output");
    linkOutput.target = "_blank";
    const copyToClipboardButton = document.createElement("button");
    copyToClipboardButton.classList.add("copy-hex-button");
    copyToClipboardButton.classList.add("copy-link-button");

    const copyToClipboard = () => {
      if (shareUrl) {
        navigator.clipboard.writeText(shareUrl);

        const svg = copyToClipboardButton.querySelector("svg");
        if (!svg) {
          return;
        }
        svg.style.fill = "var(--color-text)";
        copyToClipboardButton.innerHTML = doneSvg;

        setTimeout(() => {
          svg.style.fill = "none";
          copyToClipboardButton.innerHTML = copySvg;
        }, 1000);

        new Toast("Theme link copied to clipboard", "succes").render();
      } else {
        new Toast("Theme link is not ready yet", "error").render();
      }
    };

    copyToClipboardButton.addEventListener("click", copyToClipboard);
    copyToClipboardButton.innerHTML = loadingSpinnerSvg;

    let shareUrl: string | null = null; // Store the URL instead

    shareDialog.renderContent = async () => {
      function getEditableValues(cssProperties: Theme["cssProperties"]) {
        const nonEditableValues = [
          "--color-homepage-sidebars-bg",
          "--darken-background",
          "--color-splashtext",
        ];
        const editableValues = Object.keys(cssProperties).filter((property) => {
          return !nonEditableValues.includes(property);
        });
        return editableValues;
      }

      function createColorPreview(name: string) {
        const colorPreview = document.createElement("div");
        colorPreview.classList.add("color-preview-bubble");
        if (theme.cssProperties[name]) {
          colorPreview.style.setProperty("--current-color", theme.cssProperties[name]);
        }
        return colorPreview;
      }

      function generateColorPreviews(editableValues: string[]) {
        const colorPreviews = editableValues.map((colorName) => {
          const colorPreview: { [key: string]: HTMLDivElement } = {};
          colorPreview[colorName] = createColorPreview(colorName);
          return colorPreview;
        });

        return colorPreviews;
      }

      const element = document.createElement("div");
      element.classList.add("share-dialog-content");
      const title = document.createElement("h1");
      title.innerText = (await getTheme(this.name)).displayName;
      const subTitle = document.createElement("h2");
      subTitle.innerText = "Share theme:";
      linkOutput.innerText = "Loading...";
      linkOutput.style.pointerEvents = "none";
      const copyContainer = document.createElement("div");
      copyContainer.classList.add("copy-container");

      const tile = document.createElement("div");
      tile.classList.add("sharing-tile");

      const theme = await getTheme(this.name);
      Object.keys(theme.cssProperties).forEach((key) => {
        element.style.setProperty(`${key}-local`, theme.cssProperties[key] as string);
      });

      const imageContainer = document.createElement("div");
      imageContainer.classList.add("sharing-image-container");

      const imageURL = await getImageURL(
        this.name,
        async () => {
          return await getExtensionImage(`theme-backgrounds/compressed/${this.name}.jpg`);
        },
        false,
      );
      const image = document.createElement("img");
      image.classList.add("sharing-image");

      if (await isValidImage(await imageURL.url)) {
        imageContainer.appendChild(image);
      }
      image.src = imageURL.url;

      const displayNameLength = title.innerText.length;

      if (displayNameLength < 20) {
        title.style.fontSize = "2rem";
      } else if (displayNameLength < 25) {
        title.style.fontSize = "1.5rem";
      } else if (displayNameLength < 30) {
        title.style.fontSize = "1.2rem";
      } else {
        title.style.fontSize = "1.2rem";
        title.innerText = `${title.innerText.slice(0, 30)}…`;
      }
      console.log(imageContainer);
      imageContainer.appendChild(title);
      console.log(imageContainer);
      tile.appendChild(imageContainer);

      const colorPreviewsContainer = document.createElement("div");
      colorPreviewsContainer.classList.add("sharing-color-previews");
      Object.values(generateColorPreviews(getEditableValues(theme.cssProperties))).forEach(
        (preview) => {
          const actualPreview = Object.values(preview)[0];
          if (actualPreview) {
            colorPreviewsContainer.appendChild(actualPreview);
          }
        },
      );
      tile.appendChild(colorPreviewsContainer);

      copyContainer.appendChild(linkOutput);
      copyContainer.appendChild(copyToClipboardButton);

      element.appendChild(subTitle);
      tile.appendChild(copyContainer);
      element.appendChild(tile);
      return element;
    };

    await shareDialog.create();
    shareDialog.show();
    new Toast("Uploading theme...", "info").render();

    const resp = await browser.runtime.sendMessage({
      action: "shareTheme",
      name: this.name,
    });

    if (resp.error) {
      console.error("Failed to share theme", resp.error);
      linkOutput.innerText = "Failed to share theme";
      shareDialog.element.classList.add("error-theme-sharing");
      copyToClipboardButton.innerHTML = errorSvg;
      copyToClipboardButton.style.pointerEvents = "none";
      new Toast("Failed to share theme", "error").render();
    } else {
      shareUrl = resp.shareUrl; // Update the URL variable
      console.log(linkOutput);
      linkOutput.innerText = `${(resp.shareUrl as string).slice(0, 32)}…`;
      linkOutput.style.pointerEvents = "all";
      linkOutput.addEventListener("click", copyToClipboard);
      copyToClipboardButton.innerHTML = copySvg;
      new Toast("Theme uploaded", "succes").render();
    }

    this.onShare();
  }

  // Overide in de implementation
  async onFavoriteToggle() {}

  // Overide in de implementation
  async onShare() {}

  // Overide in de implementation
  async onDuplicate(_newThemeName: string) {}
}

export async function updateTheme(name: string) {
  await browser.runtime.sendMessage({
    action: "setSetting",
    name: "appearance.theme",
    data: name,
  });
  Promise.all([setTheme(name), setBackground(name)]);
}

export class ThemeFolder extends Tile {
  category: string;
  constructor(category: string) {
    super();
    this.category = category;
  }

  override async createContent() {
    const firstThemeInCategory = (await browser.runtime.sendMessage({
      action: "getFirstThemeInCategory",
      category: this.category,
      includeHidden: true,
    })) as string;

    if (!firstThemeInCategory) {
      return;
    }
    const theme = (await browser.runtime.sendMessage({
      action: "getTheme",
      name: firstThemeInCategory,
    })) as Theme;

    Object.keys(theme.cssProperties).forEach((key) => {
      this.element.style.setProperty(`${key}-local`, theme.cssProperties[key] as string);
    });

    if (this.category === "custom" || this.category === "quickSettings") {
      this.element.classList.add("use-default-colors");
    }

    this.element.style.setProperty("--background-image-local", "url()");
    this.element.appendChild(this.createImageContainer());
    this.element.appendChild(this.createBottomContainer());
  }

  createBottomContainer() {
    const bottomContainer = document.createElement("div");
    bottomContainer.classList.add("theme-tile-bottom");

    const title = document.createElement("span");
    title.innerText = getFancyCategoryName(this.category);
    if (this.category === "quickSettings") {
      title.innerText = "Favorites";
    }

    title.classList.add("theme-tile-title");
    bottomContainer.appendChild(title);

    return bottomContainer;
  }

  createImageContainer() {
    const imageContainer = document.createElement("div");
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

type Tiles = Tile[] & ThemeTile[] & ThemeFolder[] & AddCustomTheme[] & noThemes[];

function getFancyCategoryName(name: string) {
  const fancyName = name.charAt(0).toUpperCase() + name.slice(1);
  return fancyName;
}

class AddCustomTheme extends Tile {
  createImageContainer() {
    const imageContainer = document.createElement("div");
    const svg = plusSVG;

    imageContainer.innerHTML = svg;
    imageContainer.classList.add("image-container");
    return imageContainer;
  }

  createBottomContainer() {
    const bottomContainer = document.createElement("div");
    bottomContainer.classList.add("theme-tile-bottom");

    const title = document.createElement("span");
    title.classList.add("theme-tile-title");
    title.innerText = "Create theme";
    bottomContainer.appendChild(title);

    return bottomContainer;
  }

  override async onClick() {
    const newTheme = await browser.runtime.sendMessage({
      action: "saveCustomTheme",
      data: await getTheme("defaultCustom"),
    });

    await settingsWindow.themeSelector.updateSelectorContent();
    await settingsWindow.loadPage(false);

    await updateTheme(newTheme);
    startCustomThemeCreator(await getTheme("defaultCustom"), newTheme);
  }

  override async createContent() {
    this.element.classList.add("use-default-colors");
    this.element.classList.add("create-theme-button");
    this.element.appendChild(this.createImageContainer());
    this.element.appendChild(this.createBottomContainer());
  }
}

class noThemes extends Tile {
  createImageContainer() {
    const imageContainer = document.createElement("div");
    const svg = brokenHeartSvg;

    imageContainer.innerHTML = svg;
    imageContainer.classList.add("image-container");
    return imageContainer;
  }

  createBottomContainer() {
    const bottomContainer = document.createElement("div");
    bottomContainer.classList.add("theme-tile-bottom");

    const title = document.createElement("span");
    title.classList.add("theme-tile-title");
    title.innerText = "No themes";
    bottomContainer.appendChild(title);

    return bottomContainer;
  }
  override async createContent() {
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
  currentCategory = "all";
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

    if (this.currentCategory === "all") {
      await this.renderFolderTiles();
    } else {
      await this.renderThemeTiles();
    }
    this.updateSizes();
    this.updateContentHeight();
  }

  // this is used if some of the correct content is already loaded
  async updateSelectorContent() {
    if (this.currentCategory === "all") {
      await this.renderFolderTiles();
      return;
    }

    await this.updateThemeTiles();
    this.updateImages();
  }

  async updateThemeTiles() {
    if (this.currentCategory === "all") {
      return;
    }
    const themes = (await browser.runtime.sendMessage({
      action: "getThemes",
      categories: [this.currentCategory],
      includeHidden: true,
    })) as {
      [key: string]: Theme;
    };
    const data = (await browser.runtime.sendMessage({
      action: "getSettingsData",
    })) as Settings;

    const visibleThemeTiles = this.content.querySelectorAll(".theme-tile");
    const visibleThemeTilesArray: HTMLDivElement[] = [];
    visibleThemeTiles.forEach((element) => {
      visibleThemeTilesArray.push(element as HTMLDivElement);
    });
    const visibleThemeNames = visibleThemeTilesArray.map((element) => {
      return element.dataset.name;
    }) as string[];

    const correctThemeNames = Object.keys(themes).map((themeName) => {
      return themeName;
    });

    const addMissingTiles = async (visibleThemeNames: string[], correctThemeNames: string[]) => {
      const customThemes = (await browser.runtime.sendMessage({
        action: "getThemes",
        categories: ["custom"],
        includeHidden: true,
      })) as {
        [key: string]: Theme;
      };
      correctThemeNames.forEach(async (themeName) => {
        if (!visibleThemeNames.includes(themeName)) {
          const isFavorite = data.appearance.quickSettingsThemes.includes(themeName);
          const newTile = this.createThemeTile(
            themeName,
            isFavorite,
            Object.keys(customThemes).includes(themeName),
          );
          const createThemeButton = this.content.querySelector(".create-theme-button");
          if (createThemeButton) {
            createThemeButton.insertAdjacentElement("beforebegin", await newTile.render());
          } else {
            this.content.appendChild(await newTile.render());
          }
          this.currentTiles.push(newTile);
          this.updateContentHeight();
        }
      });
    };

    const removeIncorrectTiles = async (
      visibleThemeNames: string[],
      correctThemeNames: string[],
    ) => {
      visibleThemeNames.forEach(async (themeName) => {
        if (!correctThemeNames.includes(themeName)) {
          const element = visibleThemeTilesArray.find((element) => {
            if (element.dataset.name === themeName) {
              return element;
            }
            return false;
          });
          if (!element) {
            return;
          }
          if (element.classList.contains("create-theme-button")) {
            return;
          }
          this.content.removeChild(element);
          this.currentTiles = this.currentTiles.filter((tile) => {
            if (tile instanceof AddCustomTheme) {
              return true;
            }
            if (tile instanceof ThemeTile) {
              return tile.name !== themeName;
            }
            return false;
          }) as Tiles;
        }
        this.updateContentHeight();
      });
    };

    const updateLocalCSS = async () => {
      this.currentTiles.forEach((tile: ThemeTile) => {
        if (tile.name === currentThemeName) {
          tile.updateCSS();
          tile.updateTitle();
        }
      });
    };
    if (Object.keys(themes).length === 0 && this.currentCategory !== "custom") {
      this.currentTiles.push(new noThemes());
      await this.renderTiles(this.currentTiles);
    }

    await addMissingTiles(visibleThemeNames, correctThemeNames);
    await removeIncorrectTiles(visibleThemeNames, correctThemeNames);
    updateLocalCSS();
  }

  updateTopContainer() {
    this.topContainer.innerHTML = "";
    const title = document.createElement("h2");
    title.classList.add("current-category");

    if (this.currentCategory !== "all") {
      const backButton = document.createElement("button");
      backButton.innerHTML = chevronLeftSvg;
      backButton.addEventListener("click", () => this.changeCategory("all"));
      this.topContainer.appendChild(backButton);
    }

    title.innerText = `${getFancyCategoryName(this.currentCategory)} themes`;
    if (this.currentCategory === "quickSettings") {
      title.innerText = "Favorite themes";
    }
    this.topContainer.appendChild(title);
  }

  async renderTiles(tiles: Tiles) {
    function getTileDelay(number: number) {
      if (number < 8) {
        return 20;
      }
      if (number < 12) {
        return 15;
      }
      return 7;
    }
    this.content.style.height = `${this.calculateContentHeight(tiles.length)}px`;
    const delayAmount = getTileDelay(tiles.length);
    for (let i = 1; i <= tiles.length; i++) {
      const tile = tiles[i - 1];
      if (!tile) {
        break;
      }
      await tile.render();
      await tile.updateImage(currentThemeName, true);

      this.content.appendChild(tile.element);

      if (document.body.classList.contains("enableAnimations")) {
        await delay(delayAmount);
      }
    }
  }

  createContentContainer() {
    this.content = document.createElement("div");
    this.content.classList.add("theme-tiles");
  }

  calculateContentHeight(tileAmount: number) {
    const TILE_HEIGHT = 104;
    const TILE_WIDTH = 168;
    const GAP = 6;
    const totalWidth = this.contentWidth;
    const tilesPerRow = Math.floor((totalWidth + GAP) / (TILE_WIDTH + GAP));
    const numRows = Math.ceil(tileAmount / tilesPerRow);
    const totalHeight = numRows * TILE_HEIGHT + (numRows - 1) * GAP;
    return totalHeight;
  }

  async renderFolderTiles() {
    const categories = (await browser.runtime.sendMessage({
      action: "getThemeCategories",
      includeEmpty: true,
      includeHidden: true,
    })) as {
      [key: string]: string[];
    };

    const tiles = Object.keys(categories).map((category) => {
      const tile = new ThemeFolder(category);
      tile.onClick = async () => {
        this.changeCategory(category);
      };
      return tile;
    }) as Tiles;
    this.currentTiles = tiles;
    await this.renderTiles(tiles);
  }

  updateContentHeight() {
    this.content.style.height = `${String(this.calculateContentHeight(this.currentTiles.length))}px`;
  }

  createThemeTile(name: string, isFavorite: boolean, isCustom: boolean) {
    const tile = new ThemeTile(name, this.currentCategory, isFavorite, isCustom);
    tile.element.dataset.name = name;

    tile.onDuplicate = async (newThemeName: string) => {
      if (isCustom) {
        await this.updateSelectorContent();
      }
      await updateTheme(newThemeName);
      await this.changeCategory("custom");
      Promise.all([settingsWindow.loadPage(false)]);

      startCustomThemeCreator(await getTheme(newThemeName), newThemeName);
    };
    tile.onFavoriteToggle = async () => {
      await settingsWindow.loadPage(false);
      await loadQuickSettings();
      if (this.currentCategory === "quickSettings") {
        await this.updateSelectorContent();
      }
    };
    return tile;
  }

  async renderThemeTiles() {
    const themes = (await browser.runtime.sendMessage({
      action: "getThemes",
      categories: [this.currentCategory],
      includeHidden: true,
    })) as {
      [key: string]: Theme;
    };
    const customThemes = (await browser.runtime.sendMessage({
      action: "getThemes",
      categories: ["custom"],
      includeHidden: true,
    })) as {
      [key: string]: Theme;
    };
    const data = (await browser.runtime.sendMessage({
      action: "getSettingsData",
    })) as Settings;

    const tiles = Object.keys(themes).map((name) => {
      const isFavorite = data.appearance.quickSettingsThemes.includes(name);
      const isCustom = Object.keys(customThemes).includes(name);
      return this.createThemeTile(name, isFavorite, isCustom);
    }) as Tiles;
    if (this.currentCategory === "custom") {
      tiles.push(new AddCustomTheme());
    }
    this.currentTiles = tiles;

    if (Object.keys(themes).length === 0 && this.currentCategory !== "custom") {
      this.currentTiles.push(new noThemes());
    }

    await this.renderTiles(this.currentTiles);
  }

  async changeCategory(category: string) {
    this.currentCategory = category;
    await this.renderSelectorContent();
  }
}

async function startCustomThemeCreator(theme: Theme, name: string) {
  const themeEditor = new CustomThemeCreator(theme, name);
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

interface colordPalette {
  Vibrant: Colord;
  DarkVibrant: Colord;
  LightVibrant: Colord;
  Muted: Colord;
  DarkMuted: Colord;
  LightMuted: Colord;
}

function convertColorPalette(vibrantPalette: Palette) {
  function convertSwatchToColord(swatch: Swatch | null) {
    if (!swatch) {
      return colord("#000");
    }
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

export class CustomThemeCreator extends Dialog {
  theme: Theme;
  name: ThemeId;
  editableValues: string[];
  colorPreviews: {
    [key: string]: HTMLDivElement;
  }[];
  backgroundImageInput: ImageSelector;
  backgroundImagePreview: HTMLImageElement;
  themeGeneratorIsOpen = false;
  imagePreviewContainer: HTMLDivElement;

  getEditableValues(cssProperties: Theme["cssProperties"]) {
    const nonEditableValues = [
      "--color-homepage-sidebars-bg",
      "--darken-background",
      "--color-splashtext",
    ];
    const editableValues = Object.keys(cssProperties).filter((property) => {
      return !nonEditableValues.includes(property);
    });
    return editableValues;
  }

  createColorPreview(name: string) {
    const colorPreview = document.createElement("div");
    colorPreview.classList.add("color-preview-bubble");
    if (this.theme.cssProperties[name]) {
      colorPreview.style.setProperty("--current-color", this.theme.cssProperties[name]);
    }
    colorPreview.dataset.name = name;
    colorPreview.addEventListener("click", (e: Event) => {
      if (!colorPreview.parentElement?.querySelector(".floating-picker")) {
        this.openColorPicker(name, colorPreview, e);
      }
    });
    return colorPreview;
  }

  updateColorPreviews() {
    this.colorPreviews.forEach((preview) => {
      const previewName = Object.keys(preview)[0];
      const element = Object.values(preview)[0];
      if (previewName && element) {
        const newValue = this.theme.cssProperties[previewName];
        if (newValue) {
          element.style.setProperty("--current-color", newValue);
        }
      }
    });
  }

  generateColorPreviews(editableValues: string[]) {
    const colorPreviews = editableValues.map((colorName) => {
      const colorPreview: { [key: string]: HTMLDivElement } = {};
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

  constructor(theme: Theme, name: ThemeId) {
    super("customThemeCreator", true);
    this.theme = theme;
    this.name = name;
    this.editableValues = this.getEditableValues(theme.cssProperties);
    this.colorPreviews = this.generateColorPreviews(this.editableValues);
    this.backgroundImageInput = new ImageSelector(this.name, true);
    this.backgroundImageInput.id = this.name;
    this.imagePreviewContainer = document.createElement("div");
    this.backgroundImageInput.onStore = async () => {
      updateTheme(this.name);
      this.updateBackgroundImagePreview();
    };
    this.backgroundImagePreview = this.createBackgroundImagePreview();
  }

  content = document.createElement("div");
  displayNameInput = document.createElement("input");

  openColorPicker(name: string, colorPreview: HTMLDivElement, e: Event) {
    const colorPicker = new ColorPicker();

    colorPicker.element.style.position = "absolute";
    colorPicker.element.classList.add("floating-picker");

    const _docEventHandler = (docEvent: Event) => {
      if (docEvent === e) {
        return;
      }

      if (!(docEvent.target instanceof Node)) {
        return;
      }
      if (docEvent.target === colorPreview) {
        return;
      }
      const targetElement = docEvent.target as HTMLElement;
      const parentElement = targetElement.parentElement;

      if (colorPicker.element.contains(targetElement)) {
        return;
      }

      const isIconClick =
        targetElement.classList?.contains("copy-svg") ||
        targetElement.classList?.contains("done-icon") ||
        parentElement?.classList?.contains("copy-svg") ||
        parentElement?.classList?.contains("done-icon");

      if (isIconClick) {
        return;
      }

      colorPicker.element.remove();
      document.removeEventListener("mousedown", _docEventHandler);
    };

    document.addEventListener("mousedown", _docEventHandler);

    if (this.theme.cssProperties[name]) {
      colorPicker.currentColor = colord(this.theme.cssProperties[name]);
    }
    colorPicker.onChange = async () => {
      colorPreview.style.setProperty("--current-color", colorPicker.currentColor.toHex());
      await this.saveThemeData();
      setTheme(this.name);
    };
    colorPreview.parentElement?.appendChild(colorPicker.render());
  }

  async saveThemeData() {
    await browser.runtime.sendMessage({
      action: "markThemeAsModified",
      name: this.name,
    });

    this.colorPreviews.forEach((preview) => {
      const colorPreview = Object.values(preview)[0];
      if (!colorPreview) {
        return;
      }
      const colorName = colorPreview.dataset.name;
      if (!colorName) {
        return;
      }
      this.theme.cssProperties[colorName] = colorPreview.style.getPropertyValue("--current-color");
    });
    this.theme.displayName = this.displayNameInput.value;
    if (
      this.theme.cssProperties["--color-base00"] &&
      this.theme.cssProperties["--color-base02"] &&
      this.theme.cssProperties["--color-text"]
    ) {
      const base00 = colord(this.theme.cssProperties["--color-base00"]);
      let darkenColor: Colord;
      const splashColor: Colord = colord(this.theme.cssProperties["--color-text"]);
      if (base00.brightness() > 0.5) {
        darkenColor = colord("rgba(228, 228, 228, 0.4)");
        darkenColor = darkenColor.mix(this.theme.cssProperties["--color-base02"], 0.5).alpha(0.4);
      } else {
        darkenColor = colord("rgba(0,0,0,0.2)");
        darkenColor = darkenColor.mix(this.theme.cssProperties["--color-base00"], 0.5).alpha(0.3);
      }
      this.theme.cssProperties["--color-splashtext"] = splashColor.toHex();
      this.theme.cssProperties["--darken-background"] = darkenColor.toHex();
      this.theme.cssProperties["--color-homepage-sidebars-bg"] = darkenColor.alpha(0.1).toHex();
    }
    await browser.runtime.sendMessage({
      action: "saveCustomTheme",
      data: this.theme,
      id: this.name,
    });
  }

  createRemoveButton() {
    const button = document.createElement("button");
    button.classList.add("remove-custom-theme");
    button.innerHTML = `Remove theme${trashSvg}`;
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
    const button = document.createElement("button");
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
    const img = document.createElement("img");
    img.classList.add("theme-creator-preview-image");
    return img;
  }

  async updateBackgroundImagePreview() {
    const result = (await browser.runtime.sendMessage({
      action: "getImage",
      id: this.name,
    })) as SMPPImage;

    if (result.metaData.type === "default") {
      result.imageData = await getExtensionImage(`theme-backgrounds/compressed/${this.name}.jpg`);
    }
    if (await isValidImage(result.imageData)) {
      this.backgroundImagePreview.src = result.imageData;
      this.content.classList.remove("no-image-available");
    } else {
      this.backgroundImagePreview.src = "";
      this.content.classList.add("no-image-available");
    }
  }

  async getImageColors() {
    try {
      const vibrantTester = new Vibrant(this.backgroundImagePreview.src, {
        quality: 1,
        colorCount: 256,
      });

      const palette = await vibrantTester.getPalette();

      return palette;
    } catch (error) {
      console.error("Error extracting image colors:", error);
      return null;
    }
  }

  readUserChoice() {
    const brightnessButton = document.getElementById("brightness-control") as HTMLInputElement;
    const saturationButton = document.getElementById("saturation-control") as HTMLInputElement;
    if (!(brightnessButton && saturationButton)) {
      return;
    }
    const choice = {
      mode: brightnessButton.checked,
      saturation: saturationButton.checked,
    };
    return choice;
  }

  async generateTheme() {
    const swatchPalette = await this.getImageColors();
    if (!swatchPalette) {
      return;
    }

    const colordPalette = convertColorPalette(swatchPalette);

    const choice = this.readUserChoice();
    if (!choice) {
      return;
    }

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

      darkenColor = colord("rgba(0,0,0,0.2)").mix(base00.toHex(), 0.5).alpha(0.3);
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
      darkenColor = colord("rgba(228, 228, 228, 0.4)").mix(base02.toHex(), 0.5).alpha(0.4);
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
      action: "markThemeAsModified",
      name: this.name,
    });
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
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = id;
        input.classList.add("theme-maker-input");

        const label = document.createElement("label");
        label.htmlFor = id;
        label.classList.add("theme-maker-label", "generate-theme-control");

        input.addEventListener("click", () => {
          this.updateLogo(this.label, this.element.checked);
        });

        return { input, label };
      }

      updateLogo(_element: HTMLLabelElement, _state: boolean) {}

      load() {
        this.updateLogo(this.label, this.element.checked);
      }

      createWrapper() {
        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.display = "flex";
        wrapper.appendChild(this.element);
        wrapper.appendChild(this.label);
        return wrapper;
      }
    }

    function createSmallThemeGenerationContainer() {
      const container = document.createElement("div");
      container.classList.add("theme-generation-sub-container");
      return container;
    }

    const container = document.createElement("div");
    container.classList.add("theme-controls-container");

    const brightnessButton = new themeGenerationControl("brightness-control");
    brightnessButton.updateLogo = (e, s) => {
      const tooltip = e.parentElement?.querySelector(".smpp-tooltip");
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

    const saturationButton = new themeGenerationControl("saturation-control");
    saturationButton.updateLogo = (e, s) => {
      const tooltip = e.parentElement?.querySelector(".smpp-tooltip");
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

    const firstSubContainer = createSmallThemeGenerationContainer();

    const brightnessButtonWrapper = brightnessButton.createWrapper();
    brightnessButtonWrapper.appendChild(createHoverTooltip("Brightness", "horizontal"));
    const saturationButtonWrapper = saturationButton.createWrapper();
    saturationButtonWrapper.appendChild(createHoverTooltip("Saturation", "horizontal"));
    firstSubContainer.appendChild(brightnessButtonWrapper);
    firstSubContainer.appendChild(saturationButtonWrapper);

    const secondSubContainer = createSmallThemeGenerationContainer();
    secondSubContainer.appendChild(this.createMakeThemeButton());
    container.appendChild(firstSubContainer);
    container.appendChild(secondSubContainer);

    brightnessButton.load();
    saturationButton.load();
    return container;
  }

  createColorPickers() {
    const colorPickerElement = document.createElement("div");
    colorPickerElement.classList.add("custom-theme-color-picker-container");
    this.colorPreviews.forEach((preview) => {
      const colorPreviewWrapper = document.createElement("div");
      colorPreviewWrapper.classList.add("color-picker-preview-wrapper");
      const colorPreview = Object.values(preview)[0];
      if (colorPreview) {
        colorPreviewWrapper.appendChild(colorPreview);
      }
      const colorName = Object.keys(preview)[0];
      if (colorName) {
        colorPreviewWrapper.appendChild(
          createHoverTooltip(this.convertPropertyName(colorName as ThemeProperty), "vertical"),
        );
      }

      colorPickerElement.appendChild(colorPreviewWrapper);
    });
    return colorPickerElement;
  }

  createFileInputContainer() {
    const fileInputContainer = document.createElement("div");
    fileInputContainer.classList.add("file-and-theme-button-container");
    fileInputContainer.appendChild(this.backgroundImageInput.fullContainer);
    const divider = document.createElement("div");
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
    const button = document.createElement("button");
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
    const imageWrapper = document.createElement("div");
    imageWrapper.classList.add("preview-image-wrapper");
    imageWrapper.appendChild(this.backgroundImagePreview);
    this.imagePreviewContainer.appendChild(imageWrapper);
    this.imagePreviewContainer.appendChild(this.createThemeGenerationControls());

    return this.imagePreviewContainer;
  }

  override async renderContent() {
    this.content.classList.add("custom-theme-maker");

    this.content.appendChild(this.createDisplayNameInput());

    this.content.appendChild(this.createImagePreviewContainer());

    this.content.appendChild(this.createFileInputContainer());
    this.content.appendChild(this.createColorPickers());

    this.content.appendChild(this.createRemoveButton());
    this.element.appendChild(this.content);

    return this.element;
  }

  override async onCreate(): Promise<void> {
    await this.updateBackgroundImagePreview();
    this.load(this.theme);
  }

  async load(theme: Theme) {
    this.displayNameInput.value = theme.displayName;
    this.updateColorPreviews();
    await this.backgroundImageInput.loadImageData();
  }

  override onClosed(realUserIntent: boolean): void {
    document.body.removeChild(this.wrapper);
    if (!realUserIntent) {
      return;
    }
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
    this.hide(true);
  }
}
