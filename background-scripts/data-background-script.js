if (typeof browser === "undefined") {
  var browser = chrome;
}

import { fetchDelijnData } from "./api-background-script.js";
import { fillObjectWithDefaults } from "./utils.js";

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

export function getDefaultSettings() {
  return defaultSettings;
}

export async function getSettingsData() {
  let data = (await browser.storage.local.get("settingsData")).settingsData;
  console.log("set before filled: ");
  console.log(data);
  data = fillObjectWithDefaults(data, getDefaultSettings());
  console.log("set after filled: ");
  console.log(data);
  return data;
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

export function getSettingsOptions() {
  return settingsOptions;
}

export function getAllThemes() {
  return themes;
}

export function getTheme(theme) {
  console.log(themes[theme]);
  if (themes[theme] != undefined) {
    return themes[theme];
  } else {
    throw new Error("Theme not found");
  }
}

export async function getDelijnColorData() {
  try {
    let data = await browser.storage.local.get("delijnColorData");
    let delijnColorData;
    if (data.delijnColorData?.kleuren != undefined) {
      delijnColorData = data.delijnColorData;
    } else {
      delijnColorData = await fetchDelijnData(
        "https://api.delijn.be/DLKernOpenData/api/v1/kleuren"
      );
    }

    await browser.storage.local.set({
      delijnColorData: delijnColorData,
    });
    console.log("Retrieved Delijn Color Data.");
    return delijnColorData;
  } catch (error) {
    console.error("Error retrieving Delijn Color Data:", error);
    return fallbackColorData;
  }
}

export async function setImage(id, data) {
  const images = (await browser.storage.local.get("images")).images || {};
  images[id] = data;
  await browser.storage.local.set({ images });
}

export async function getImage(id) {
  const images = (await browser.storage.local.get("images")).images || {};
  if (!images[id]) return { type: "default", link: null, imageData: null };
  return images[id];
}
