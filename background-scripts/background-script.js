if (typeof browser === "undefined") {
  var browser = chrome;
}

let globalsInitialized = false;

import {
  getSettingsData,
  getSettingsOptions,
  getWeatherAppData,
  getDelijnAppData,
  getDelijnColorData,
  getDefaultSettings,
  getPlantAppData,
  getCustomThemeData,
  getAllThemes,
  getTheme,
  setImage,
  getImage,
} from "./data-background-script.js";
import { fetchWeatherData, fetchDelijnData } from "./api-background-script.js";
import { initGlobals } from "./json-loader.js";

///
///```js
/// const ob = { sub1: { sub2: "hello" } };
/// getByPath(ob, "sub1.sub2") === "hello"
///```
function getByPath(object, path) {
  if (!path) {
    return object;
  }
  let ob = object;
  for (let node of path.split(".")) {
    ob = ob[node];
    if (ob === undefined) {
      throw `getByPath: ${node} did not exist in path ${path}`;
    }
  }
  return ob;
}

function setByPath(object, path, value) {
  let ob = object;
  const pathSplit = path.split(".");
  for (let i = 0; i < pathSplit.length - 1; i++) {
    ob = ob[pathSplit[i]];
    if (ob === undefined) {
      throw `setByPath: ${pathSplit[i]} did not exist in path ${path}`;
    }
  }
  ob[pathSplit[pathSplit.length - 1]] = value;
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
      sendResponse({ success: true });
      console.log("Cleared browser storage");
    }
    // Settings
    if (message.action === "setSettingsData") {
      await browser.storage.local.set({ settingsData: message.data });
      sendResponse({ success: true });
      console.log("Settings data saved.");
    }
    /* maybe usefull but just use the categories for now
    if (message.action === "setSetting") {
      const settingsData = await getSettingsData();
      settingsData[message.name] = message.value;
      await browser.storage.local.set({ settingsData: settingsData });
      sendResponse({ success: true });
    }
    if (message.action === "getSetting") {
      const settingsData = await getSettingsData();
      settingsData[message.name] = message.value;
      await browser.storage.local.set({ settingsData: settingsData });
      sendResponse({ success: true });
    }
    */
    if (message.action === "setSettingsCategory") {
      const settingsData = await getSettingsData();
      setByPath(settingsData, message.category, message.data);
      await browser.storage.local.set({ settingsData: settingsData });
      sendResponse({ success: true });
    }
    if (message.action === "getSettingsCategory") {
      const settingsData = await getSettingsData();
      sendResponse(getByPath(settingsData, message.category));
      console.log(
        "Settings data sent for this:" + message.category + "category",
      );
    }
    if (message.action === "getSettingsData") {
      const settingsData = await getSettingsData();
      console.log(settingsData);
      sendResponse(settingsData);
      console.log("Settings data sent.");
    }

    // category is optional
    if (message.action === "getSettingsOptions") {
      const settingsOptions = await getSettingsOptions();
      sendResponse(getByPath(settingsOptions, message.category));
      console.log("Settings options sent.");
    }

    // category is optional
    if (message.action === "getSettingsDefaults") {
      const defaults = getDefaultSettings();
      sendResponse(getByPath(defaults, message.category));
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
      sendResponse({ success: true });
      console.log("Custom theme data saved.");
    }
    // Images
    if (message.action === "setImage") {
      await setImage(message.id, message.data);
      sendResponse({ success: true });
      console.log(`Image with id:${message.id} saved.`);
    }
    if (message.action === "getImage") {
      const image = await getImage(message.id);
      sendResponse(image || null);
      console.log(`Image with id:${message.id} sent.`);
    }
    // for migration, NEVER use this!!!
    if (message.action === "getBackgroundImage") {
      const backgroundImage =
        await browser.storage.local.get("backgroundImage");
      await browser.storage.local.remove("backgroundImage");
      sendResponse(backgroundImage || null);
      console.log("Background image sent.");
    }

    // Weather
    if (message.action === "setWeatherAppData") {
      await browser.storage.local.set({ weatherAppData: message.data });
      sendResponse({ success: true });
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
      sendResponse({ success: true });
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
      await browser.storage.local.set({ plantAppData: message.data });
      sendResponse({ success: true });
    }
    if (message.action === "getPlantAppData") {
      const plantAppData = await getPlantAppData();
      sendResponse(plantAppData);
      console.log("Plant appdata sent.");
    }
    // Widgets
    if (message.action === "getWidgetLayout") {
      console.log("loading widget layout");
      const data = await browser.storage.local.get("widgets");
      sendResponse(data.widgets);
    }
    if (message.action === "setWidgetLayout") {
      console.log("saving widget layout");
      await browser.storage.local.set({ widgets: message.layout });
      sendResponse({ success: true });
    }
    if (message.action === "getWidgetData") {
      console.log("loading widget data");
      const widgetId = "Game." + message.widget;
      let data = await browser.storage.local.get(widgetId);
      data = data[widgetId];
      sendResponse(data);
    }
    if (message.action === "setWidgetData") {
      console.log("saving widget data");
      let data = {};
      data["Game." + message.widget] = message.data;
      await browser.storage.local.set(data);
      sendResponse({ success: true });
    }
  } catch (err) {
    console.error("Service worker error:", err);
    sendResponse({ error: err.message || String(err) });
  }
}
