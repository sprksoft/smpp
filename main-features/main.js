//java script komt hier je weet wel
//ok - ldev
//oh ok, ik dacht in general.css - Jdev
let quickSettingsWindowIsHidden = true;

function updateDiscordPopup(discordButtonEnabled) {
  if (discordButtonEnabled) {
    let discordButtonContainer =
      document.getElementById("discord-link-container") ||
      document.createElement("div");
    discordButtonContainer.id = "discord-link-container";
    discordButtonContainer.innerHTML = discordSvg;
    document.body.appendChild(discordButtonContainer);
  } else {
    document.getElementById("discord-link-container").remove();
  }
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

function updateTopNavIcons(data) {
  const notifsButton = document.querySelector(".js-btn-notifs");
  if (notifsButton && data.notifications) {
    const textSpan = notifsButton.querySelector("span");
    notifsButton.innerHTML = notfisSvg;
    notifsButton.appendChild(textSpan);
  } else if (notifsButton && !data.notifications) {
    const textSpan = notifsButton.querySelector("span");
    notifsButton.innerHTML = "Meldingen";
    notifsButton.appendChild(textSpan);
  }
  const startButton = document.querySelector(".js-btn-home");
  if (startButton && data.home) {
    startButton.innerHTML = homeiconSvg;
  } else if (startButton && !data.home) {
    startButton.innerHTML = "Start";
  }
  const messageButton = document.querySelector(".js-btn-messages");
  if (messageButton && data.mail) {
    const textSpan = messageButton.querySelector("span");
    messageButton.innerHTML = messageSvg;
    messageButton.appendChild(textSpan);
  } else if (messageButton && !data.mail) {
    const textSpan = messageButton.querySelector("span");
    messageButton.innerHTML = "Berichten";
    messageButton.appendChild(textSpan);
  }

  const settingButton = document.getElementById("quickSettingsButton");
  if (settingButton && data.settings) {
    settingButton.innerHTML = settingsIconSvg;
  } else if (settingButton && !data.settings) {
    settingButton.innerHTML = "Settings";
  }
}

function updateBackgroundBlur() {
  style.setProperty("--blur-value-large", "blur(" + bigblurvalue + "px)");
  style.setProperty("--blur-value-small", "blur(" + blurvalue + "px)");
}

function updateTabLogo(logo) {
  let iconElement = document.querySelector('link[rel="icon"]');
  if (!iconElement) return;
  switch (logo) {
    case "sm":
      iconElement.href =
        "https://static4.smart-school.net/smsc/svg/favicon/favicon.svg";
      break;
    case "smpp":
      iconElement.href = liteMode
        ? "https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/smpp_lite_logo128.png"
        : "https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/icon128.png";
      break;
    default:
      break;
  }
}

function applyTopNav(data) {
  let topNav = document.querySelector(".topnav");
  if (!topNav) return;
  updateTopNavIcons(data.icons);
  updateTopButtons(data.buttons);
  if (data.switchCoursesAndLinks) {
    topNav.insertBefore(
      document.querySelector("[data-links]"),
      document.querySelector("[data-courses]")
    );
  } else {
    topNav.insertBefore(
      document.querySelector("[data-courses]"),
      document.querySelector("[data-links]")
    );
  }
}

function fixMessageBox() {
  if (document.getElementById("tinymce")) {
    document.getElementById("background_image")?.remove();
  }
}

async function createStaticGlobals() {
  themes = await browser.runtime.sendMessage({
    action: "getAllThemes",
  });

  settingsOptions = await browser.runtime.sendMessage({
    action: "getSettingsOptions",
  });
  originalUsername =
    document.querySelector(".js-btn-profile .hlp-vert-box span")?.innerText ||
    "Mr Unknown";
  isGOSchool = document.body.classList.contains("go");
  console.log("go school:", isGOSchool);
}

async function applyAppearance(appearance) {
  let style = document.documentElement.style;

  await setTheme(appearance.theme);
  setBackground(appearance);
  updateNews(appearance.news);
  updateTabLogo(appearance.tabLogo);

  let defaultBackgroundBlur = appearance.background.blur * 2;
  if (appearance.background.blur == 0) defaultBackgroundBlur += 2;
  style.setProperty("--blur-value-large", `blur(${defaultBackgroundBlur}px)`);
  style.setProperty(
    "--blur-value-small",
    `blur(${appearance.background.blur}px)`
  );
}

function applyWidgets(widgets) {
  const monochromeDelijnStyleId = "monochrome-delijn-style";
  const monochromeDelijnStyle = document.getElementById(
    monochromeDelijnStyleId
  );

  if (widgets.delijn.monochrome) {
    if (!monochromeDelijnStyle) {
      const style = document.createElement("style");
      style.id = monochromeDelijnStyleId;
      style.textContent = `
      .lijnNumber {
        background-color: var(--color-base02) !important;
        border-color: var(--color-accent) !important;
        color: var(--color-text) !important;
      }
    `;
      document.head.appendChild(style);
    }
  } else {
    monochromeDelijnStyle?.remove();
  }
}

function applyOther(other) {
  if (window.location.href.split("/")[3] == "login")
    updateSplashText(other.splashText);

  keybinds = other.keybinds;

  other.performanceMode
    ? document.body.classList.remove("enableAnimations")
    : document.body.classList.add("enableAnimations");

  if (onHomePage) updateDiscordPopup(other.discordButton);
}

function applyProfile(profile) {
  let style = document.documentElement.style;
  style.setProperty(
    "--profile-picture",
    "url(" + getPfpLink(profile.username || originalUsername) + ")"
  );
  userNameChanger(profile.username);
  if (!profile.profilePicture) decapitateಠ_ಠ();
}

function applyFixes() {
  changeFont();
  fixCoursesSearch();

  if (document.getElementById("background_image")) {
    document.getElementById("background_image").style.display = "none";
  }

  let notifsToggleLabel = document.getElementById("notifsToggleLabel");
  if (notifsToggleLabel) notifsToggleLabel.innerText = "Toon pop-ups";
  if (document.querySelector(".login-app__left")) updateLoginPanel();
}

async function apply() {
  const data = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });
  console.log("Settings data: \n", data);

  await reloadDMenuConfig(); // reload the dmenu config. (er is een object voor async raarheid te vermijden en dat wordt herladen door deze functie)
  if (onHomePage) setEditMode(false);
  await applyAppearance(data.appearance);
  if (!liteMode) applyWeatherEffects(data.appearance.weatherOverlay);
  applyProfile(data.profile);
  applyTopNav(data.topNav);
  applyWidgets(data.widgets);
  applyOther(data.other);
  fixMessageBox();
}

