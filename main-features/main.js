//java script komt hier je weet wel
//ok - ldev
//oh ok, ik dacht in general.css - Jdev

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

  let settingsData = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });

  if (settingsData.theme != null) {
    await migrateSettingsV2();
    settingsData = await browser.runtime.sendMessage({
      action: "getSettingsData",
    });
  }

  const backgroundImage = await browser.runtime.sendMessage({
    action: "getBackgroundImage",
  });
  if (backgroundImage["backgroundImage"]) {
    await browser.runtime.sendMessage({
      action: "setImage",
      id: "backgroundImage",
      imageData: backgroundImage["backgroundImage"],
      type: settingsData.appearance.background.backgroundSelector,
    });
  }

  applyFixes();
  createStaticGlobals();

  await createWidgetSystem();
  createTopButtons();

  await apply();
}

main();
