import { apply } from "../main.js";
import { getImageURL, ImageSelector } from "../modules/images.js";
import { performanceModeSvg, settingsIconSvg } from "../../fixes-utils/svgs.js";
import {
  openSettingsWindow,
  settingsWindow,
  type Settings,
} from "./main-settings.js";
import { browser, getExtensionImage } from "../../common/utils.js";
import { getTheme } from "../appearance/themes.js";

let quickSettingsWindowIsHidden = true;
let quickSettingsBackgroundImageSelector = new ImageSelector("backgroundImage");

async function storeQuickSettings() {
  const oldData = (await browser.runtime.sendMessage({
    action: "getSettingsData",
  })) as Settings;

  const data = structuredClone(oldData);
  const backgroundBlurAmountSlider = document.getElementById(
    "background-blur-amount-slider"
  ) as HTMLInputElement;
  if (backgroundBlurAmountSlider) {
    data.appearance.background.blur = Number(backgroundBlurAmountSlider.value);
  }
  const performanceModeToggle = document.getElementById(
    "performance-mode-toggle"
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
    "background-blur-amount-slider"
  ) as HTMLInputElement;
  if (backgroundBlurAmountSlider) {
    backgroundBlurAmountSlider.value = data.appearance.background.blur;
  }
  const performanceModeToggle = document.getElementById(
    "performance-mode-toggle"
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
}

function toggleQuickSettings() {
  let win = document.getElementById("quickSettings");
  if (win && !quickSettingsWindowIsHidden) {
    closeQuickSettings();
  } else {
    openQuickSettings();
  }
}

async function openQuickSettings() {
  let win = document.getElementById("quickSettings");
  if (!win) return;
  win.classList.remove("qs-hidden");
  await loadQuickSettings();
  quickSettingsWindowIsHidden = false;
}

function closeQuickSettings() {
  let win = document.getElementById("quickSettings");
  if (win) {
    win.classList.add("qs-hidden");
  }
  quickSettingsWindowIsHidden = true;
}

function createQuickSettingsHTML(parent: HTMLDivElement): HTMLDivElement {
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

  const compactThemeSelector = new CompyThemeSelector();

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

  wallpaperContainer.appendChild(
    quickSettingsBackgroundImageSelector.fullContainer
  );
  wallpaperContainer.appendChild(blurSliderContainer);

  wallpaperTopContainer.appendChild(wallpaperHeading);
  wallpaperTopContainer.appendChild(wallpaperContainer);

  const extraSettingsButton = document.createElement("button");
  extraSettingsButton.id = "extraSettingsButton";
  extraSettingsButton.innerHTML += "More Settings";
  extraSettingsButton.innerHTML += settingsIconSvg;
  extraSettingsButton.addEventListener("click", (e) => openSettingsWindow(e));

  parent.appendChild(performanceModeTooltipLabel);
  parent.appendChild(compactThemeSelector.render());
  parent.appendChild(wallpaperTopContainer);
  parent.appendChild(performanceModeInfo);
  parent.appendChild(extraSettingsButton);
  return parent;
}

export function createQuickSettings() {
  let quickSettingsWindow = document.createElement("div");
  quickSettingsWindow.id = "quickSettings";
  quickSettingsWindow.addEventListener("change", storeQuickSettings);

  quickSettingsBackgroundImageSelector.onStore = () => {
    storeQuickSettings();
  };

  quickSettingsWindow = createQuickSettingsHTML(quickSettingsWindow);

  const quickSettingsButton = document.getElementById("quickSettingsButton");
  if (quickSettingsButton) {
    quickSettingsButton.insertAdjacentElement("afterend", quickSettingsWindow);
  }

  const tooltipLabel = document.getElementById("performanceModeTooltipLabel");
  const tooltipInfo = document.getElementById("performance-mode-info");

  if (tooltipLabel && tooltipInfo) {
    tooltipLabel.addEventListener("mouseover", () => {
      tooltipInfo.style.opacity = "1";
      tooltipInfo.style.zIndex = "2";
    });

    tooltipLabel.addEventListener("mouseout", () => {
      tooltipInfo.style.opacity = "0";
      tooltipInfo.style.zIndex = "-1";
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
  let quickSettingsButtonWrapper = document.createElement("div");
  quickSettingsButtonWrapper.id = "quickSettingsButtonWrapper";
  quickSettingsButtonWrapper.classList.add("smpp-button");
  quickSettingsButtonWrapper.classList.add("topnav__btn-wrapper");

  let quickSettingsButton = document.createElement("button");
  quickSettingsButton.id = "quickSettingsButton";
  quickSettingsButton.classList.add("topnav__btn");
  quickSettingsButton.innerText = "Settings";
  quickSettingsButton.addEventListener("click", toggleQuickSettings);
  quickSettingsButtonWrapper.appendChild(quickSettingsButton);
  return quickSettingsButtonWrapper;
}

class ThemeOptiony {
  element = document.createElement("div");
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  createImageContainer() {
    let imageContainer = document.createElement("div");
    imageContainer.classList.add("image-container");
    return imageContainer;
  }

  async imageIsOutdated() {}

  async updateImage(forceReload = false) {
    let data = (await browser.runtime.sendMessage({
      action: "getSettingsData",
    })) as Settings;
    if (this.name == data.appearance.theme || forceReload) {
      let imageURL = await getImageURL(this.name, async () => {
        return await getExtensionImage(
          "theme-backgrounds/" + this.name + ".jpg"
        );
      });

      this.element.style.setProperty(
        "--background-image-local",
        `url(${await imageURL.url})`
      );
    }
  }

  async render() {
    this.element.classList.add("lethal-compact-theme-option");

    let theme = await getTheme(this.name);
    Object.keys(theme.cssProperties).forEach((key) => {
      this.element.style.setProperty(
        `${key}-local`,
        theme.cssProperties[key] as string
      );
    });

    return this.element;
  }
}
type ThemeOptions = ThemeOptiony[];

class CompyThemeSelector {
  element = document.createElement("div");
  render() {
    let ThemeOptionyStalker = new ThemeOptiony("stalker" as string);
    console.log(ThemeOptionyStalker.name);
    return this.element;
  }
}
