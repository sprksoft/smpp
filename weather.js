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
    const rightContainer = document.getElementById('rightcontainer');



    if (rightContainer == undefined){
      return;
    }
    rightContainer.innerHTML = ''; 
    weatherdiv = document.createElement("div");
    console.log('Updating weather information based on user location...');
    const weatherData = await getWeatherByLocation();
    if (weatherData) {
        console.log('Weather data:', weatherData);
        const { name, main, weather, rain, wind } = weatherData; // Include rain data
        const temperature = Math.round(main.temp);
        const description = weather[0].description;
        const humidity = main.humidity;
        let windSpeed = Number(wind.speed);
        const mainWeather = weather[0].main;
        windSpeedkmh = Math.round(windSpeed * 3.6); // Convert to km/h

        
        // Update the content of the div with unique classes
        try {
            weatherdiv.innerHTML = `<div class="weatherdiv">
            <h2 class="weather-location">${name}</h2>
            <h2 class="weather-main">${mainWeather}</h2>
            <div class="weather">
    <img src="https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/chanceflurries.svg" class="weather-icon">
</div>
            <p class="weather-temperature">${temperature}°C</p>
            <div class="weather-humwind">
            <div class="col"> <img src='https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/humidity.png'><div>
            <p class="weather-humidity"></p>
            <p class="weather-humidity">${humidity}%</p>
            <p class="weather-humidity">Humidity</p></div>
            </div>
            <div class="weather-humwind">
            <div class="col"> <img src='https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/wind.png'><div>
            <p class="weather-wind"></p>
            <p class="weather-wind">${windSpeedkmh} km/h</p>
            <p class="weather-wind">Wind Speed</p></div>
            </div>
            </div>

            </div>
            </div>
        `;

        const weatherIcon = document.querySelector('.weather-icon');
        if(description == "broken clouds"){
            weatherIcon.src = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/mostlycloudy.svg'
        }
        else if(description == "few clouds" || description == "scattered clouds"){
            weatherIcon.src = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/mostlysunny.svg'
        }
        else if(description == "overcast clouds"){
            weatherIcon.src = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/cloudy.svg'
        }
        else if(mainWeather == "Clouds"){
            weatherIcon.src = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/cloudy.svg'
        }
        else if (mainWeather == "Clear"){
            weatherIcon.src = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/clear.svg'
        }
        else if (mainWeather == "Rain"){
            weatherIcon.src = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/rain.svg'
        }
        else if (mainWeather == "Drizzle"){
            weatherIcon.src = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/chancerain.svg'
        }
        else if (mainWeather == "Mist" || mainWeather == "Fog"|| mainWeather == "Squall"|| mainWeather == "Smoke"|| mainWeather == "Haze"){
            weatherIcon.src = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/fog.svg'
        }
        else if (mainWeather == "Snow"){
            weatherIcon.src = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/snow.svg'
        }
        else if (mainWeather == "Thunderstorm"){
            weatherIcon.src = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/tstorms.svg'
        }
    }
         catch (e) {
            console.log(e); 
        }
        rightContainer.appendChild(weatherdiv);
        console.log('Weather information updated.');
}
}
// Call the function to update the 'rightcontainer' div based on user's location
updateWeatherDiv();

