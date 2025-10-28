if (typeof browser === "undefined") {
  var browser = chrome;
}

import { fetchDelijnData, fetchWeatherData } from "./api-background-script.js";

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
  let data = await browser.storage.local.get("settingsData");
  console.log(data.settingsData || getDefaultSettings());
  return data.settingsData || getDefaultSettings();
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

// Returns { url: string|null, revoke: () => void }
export async function getImageURL(id) {
  console.log(`[getImageURL] Fetching image URL with id: ${id}`);

  let image;
  try {
    image = await getImage(id);
  } catch (err) {
    return { url: null, isDefault: true };
  }

  // Default
  if (!image || image.type === "default") {
    return { url: null, isDefault: true };
  }

  // Link
  if (image.type === "link" && image.imageData) {
    return { url: image.imageData, isDefault: false };
  }

  // File (base64)
  try {
    const res = await fetch(image.imageData);
    console.log(res);
    console.log("b");
    let obj = { url: objectURL, isDefault: false };
    console.log(obj);
    console.log("cx");
    const blob = await res.blob();
    console.log({ url: objectURL, revoke: revokeAndCleanup, isDefault: false });
    const objectURL = URL.createObjectURL(blob);
    console.log({ url: objectURL, revoke: revokeAndCleanup, isDefault: false });
    window.addEventListener("beforeunload", onUnload, { once: true });
    let revoked = false;
    const revoke = () => {
      if (!revoked) {
        URL.revokeObjectURL(objectURL);
        revoked = true;
      }
    };
    const revokeAndCleanup = () => {
      revoke();
      try {
        window.removeEventListener("beforeunload", onUnload);
      } catch (e) {}
    };
    console.log({ url: objectURL, revoke: revokeAndCleanup, isDefault: false });
    return { url: objectURL, revoke: revokeAndCleanup, isDefault: false };
  } catch (err) {
    return { url: null, isDefault: false };
  }
}
