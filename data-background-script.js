if (typeof browser === 'undefined') { var browser = chrome; }
const liteMode = browser.runtime.getManifest().lite_mode
import { fetchDelijnData } from './api-background-script.js';

function getDefaultSettings(isLite){
  if (isLite){
    return {
      theme: "ldev",
      enableSMPPLogo: true,
      enablePerfomanceMode: true,
      backgroundSelection: 0,
      backgroundLink: null,
    }
  }
  return {
    theme: "ldev",
    enableSMPPLogo: true,
    enablePerfomanceMode: false,
    backgroundSelection: 0,
    backgroundLink: null,
    weatherOverlaySelector: 1,
    weatherOverlayAmount:0
  }
}

export async function getSettingsData() {
  let data = await browser.storage.local.get("weatherAppData");
  return data.settingsData || getDefaultSettings(liteMode);
}

export async function getWidgetData() {
  let data = await browser.storage.local.get("widgets");
  return data.widgets || {
    leftPannels: [],
    rightPannels: [
      {
        widgets:[ "TestWidget" ]
      }
    ],
  };

}

export async function getWeatherAppData(location) {
  let data = await browser.storage.local.get("weatherAppData");
  let weatherAppData = data.weatherAppData || {
    weatherData: null,
    lastUpdateDate: new Date().toISOString(),
    lastLocation: location || ""
  };

  weatherAppData.lastUpdateDate = new Date(weatherAppData.lastUpdateDate).toISOString();

  await browser.storage.local.set({
    weatherAppData: {
      weatherData: weatherAppData.weatherData,
      lastUpdateDate: weatherAppData.lastUpdateDate,
      lastLocation: weatherAppData.lastLocation
    }
  });

  return weatherAppData;
}

export async function getDelijnColorData() {
  try {
    let data = await browser.storage.local.get("delijnColorData");
    let delijnColorData;
    if (data.delijnColorData?.kleuren != undefined) {
      delijnColorData = data.delijnColorData
    } else {
      delijnColorData = await fetchDelijnData("https://api.delijn.be/DLKernOpenData/api/v1/kleuren")
    }

    await browser.storage.local.set({
      delijnColorData: delijnColorData
    });
    console.log('Retrieved Delijn Color Data.');
    return delijnColorData;
  } catch (error) {
    console.error('Error retrieving Delijn Color Data:', error);
  }
}

export async function getDelijnAppData() {
  let data = await browser.storage.local.get("delijnAppData");
  let delijnAppData = data.delijnAppData || {
    entiteitnummer: null,
    haltenummer: null,
  };

  return delijnAppData;
}
