if (typeof browser === 'undefined') { var browser = chrome; }

import { getWeatherAppData, getDelijnAppData, getDelijnColorData } from './data-background-script.js';
import { fetchWeatherData, fetchDelijnData } from './api-background-script.js';

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    // General
    if (message.action === 'clearLocalStorage') {
      browser.storage.local.clear()
      sendResponse({ succes: true });
      console.log('Cleared browser storage');
    }
    // Background image
    if (message.action === 'saveBackgroundImage') {
      await browser.storage.local.set({ backgroundImage: message.data });
      sendResponse({ succes: true });
      console.log('Background image saved.');
    }
    // Weather
    if (message.action === 'setWeatherAppData') {
      await browser.storage.local.set({ weatherAppData: message.data });
      sendResponse({ succes: true });
      console.log('Weather appdata saved.');
    }
    if (message.action === 'getWeatherAppData') {
      const weatherAppData = await getWeatherAppData(message.location);
      sendResponse(weatherAppData);
      console.log('Weather appdata sent.');
    }
    if (message.action === 'fetchWeatherData') {
      const weatherData = await fetchWeatherData(message.location);
      sendResponse(weatherData);
      console.log('Weather data fetched and sent.');
    }
    // Delijn
    if (message.action === 'setDelijnAppData') {
      await browser.storage.local.set({ delijnAppData: message.data });
      sendResponse({ succes: true });
      console.log('Delijn appdata saved.');
    }
    if (message.action === 'getDelijnAppData') {
      const delijnAppData = await getDelijnAppData();
      sendResponse(delijnAppData);
      console.log('Delijn appdata sent.');
    }
    if (message.action === 'fetchDelijnData') {
      const delijnData = await fetchDelijnData(message.url);
      sendResponse(delijnData);
      console.log('Delijn appdata fetched and sent.');
    }
    if (message.action === 'getDelijnColorData') {
      let delijnColorData = await getDelijnColorData()
      sendResponse(delijnColorData);
      console.log('Delijn color data fetched and sent.');
    }

    // Widgets
    if (message.action = "getEnabledWidgets"){
      let data = await browser.storage.local.get("widgets");
      let enabledWidgets = data.enabledWidgets;
      if (enabledWidgets == undefined){
        sendResponse([]);
      }else{
        sendResponse(enabledWidgets);
      }
    }
  })();
  return true;
});
