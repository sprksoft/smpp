// @ts-nocheck
import { getExtensionImage, randomChance, getPfpLink } from "../fixes-utils/utils.js";
import "../fixes-utils/svgs.js";
import "../fixes-utils/login.js";
import { migrate } from "../fixes-utils/migration.js";
import "../fixes-utils/scraper.js";
import { titleFix } from "../fixes-utils/titlefix.js";
import "../fixes-utils/results.js";
import { createWidgetSystem, createWidgetEditModeButton } from "../widgets/widgets.js"
import "../main-features/modules/windows.js";
import "../main-features/modules/images.js";
import { createGC } from "../main-features/globalchat.js";
import "./profile.js";
import "../main-features/keybinds.js";
import "../main-features/appearance/background-image.js";
import "../main-features/appearance/themes.js";
import "../main-features/appearance/ui.js";
import "../main-features/appearance/weather-effects.js";
import { createQuickSettingsButton, createQuickSettings } from "../main-features/settings/quick-settings.js";
import { createSettingsWindow } from "./settings/main-settings.js";
import { quickLoad } from "../main-features/quick-menu/quick.js";
import "../games/games.js";
import "../games/breakout.js";
import "../games/flappy.js";
import "../games/snake.js";
import "../games/pong.js";
import "../games/tetris.js";
import "../main-features/main.js";

// Widgets
import "../widgets/tutorial-widget.js";
import "../widgets/assignments.js";
import "../widgets/delijn.js";
import "../widgets/plant.js";
import "../widgets/planner.js";
import "../widgets/weather.js";
import "../widgets/clock.js";

export var originalUsername: string;
export var settingsTemplate: any;
export var themes: any;
export var browser : any;
export var onHomePage: boolean;
export var onLoginPage: boolean;
export var isGOSchool: boolean;
export var isFirefox: boolean;
export var originalPfpUrl: string;
export var keybinds: any;
export var liteMode: boolean;
export var customTheme: any;

import {
  discordSvg,
  homeiconSvg,
  messageSvg,
  notfisSvg,
  searchButtonSvg,
  settingsIconSvg,
} from "../fixes-utils/svgs.js";

import { setEditMode } from "../widgets/widgets.js";
import { initWidgetEditMode } from "../widgets/widgets.js";
import { applyUsername, applyProfilePicture } from "./profile.js";
import { updateLoginPanel } from "../fixes-utils/login.js";
import { buisStats } from "../fixes-utils/results.js";
import { setTheme } from "../main-features/appearance/themes.js";
import { setBackground } from "../main-features/appearance/background-image.js";
import { updateNews } from "../widgets/widgets.ts";
import { updateSplashText } from "../fixes-utils/login.js";
import { applyWeatherEffects } from "../main-features/appearance/weather-effects.js";
import { openSettingsWindow } from "./settings/main-settings.js";
import { reloadDMenuConfig, createQuickMenuButton } from "../main-features/quick-menu/dmenu.js";
import { colorpickersHTML } from "../fixes-utils/svgs.js";

