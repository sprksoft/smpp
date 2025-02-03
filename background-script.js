if (typeof browser === 'undefined') { var browser = chrome; }

import { getWeatherAppData } from './data-background-script.js';
import { fetchWeatherData } from './api-background-script.js';

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.action === 'saveBackgroundImage') {
      await browser.storage.local.set({ backgroundImage: message.data });
      sendResponse({ succes: true });
      console.log('Background image saved.');
    }
    if (message.action === 'setWeatherAppData') {
      console.log(message.data);
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
  })();
  return true;
});
