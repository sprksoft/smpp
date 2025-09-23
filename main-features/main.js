//java script komt hier je weet wel
//ok - ldev
//oh ok, ik dacht in general.css - Jdev
let quickSettingsWindowIsHidden = true;

function discordpopup() {
  let discordelement = document.createElement("div");
  discordelement.innerHTML = discordSvg;
  document.body.appendChild(discordelement);
}
function changeLogoutText() {
  if (randomChance(1 / 50)) {
    return "Good Bye! →";
  }
  return "Log out →";
}

function openFileSelector() {
  document.getElementById("background-file-input").click();
}

function changeFont() {
  let fontLinks = document.createElement("div");
  fontLinks.innerHTML = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">`;
  document.getElementsByTagName("head")[0].appendChild(fontLinks);
}

function fixCoursesSearch() {
  document
    .getElementById("courseSearch")
    ?.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();

        setTimeout(() => {
          const firstCourse = document.querySelector(
            ".course-list.js-courses-list li a"
          );
          if (firstCourse) {
            firstCourse.click();
          }
        }, 100);
      }
    });
}

function decapitateಠ_ಠ() {
  let style_el = document.createElement("style");
  style_el.innerHTML = `
    .studentPicture, .rounded_profile_photo, .square_photo_64 {
      display: none;
    }
  `;
  document.head.appendChild(style_el);
}
function getPfpLink(username) {
  let firstInitial;
  let secondInitial;
  if (username) {
    const parts = username.trim().split(/\s+/);
    firstInitial = parts[0][0].toUpperCase();
    secondInitial = parts.length > 1 ? parts[1][0].toUpperCase() : "";
  } else {
    // Mr. Unknown
    firstInitial = "M";
    secondInitial = "U";
  }
  return `https://userpicture20.smartschool.be/User/Userimage/hashimage/hash/initials_${
    firstInitial + secondInitial
  }/plain/1/res/128`;
}
function switchCoursesButton() {
  topnav = document.querySelector(".topnav");
  if (topnav)
    topnav.insertBefore(
      document.querySelector("[data-links]"),
      document.querySelector("[data-courses]")
    );
}
function topNavIcons(data) {
  const notifsButton = document.querySelector(".js-btn-notifs");
  if (notifsButton && data.enableNotificationIcon) {
    const textSpan = notifsButton.querySelector("span");
    notifsButton.innerHTML = notfisSvg;
    notifsButton.appendChild(textSpan);
  }
  const startButton = document.querySelector(".js-btn-home");
  if (startButton && data.enableHomeIcon) {
    startButton.innerHTML = homeiconSvg;
  }
  const messageButton = document.querySelector(".js-btn-messages");
  if (messageButton && data.enableMailIcon) {
    const textSpan = messageButton.querySelector("span");
    messageButton.innerHTML = messageSvg;
    messageButton.appendChild(textSpan);
  }
}
function updateBackgroundBlur() {
  style.setProperty("--blur-value-large", "blur(" + bigblurvalue + "px)");
  style.setProperty("--blur-value-small", "blur(" + blurvalue + "px)");
}
function updateSMPPlogo() {
  let iconElement = document.querySelector('link[rel="icon"]');
  if (iconElement) {
    iconElement.href = liteMode
      ? "https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/smpp_lite_logo128.png"
      : "https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/icon128.png";
  }
}
function resetSMlogo() {
  let iconElement = document.querySelector('link[rel="icon"]');
  if (iconElement)
    iconElement.href =
      "https://static4.smart-school.net/smsc/svg/favicon/favicon.svg";
}
async function apply() {
  await reloadDMenuConfig(); // reload the dmenu config. (er is een object voor async raarheid te vermijden en dat wordt herladen door deze functie)
  setEditMode(false); // Turn off widget edit mode
  let style = document.documentElement.style;
  const data = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });

  console.log("Settings data: \n", data);

  themes = await browser.runtime.sendMessage({
    action: "getAllThemes",
  });

  settingsOptions = await browser.runtime.sendMessage({
    action: "getSettingsOptions",
  });

  changeFont();
  userNameChanger(data.profile.customUserName);
  if (!data.profile.enableOriginalPFP) decapitateಠ_ಠ();
  fixCoursesSearch();

  await setTheme(data.appearance.theme);

  showNews(data.features.showNews);

  getThemeQueryString([
    "color-base00",
    "color-base01",
    "color-base02",
    "color-base03",
    "color-accent",
    "color-text",
  ]);

  if (document.querySelector("nav.topnav")) {
    topNavIcons(data.topNav.icons);
    if (data.topNav.switchCoursesAndLinks) switchCoursesButton();
  }
  updateTopButtons(data.topNav);

  if (document.querySelector(".login-app__left")) updateLoginPanel();

  let defaultBackgroundBlur =
    data.appearance.background.backgroundBlurAmount * 2;
  if (data.appearance.background.backgroundBlurAmount == 0) {
    defaultBackgroundBlur += 2;
  }

  style.setProperty(
    "--profile-picture",
    "url(" + getPfpLink(data.profile.customUserName || getOriginalName()) + ")"
  );
  style.setProperty("--blur-value-large", `blur(${defaultBackgroundBlur}px)`);
  style.setProperty(
    "--blur-value-small",
    `blur(${data.appearance.background.backgroundBlurAmount}px)`
  );

  if (!liteMode) {
    applyWeatherEffects(
      data.appearance.weatherOverlay.weatherOverlaySelection,
      data.appearance.weatherOverlay.weatherOverlayAmount
    );
  }

  data.other.enablePerfomanceMode
    ? document.body.classList.remove("enableAnimations")
    : document.body.classList.add("enableAnimations");

  if (document.getElementById("background_image")) {
    document.getElementById("background_image").style.display = "none";
  }

  setBackground(data.appearance);

  if (data.appearance.enableSMPPLogo) {
    updateSMPPlogo();
  } else {
    resetSMlogo();
  }

}

