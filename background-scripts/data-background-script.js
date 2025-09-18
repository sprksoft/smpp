if (typeof browser === "undefined") {
  var browser = chrome;
}

const liteMode = browser.runtime.getManifest().lite_mode;
import { fetchDelijnData, fetchWeatherData } from "./api-background-script.js";

import themes from "./data/themes.json" with { type: "json" };
import settingsOptions from "./data/settings-options.json" with { type: "json" };
import defaultSettings from "./data/default-settings.json" with { type: "json" };
import liteDefaultSettings from "./data/lite/lite-default-settings.json" with { type: "json" };
import defaultPlantData from "./data/default-plant-data.json" with { type: "json" };
import fallbackColorData from "./data/delijn-kleuren.json" with { type: "json" };

function getDefaultCustomThemeData() {
  return {
    color_accent: "#a3a2ec",
    color_base00: "#38313a",
    color_base01: "#826882",
    color_base02: "#ac85b7",
    color_base03: "#c78af0",
    color_text: "#ede3e3",
  };
}

function getDefaultSettings(isLite) {
  if (!isLite) {
    return defaultSettings
  } else {
    return liteDefaultSettings
  }
}

export async function getSettingsData() {
  let data = await browser.storage.local.get("settingsData");
  console.log(data);
  console.log(data.settingsData || getDefaultSettings(liteMode));
  return data.settingsData || getDefaultSettings(liteMode);
}

export async function getWidgetData() {
  let data = await browser.storage.local.get("widgets");
  return data.widgets;
}

export async function getWeatherAppData() {
  let data = await browser.storage.local.get("weatherAppData");
  let weatherAppData = data.weatherAppData || {
    weatherData: await fetchWeatherData("Keerbergen"),
    lastUpdateDate: new Date().toISOString(),
    lastLocation: "Keerbergen",
  };

  await browser.storage.local.set({
    weatherAppData: {
      weatherData: weatherAppData.weatherData,
      lastUpdateDate: weatherAppData.lastUpdateDate,
      lastLocation: weatherAppData.lastLocation,
    },
  });
  return weatherAppData;
}

export async function getDelijnAppData() {
  let data = await browser.storage.local.get("delijnAppData");
  let delijnAppData = data.delijnAppData || {
    entiteitnummer: null,
    haltenummer: null,
  };
  return delijnAppData;
}

export async function getPlantAppData() {
  let data = await browser.storage.local.get("plantAppData");
  let plantAppData = data.plantAppData || defaultPlantData;
  return plantAppData;
}

export async function getCustomThemeData() {
  let data = await browser.storage.local.get("customThemeData");
  return data.customThemeData || getDefaultCustomThemeData();
}

export function getSettingsOptions(isLite) {
  if (!isLite) {
    return settingsOptions;
  }
}
console.log(getSettingsOptions(liteMode));

export function getAllThemes() {
  return themes;
}

export function getTheme(theme) {
  return themes[theme];
}

export async function getDelijnColorData() {
    try {
    let data = await browser.storage.local.get("delijnColorData");
    let delijnColorData;
    if (data.delijnColorData?.kleuren != undefined) {
      delijnColorData = data.delijnColorData
    } else {
      delijnColorData = await fetchDelijnData("https://api.delijn.be/DLKernOpenData/api/v1/kleuren")
    }

    await browser.storage.local.set({
      delijnColorData: delijnColorData
    });
    console.log('Retrieved Delijn Color Data.');
    return delijnColorData;
  } catch (error) {
    console.error('Error retrieving Delijn Color Data:', error);
    return fallbackColorData
  }
}
