const apiKey = '2b6f9b6dbe5064dd770f29d4b229a22c';
export async function fetchWeatherData(location) {
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log("fetching data")
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}