if (typeof browser === "undefined") {
  var browser = chrome;
}
let globalsInitialized = false;

import {
  getSettingsData,
  getSettingsOptions,
  getWeatherAppData,
  getDelijnAppData,
  getWidgetData,
  getDelijnColorData,
  getPlantAppData,
  getCustomThemeData,
  getAllThemes,
  getTheme,
} from "./data-background-script.js";
import { fetchWeatherData, fetchDelijnData } from "./api-background-script.js";
import { initGlobals } from "./json-loader.js";


///
///```js
/// const ob = { sub1: { sub2: "hello" } };
/// getByPath(ob, "sub1.sub2") === "hello"
///```
function getByPath(object, path) {
  let ob = object;
  for (let node of path.split(".")) {
    ob = ob[node];
  }
  return ob;
}

function setByPath(object, path, value) {
  let ob = object; 
  const pathSplit = path.split(".");
  for (let i=0; i < pathSplit.length-1; i++) {
    ob = ob[pathSplit[i]];
  }
  ob[pathSplit[pathSplit.length-1]] = value;
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sendResponse);
  return true; // keeps channel open
});

async function handleMessage(message, sendResponse) {
  if (!globalsInitialized) {
    await initGlobals();
    globalsInitialized = true;
  }
  try {
    // General
    if (message.action === "clearLocalStorage") {
      browser.storage.local.clear();
      sendResponse({ succes: true });
      console.log("Cleared browser storage");
    }
    // Settings
    if (message.action === "setSettingsData") {
      await browser.storage.local.set({ settingsData: message.data });
      sendResponse({ succes: true });
      console.log("Settings data saved.");
    }
    /* maybe usefull but just use the categories for now
    if (message.action === "setSetting") {
      const settingsData = await getSettingsData();
      settingsData[message.name] = message.value;
      await browser.storage.local.set({ settingsData: settingsData });
      sendResponse({ succes: true });
    }
    if (message.action === "getSetting") {
      const settingsData = await getSettingsData();
      settingsData[message.name] = message.value;
      await browser.storage.local.set({ settingsData: settingsData });
      sendResponse({ succes: true });
    }
    */
    if (message.action === "setSettingsCategory") {
      const settingsData = await getSettingsData();
      console.log(settingsData);
      console.log("setting", message.category, "to", message.data);
      setByPath(settingsData, message.category, message.data);
      console.log(settingsData);
      await browser.storage.local.set({ settingsData: settingsData });
      sendResponse({ succes: true });
      console.log(
        "Settings data saved for this:" + message.category + "category"
      );
    }
    if (message.action === "getSettingsCategory") {
      const settingsData = await getSettingsData();
      sendResponse(getByPath(settingsData, message.category));
      console.log(
        "Settings data sent for this:" + message.category + "category"
      );
    }
    if (message.action === "getSettingsData") {
      const settingsData = await getSettingsData();
      console.log(settingsData);
      sendResponse(settingsData);
      console.log("Settings data sent.");
    }

    if (message.action === "getSettingsOptions") {
      const settingsOptions = await getSettingsOptions();
      console.log(settingsOptions);
      sendResponse(settingsOptions);
      console.log("Settings options sent.");
    }
    // Themes
    if (message.action === "getAllThemes") {
      const allThemes = getAllThemes();
      sendResponse(allThemes);
      console.log("All themes sent.");
    }
    if (message.action === "getTheme") {
      let theme;
      try {
        theme = getTheme(message.theme);
        sendResponse(theme);
        console.log(`Theme ${message.theme} sent.`);
      } catch (error) {
        console.error(error);
        theme = getTheme("error");
        sendResponse(theme);
        console.error(`Invalid theme requested, sent "error" theme`);
      }
    }
    // Custom theme
    if (message.action === "getCustomThemeData") {
      const customThemeData = await getCustomThemeData();
      sendResponse(customThemeData);
      console.log("Custom theme data data sent.");
    }
    if (message.action === "setCustomThemeData") {
      await browser.storage.local.set({ customThemeData: message.data });
      sendResponse({ succes: true });
      console.log("Custom theme data saved.");
    }
    // Background image
    if (message.action === "saveBackgroundImage") {
      await browser.storage.local.set({ backgroundImage: message.data });
      sendResponse({ succes: true });
      console.log("Background image saved.");
    }
    if (message.action === "getBackgroundImage") {
      const backgroundImage = await browser.storage.local.get(
        "backgroundImage"
      );
      sendResponse(backgroundImage || null);
      console.log("Background image sent.");
    }

    if (message.action === "savePhotoWidgetImage") {
      await browser.storage.local.set({ photoWidgetImage: message.data });
      sendResponse({ succes: true });
      console.log("Photo widget image saved.");
    }
    if (message.action === "getPhotoWidgetImage") {
      const photoWidgetImage = await browser.storage.local.get(
        "photoWidgetImage"
      );
      sendResponse(photoWidgetImage || null);
      console.log("Photo widget image sent.");
    }
    // Weather
    if (message.action === "setWeatherAppData") {
      await browser.storage.local.set({ weatherAppData: message.data });
      sendResponse({ succes: true });
      console.log("Weather appdata saved.");
    }
    if (message.action === "getWeatherAppData") {
      const weatherAppData = await getWeatherAppData();
      sendResponse(weatherAppData);
      console.log("Weather appdata sent.");
    }
    if (message.action === "fetchWeatherData") {
      const weatherData = await fetchWeatherData(message.location);
      sendResponse(weatherData);
      console.log("Weather data fetched and sent.");
    }
    // Delijn
    if (message.action === "setDelijnAppData") {
      await browser.storage.local.set({ delijnAppData: message.data });
      sendResponse({ succes: true });
      console.log("Delijn appdata saved.");
    }
    if (message.action === "getDelijnAppData") {
      const delijnAppData = await getDelijnAppData();
      sendResponse(delijnAppData);
      console.log("Delijn appdata sent.");
    }
    if (message.action === "fetchDelijnData") {
      const delijnData = await fetchDelijnData(message.url);
      sendResponse(delijnData);
      console.log("Delijn appdata fetched and sent.");
    }
    if (message.action === "getDelijnColorData") {
      let delijnColorData = await getDelijnColorData();
      sendResponse(delijnColorData);
      console.log("Delijn color data fetched and sent.");
    }
    // Plant
    if (message.action === "setPlantAppData") {
      console.log(message.data);
      await browser.storage.local.set({ plantAppData: message.data });
      sendResponse({ succes: true });
      console.log("Plant appdata saved.");
    }
    if (message.action === "getPlantAppData") {
      const plantAppData = await getPlantAppData();
      sendResponse(plantAppData);
      console.log("Plant appdata sent.");
    }
    // Widgets
    if (message.action === "getWidgetData") {
      console.log("getting widget data");
      let widgetData = await getWidgetData();
      sendResponse(widgetData);
    }
    if (message.action === "setWidgetData") {
      console.log("saving widget data");
      await browser.storage.local.set({ widgets: message.widgetData });
      sendResponse({ succes: true });
    }
    // Games
    if (message.action === "getGameData") {
      let gameData = await browser.storage.local.get("Game." + message.game);
      gameData = gameData["Game." + message.game];
      if (!gameData) {
        sendResponse({
          options: {},
          score: 0,
        });
      } else {
        sendResponse(gameData);
      }
    }
    if (message.action === "setGameData") {
      console.log("saving game data");
      let gameData = {};
      gameData["Game." + message.game] = message.data;
      await browser.storage.local.set(gameData);
      sendResponse({ success: true });
    }
  } catch (err) {
    console.error("Service worker error:", err);
    sendResponse({ error: err.message || String(err) });
  }
}
