//java script komt hier je weet wel
//ok - ldev
//oh ok, ik dacht in general.css - Jdev
let currentThemeVars;
let quickSettingsWindowIsHidden = true;

function discordpopup() {
  let discordelement = document.createElement("div");
  discordelement.innerHTML = discordSvg;
  document.body.appendChild(discordelement);
}
function changeLogoutText() {
  var randomNum = Math.floor(Math.random() * 50) + 1;
  if (randomNum === 1) {
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
    .addEventListener("keydown", function (event) {
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
  if (username) {
    const parts = username.trim().split(/\s+/);
    const firstInitial = parts[0][0].toUpperCase();
    const secondInitial = parts.length > 1 ? parts[1][0].toUpperCase() : "";
    return `https://userpicture20.smartschool.be/User/Userimage/hashimage/hash/initials_${
      firstInitial + secondInitial
    }/plain/1/res/32`;
  }
  return `https://userpicture20.smartschool.be/User/Userimage/hashimage/hash/initials_MU/plain/1/res/32`;
}
function switchCoursesButton() {
  topnav = document.querySelector(".topnav");
  if (topnav)
    topnav.insertBefore(
      document.querySelector("[data-links]"),
      document.querySelector("[data-courses]")
    );
}
function topNavIcons() {
  const notifsButton = document.querySelector(".js-btn-notifs");
  if (notifsButton) {
    const textSpan = notifsButton.querySelector("span");
    notifsButton.innerHTML = notfisSvg;
    notifsButton.appendChild(textSpan);
  }
  const startButton = document.querySelector(".js-btn-home");
  if (startButton) {
    startButton.innerHTML = homeiconSvg;
  }
  const messageButton = document.querySelector(".js-btn-messages");
  if (messageButton) {
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
  setEditMode(false); // Turn off widget edit mode
  let style = document.documentElement.style;
  const data = await browser.runtime.sendMessage({
    action: "getQuickSettingsData",
  });
  changeFont();
  userNameChanger(data.customName);
  decapitateಠ_ಠ();
  fixCoursesSearch();

  await setTheme(data.theme);
  currentTheme = data.theme;
  showNews(data.showNews);
  getThemeQueryString([
    "color-base00",
    "color-base01",
    "color-base02",
    "color-base03",
    "color-accent",
    "color-text",
  ]);

  if (document.querySelector("nav.topnav")) {
    topNavIcons();
    switchCoursesButton();
  }
  if (document.querySelector(".login-app__left")) updateLoginPanel();
  let defaultBackgroundBlur = data.backgroundBlurAmount * 2;
  if (data.backgroundBlurAmount == 0) {
    defaultBackgroundBlur += 2;
  }
  style.setProperty(
    "--profile-picture",
    "url(" + getPfpLink(data.customName || getOriginalName()) + ")"
  );
  style.setProperty(
    "--blur-value-large",
    "blur(" + defaultBackgroundBlur + "px)"
  );
  style.setProperty(
    "--blur-value-small",
    "blur(" + data.backgroundBlurAmount + "px)"
  );
  if (!liteMode) {
    applyWeatherEffects(
      data.weatherOverlaySelection,
      data.weatherOverlayAmount
    );
  }
  data.enablePerfomanceMode
    ? document.body.classList.remove("enableAnimations")
    : document.body.classList.add("enableAnimations");
  if (document.getElementById("background_image"))
    document.getElementById("background_image").style.display = "none";
  switch (data.backgroundSelection) {
    case 1:
      set_backgroundlink(data.backgroundLink);
      break;
    case 2:
      set_background();
      break;
  }
  if (data.enableSMPPLogo) {
    updateSMPPlogo();
  } else {
    resetSMlogo();
  }
}

async function storeQuickSettings() {
  const data = await browser.runtime.sendMessage({
    action: "getQuickSettingsData",
  });
  if (data.theme == "custom") {
    await storeCustomThemeData();
  }
  data.theme = document.getElementById("theme-selector").value;
  currentTheme = data.theme;
  let oldBackgroundLink = data.backgroundLink;
  data.backgroundLink = document.getElementById("background-link-input").value;

  if (data.backgroundLink) {
    document.getElementById("smpp-link-clear-button").classList.add("active");
  } else {
    document
      .getElementById("smpp-link-clear-button")
      .classList.remove("active");
  }

  data.backgroundBlurAmount = Number(
    document.getElementById("background-blur-amount-slider").value
  );
  data.enablePerfomanceMode = document.getElementById(
    "performance-mode-toggle"
  ).checked;
  data.enableSMPPLogo = document.getElementById("smpp-logo-toggle").checked;
  data.showNews = document.getElementById("news-toggle").checked;
  if (!liteMode) {
    data.weatherOverlaySelection = Number(
      document.getElementById("weather-overlay-selector").value
    );
    data.weatherOverlayAmount = Number(
      document.getElementById("weather-overlay-amount-slider").value
    );
  }
  document.getElementById(
    "performance-mode-info"
  ).innerHTML = `Toggle performance mode ${
    data.enablePerfomanceMode
      ? "<span class='green-underline'>Enabled</span>"
      : "<span class='red-underline'>Disabled</span>"
  }`;
  if (data.theme == "custom") {
    await createCustomThemeUI();
  } else {
    document.getElementById("colorpickers").innerHTML = ``;
  }
  let file = document.getElementById("background-file-input").files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result;
      browser.runtime.sendMessage({
        action: "saveBackgroundImage",
        data: imageData,
      });
    };
    reader.readAsDataURL(file);

    data.backgroundSelection = 2;
    data.backgroundLink = file.name;
    await browser.runtime.sendMessage({
      action: "setQuickSettingsData",
      data: data,
    });

    window.location.reload();
    return;
  } else {
    if (data.backgroundLink == "") {
      data.backgroundSelection = 0;
    } else if (data.backgroundLink != oldBackgroundLink) {
      data.backgroundSelection = 1;
    }
  }
  console.log("Storing this new data:", data);
  await browser.runtime.sendMessage({
    action: "setQuickSettingsData",
    data: data,
  });
  await apply();
}

function set_background() {
  let style = document.documentElement.style;
  browser.storage.local.get("backgroundImage", (result) => {
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
    if (result.backgroundImage) img.src = result.backgroundImage;
    if (!document.getElementById("background_image")) {
      document.body.appendChild(img);
    }
  });
}

function isAbsoluteUrl(url) {
  return /^(https?:\/\/|data:image\/)/i.test(url);
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
    action: "getQuickSettingsData",
  });
  console.log("Loaded this data:", data);
  document.getElementById("theme-selector").value = data.theme;
  document.getElementById("background-link-input").value = data.backgroundLink;

  if (data.backgroundLink) {
    document.getElementById("smpp-link-clear-button").classList.add("active");
  }
  if (data.backgroundSelection == 2) {
    document.getElementById("backgroundfilebutton").classList.add("active");
  } else {
    document.getElementById("backgroundfilebutton").classList.remove("active");
  }
  document.getElementById("background-blur-amount-slider").value =
    data.backgroundBlurAmount;
  document.getElementById("performance-mode-toggle").checked =
    data.enablePerfomanceMode;
  document.getElementById("smpp-logo-toggle").checked = data.enableSMPPLogo;
  document.getElementById("news-toggle").checked = data.showNews;
  document.getElementById(
    "performance-mode-info"
  ).innerHTML = `Toggle performance mode ${
    data.enablePerfomanceMode
      ? "<span class='green-underline'>Enabled</span>"
      : "<span class='red-underline'>Disabled</span>"
  }`;
  if (!liteMode) {
    document.getElementById("weather-overlay-selector").value =
      data.weatherOverlaySelection;
    document.getElementById("weather-overlay-amount-slider").value =
      data.weatherOverlayAmount;
  }
  if (data.theme == "custom") {
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
    const data = await browser.runtime.sendMessage({
      action: "getQuickSettingsData",
    });
    data.backgroundLink = "";
    data.backgroundSelection = 0;
    await browser.runtime.sendMessage({
      action: "setQuickSettingsData",
      data: data,
    });
    await loadQuickSettings();
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

  const options = [
    { value: "default", text: "Default Deluxe" },
    { value: "white", text: "Off White" },
    { value: "custom", text: "Custom Theme" },
    { value: "ldev", text: "Dark Sands" },
    { value: "birb", text: "Midnight Sapphire" },
    { value: "stalker", text: "Ruby Eclipse" },
    { value: "chocolate", text: "Dark Mocha" },
    { value: "mountain", text: "Storm Peaks" },
    { value: "winter", text: "Arctic Azure" },
    { value: "galaxy", text: "Fluorescent Galaxy" },
    { value: "sand", text: "Sahara Oasis" },
    { value: "purple", text: "Neon Violet" },
    { value: "fall", text: "Autumn Gloom" },
    { value: "matcha", text: "Matcha Green" },
    { value: "pink", text: "Cherry Haze" },
  ];

  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.textContent = option.text;
    themeSelector.appendChild(optionElement);
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

function createTopButtons(onHomePage) {
  let topNav = document.querySelector("nav.topnav");
  if (topNav == null) {
    return;
  }

  let searchBtn = topNav.querySelector(
    ".topnav__btn--icon--search"
  ).parentElement;
  topNav.insertBefore(createQuickSettingsButton(), searchBtn);

  let pushRight = topNav.childNodes[2];

  if (!liteMode) {
    topNav.insertBefore(createGCButton(), pushRight);
  }

  if (onHomePage) {
    topNav.insertBefore(createWidgetEditModeButton(), pushRight);
  }
}

async function main() {
  if (document.body.classList.contains("smpp")) {
    console.error("smpp is waarschijnlijk 2 keer geladen");
    alert("smpp is waarschijnlijk 2 keer geladen");
  }
  document.body.classList.add("smpp"); // For modding

  if (window.localStorage.getItem("settingsdata")) {
    await migrateSettings();
  }

  apply();
  createWidgetSystem();

  let logoutButton = document.querySelector(".js-btn-logout");
  if (logoutButton) logoutButton.innerHTML = changeLogoutText();

  let onHomePage = document.getElementById("container") !== null;
  createTopButtons(onHomePage);

  document.querySelector('[data-go=""]')?.remove();
  let searchBtn = document.querySelector(".topnav__btn--icon--search");
  if (searchBtn) searchBtn.parentElement.style = "display:none";
  let notifsLabel = document.getElementById("notifsToggleLabel");
  if (notifsLabel) notifsLabel.innerText = "Toon pop-ups"; // Simplify text. (smartschool by default has a very long explanation that doesn't fit on screen)
}

main();
