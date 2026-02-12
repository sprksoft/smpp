import { browser, fnv1aHash, setByPath } from "../common/utils.js";
import type {
  ShareId,
  Theme,
  ThemeCategories,
  ThemeCategory,
  ThemeId,
  Themes,
} from "../main-features/appearance/themes.js";
import type { SMPPImage } from "../main-features/modules/images.js";
import {
  getBase64FromResponse,
  getImage,
  removeImage,
  setImage,
} from "./data-background-script.js";
import { loadJSON } from "./json-loader.js";
import { getSettingsData, setSettingsData } from "./settings.js";
import type { ApiThemeInfo } from "./theme-share-api.js";

let nativeThemes: Themes | undefined;
let categories: ThemeCategories | undefined;

async function getAllThemes(): Promise<Themes> {
  if (!nativeThemes) {
    nativeThemes = (await loadJSON("background-scripts/data/themes.json")) as Themes;
  }
  const customThemes = await getAllCustomThemes();
  const themes = { ...nativeThemes, ...customThemes };
  return themes;
}

export async function getThemeCategories(includeEmpty = false, includeHidden = false) {
  const allCategories = await getAllThemeCategories();
  if (!includeHidden) {
    const hiddenThemeKeys = (await getThemeCategory("hidden")) as ThemeCategory;

    for (const [name, category] of Object.entries(allCategories)) {
      allCategories[name] = category.filter((c) => !hiddenThemeKeys.includes(c)) as ThemeCategory;
    }
  }
  if (!includeEmpty) {
    Object.keys(allCategories).forEach((category) => {
      if (!allCategories[category]?.[0]) {
        delete allCategories[category];
      }
    });
  }
  return allCategories;
}

export async function getAllThemeCategories(): Promise<ThemeCategories> {
  if (!categories) {
    categories = (await loadJSON(
      "background-scripts/data/theme-categories.json",
    )) as ThemeCategories;
  }
  categories.quickSettings = await getQuickSettingsThemes();
  categories.custom = await getCustomCategory();
  return categories;
}

export async function getFirstThemeInCategory(
  category: string,
  _includeHidden: boolean,
): Promise<string> {
  const themeNames = await getThemeCategory(category);
  if (!themeNames) {
    return "error";
  }
  if (!themeNames[0]) {
    return "error";
  }
  return themeNames[0];
}

async function getQuickSettingsThemes() {
  const data = await getSettingsData();
  return data.appearance.quickSettingsThemes;
}

async function getThemeCategory(category: string): Promise<ThemeCategory | undefined> {
  const categories = await getAllThemeCategories();
  return categories[category];
}

export async function getThemes(
  categorynames: string[] = ["all"],
  includeHidden = false,
  mustMatchAllCategories = false,
) {
  const themes = await getAllThemes();
  if (categorynames.includes("all")) {
    return themes;
  }

  const categories = await Promise.all(
    categorynames.map((category) => getThemeCategory(category) as Promise<ThemeCategory>),
  );
  // Names of all the themes in the requested categories.
  const allThemeNames = categories.flat();

  let allowedThemeNames: string[];
  if (mustMatchAllCategories) {
    allowedThemeNames = allThemeNames.filter((themeName) =>
      categories.every((cat) => cat.includes(themeName)),
    );
  } else {
    allowedThemeNames = allThemeNames;
  }

  if (!includeHidden) {
    const hiddenThemeKeys = (await getThemeCategory("hidden")) as ThemeCategory;
    allowedThemeNames = allowedThemeNames.filter((themeKey) => !hiddenThemeKeys.includes(themeKey));
  }
  const filteredThemes = Object.fromEntries(
    Object.entries(themes).filter(([key]) => allowedThemeNames.includes(key)),
  );
  return filteredThemes;
}

export async function getTheme(name: ThemeId): Promise<Theme> {
  const allThemes = await getAllThemes();
  const theme = allThemes[name];
  if (theme !== undefined) {
    return theme;
  }
  console.error(`Invalid theme requested:"${name}", sent "error" theme`);
  return allThemes.error as Theme;
}

export async function getSharedThemeId(shareId: ShareId): Promise<ThemeId | null> {
  const cache = await loadThemeShareCache();
  for (const [theme, themeShareId] of Object.entries(cache)) {
    if (themeShareId === shareId) {
      return theme;
    }
  }
  return null;
}
export async function getSharedTheme(shareId: ShareId): Promise<Theme | null> {
  const id = await getSharedThemeId(shareId);
  if (!id) {
    return null;
  }
  return await getTheme(id);
}

export async function getCustomTheme(id: ThemeId): Promise<Theme | undefined> {
  const themes = await getAllCustomThemes();
  return themes[id];
}

async function getAllCustomThemes(): Promise<Themes> {
  const result = await browser.storage.local.get("customThemes");
  return result.customThemes || {};
}