async function storeQuickSettings() {
  const oldData = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });
  // Start from old settings
  const data = structuredClone(oldData);
  data.appearance.theme = document.getElementById("theme-selector").value;
  data.appearance.enableSMPPLogo =
    document.getElementById("smpp-logo-toggle").checked;
  data.appearance.background.backgroundLink = document.getElementById(
    "background-link-input"
  ).value;

  data.appearance.background.backgroundBlurAmount = Number(
    document.getElementById("background-blur-amount-slider").value
  );
  data.appearance.weatherOverlay.weatherOverlaySelection = !liteMode
    ? Number(document.getElementById("weather-overlay-selector").value)
    : oldData.appearance.weatherOverlay.weatherOverlaySelection;
  data.appearance.weatherOverlay.weatherOverlayAmount = !liteMode
    ? Number(document.getElementById("weather-overlay-amount-slider").value)
    : oldData.appearance.weatherOverlay.weatherOverlayAmount;

  data.features.showNews = document.getElementById("news-toggle").checked;
  data.other.enablePerfomanceMode = document.getElementById(
    "performance-mode-toggle"
  ).checked;

  document.getElementById(
    "performance-mode-info"
  ).innerHTML = `Toggle performance mode ${
    data.other.enablePerfomanceMode
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

  // Handle background file input
  let file = document.getElementById("background-file-input").files[0];
  if (file) {
    const reader = new FileReader();
    const imageData = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    await browser.runtime.sendMessage({
      action: "saveBackgroundImage",
      data: imageData,
    });
    data.appearance.background.backgroundSelection = 2;
    data.appearance.background.backgroundLink = file.name;
  } else {
    if (data.appearance.background.backgroundLink == "") {
      data.appearance.background.backgroundSelection = 0;
    } else if (
      data.appearance.background.backgroundLink !=
      oldData.appearance.background.backgroundLink
    ) {
      data.appearance.background.backgroundSelection = 1;
    }
  }

  console.log("Storing this new data:", data);
  await browser.runtime.sendMessage({ action: "setSettingsData", data });
  await loadQuickSettings();
  await apply();
}

function set_backgroundOLD() {
  let style = document.documentElement.style;
  browser.runtime
    .sendMessage({ action: "getBackgroundImage" })
    .then((result) => {
      style.setProperty("--loginpage-image", `none`);
      style.setProperty("--background-color", `transparent`);
      let img =
        document.getElementById("background_image") ||
        document.createElement("img");
      img.id = "background_image";
      img.style.backgroundColor = "var(--color-base00)";
      img.style.position = "absolute";
      img.style.top = "0";
      img.style.left = "0";
      img.style.width = "101%";
      img.style.height = "101%";
      img.style.objectFit = "cover";
      img.style.zIndex = -1;
      img.style.display = "block";
      if (result && result.backgroundImage) img.src = result.backgroundImage;
      if (!document.getElementById("background_image")) {
        document.body.appendChild(img);
      }
    });
}

async function setBackground(data) {
  let style = document.documentElement.style;
  function displayBackgroundImage(image) {
    style.setProperty("--background-color", `transparent`);
    let img =
      document.getElementById("background_image") ||
      document.createElement("img");
    img.id = "background_image";
    img.style.backgroundColor = "var(--color-base00)";
    img.style.position = "absolute";
    img.style.top = "0";
    img.style.left = "0";
    img.style.width = "101%";
    img.style.height = "101%";
    img.style.objectFit = "cover";
    img.style.zIndex = -1;
    img.style.display = "block";
    if (image) img.src = image;
    if (!document.getElementById("background_image")) {
      document.body.appendChild(img);
    }
  }
  switch (data.background.backgroundSelection) {
    case 0: // Default
      displayBackgroundImage(
        getImage("/theme-backgrounds/" + data.theme + ".jpg")
      );
      break;
    case 1: // Link
      displayBackgroundImage(data.background.backgroundLink);
      break;
    case 2: // File
      let thing = await browser.runtime.sendMessage({
        action: "getBackgroundImage",
      });
      displayBackgroundImage(thing.backgroundImage);
      break;
  }
}

function set_backgroundlink(background) {
  let style = document.documentElement.style;
  if (!background) {
    style.setProperty("--loginpage-image", "");
    return;
  }
  let img = new Image();
  if (isAbsoluteUrl(background)) {
    img.src = background;
    img.onload = () => {
      style.setProperty("--loginpage-image", `url(${background})`);
    };
    img.onerror = () => {
      console.error("Image failed to load from link:", background);
    };
  }
}

async function storeCustomThemeData() {
  await browser.runtime.sendMessage({
    action: "setCustomThemeData",
    data: {
      color_base00: document.getElementById("colorPicker1").value,
      color_base01: document.getElementById("colorPicker2").value,
      color_base02: document.getElementById("colorPicker3").value,
      color_base03: document.getElementById("colorPicker4").value,
      color_accent: document.getElementById("colorPicker5").value,
      color_text: document.getElementById("colorPicker6").value,
    },
  });
}

async function loadCustomThemeData() {
  const themeData = await browser.runtime.sendMessage({
    action: "getCustomThemeData",
  });
  customTheme = themeData;
  document.getElementById("colorPicker1").value = themeData.color_base00;
  document.getElementById("colorPicker2").value = themeData.color_base01;
  document.getElementById("colorPicker3").value = themeData.color_base02;
  document.getElementById("colorPicker4").value = themeData.color_base03;
  document.getElementById("colorPicker5").value = themeData.color_accent;
  document.getElementById("colorPicker6").value = themeData.color_text;
}

async function createCustomThemeUI() {
  const colorpickers = document.getElementById("colorpickers");
  colorpickers.innerHTML = colorpickersHTML;
  await loadCustomThemeData();
}

async function loadQuickSettings() {
  const data = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });
  console.log("Loaded this data:", data);
  document.getElementById("theme-selector").value = data.appearance.theme;
  document.getElementById("background-link-input").value =
    data.appearance.background.backgroundLink;

  if (data.appearance.background.backgroundLink) {
    document.getElementById("smpp-link-clear-button").classList.add("active");
  }
  if (data.appearance.background.backgroundSelection == 2) {
    document.getElementById("backgroundfilebutton").classList.add("active");
  } else {
    document.getElementById("backgroundfilebutton").classList.remove("active");
  }

  document.getElementById("background-file-input").value = ""; // reset the files
  document.getElementById("background-blur-amount-slider").value =
    data.appearance.background.backgroundBlurAmount;
  document.getElementById("performance-mode-toggle").checked =
    data.other.enablePerfomanceMode;
  document.getElementById("smpp-logo-toggle").checked =
    data.appearance.enableSMPPLogo;
  document.getElementById("news-toggle").checked = data.features.showNews;
  document.getElementById(
    "performance-mode-info"
  ).innerHTML = `Toggle performance mode ${
    data.other.enablePerfomanceMode
      ? "<span class='green-underline'>Enabled</span>"
      : "<span class='red-underline'>Disabled</span>"
  }`;
  if (!liteMode) {
    document.getElementById("weather-overlay-selector").value =
      data.appearance.weatherOverlay.weatherOverlaySelection;
    document.getElementById("weather-overlay-amount-slider").value =
      data.appearance.weatherOverlay.weatherOverlayAmount;
  }
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

function createSwitch(id, title) {
  const switchContainer = document.createElement("div");
  const switchHeading = document.createElement("h3");
  switchHeading.className = "quick-settings-title";
  switchHeading.textContent = title;

  const switchLabel = document.createElement("label");
  switchLabel.className = "switch";

  const switchInput = document.createElement("input");
  switchInput.className = "popupinput";
  switchInput.type = "checkbox";
  switchInput.id = id;

  const switchSlider = document.createElement("span");
  switchSlider.className = "slider round";

  switchLabel.appendChild(switchInput);
  switchLabel.appendChild(switchSlider);
  if (title != null) {
    switchContainer.appendChild(switchHeading);
  }
  switchContainer.appendChild(switchLabel);

  return switchContainer;
}

function createBgSelector() {
  const backgroundSelector = document.createElement("div");
  backgroundSelector.className = "smpp-background-selector";

  const clearButton = document.createElement("button");
  clearButton.id = "smpp-link-clear-button";
  clearButton.classList.add("smpp-link-clear-button");
  clearButton.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2">
          <g xmlns="http://www.w3.org/2000/svg">
          <path d="M7 7.00006L17 17.0001M7 17.0001L17 7.00006" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
        </svg>`;

  clearButton.addEventListener("click", async function (event) {
    event.target.closest(".smpp-link-clear-button").classList.remove("active");
    document.getElementById("background-link-input").value = "";
    await storeQuickSettings();
  });

  const linkInput = document.createElement("input");
  linkInput.className = "smpp-background-link";
  linkInput.id = "background-link-input";
  linkInput.spellcheck = false;
  linkInput.type = "text";

  const fileBtn = document.createElement("button");
  fileBtn.className = "smpp-background-file";
  fileBtn.id = "backgroundfilebutton";
  fileBtn.innerHTML = fileInputIconSvg;

  const backgroundFileInput = document.createElement("input");
  backgroundFileInput.id = "background-file-input";
  backgroundFileInput.style.display = "none";
  backgroundFileInput.type = "file";
  backgroundFileInput.accept = ".png, .jpg, .jpeg";

  backgroundSelector.appendChild(linkInput);
  backgroundSelector.appendChild(fileBtn);
  backgroundSelector.appendChild(clearButton);
  backgroundSelector.appendChild(backgroundFileInput);

  return backgroundSelector;
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

  const switchesContainer = document.createElement("div");
  switchesContainer.className = "switches-container";

  switchesContainer.appendChild(createSwitch("news-toggle", "News:"));
  switchesContainer.appendChild(createSwitch("smpp-logo-toggle", "Logo:"));

  const wallpaperTopContainer = document.createElement("div");

  const wallpaperHeading = document.createElement("h3");
  wallpaperHeading.className = "quick-settings-title";
  wallpaperHeading.textContent = "Wallpaper:";

  const wallpaperContainer = document.createElement("div");
  wallpaperContainer.className = "wallpaper-quick-settings-container";

  const blurSliderContainer = document.createElement("div");
  blurSliderContainer.className = "blur-slider-container";

  const backgroundBlurAmountSlider = document.createElement("input");
  backgroundBlurAmountSlider.type = "range";
  backgroundBlurAmountSlider.min = "0";
  backgroundBlurAmountSlider.max = "10";
  backgroundBlurAmountSlider.value = "0";
  backgroundBlurAmountSlider.className = "main-slider";
  backgroundBlurAmountSlider.id = "background-blur-amount-slider";

  const backgroundBlurLabel = document.createElement("span");
  backgroundBlurLabel.className = "color-label";
  backgroundBlurLabel.id = "blurPlaats";
  backgroundBlurLabel.textContent = "blur";

  blurSliderContainer.appendChild(backgroundBlurAmountSlider);
  blurSliderContainer.appendChild(backgroundBlurLabel);

  wallpaperContainer.appendChild(createBgSelector());
  wallpaperContainer.appendChild(blurSliderContainer);

  wallpaperTopContainer.appendChild(wallpaperHeading);
  wallpaperTopContainer.appendChild(wallpaperContainer);

  const weatherOverlayTopContainer = document.createElement("div");

  const weatherOverlayHeading = document.createElement("h3");
  weatherOverlayHeading.className = "quick-settings-title";
  weatherOverlayHeading.textContent = "Weather overlay:";

  const weatherOverlayContainer = document.createElement("div");
  weatherOverlayContainer.className = "weather-overlay-container";

  const weatherVerticalText = document.createElement("div");
  weatherVerticalText.className = "vertical-selector-labels";

  const snowText = document.createElement("span");
  snowText.textContent = "Snow";

  const realtimeText = document.createElement("span");
  realtimeText.className = "accent-text";
  realtimeText.textContent = "Realtime";

  const rainText = document.createElement("span");
  rainText.textContent = "Rain";

  weatherVerticalText.appendChild(snowText);
  weatherVerticalText.appendChild(realtimeText);
  weatherVerticalText.appendChild(rainText);

  const weatherSelectorContainer = document.createElement("div");
  weatherSelectorContainer.classList.add("weather-overlay-selector-container");

  const weatherSelector = document.createElement("input");
  weatherSelector.type = "range";
  weatherSelector.min = "0";
  weatherSelector.max = "2";
  weatherSelector.value = "0";
  weatherSelector.className = "main-slider";
  weatherSelector.id = "weather-overlay-selector";

  weatherSelectorContainer.appendChild(weatherSelector);

  const weatherSliderContainer = document.createElement("div");
  weatherSliderContainer.classList.add("weather-amount-slider-container");

  const weatherAmountSliderTitle = document.createElement("h4");
  weatherAmountSliderTitle.classList.add("weather-amount-slider-title");
  weatherAmountSliderTitle.textContent = "Amount:";

  const weatherSlider = document.createElement("input");
  weatherSlider.type = "range";
  weatherSlider.min = "0";
  weatherSlider.max = "500";
  weatherSlider.value = "0";
  weatherSlider.className = "main-slider";
  weatherSlider.id = "weather-overlay-amount-slider";

  weatherSliderContainer.appendChild(weatherAmountSliderTitle);
  weatherSliderContainer.appendChild(weatherSlider);

  weatherOverlayContainer.appendChild(weatherVerticalText);
  weatherOverlayContainer.appendChild(weatherSelectorContainer);
  weatherOverlayContainer.appendChild(weatherSliderContainer);

  weatherOverlayTopContainer.appendChild(weatherOverlayHeading);
  weatherOverlayTopContainer.appendChild(weatherOverlayContainer);

  parent.appendChild(performanceModeTooltipLabel);
  parent.appendChild(performanceModeInfo);

  parent.appendChild(themeContainer);

  parent.appendChild(wallpaperTopContainer);

  parent.appendChild(switchesContainer);

  if (!liteMode) {
    parent.appendChild(weatherOverlayTopContainer);
  }
  return parent;
}

