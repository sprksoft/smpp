// Replace 'YOUR_API_KEY' with your actual OpenWeather API key
const apiKey = '2b6f9b6dbe5064dd770f29d4b229a22c';

// Function to get user's current location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve({ latitude, longitude });
                },
                (error) => {
                    reject(error);
                }
            );
        } else {
            reject('Geolocation is not supported by this browser.');
        }
    });
}

// Function to fetch weather data based on user's location
async function getWeatherByLocation() {
    try {
        const { latitude, longitude } = await getUserLocation();
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error fetching data:', error);
    }
}

// ... (previous code remains unchanged)

async function updateWeatherDiv() {
    console.log('Updating weather information based on user location...');
    const weatherData = await getWeatherByLocation();
    if (weatherData) {
        console.log('Weather data:', weatherData);
        const rightContainer = document.getElementById('homepage__block--datepicker');
        const { name, main, weather, rain, wind } = weatherData; // Include rain data
        const temperature = Math.round(main.temp);
        const description = weather[0].description;
        const rainVolume = rain ? rain['1h'] : 0; // Check if rain data
        const humidity = main.humidity;
        const minTemp = Math.round(main.temp_min);
        const maxTemp = Math.round(main.temp_max);
        let windSpeed = Number(wind.speed);
        const mainWeather = weather[0].main;
        windSpeedkmh = Math.round(windSpeed * 3.6); // Convert to km/h

        // Update the content of the div with unique classes
        rightContainer.innerHTML = `
            <h2 class="weather-location">Weather in ${name}</h2>
            <div class="weather">
    <img src="weathericons/rain.svg" class="weather-icon">
</div>
            <p class="weather-temperature">Temperature: ${temperature}°C</p>
            <p class="weather-main">Main Weather: ${mainWeather}</p>
            <p class="weather-description">Description: ${description}</p>
            <p class="weather-humidity">Humidity: ${humidity}%</p>
            <p class="weather-min-temp">Min Temperature: ${minTemp}°C</p>
            <p class="weather-max-temp">Max Temperature: ${maxTemp}°C</p>
            <p class="weather-wind-speed">Wind Speed: ${windSpeedkmh} km/h</p>
            <p class="weather-rain-volume">Rain (last hour): ${rainVolume} mm</p> <!-- Display rain volume -->
        `;
    }
}

// Call the function to update the 'rightcontainer' div based on user's location
updateWeatherDiv();


// Call the function to update the 'rightcontainer' div based on user's location
updateWeatherDiv();
