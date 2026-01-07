// @ts-nocheck
import { themes, settingsTemplate, apply, browser } from "../main.js";
import { ImageSelector } from "../modules/images.js";
import { performanceModeSvg, settingsIconSvg } from "../../fixes-utils/svgs.js";
import { openSettingsWindow, settingsWindow } from "./main-settings.js";

let quickSettingsWindowIsHidden = true;

var quickSettingsBackgroundImageSelector;

async function storeQuickSettings() {
  const oldData = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });

  const data = structuredClone(oldData);
  if (
    document.getElementById("theme-selector").value != data.appearance.theme &&
    document.getElementById("theme-selector").value != ""
  ) {
    data.appearance.theme = document.getElementById("theme-selector").value;
  }

  data.appearance.background.blur = Number(
    document.getElementById("background-blur-amount-slider").value
  );

  data.other.performanceMode = document.getElementById(
    "performance-mode-toggle"
  ).checked;

  document.getElementById(
    "performance-mode-info"
  ).innerHTML = `Toggle performance mode ${
    data.other.performanceMode
      ? "<span class='green-underline'>Enabled</span>"
      : "<span class='red-underline'>Disabled</span>"
  }`;

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

  quickSettingsBackgroundImageSelector.loadImageData();

  document.getElementById("background-blur-amount-slider").value =
    data.appearance.background.blur;
  document.getElementById("performance-mode-toggle").checked =
    data.other.performanceMode;

  document.getElementById(
    "performance-mode-info"
  ).innerHTML = `Toggle performance mode ${
    data.other.performanceMode
      ? "<span class='green-underline'>Enabled</span>"
      : "<span class='red-underline'>Disabled</span>"
  }`;
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

  win = document.getElementById("quickSettings");

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

function createQuickSettingsHTML(parent) {
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

  const themeContainer = document.createElement("div");
  themeContainer.className = "theme-container";

  const themeHeading = document.createElement("h3");
  themeHeading.className = "quick-settings-title";
  themeHeading.textContent = "Theme:";

  const themeSelector = document.createElement("select");
  themeSelector.id = "theme-selector";

  settingsTemplate.appearance.theme.forEach((key) => {
    const optionElement = document.createElement("option");
    optionElement.value = key;

    optionElement.textContent = themes[key]["display-name"];
    themeSelector.appendChild(optionElement);
  });

  const colorPickers = document.createElement("div");
  colorPickers.id = "colorpickers";

  themeContainer.appendChild(themeHeading);
  themeContainer.appendChild(themeSelector);
  themeContainer.appendChild(colorPickers);

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
  parent.appendChild(themeContainer);
  parent.appendChild(wallpaperTopContainer);
  parent.appendChild(performanceModeInfo);
  parent.appendChild(extraSettingsButton);
  return parent;
}

export function createQuickSettings() {
  let quickSettingsWindow = document.createElement("div");
  quickSettingsWindow.id = "quickSettings";
  quickSettingsWindow.addEventListener("change", storeQuickSettings);
  quickSettingsBackgroundImageSelector = new ImageSelector("backgroundImage");
  quickSettingsBackgroundImageSelector.onStore = () => {
    storeQuickSettings();
  };
  quickSettingsBackgroundImageSelector.loadImageData();
  quickSettingsWindow = createQuickSettingsHTML(quickSettingsWindow);

  document
    .getElementById("quickSettingsButton")
    .insertAdjacentElement("afterend", quickSettingsWindow);

  document
    .getElementById("performanceModeTooltipLabel")
    .addEventListener("mouseover", () => {
      document.getElementById("performance-mode-info").style.opacity = "1";
      document.getElementById("performance-mode-info").style.zIndex = "2";
    });
  document
    .getElementById("performanceModeTooltipLabel")
    .addEventListener("mouseout", () => {
      document.getElementById("performance-mode-info").style.opacity = "0";
      document.getElementById("performance-mode-info").style.zIndex = "-1";
    });

  document.addEventListener("click", (e) => {
    if (quickSettingsWindowIsHidden) return;
    if (e.target.id === "extraSettingsButton") {
      closeQuickSettings();
    }
    if (
      e.target.id === "quickSettings" ||
      quickSettingsWindow.contains(e.target) ||
      e.target.id === "quickSettingsButton"
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