async function storeQuickSettings() {
  const oldData = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });
  // Start from old settings
  const data = structuredClone(oldData);
  data.appearance.theme = document.getElementById("theme-selector").value;
  data.appearance.background.link = document.getElementById(
    "background-link-input"
  ).value;

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

  // Handle background file input
  let file = document.getElementById("background-file-input").files[0];
  if (file) {
    const reader = new FileReader();
    const imageData = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    await browser.runtime.sendMessage({
      action: "setImage",
      id: "backgroundImage",
      data: imageData,
    });

    data.appearance.background.selection = "file";
    data.appearance.background.link = file.name;
  } else {
    if (data.appearance.background.link == "") {
      data.appearance.background.selection = "default";
    } else if (
      data.appearance.background.link != oldData.appearance.background.link
    ) {
      data.appearance.background.selection = "link";
    }
  }

  console.log("Storing this new data:", data);
  await browser.runtime.sendMessage({ action: "setSettingsData", data });
  await loadQuickSettings();
  if (settingsWindow) {
    await settingsWindow.loadPage();
  }
  await apply();
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
  switch (data.background.selection) {
    case "default":
      displayBackgroundImage(
        getImage("/theme-backgrounds/" + data.theme + ".jpg")
      );
      break;
    case "link":
      displayBackgroundImage(data.background.link);
      break;
    case "file":
      let backgroundImage = await browser.runtime.sendMessage({
        action: "getImage",
        id: "backgroundImage",
      });
      displayBackgroundImage(backgroundImage);
      break;
  }
}

function set_link(background) {
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
    data.appearance.background.link;

  if (data.appearance.background.link) {
    document.getElementById("smpp-link-clear-button").classList.add("active");
  }
  if (data.appearance.background.selection == "file") {
    document.getElementById("backgroundfilebutton").classList.add("active");
  } else {
    document.getElementById("backgroundfilebutton").classList.remove("active");
  }

  document.getElementById("background-file-input").value = ""; // reset the files
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

  wallpaperContainer.appendChild(createBgSelector());
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
  quickSettingsWindow = createQuickSettingsHTML(quickSettingsWindow);

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
  onHomePage = document.getElementById("container") != null;
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
    topNav.insertBefore(createGC(), pushRight);
  }
  let searchButton = document.querySelector(".topnav__btn--icon--search");
  if (searchButton) {
    searchButton.innerHTML = searchButtonSvg;
  }
  if (onHomePage) {
    initWidgetEditMode();
    topNav.insertBefore(createWidgetEditModeButton(), pushRight);
  }

  topNav.insertBefore(createQuickMenuButton(), pushRight);

  topNav.insertBefore(createSettingsButton(), pushRight); //temp
}

function updateTopButtons(data) {
  let GOButton = document.querySelector(`[data-go=""]`);
  if (GOButton) {
    data.GO
      ? (GOButton.style = "display:flex")
      : (GOButton.style = "display:none");
  }

  let searchButton = document.querySelector(".topnav__btn--icon--search");
  if (searchButton) {
    data.search
      ? (searchButton.parentElement.style = "display:flex")
      : (searchButton.parentElement.style = "display:none");
  }

  let GC = document.getElementById("global_chat_button");
  if (GC) {
    data.GC
      ? (GC.style = "display:flex !important")
      : (GC.style = "display:none !important");
  }

  let quickButton = document.getElementById("quick-menu-button");
  if (quickButton) {
    data.quickMenu
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
  const backgroundImage = await browser.runtime.sendMessage({
    action: "getBackgroundImage",
  });
  if (settingsData.theme != null) {
    await migrateSettingsV2();
  }
  console.log(backgroundImage);
  if (backgroundImage["backgroundImage"]) {
    await browser.runtime.sendMessage({
      action: "setImage",
      id: "backgroundImage",
      data: backgroundImage["backgroundImage"],
    });
  }

  applyFixes();
  createStaticGlobals();

  await createWidgetSystem();
  createTopButtons();

  await apply();
}

main();
