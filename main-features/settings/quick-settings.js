let quickSettingsWindowIsHidden = true;

async function storeQuickSettings() {
  const oldData = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });
  // Start from old settings
  const data = structuredClone(oldData);

  data.appearance.theme = document.getElementById("theme-selector").value;

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

  if (data.appearance.theme == "custom") {
    if (oldData.appearance.theme == "custom") {
      await storeCustomThemeData();
    }
    await createCustomThemeUI();
  } else {
    document.getElementById("colorpickers").innerHTML = ``;
  }

  await browser.runtime.sendMessage({ action: "setSettingsData", data });
  await loadQuickSettings();
  if (settingsWindow) {
    await settingsWindow.loadPage();
  }
  await apply();
}

async function loadQuickSettings() {
  const data = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });
  console.log("Loaded this data:", data);
  document.getElementById("theme-selector").value = data.appearance.theme;

  quickSettingsBackgroundImageSelector.loadImage();

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

  if (data.appearance.theme == "custom") {
    await createCustomThemeUI();
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
  if (!win) {
    createQuickSettings();
    win = document.getElementById("quickSettings");
  }
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

  settingsOptions.appearance.theme.forEach((key) => {
    if (!themes[key]["display-name"].startsWith("__")) {
      // Don't include hidden themes
      const optionElement = document.createElement("option");
      optionElement.value = key;

      optionElement.textContent = themes[key]["display-name"];
      themeSelector.appendChild(optionElement);
    }
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

  parent.appendChild(performanceModeTooltipLabel);
  parent.appendChild(themeContainer);
  parent.appendChild(wallpaperTopContainer);
  parent.appendChild(performanceModeInfo);
  return parent;
}

function createQuickSettings() {
  let quickSettingsWindow = document.createElement("div");
  quickSettingsWindow.id = "quickSettings";
  quickSettingsWindow.addEventListener("change", storeQuickSettings);
  quickSettingsBackgroundImageSelector = new ImageSelector("backgroundImage");
  quickSettingsBackgroundImageSelector.onStore = () => {
    storeQuickSettings();
  };
  quickSettingsBackgroundImageSelector.loadImage();
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
    if (
      e.target.id === "quickSettings" ||
      quickSettingsWindow.contains(e.target) ||
      e.target.id === "quickSettingsButton"
    ) {
      return;
    }
    closeQuickSettings();
  });
}

function createQuickSettingsButton() {
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
