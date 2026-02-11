import { browser, delay, getExtensionImage } from "../../common/utils.js";
import { performanceModeSvg, settingsIconSvg } from "../../fixes-utils/svgs.js";
import {
  currentThemeName,
  getTheme,
  type Theme,
  type Themes,
  updateTheme,
} from "../appearance/themes.js";
import { apply } from "../main.js";
import { getImageURL, ImageSelector } from "../modules/images.js";
import { openSettingsWindow, type Settings, settingsWindow } from "./main-settings.js";

class CompactThemeOption {
  element = document.createElement("div");
  name: string;
  currentTheme: Theme;

  constructor(name: string, theme: Theme) {
    this.name = name;
    this.currentTheme = theme;
  }
  createText() {
    const text = document.createElement("div");
    text.classList.add("compact-theme-option-text");
    text.innerText = this.currentTheme.displayName;

    return text;
  }

  render() {
    this.element.innerHTML = "";
    this.element.classList.add("compact-theme-option");
    this.element.dataset.name = this.name;
    this.element.addEventListener("click", () => this.click());
    this.element.appendChild(this.createText());
    this.element.appendChild(this.createImageContainer());
    this.update();
    return this.element;
  }

  createImageContainer() {
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("compact-theme-option-image-container");
    return imageContainer;
  }

  async updateImage(forceReload = false) {
    if (this.name === currentThemeName || forceReload) {
      const imageURL = await getImageURL(
        this.name,
        async () => {
          return await getExtensionImage(`theme-backgrounds/compressed/${this.name}.jpg`);
        },
        true,
      );

      this.element.style.setProperty("--background-image-local", `url(${imageURL.url})`);
    }
  }

  updateElement() {
    Object.keys(this.currentTheme.cssProperties).forEach((key) => {
      this.element.style.setProperty(
        `${key}-local`,
        this.currentTheme.cssProperties[key] as string,
      );
    });
  }

  async click() {
    await updateTheme(this.name);
    await this.onClick();
    this.element.classList.add("is-selected");
  }

  async onClick() {}

  async updateSelection() {
    if (this.name === currentThemeName) {
      this.element.classList.add("is-selected");
      this.updateImage(true);
    } else {
      this.element.classList.remove("is-selected");
      this.element.style.setProperty("--background-image-local", `url()`);
    }
  }

  async update() {
    this.currentTheme = await getTheme(this.name);
    this.updateSelection();
    this.updateElement();
  }
}

class CompactThemeSelector {
  element = document.createElement("div");
  input = document.createElement("div");
  selector = document.createElement("div");
  selectorIsOpen: boolean = false;
  themeOptions: CompactThemeOption[] = [];

  async createThemeOption(name: string, theme: Theme) {
    const option = new CompactThemeOption(name, theme);
    option.onClick = async () => {
      this.updateInput();
      if (settingsWindow) {
        await settingsWindow.loadPage();
      }
      this.themeOptions.forEach((option) => {
        option.updateSelection();
      });
    };
    this.themeOptions.push(option);
    return option;
  }

  async createThemeOptions(themes: Themes) {
    Object.entries(themes).forEach((theme) => {
      this.createThemeOption(theme[0], theme[1]);
    });
  }

  async renderThemeOptions() {
    for (let i = 1; i <= this.themeOptions.length; i++) {
      const option = this.themeOptions[i - 1];
      if (!option) break;
      option.render();
      this.selector.style.height = `${this.calculateHeight(i)}px`;
      this.selector.appendChild(option.element);

      if (document.body.classList.contains("enableAnimations")) await delay(20);
    }
  }

  async updateThemeOptions() {
    const themes = (await browser.runtime.sendMessage({
      action: "getThemes",
      categories: ["quickSettings"],
      includeHidden: true,
    })) as Themes;

    const themeOptionNames = this.themeOptions.map((option) => {
      return option.name;
    });

    const themeNames = Object.keys(themes);

    const missingThemeOptionNames = themeNames.filter((name: string) => {
      return !themeOptionNames.includes(name);
    });
    missingThemeOptionNames.forEach(async (name) => {
      if (!themes[name]) {
        return;
      }
      const option = await this.createThemeOption(name, themes[name]);
      option.render();
      this.selector.appendChild(option.element);
    });

    const extraThemeOptionNames = themeOptionNames.filter((name: string) => {
      return !themeNames.includes(name);
    });

    this.themeOptions.forEach((option) => {
      if (extraThemeOptionNames.includes(option.name)) {
        option.element.remove();
      }
    });

    this.themeOptions = this.themeOptions.filter((option) => {
      return !extraThemeOptionNames.includes(option.name);
    });
    this.themeOptions.forEach((option) => {
      option.updateSelection();
    });
  }
  createInput() {
    this.input.classList.add("theme-selector-input");
    this.updateInput();
  }
  async updateInput() {
    const currentOption = new CompactThemeOption(
      currentThemeName,
      await getTheme(currentThemeName),
    );
    currentOption.onClick = async () => {
      this.selectorIsOpen = !this.selectorIsOpen;
      this.updateSelectorStatus();
    };
    currentOption.render();
    currentOption.element.classList.add("is-selected");
    this.input.innerHTML = "";
    this.input.appendChild(currentOption.element);
  }
  async updateSelectorStatus() {
    if (this.selectorIsOpen) {
      this.selector.innerHTML = "";
      this.selector.classList.add("visible");
      this.selector.style.overflowY = "hidden";

      await this.renderThemeOptions();
      await delay(500);
      this.selector.style.overflowY = "auto";
    } else {
      this.selector.style.overflowY = "hidden";
      this.selector.style.height = "0px";
      this.selector.classList.remove("visible");
    }
  }

