import { browser, getByPath, setByPath } from "../common/utils.js";
import {
  getDelijnColorData,
  getPlantAppData,
  getCustomThemeData,
  setImage,
  getImage,
  getBase64,
  getFileData,
  migrateImagesV6,
} from "./data-background-script.js";
import {
  setSettingsData,
  getSettingsData,
  getSettingsTemplate,
} from "./settings.js";
import { fetchWeatherData, fetchDelijnData } from "./api-background-script.js";
import {
  getTheme,
  getThemes,
  getThemeCategories,
  saveCustomTheme,
  removeCustomTheme,
  getFirstThemeInCategory,
  shareTheme,
  installTheme,
  getSharedTheme,
  purgeThemeShareCache,
} from "./themes.js";

browser.runtime.onMessage.addListener(
  (message: any, _sender: any, sendResponse: (resp: any) => void) => {
    handleMessage(message, sendResponse);
    return true;
  }
);

async function handleMessage(message: any, sendResponse: (resp: any) => void) {
  try {
    // General
    if (message.action === "clearLocalStorage") {
      browser.storage.local.clear();
      sendResponse({ success: true });
      console.log("Cleared browser storage");
    }

    // Themes
    if (message.action === "getThemes") {
      let themes = await getThemes(
        message.categories,
        message.includeHidden,
        message.mustMatchAllCategories
      );
      sendResponse(themes);
      console.log(
        `Themes for categories: ${
          message.categories
        } sent, including hidden themes: ${
          message.includeHidden ? true : false
        }`
      );
      console.log(themes);
    }
    if (message.action === "getTheme") {
      let theme = await getTheme(message.name);
      sendResponse(theme);
      console.log(`Theme ${message.name} sent.`);
    }
    if (message.action == "getThemeCategories") {
      let categories = await getThemeCategories(message.includeHidden);
      sendResponse(categories);
      console.log(`Theme categories sent: ${categories}`);
    }
    if (message.action == "getFirstThemeInCategory") {
      let themeName = await getFirstThemeInCategory(
        message.category,
        message.includeHidden
      );
      sendResponse(themeName);
      console.log(
        `First theme in category ${message.category} sent: ${themeName}`
      );
    }

    if (message.action === "saveCustomTheme") {
      let id = await saveCustomTheme(message.data, message.id);
      sendResponse(id);

      console.log(`Custom theme ${message.id} saved as:`);
      console.log(message.data);
    }
    if (message.action === "removeCustomTheme") {
      await removeCustomTheme(message.id);
      sendResponse({ success: true });
      console.log(`Theme ${message.id} removed.`);
    }

    // Theme Sharing
    if (message.action === "markThemeAsModified") {
      await purgeThemeShareCache(message.name);
      sendResponse({ success: true });
    }
    if (message.action === "getSharedTheme") {
      const theme = await getSharedTheme(message.shareId);
      console.log("sending", theme);
      sendResponse({ theme: theme });
    }
    if (message.action === "installTheme") {
      await installTheme(message.shareId);
      sendResponse({ success: true });
    }
    if (message.action === "shareTheme") {
      const output = await shareTheme(message.name);
      if (typeof output == "string") {
        console.log(`Theme ${message.name} was shared (url: ${output})`);
        sendResponse({ shareUrl: output });
      } else {
        sendResponse({ humanError: output.message });
      }
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
    if (message.action === "getBase64") {
      const base64 = await getBase64(message.link);
      sendResponse(base64 || null);
      console.log(`Image with link:${message.link} converted to base64.`);
    }
    if (message.action === "getFileData") {
      const file = await getFileData(message.link);
      sendResponse(file || null);
      console.log(`Image with link:${message.link} converted to Data.`);
    }

    // Weather
    if (message.action === "fetchWeatherData") {
      const weatherData = await fetchWeatherData(message.location);
      sendResponse(weatherData);
      console.log("Weather data fetched and sent.");
    }

    // Delijn
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

    // Settings
    if (message.action === "setSetting") {
      const settingsData = await getSettingsData();
      setByPath(settingsData, message.name, message.data);
      await setSettingsData(settingsData);
      console.log(settingsData);
      sendResponse({ success: true });
    }
    if (message.action === "getSetting") {
      const settingsData = await getSettingsData();
      sendResponse(getByPath(settingsData, message.name));
      console.log("Setting " + message.name + "sent");
    }
    if (message.action === "setSettingsData") {
      await setSettingsData(message.data);
      sendResponse({ success: true });
      console.log("Settings data saved.");
    }
    if (message.action === "getSettingsData") {
      let settingsData = await getSettingsData();
      console.log(settingsData);
      sendResponse(settingsData);
      console.log("Settings data sent.");
    }
    if (message.action === "getSettingsTemplate") {
      const settingsTemplate = await getSettingsTemplate();
      sendResponse(getByPath(settingsTemplate, message.name));
      console.log("Settings options sent.");
    }

    // Widgets
    if (message.action === "getWidgetLayout") {
      console.log("Loading widget layout...");
      const data = await browser.storage.local.get("widgets");
      sendResponse(data.widgets);
    }
    if (message.action === "setWidgetLayout") {
      console.log("Saving widget layout...");
      await browser.storage.local.set({ widgets: message.layout });
      sendResponse({ success: true });
    }
    if (message.action === "getWidgetData") {
      console.log("Loading widget data...");
      const widgetId = "Game." + message.widget;
      let data = await browser.storage.local.get(widgetId);
      data = data[widgetId];
      sendResponse(data);
    }
    if (message.action === "setWidgetData") {
      console.log("Saving widget data...");
      let data: any = {};
      data["Game." + message.widget] = message.data;
      await browser.storage.local.set(data);
      sendResponse({ success: true });
    }

    // Migration
    if (message.action === "getDelijnAppData") {
      // for migration, NEVER use this!!!
      const delijnAppData = await browser.storage.local.get("delijnAppData");
      await browser.storage.local.remove("delijnAppData");
      sendResponse(delijnAppData);
      console.log("delijnAppData sent.");
    }
    if (message.action === "getWeatherAppData") {
      // for migration, NEVER use this!!!
      const weatherAppData = await browser.storage.local.get("weatherAppData");
      await browser.storage.local.remove("weatherAppData");
      sendResponse(weatherAppData);
      console.log("weatherAppData sent.");
    }
    if (message.action === "getBackgroundImage") {
      // for migration, NEVER use this!!!
      const backgroundImage =
        await browser.storage.local.get("backgroundImage");
      await browser.storage.local.remove("backgroundImage");
      sendResponse(backgroundImage);
      console.log("Background image sent.");
    }
    if (message.action === "getRawSettingsData") {
      // for migration, probably shouldn't use this...
      let rawSettingsData = (await browser.storage.local.get("settingsData"))
        .settingsData;
      sendResponse(rawSettingsData);
      console.log("Raw settings data sent.");
    }
    if (message.action === "setRawSettingsData") {
      // for migration, NEVER use this!!!
      console.log("Saving raw settings data...");
      console.log(message.data);
      await browser.storage.local.set({ settingsData: message.data });
      sendResponse({ success: true });
    }
    if (message.action === "migrateImagesV6") {
      // for migration, NEVER use this!!!
      console.log("Migrating images to V6...");
      await migrateImagesV6();
      sendResponse({ success: true });
    }
    if (message.action === "getCustomThemeData") {
      // for migration, NEVER use this!!!
      const customThemeData = await getCustomThemeData();
      sendResponse(customThemeData);
      console.log("Custom theme data data sent.");
    }
  } catch (err) {
    console.error("Service worker error:", err);
    sendResponse({ error: (err as any).message || String(err) });
  }
}
