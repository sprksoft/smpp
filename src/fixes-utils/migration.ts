// @ts-nocheck

import { browser } from "../common/utils.ts";
import type { Theme } from "../main-features/appearance/themes.js";
import { currentDataVersion } from "../main-features/main.js";
import { clearAllData, Toast } from "./utils.js";

async function updateSettings() {
  // Seems pointless, it's not
  const data = (await browser.runtime.sendMessage({
    action: "getSettingsData",
  })) as Settings;
  (await browser.runtime.sendMessage({
    action: "setSettingsData",
    data,
  })) as Settings;
}

export async function migrate() {
  await removeLegacyData(); // will reload the page if legacy data is present
  const dataVersion: number = await browser.runtime.sendMessage({
    action: "getDataVersion",
  });
  if (dataVersion < currentDataVersion) {
    // Run some mig in the future
    await browser.runtime.sendMessage({
      action: "setDataVersion",
      version: currentDataVersion,
    });
  }
  const settingsData = await browser.runtime.sendMessage({
    action: "getRawSettingsData",
  });
  if (!settingsData) {
    return;
  }
  if (settingsData.glass !== undefined) {
    return;
  }
  await migrateV6();
}

async function migrateV6() {
  await migrateCustomThemeV6();
  await migrateImagesV6();
  await updateSettings();
  new Toast("Updated to 6.0.0", "info", 10_000).render();
}

async function migrateCustomThemeV6(_customTheme) {
  const oldCustomThemeData = await browser.runtime.sendMessage({
    action: "getCustomThemeData",
  });
  if (!oldCustomThemeData) {
    return;
  }
  const theme: Theme = {
    displayName: "Custom Theme",
    cssProperties: {
      "--color-accent": oldCustomThemeData.color_accent,
      "--color-base00": oldCustomThemeData.color_base00,
      "--color-base01": oldCustomThemeData.color_base01,
      "--color-base02": oldCustomThemeData.color_base02,
      "--color-base03": oldCustomThemeData.color_base03,
      "--color-homepage-sidebars-bg": "#02020585",
      "--color-splashtext": oldCustomThemeData.color_text,
      "--color-text": oldCustomThemeData.color_text,
      "--darken-background": "#00000033",
    },
  };
  const id = await browser.runtime.sendMessage({
    action: "saveCustomTheme",
    data: theme,
  });
  let data = (await browser.runtime.sendMessage({
    action: "getSettingsData",
  })) as Settings;
  if (data.appearance.theme === "custom") {
    await browser.runtime.sendMessage({
      action: "setSetting",
      name: "appearance.theme",
      data: id,
    });
  }
  data = (await browser.runtime.sendMessage({
    action: "getSettingsData",
  })) as Settings;
}

async function migrateImagesV6() {
  browser.runtime.sendMessage({
    action: "migrateImagesV6",
  });
}

async function removeLegacyData() {
  const _rawSettingsData = await browser.runtime.sendMessage({
    action: "getRawSettingsData",
  });
  if (window.localStorage.getItem("settingsdata")) {
    await clearAllData();
  }
}