  calculateHeight(themeOptionsCount: number) {
    const TOP_MARGIN = 7;
    const CONTENT_HEIGHT = themeOptionsCount * (36 + 3);
    return TOP_MARGIN + CONTENT_HEIGHT;
  }

  async render() {
    this.element.classList.add("compact-theme-selector");
    const themes = (await browser.runtime.sendMessage({
      action: "getThemes",
      categories: ["quickSettings"],
      includeHidden: true,
    })) as Themes;
    this.themeOptions = [];

    this.createThemeOptions(themes);

    this.updateThemeOptions();
    this.createInput();

    document.addEventListener("click", (e: MouseEvent) => {
      if (e.target instanceof HTMLElement) {
        if (e.target === this.input || this.input.contains(e.target)) return;
        this.selectorIsOpen = false;
        this.updateSelectorStatus();
      }
    });

    this.element.appendChild(this.input);
    this.element.appendChild(this.selector);
    this.selector.classList.add("compact-theme-options");

    return this.element;
  }
}

const compactThemeSelector = new CompactThemeSelector();

let quickSettingsWindowIsHidden = true;
const quickSettingsBackgroundImageSelector = new ImageSelector("backgroundImage", true);

async function storeQuickSettings() {
  const oldData = (await browser.runtime.sendMessage({
    action: "getSettingsData",
  })) as Settings;

  const data = structuredClone(oldData);
  const backgroundBlurAmountSlider = document.getElementById(
    "background-blur-amount-slider",
  ) as HTMLInputElement;
  if (backgroundBlurAmountSlider) {
    data.appearance.background.blur = Number(backgroundBlurAmountSlider.value);
  }
  const performanceModeToggle = document.getElementById(
    "performance-mode-toggle",
  ) as HTMLInputElement;
  if (performanceModeToggle) {
    data.other.performanceMode = performanceModeToggle.checked;
  }

  await browser.runtime.sendMessage({ action: "setSettingsData", data });
  await loadQuickSettings();
  if (settingsWindow) {
    await settingsWindow.loadPage();
  }
  console.log("Successfull stored quick settings:\n", data);
  await apply();
}

export async function loadQuickSettings() {
  const data = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });

  quickSettingsBackgroundImageSelector.id = data.appearance.theme;
  quickSettingsBackgroundImageSelector.loadImageData();
  const backgroundBlurAmountSlider = document.getElementById(
    "background-blur-amount-slider",
  ) as HTMLInputElement;
  if (backgroundBlurAmountSlider) {
    backgroundBlurAmountSlider.value = data.appearance.background.blur;
  }
  const performanceModeToggle = document.getElementById(
    "performance-mode-toggle",
  ) as HTMLInputElement;
  if (performanceModeToggle) {
    performanceModeToggle.checked = data.other.performanceMode;
  }

  const performanceModeInfo = document.getElementById("performance-mode-info");
  if (performanceModeInfo) {
    performanceModeInfo.innerHTML = `Toggle performance mode ${
      data.other.performanceMode
        ? "<span class='green-underline'>Enabled</span>"
        : "<span class='red-underline'>Disabled</span>"
    }`;
  }
  await compactThemeSelector.updateInput();
  await compactThemeSelector.updateThemeOptions();
}

function toggleQuickSettings() {
  const win = document.getElementById("quickSettings");
  if (win && !quickSettingsWindowIsHidden) {
    closeQuickSettings();
  } else {
    openQuickSettings();
  }
}

async function openQuickSettings() {
  const win = document.getElementById("quickSettings");
  if (!win) return;
  win.classList.remove("qs-hidden");
  await loadQuickSettings();
  quickSettingsWindowIsHidden = false;
}

function closeQuickSettings() {
  const win = document.getElementById("quickSettings");
  if (win) {
    win.classList.add("qs-hidden");
  }
  quickSettingsWindowIsHidden = true;
}

