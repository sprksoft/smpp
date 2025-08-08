if (typeof browser === "undefined") {
  var browser = chrome;
}

const liteMode = browser.runtime.getManifest().lite_mode;
const plantVersion = 2;
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

function getDefaultSettings(isLite) {
  if (!isLite) {
    return {
      profile: {
        customUserName: null,
      },
      appearance: {
        theme: "ldev",
        enableSMPPLogo: true,
        background: {
          backgroundSelection: 0,
          backgroundLink: null,
          backgroundBlurAmount: 0,
        },
        weatherOverlay: {
          weatherOverlaySelection: 1,
          weatherOverlayAmount: 0,
        },
      },
      topBar: {
        enableGOButton: false,
        enableSearchButton: false,
        enableGCButton: true,
        enableLogoutButton: true,
        enableQuickMenuButton: false,
      },
      features: {
        showNews: true,
        delijn: {
          monochrome: false,
        },
      },
      other: { quicks: [], enablePerfomanceMode: false },
    };
  } else {
    return {
      profile: {
        customUserName: null,
      },
      appearance: {
        theme: "ldev",
        enableSMPPLogo: false,
        background: {
          backgroundSelection: 0,
          backgroundLink: null,
          backgroundBlurAmount: 0,
        },
      },
      topBar: {
        enableGOButton: false,
        enableSearchButton: false,
        enableLogoutButton: true,
        enableQuickMenuButton: false,
      },
      features: {
        showNews: true,
        delijn: {
          monochrome: true,
        },
      },
      other: { quicks: [], enablePerfomanceMode: true },
    };
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

export async function setWidgetData(widgetData) {}

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
  let plantAppData = data.plantAppData || {
    age: 0,
    lastWaterTime: null,
    lastGrowTime: null,
    uniqueColor: "#fff",
    plantVersion: plantVersion,
    birthday: null,
    daysSinceBirthday: 0,
    isAlive: true,
  };
  return plantAppData;
}

export async function getCustomThemeData() {
  let data = await browser.storage.local.get("customThemeData");
  return data.customThemeData || getDefaultCustomThemeData();
}

export async function getDelijnColorData() {
  return {
    kleuren: [
      {
        code: "TU",
        hex: "0099AA",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/TU",
          },
        ],
        omschrijving: "Turkoois",
        rgb: {
          blauw: 170,
          groen: 153,
          rood: 0,
        },
      },
      {
        code: "RZ",
        hex: "FF88AA",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/RZ",
          },
        ],
        omschrijving: "Roze",
        rgb: {
          blauw: 170,
          groen: 136,
          rood: 255,
        },
      },
      {
        code: "OR",
        hex: "EE8822",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/OR",
          },
        ],
        omschrijving: "Oranje",
        rgb: {
          blauw: 34,
          groen: 136,
          rood: 238,
        },
      },
      {
        code: "RO",
        hex: "BB0022",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/RO",
          },
        ],
        omschrijving: "Rood",
        rgb: {
          blauw: 34,
          groen: 0,
          rood: 187,
        },
      },
      {
        code: "PA",
        hex: "991199",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/PA",
          },
        ],
        omschrijving: "Paars",
        rgb: {
          blauw: 153,
          groen: 17,
          rood: 153,
        },
      },
      {
        code: "MA",
        hex: "DD0077",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/MA",
          },
        ],
        omschrijving: "Magenta",
        rgb: {
          blauw: 119,
          groen: 0,
          rood: 221,
        },
      },
      {
        code: "LB",
        hex: "AACCEE",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/LB",
          },
        ],
        omschrijving: "Lichtblauw",
        rgb: {
          blauw: 238,
          groen: 204,
          rood: 170,
        },
      },
      {
        code: "GE",
        hex: "FFCC11",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/GE",
          },
        ],
        omschrijving: "Geel",
        rgb: {
          blauw: 17,
          groen: 204,
          rood: 255,
        },
      },
      {
        code: "GR",
        hex: "229922",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/GR",
          },
        ],
        omschrijving: "Groen",
        rgb: {
          blauw: 34,
          groen: 153,
          rood: 34,
        },
      },
      {
        code: "MU",
        hex: "77CCAA",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/MU",
          },
        ],
        omschrijving: "Munt",
        rgb: {
          blauw: 170,
          groen: 204,
          rood: 119,
        },
      },
      {
        code: "KA",
        hex: "995511",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/KA",
          },
        ],
        omschrijving: "Kastanje",
        rgb: {
          blauw: 17,
          groen: 85,
          rood: 153,
        },
      },
      {
        code: "BL",
        hex: "1199DD",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/BL",
          },
        ],
        omschrijving: "Blauw",
        rgb: {
          blauw: 221,
          groen: 153,
          rood: 17,
        },
      },
      {
        code: "ZA",
        hex: "FFCCAA",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/ZA",
          },
        ],
        omschrijving: "Zalm",
        rgb: {
          blauw: 170,
          groen: 204,
          rood: 255,
        },
      },
      {
        code: "BO",
        hex: "771133",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/BO",
          },
        ],
        omschrijving: "Bordeaux",
        rgb: {
          blauw: 51,
          groen: 17,
          rood: 119,
        },
      },
      {
        code: "KI",
        hex: "444411",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/KI",
          },
        ],
        omschrijving: "Kaki",
        rgb: {
          blauw: 17,
          groen: 68,
          rood: 68,
        },
      },
      {
        code: "DB",
        hex: "0044BB",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/DB",
          },
        ],
        omschrijving: "Donkerblauw",
        rgb: {
          blauw: 187,
          groen: 68,
          rood: 0,
        },
      },
      {
        code: "LG",
        hex: "BBDD00",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/LG",
          },
        ],
        omschrijving: "Lichtgroen",
        rgb: {
          blauw: 0,
          groen: 221,
          rood: 187,
        },
      },
      {
        code: "PE",
        hex: "005555",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/PE",
          },
        ],
        omschrijving: "Petrol",
        rgb: {
          blauw: 85,
          groen: 85,
          rood: 0,
        },
      },
      {
        code: "ST",
        hex: "8899AA",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/ST",
          },
        ],
        omschrijving: "Staal",
        rgb: {
          blauw: 170,
          groen: 153,
          rood: 136,
        },
      },
      {
        code: "WI",
        hex: "FFFFFF",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/WI",
          },
        ],
        omschrijving: "Wit",
        rgb: {
          blauw: 255,
          groen: 255,
          rood: 255,
        },
      },
      {
        code: "GD",
        hex: "FFDD00",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/GD",
          },
        ],
        omschrijving: "GeelDeLijn",
        rgb: {
          blauw: 0,
          groen: 221,
          rood: 255,
        },
      },
      {
        code: "ZW",
        hex: "000000",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/ZW",
          },
        ],
        omschrijving: "Zwart",
        rgb: {
          blauw: 0,
          groen: 0,
          rood: 0,
        },
      },
      {
        code: "CR",
        hex: "C5AA77",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/CR",
          },
        ],
        omschrijving: "CrÃ¨me",
        rgb: {
          blauw: 119,
          groen: 170,
          rood: 197,
        },
      },
      {
        code: "BD",
        hex: "000099",
        links: [
          {
            rel: "detail",
            url: "https://api.delijn.be/DLKernOpenData/api/v1/kleuren/BD",
          },
        ],
        omschrijving: "BlauwDeLijn",
        rgb: {
          blauw: 153,
          groen: 0,
          rood: 0,
        },
      },
    ],
  };
}
