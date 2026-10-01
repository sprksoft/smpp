import { colord } from "colord";
import type { Theme } from "../main-features/appearance/themes.js";
import type { SMPPImage } from "../main-features/modules/images.js";

export const MAX_THEME_FILE_SIZE = 20 * 1024 * 1024;
const colorKeys = [
  "--color-accent",
  "--color-text",
  "--color-base00",
  "--color-base01",
  "--color-base02",
  "--color-base03",
  "--color-homepage-sidebars-bg",
  "--color-splashtext",
  "--darken-background",
];

export type ThemeFile = {
  format: "smpp-theme";
  version: 1;
  theme: Theme;
  background: SMPPImage | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateThemeFile(value: unknown): ThemeFile {
  if (
    !isRecord(value) ||
    value["format"] !== "smpp-theme" ||
    value["version"] !== 1
  ) {
    throw new Error("Bestand of versie wordt niet ondersteund.");
  }

  const theme = value["theme"];
  if (
    !isRecord(theme) ||
    typeof theme["displayName"] !== "string" ||
    !theme["displayName"].trim() ||
    theme["displayName"].length > 200 ||
    !isRecord(theme["cssProperties"])
  ) {
    throw new Error("Invalid theme name or colors.");
  }

  const colors = theme["cssProperties"];
  if (Object.keys(colors).some((key) => !colorKeys.includes(key))) {
    throw new Error("Dit thema bevat kleurinstellingen die niet worden ondersteund.");
  }

  const cssProperties: Record<string, string> = {};
  for (const key of colorKeys) {
    const color = colors[key];
    if (
      typeof color !== "string" ||
      color.length > 100 ||
      !colord(color).isValid()
    ) {
      throw new Error("Het thema bevat ontbrekende of ongeldige kleuren.");
    }

    cssProperties[key] = color;
  }

  let background: SMPPImage | null = null;
  if (value["background"] !== null) {
    const image = value["background"];

    if (
      !isRecord(image) ||
      typeof image["imageData"] !== "string" ||
      image["imageData"].length > MAX_THEME_FILE_SIZE ||
      !/^data:image\/(png|jpeg|webp|gif|avif|bmp|x-icon);base64,[A-Za-z0-9+/]+={0,2}$/.test(
        image["imageData"]
      )
    ) {
      throw new Error("De achtergrond moet een ingesloten afbeelding zijn.");
    }

    background = {
      metaData: { type: "file", link: "Imported background" },
      imageData: image["imageData"],
    };
  }

  return {
    format: "smpp-theme",
    version: 1,
    theme: { displayName: theme["displayName"].trim(), cssProperties },
    background,
  };
}
