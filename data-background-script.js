if (typeof browser === 'undefined') { var browser = chrome; }

export async function getWeatherAppData(location) {
    try {
        let data = await browser.storage.local.get("weatherAppData");
        let weatherAppData = data.weatherAppData || {
            weatherData: {},
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
        console.log('Retrieved weather AppData.');
        return weatherAppData;
    } catch (error) {
        console.error('Error retrieving weather AppData:', error);
    }
}