function createQuickSettings() {
  let quickSettingsWindow = document.createElement("div");
  quickSettingsWindow.id = "quickSettings";
  quickSettingsWindow.addEventListener("change", storeQuickSettings);
  quickSettingsWindow = createQuickSettingsHTML(quickSettingsWindow);

  quickSettingsWindow.style.left = -237 / 3 + "px";
  document
    .getElementById("quickSettingsButton")
    .insertAdjacentElement("afterend", quickSettingsWindow);

  document
    .getElementById("backgroundfilebutton")
    .addEventListener("click", openFileSelector);

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

function createTopButtons() {
  const onHomePage = document.getElementById("container") !== null;
  let topNav = document.querySelector("nav.topnav");
  if (topNav == null) {
    return;
  }

  let logoutButton = document.querySelector(".js-btn-logout");
  if (logoutButton) {
    logoutButton.innerHTML = changeLogoutText();
  }

  let searchBtn = document.querySelector(".topnav__btn--icon--search");

  topNav.insertBefore(createQuickSettingsButton(), searchBtn.parentElement);

  let pushRight = topNav.childNodes[2];

  if (!liteMode) {
    topNav.insertBefore(createGCButton(), pushRight);
  }
  let searchButton = document.querySelector(".topnav__btn--icon--search");
  if (searchButton) {
    searchButton.innerHTML = searchButtonSvg;
  }
  if (onHomePage) {
    topNav.insertBefore(createWidgetEditModeButton(), pushRight);
  }

  topNav.insertBefore(createQuickMenuButton(), pushRight);

  topNav.insertBefore(createSettingsButton(), pushRight); //temp
}

function updateTopButtons(data) {
  let GOButton = document.querySelector(`[data-go=""]`);
  if (GOButton) {
    data.enableGOButton
      ? (GOButton.style = "display:flex")
      : (GOButton.style = "display:none");
  }

  let searchButton = document.querySelector(".topnav__btn--icon--search");
  if (searchButton) {
    data.enableSearchButton
      ? (searchButton.parentElement.style = "display:flex")
      : (searchButton.parentElement.style = "display:none");
  }

  let GCButton = document.getElementById("global_chat_button");
  if (GCButton) {
    data.enableGCButton
      ? (GCButton.style = "display:flex !important")
      : (GCButton.style = "display:none !important");
  }

  let quickButton = document.getElementById("quick-menu-button");
  if (quickButton) {
    data.enableQuickMenuButton
      ? (quickButton.style = "display:flex !important")
      : (quickButton.style = "display:none !important");
  }
}

async function main() {
  if (document.body.classList.contains("smpp")) {
    console.error("SMPP is waarschijnlijk 2 keer geladen");
    alert("SMPP is 2x geladen waarschijnlijk");
  }
  document.body.classList.add("smpp"); // For modding
  if (window.localStorage.getItem("settingsdata")) {
    await migrateSettings();
  }
  const settingsData = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });
  if (settingsData.theme != null) {
    await migrateSettingsV2();
  }
  createTopButtons();

  await apply();
  createWidgetSystem();

  let notifsLabel = document.getElementById("notifsToggleLabel");
  if (notifsLabel) notifsLabel.innerText = "Toon pop-ups"; // Simplify text. (smartschool by default has a very long explanation that doesn't fit on screen)
}

main();
