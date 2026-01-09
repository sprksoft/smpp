// @ts-nocheck
import { clearAllData } from "./utils.js";
import { setWidgetSetting, widgets } from "../widgets/widgets.js";
import { browser } from "../common/utils.ts";

export async function migrate() {
  await removeLegacyData(); // will reload the page if legacy data is present

  let settingsData = await browser.runtime.sendMessage({
    action: "getRawSettingsData",
  });
  if (settingsData == undefined) return;
  if (settingsData.backgroundBlurAmount == undefined) return;
  await migrateV5(settingsData);
}

async function migrateV5(settingsData) {
  console.log("MIG V:\n Started migration with", settingsData);
  await migrateSettingsV5(settingsData);
  await migrateImageV5(settingsData);
  await migrateWidgetSettingsData();
}

async function migrateWidgetSettingsData() {
  let delijnAppData = await browser.runtime.sendMessage({
    action: "getDelijnAppData",
  });
  let weatherAppData = await browser.runtime.sendMessage({
    action: "getWeatherAppData",
  });

  if (Object.keys(delijnAppData).length !== 0) {
    await setWidgetSetting("DelijnWidget.halte", {
      entiteit: delijnAppData.delijnAppData.entiteitnummer,
      nummer: delijnAppData.delijnAppData.haltenummer,
    });
  }
  if (Object.keys(weatherAppData).length !== 0) {
    let weatherWidgets = widgets.filter((item) =>
      item.name.toLowerCase().includes("weather")
    );
    weatherWidgets.forEach(async (widget) => {
      await widget.setSetting(
        "currentLocation",
        weatherAppData.weatherAppData.lastLocation
      );
    });
  }
}

async function migrateImageV5(oldData) {
  let data;
  switch (oldData.backgroundSelection) {
    case 0: //default
      data = {
        imageData: null,
        link: "",
        type: "default",
      };
      break;
    case 1: //link
      data = {
        imageData: oldData.backgroundLink,
        link: oldData.backgroundLink,
        type: "link",
      };
      break;
    case 2: //file
      let imageData = await browser.runtime.sendMessage({
        action: "getBackgroundImage",
      });
      data = {
        imageData: imageData.backgroundImage,
        link: oldData.backgroundLink,
        type: "file",
      };
      break;
    default:
      break;
  }

  await browser.runtime.sendMessage({
    action: "setImage",
    id: "backgroundImage",
    data: data,
  });

  console.log(
    "MIG V: \n Successfully migrated background image  with data:",
    data
  );
}

async function migrateSettingsV5(oldData) {
  let newWeatherOverlayType;
  switch (oldData.weatherOverlaySelection) {
    case 0:
      newWeatherOverlayType = "snow";
      break;
    case 1:
      newWeatherOverlayType = "realtime";
      break;
    case 2:
      newWeatherOverlayType = "snow";
      break;
  }
  console.log(oldData);
  console.log(oldData.customName);
  let newSettingsData = {
    username: oldData.customName,
    theme: oldData.theme,
    background: {
      blur: oldData.backgroundBlurAmount,
    },
    weatherOverlay: {
      type: newWeatherOverlayType,
      amount: oldData.weatherOverlayAmount,
    },
    tabLogo: oldData.enableSMPPLogo ? "smpp" : "sm",
    news: oldData.showNews,
    quicks: oldData.quicks,
    performanceMode: oldData.enablePerfomanceMode,
  };

  await browser.runtime.sendMessage({
    action: "setRawSettingsData",
    data: newSettingsData,
  });

  // Don't mind this, we don't talk about this, and we never remove it
  const settings = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });
  await browser.runtime.sendMessage({
    action: "setSettingsData",
    data: settings,
  });

  console.log(
    "MIG V: \n Succesfully migrated settings data to:",
    newSettingsData
  );
}

async function removeLegacyData() {
  if (window.localStorage.getItem("settingsdata")) {
    await clearAllData();
  }
}
