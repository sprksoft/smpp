import { browser } from "../common/utils.js";
import type {
  SMPPImage,
  SMPPImageMetaData,
} from "../main-features/modules/images.js";
import type { Settings } from "../main-features/settings/main-settings.js";
import { fetchDelijnData } from "./api-background-script.js";
import { loadJSON } from "./json-loader.js";
import { getSettingsData } from "./settings.js";

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
  if (Object.keys(defaultPlantData).length == 0) {
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
  if (Object.keys(fallBackColorData).length == 0) {
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
    return delijnColorData;
  } catch (error) {
    console.error("Error retrieving Delijn Color Data:", error);
    return getFallbackColorData;
  }
}

export async function setImage(id: string, data: SMPPImage) {
  const imagesMetaData =
    (await browser.storage.local.get("images")).images || {};

  imagesMetaData[id] = data.metaData;
  await browser.storage.local.set({ images: imagesMetaData });

  const customId = "SMPPImage-" + id;
  await browser.storage.local.set({ [customId]: data.imageData });
}

export async function getImage(id: string): Promise<SMPPImage> {
  const imagesMetaData =
    (await browser.storage.local.get("images")).images || {};
  let metaData = imagesMetaData[id] as SMPPImageMetaData;
  if (!metaData)
    return {
      metaData: { type: "default", link: "" },
      imageData: "",
    } as SMPPImage;

  const customId = "SMPPImage-" + id;
  const image: string =
    (await browser.storage.local.get(customId))[customId] || "";

  return {
    metaData,
    imageData: image,
  } as SMPPImage;
}

export async function removeImage(id: string) {
  const imagesMetaData =
    (await browser.storage.local.get("images")).images || {};
  delete imagesMetaData[id];
  const customId = "SMPPImage-" + id;
  await browser.storage.local.remove([customId]);
  await browser.storage.local.set({ images: imagesMetaData });
}

export async function getBase64FromResponse(
  response: Response
): Promise<string> {
  let blob = await response.blob();
  let base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return base64 as string;
}

export async function getBase64(link: string): Promise<string | null> {
  try {
    let response = await fetch(link);
    if (!response.ok) {
      console.error(
        `Failed to fetch image: ${response.status} ${response.statusText}`
      );
      return null;
    }
    return getBase64FromResponse(response);
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null;
  }
}

export async function getFileData(link: string) {
  try {
    let response = await fetch(link);
    if (!response.ok) return null;

    let blob = await response.blob();
    let arrayBuffer = await blob.arrayBuffer();

    const urlParts = link.split("/");
    const filename = urlParts[urlParts.length - 1] || "image.jpg";

    return {
      arrayBuffer: Array.from(new Uint8Array(arrayBuffer)),
      mimeType: blob.type || "image/jpeg",
      filename: filename,
    };
  } catch (error) {
    console.error("Error getting file data:", error);
    return null;
  }
}

export async function migrateImagesV6() {
  let settings = (await getSettingsData()) as Settings;
  const images = (await browser.storage.local.get("images")).images || {};

  if (images["profilePicture"]) {
    let profileImage = {
      metaData: {
        type: images["profilePicture"].type,
        link: images["profilePicture"].link,
      },
      imageData: images["profilePicture"].imageData,
    };
    await setImage("profilePicture", profileImage);
  }

  if (images["backgroundImage"]) {
    let backgroundImage = {
      metaData: {
        type: images["backgroundImage"].type,
        link: images["backgroundImage"].link,
      },
      imageData: images["backgroundImage"].imageData,
    };
    await setImage(settings.appearance.theme, backgroundImage);
  }
}
