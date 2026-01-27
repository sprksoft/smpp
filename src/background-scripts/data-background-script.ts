import { browser } from "../common/utils.js";
import type { SMPPImage } from "../main-features/modules/images.js";
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

let defaultPlantData = {};
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

let fallBackColorData = {};
async function getFallbackColorData() {
  if (!fallBackColorData) {
    fallBackColorData = await loadJSON(
      "background-scripts/data/delijn-kleuren.json"
    );
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

// TODO: Change how images are saved because the images object gets too big

export async function setImage(id: string, data: SMPPImage) {
  const images = (await browser.storage.local.get("images")).images || {};
  images[id] = data;
  await browser.storage.local.set({ images });
}

export async function getImage(id: string) {
  const images = (await browser.storage.local.get("images")).images || {};
  console.log(images);
  console.log(images[id]);
  if (!images[id])
    return { type: "default", link: "", imageData: "" } as SMPPImage;
  return images[id];
}

export async function removeImage(id: string) {
  const images = (await browser.storage.local.get("images")).images || {};
  delete images[id];
  await browser.storage.local.set({ images });
}