async function createQuickSettingsHTML(parent: HTMLDivElement) {
  const performanceModeTooltipLabel = document.createElement("label");
  performanceModeTooltipLabel.className = "performanceModeTooltipLabel";
  performanceModeTooltipLabel.id = "performanceModeTooltipLabel";

  const performanceModeTooltip = document.createElement("input");
  performanceModeTooltip.type = "checkbox";
  performanceModeTooltip.id = "performance-mode-toggle";

  performanceModeTooltipLabel.appendChild(performanceModeTooltip);
  performanceModeTooltipLabel.innerHTML += performanceModeSvg;

  const performanceModeInfo = document.createElement("span");
  performanceModeInfo.id = "performance-mode-info";

  const themeHeading = document.createElement("h3");
  themeHeading.className = "quick-settings-title";
  themeHeading.textContent = "Theme:";

  const wallpaperTopContainer = document.createElement("div");

  const wallpaperHeading = document.createElement("h3");
  wallpaperHeading.className = "quick-settings-title";
  wallpaperHeading.textContent = "Wallpaper:";

  const wallpaperContainer = document.createElement("div");
  wallpaperContainer.className = "wallpaper-quick-settings-container";

  const blurSliderContainer = document.createElement("div");
  blurSliderContainer.className = "blur-slider-container";

  const blurSlider = document.createElement("input");
  blurSlider.type = "range";
  blurSlider.min = "0";
  blurSlider.max = "10";
  blurSlider.value = "0";
  blurSlider.className = "main-slider";
  blurSlider.id = "background-blur-amount-slider";

  const backgroundBlurLabel = document.createElement("span");
  backgroundBlurLabel.className = "color-label";
  backgroundBlurLabel.id = "blurPlaats";
  backgroundBlurLabel.textContent = "blur";

  blurSliderContainer.appendChild(blurSlider);
  blurSliderContainer.appendChild(backgroundBlurLabel);

  wallpaperContainer.appendChild(quickSettingsBackgroundImageSelector.fullContainer);
  wallpaperContainer.appendChild(blurSliderContainer);

  wallpaperTopContainer.appendChild(wallpaperHeading);
  wallpaperTopContainer.appendChild(wallpaperContainer);

  const extraSettingsButton = document.createElement("button");
  extraSettingsButton.id = "extraSettingsButton";
  extraSettingsButton.innerHTML += "More Settings";
  extraSettingsButton.innerHTML += settingsIconSvg;
  extraSettingsButton.addEventListener("click", (e) => openSettingsWindow(e));

  const themeContainer = document.createElement("div");
  themeContainer.classList.add("quick-settings-theme-container");
  await compactThemeSelector.render();
  themeContainer.appendChild(themeHeading);
  themeContainer.appendChild(compactThemeSelector.element);
  parent.appendChild(performanceModeTooltipLabel);
  parent.appendChild(themeContainer);
  parent.appendChild(wallpaperTopContainer);
  parent.appendChild(performanceModeInfo);
  parent.appendChild(extraSettingsButton);
  return parent;
}

export async function createQuickSettings() {
  let quickSettingsWindow = document.createElement("div");
  quickSettingsWindow.id = "quickSettings";
  quickSettingsWindow.addEventListener("change", storeQuickSettings);

  quickSettingsBackgroundImageSelector.onStore = () => {
    storeQuickSettings();
  };

  quickSettingsWindow = await createQuickSettingsHTML(quickSettingsWindow);

  const quickSettingsButton = document.getElementById("quickSettingsButton");
  if (quickSettingsButton) {
    quickSettingsButton.insertAdjacentElement("afterend", quickSettingsWindow);
  }

  const tooltipLabel = document.getElementById("performanceModeTooltipLabel");
  const tooltipInfo = document.getElementById("performance-mode-info");

  if (tooltipLabel && tooltipInfo) {
    tooltipLabel.addEventListener("mouseover", () => {
      tooltipInfo.style.opacity = "1";
    });

    tooltipLabel.addEventListener("mouseout", () => {
      tooltipInfo.style.opacity = "0";
    });
  }

  document.addEventListener("click", (e: MouseEvent) => {
    if (quickSettingsWindowIsHidden) return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (target.id === "extraSettingsButton") {
      closeQuickSettings();
      return;
    }

    if (
      target.id === "quickSettings" ||
      quickSettingsWindow.contains(target) ||
      target.id === "quickSettingsButton"
    ) {
      return;
    }

    closeQuickSettings();
  });

  closeQuickSettings();
}

export function createQuickSettingsButton() {
  const quickSettingsButtonWrapper = document.createElement("div");
  quickSettingsButtonWrapper.id = "quickSettingsButtonWrapper";
  quickSettingsButtonWrapper.classList.add("smpp-button");
  quickSettingsButtonWrapper.classList.add("topnav__btn-wrapper");

  const quickSettingsButton = document.createElement("button");
  quickSettingsButton.id = "quickSettingsButton";
  quickSettingsButton.classList.add("topnav__btn");
  quickSettingsButton.innerText = "Settings";
  quickSettingsButton.addEventListener("click", toggleQuickSettings);
  quickSettingsButtonWrapper.appendChild(quickSettingsButton);
  return quickSettingsButtonWrapper;
}
