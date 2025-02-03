if (browser == undefined) { var browser = chrome };
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveBackgroundImage') {
    browser.storage.local.set({ backgroundImage: message.data }, () => {
      console.log('Background image saved.');
    });
  }
  if (message.action === 'setWeatherAppData') {
    console.log(message.data); 
    browser.storage.local.set({ weatherAppData: message.data }, () => {
        console.log('Weather AppData saved.');
    });
}

  if (message.action === 'getWeatherAppData') {
    browser.storage.local.get("weatherAppData").then((data) => {
        let weatherAppData = data.weatherAppData || {
            weatherData: {}, 
            lastUpdateDate: new Date().toISOString(), 
            lastLocation: message.location || "" 
        };

        weatherAppData.lastUpdateDate = new Date(weatherAppData.lastUpdateDate).toISOString();
        browser.storage.local.set({
            weatherAppData: {
                weatherData: weatherAppData.weatherData, 
                lastUpdateDate: weatherAppData.lastUpdateDate,
                lastLocation: weatherAppData.lastLocation
            }
        });

        sendResponse(weatherAppData); 
        console.log('Retrieved weather AppData.');
    });

    return true;
}
});