async function getCustomCategory(): Promise<ThemeCategory> {
  const customThemes = await getAllCustomThemes();
  const customCategory = Object.keys(customThemes) as ThemeCategory;
  return customCategory;
}

export async function saveCustomTheme(data: Theme, id: string | undefined = undefined) {
  if (id === undefined) {
    id = crypto.randomUUID();
  }

  const customThemes = await getAllCustomThemes();
  customThemes[id] = data;
  await browser.storage.local.set({ customThemes });
  return id;
}

export async function removeCustomTheme(id: ThemeId) {
  const customThemes = await getAllCustomThemes();
  delete customThemes[id];
  await removeImage(id);
  await removeImage(`compressed-${id}`);
  const data = (await getSettingsData()) as any;
  const quickSettingsThemes = data.appearance.quickSettingsThemes.filter((name: string) => {
    return name !== id;
  });
  setByPath(data, "appearance.quickSettingsThemes", quickSettingsThemes);
  await setSettingsData(data);
  await browser.storage.local.set({ customThemes });
}

function getContentDispositionFileName(headerValue: string | null): string | null {
  if (!headerValue) {
    return null;
  }
  const match = [...headerValue.matchAll(/filename="(.*)"/)];
  if (match?.[0]?.[0]) {
    return match[0][0];
  }
  return null;
}

export async function installTheme(shareId: ShareId) {
  const resp = await fetch(`https://theme.smpp.be/${shareId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await resp.json();

  const theme: Theme = {
    displayName: json.name,
    cssProperties: json.css,
  };
  const id = await saveCustomTheme(theme);
  await updateThemeShareCache(id, shareId);

  const settingsData = (await getSettingsData()) as any;
  settingsData.appearance.theme = id;
  await setSettingsData(settingsData);

  if (json.img_url) {
    const resp = await fetch(json.img_url);
    const filename =
      getContentDispositionFileName(resp.headers.get("Content-Disposition")) ?? "importedFile.webp";

    const base64 = await getBase64FromResponse(resp);
    if (base64 === null) {
      throw new Error(
        "Failed to fetch img_url returned by the server while trying to create base64.",
      );
    }

    const image: SMPPImage = {
      metaData: {
        type: "file",
        link: filename,
      },
      imageData: base64,
    };
    // TODO: generate compressed images (needs to be done on client side)
    await setImage(id, image);
  }

  return;
}

async function fetchAsUnit8Array(url: string): Promise<Uint8Array | Error> {
  try {
    const resp = await fetch(url);
    return new Uint8Array(await resp.arrayBuffer());
  } catch (e) {
    return e as Error;
  }
}

export function shareUrlFromShareId(id: ShareId): string {
  return `https://theme.smpp.be/${id}`;
}

interface ThemeShareCache {
  [themeId: ThemeId]: ShareId;
}

export async function loadThemeShareCache(): Promise<ThemeShareCache> {
  return await browser.storage.local.get("themeShareCache");
}

export async function purgeThemeShareCache(themeId: ThemeId) {
  const data = await loadThemeShareCache();
  delete data[themeId];
  await browser.storage.local.set({ themeShareCache: data });
}

export async function getCachedShareId(themeId: ThemeId): Promise<ShareId | undefined> {
  const data = await loadThemeShareCache();
  return data[themeId];
}

export async function updateThemeShareCache(themeId: ThemeId, shareId: ShareId) {
  const data = await loadThemeShareCache();
  data[themeId] = shareId;
  await browser.storage.local.set({ themeShareCache: data });
}

export async function shareTheme(id: ThemeId): Promise<string> {
  const cachedShareId = await getCachedShareId(id);
  if (cachedShareId) {
    return shareUrlFromShareId(cachedShareId);
  }

  const theme = (await getTheme(id)) as Theme;
  const image = (await getImage(id)) as SMPPImage;

  let hash = null;
  let imageData = null;
  if (image.imageData !== "") {
    const data = await fetchAsUnit8Array(image.imageData);
    if (data instanceof Error) {
      throw new Error(`Failed to get image data while trying to sharing theme: ${data.message}`);
    }
    imageData = data;
    hash = fnv1aHash(imageData);
  }

  const apiTheme = {
    name: theme.displayName,
    css: theme.cssProperties,
    img_upload_chksum: hash,
  };

  const resp = await fetch("https://theme.smpp.be", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiTheme),
  });
  const themeInfo: ApiThemeInfo = await resp.json();

  await updateThemeShareCache(id, themeInfo.id);

  if (themeInfo.needs_img && hash && imageData) {
    await fetch(`https://theme.smpp.be/${themeInfo.id}/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${themeInfo.edit_key}`,
      },
      body: imageData.buffer as ArrayBuffer,
    });
  }

  // TODO: sibe fix it, important: Metadata in SMPPImage really does matter...
  // No, I don't believe ImportedFile.png it is.

  return shareUrlFromShareId(themeInfo.id);
}
