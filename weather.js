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

async function updateWeatherDiv() {
    console.log('Updating weather information based on user location...');
    const weatherData = await getWeatherByLocation();
    if (weatherData) {
        console.log('Weather data:', weatherData);
        const rightContainer = document.getElementById('rightcontainer');
        const { name, main, weather, rain, wind } = weatherData; // Include rain data
        const temperature = Math.round(main.temp);
        const description = weather[0].description;
        const rainVolume = rain ? rain['1h'] : 0; // Check if rain data
        const humidity = main.humidity;
        const minTemp = Math.round(main.temp_min);
        const maxTemp = Math.round(main.temp_max);
        const windSpeed = wind.speed;
        const mainWeather = weather[0].main;

        // Update the content of the div
        rightContainer.innerHTML = `
            <h2>Weather in ${name}</h2>
            <p>Temperature: ${temperature}°C</p>
            <p>Main Weather: ${mainWeather}</p>
            <p>Description: ${description}</p>
            <p>Humidity: ${humidity}%</p>
            <p>Min Temperature: ${minTemp}°C</p>
            <p>Max Temperature: ${maxTemp}°C</p>
            <p>Wind Speed: ${windSpeed} m/s</p>
            <p>Rain (last hour): ${rainVolume} mm</p> <!-- Display rain volume -->
        `;
    }
}

// Call the function to update the 'rightcontainer' div based on user's location
updateWeatherDiv();
