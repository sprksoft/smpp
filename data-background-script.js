if (typeof browser === 'undefined') { var browser = chrome; }
import { fetchDelijnData } from './api-background-script.js';

export async function getWeatherAppData(location) {
    try {
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
        console.log('Retrieved weather AppData.');
        return weatherAppData;
    } catch (error) {
        console.error('Error retrieving weather AppData:', error);
    }
}
export async function getDelijnAppData() {
    try {
        let data = await browser.storage.local.get("delijnAppData");
        let delijnAppData = data.delijnAppData || {
            entiteitnummer: null,
            haltenummer: null,
        };

        await browser.storage.local.set({
            delijnAppData: {
                entiteitnummer: delijnAppData.entiteitnummer,
                haltenummer: delijnAppData.haltenummer,
            }
        });
        console.log('Retrieved Delijn AppData.');
        return delijnAppData;
    } catch (error) {
        console.error('Error retrieving Delijn AppData:', error);
    }
}

export async function getDelijnColorData() {
    try {
        let data = await browser.storage.local.get("delijnColorData");
        let delijnColorData;
        if (data.delijnColorData.kleuren){
            delijnColorData = data.delijnColorData
        }else {
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