if (browser == undefined) {
  browser = chrome;
}

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
    document.getElementById("discord-link-container")?.remove();
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
    ?.addEventListener("keydown", function(event) {
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

function updateTabLogo(logo) {
  let iconElement = document.querySelector('link[rel="icon"]');
  if (!iconElement) {
    iconElement = document.createElement("link");
    document.head.appendChild(iconElement);
    iconElement.rel = "icon";
  }
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

export function applyTopNav(data) {
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

async function createStaticGlobals() {
  themes = await browser.runtime.sendMessage({
    action: "getAllThemes",
  });

  settingsTemplate = await browser.runtime.sendMessage({
    action: "getSettingsTemplate",
  });
  originalUsername =
    document.querySelector(".js-btn-profile .hlp-vert-box span")?.innerText ||
    "Mr Unknown";

  isGOSchool = document.body.classList.contains("go");
  isFirefox =
    typeof navigator.userAgent === "string" &&
    /firefox/i.test(navigator.userAgent);
  if (document.querySelector('img[alt="Profiel afbeelding"]')) {
    originalPfpUrl = document.querySelector(
      'img[alt="Profiel afbeelding"]'
    ).src;
  } else {
    originalPfpUrl = getPfpLink(originalUsername);
  }

  onHomePage = document.getElementById("container") != null;

  onLoginPage = document.querySelector(".login-app") != null;

  var quicks = await quickLoad();
  liteMode = browser.runtime.getManifest().name.includes("Lite");
}

export async function applyAppearance(appearance) {
  let style = document.documentElement.style;

  await setTheme(appearance.theme);
  setBackground(appearance);
  updateNews(appearance.news);
  updateTabLogo(appearance.tabLogo);

  if (onLoginPage) {
    style.setProperty("--background-blur", `blur(${0}px)`);
  } else {
    style.setProperty(
      "--background-blur",
      `blur(${appearance.background.blur}px)`
    );
  }
}

export function applyOther(other) {
  if (window.location.href.split("/")[3] == "login")
    updateSplashText(other.splashText);

  keybinds = other.keybinds;

  other.performanceMode
    ? document.body.classList.remove("enableAnimations")
    : document.body.classList.add("enableAnimations");

  if (onHomePage) updateDiscordPopup(other.discordButton);
}

export function applyProfile(profile) {
  let style = document.documentElement.style;
  style.setProperty(
    "--profile-picture",
    "url(" + getPfpLink(profile.username || originalUsername) + ")"
  );
  applyUsername(profile.username);
  applyProfilePicture(profile);
}

function applyFixes() {
  changeFont();
  fixCoursesSearch();
  titleFix();

  if (document.getElementById("background_image")) {
    document.getElementById("background_image").style.display = "none";
  }

  let notifsToggleLabel = document.getElementById("notifsToggleLabel");
  if (notifsToggleLabel) notifsToggleLabel.innerText = "Toon pop-ups";

  if (window.location.pathname.startsWith("/results/main/results/")) {
    buisStats();
  }
  if (document.querySelector(".login-app__left")) updateLoginPanel();
}

export async function apply() {
  const data = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });
  console.log("Applying with settings data: \n", data);

  await reloadDMenuConfig(); // reload the dmenu config. (er is een object voor async raarheid te vermijden en dat wordt herladen door deze functie)
  if (onHomePage) setEditMode(false);
  await applyAppearance(data.appearance);
  if (!liteMode) applyWeatherEffects(data.appearance.weatherOverlay);
  applyProfile(data.profile);
  applyTopNav(data.topNav);
  applyOther(data.other);
}

export async function storeCustomThemeData() {
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

export async function createCustomThemeUI() {
  const colorpickers = document.getElementById("colorpickers");
  colorpickers.innerHTML = colorpickersHTML;
  await loadCustomThemeData();
}

function createTopButtons() {
  let topNav = document.querySelector("nav.topnav");

  let logoutButton = document.querySelector(".js-btn-logout");
  if (logoutButton) {
    logoutButton.innerHTML = changeLogoutText();
  }

  let searchBtn = document.querySelector(".topnav__btn--icon--search");

  topNav.insertBefore(createQuickSettingsButton(), searchBtn.parentElement);
  createQuickSettings();

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

  document
    .getElementById("profileMenu")
    .querySelector(".topnav__menu")
    .appendChild(createProfileSettingButton());
}

function createProfileSettingButton() {
  let button = document.createElement("a");
  button.addEventListener("click", (e) => {
    openSettingsWindow(e);
    document.getElementById("profileMenu").hidden = true;
    document.querySelector(".profile-settings-button").click();
  });

  button.classList.add("topnav__menuitem");
  button.classList.add("topnav__menuitem--img");

  let textContent = document.createElement("span");
  textContent.textContent = "Smartschool++ Profile";

  let image = document.createElement("img");
  image.src = getExtensionImage("icons/smpp/" + "128.png");
  image.style.borderRadius = "0.5rem";

  button.appendChild(image);
  button.appendChild(textContent);

  return button;
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
    console.error("SMPP is 2x geladen");
    alert("SMPP is 2x geladen");
  }

  document.body.classList.add("smpp"); // For modding

  await migrate();

  applyFixes();
  await createStaticGlobals();

  await createWidgetSystem();

  if (document.querySelector("nav.topnav")) {
    await createSettingsWindow();
    createTopButtons();
  }

  await apply();
}

main();
