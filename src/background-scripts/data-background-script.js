import { browser } from "../common/utils.js";

import { fetchDelijnData } from "./api-background-script.js";
import { loadJSON } from "./json-loader.js";

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

let defaultPlantData;
async function getDefaultPlantData() {
  if (!defaultPlantData) {
    defaultPlantData = await loadJSON(
      "background-scripts/data/default-plant-data.json"
    );
  }
  return defaultPlantData;
}

export async function getPlantAppData() {
  let data = await browser.storage.local.get("plantAppData");
  let plantAppData = data.plantAppData || getDefaultPlantData();
  return plantAppData;
}

export async function getCustomThemeData() {
  let data = await browser.storage.local.get("customThemeData");
  return data.customThemeData || getDefaultCustomThemeData();
}

let fallBackColorData;
async function getFallbackColorData() {
  if (!fallBackColorData) {
    fallBackColorData = await loadJSON("background-scripts/data/delijn-kleuren.json")
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
    return getFallbackColorData;
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

export async function removeImage(id) {
  const images = (await browser.storage.local.get("images")).images || {};
  delete images[id];
  await browser.storage.local.set({ images });
}
