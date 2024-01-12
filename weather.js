// Replace 'YOUR_API_KEY' with your actual OpenWeather API key
const apiKey = '2b6f9b6dbe5064dd770f29d4b229a22c';

async function getWeatherByCity(city) {
  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error fetching data:', error);
  }
}
// ... (previous code remains unchanged)

async function updateWeatherDiv(weatherData) {
  if (!weatherData) {
    return;
  }
  const rightContainer = document.getElementById('rightcontainer');

  if (!rightContainer) {
    return;
  }

  rightContainer.innerHTML = '';
  weatherdiv = document.createElement("div");
  console.log(weatherData);
  const { name, main, weather, rain, wind } = weatherData; // Include rain data
  const temperature = Math.round(main.temp);
  const feelslike = Math.round(main.feels_like);
  const description = weather[0].description;
  const humidity = main.humidity;
  let windSpeed = Number(wind.speed);
  const mainWeather = weather[0].main;
  windSpeedkmh = Math.round(windSpeed * 3.6); // Convert to km/h

  let lastupdate_date = new Date(window.localStorage.getItem("lastupdate"));
  const currentdate = new Date();
  let difference = Math.abs(lastupdate_date - currentdate) / 1000 / 60

  difference = Math.round(difference)
  // Update the content of the div with unique classes
  try {
    weatherdiv.innerHTML = `<div class="weatherdiv">
            <h2 class="weather-location"></h2>

            <h2 class="weather-main"></h2>
            <div class="weather">
              <div src="https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/chanceflurries.svg" class="weather-icon"></div>
            </div>
            <p class="weather-temperature"></p>
            <p class="weather-feelslike"></p>
            <div class="weather-humwind">
            <div class="col"> <img src='https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/humidity.png'><div>
            <p class="weather-humidity"></p>
            <p class="weather-humidity"></p>
            <p class="weather-humidity">Humidity</p></div>
            </div>
            <div class="weather-humwind">
            <div class="col"> <img src='https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/wind.png'><div>
            <p class="weather-wind"></p>
            <p class="weather-wind"></p>
            <p class="weather-wind">Wind Speed</p></div>
            </div>
            </div>

            </div>
            <p class="weather-lastupdate"></p>
            </div>
        `;
    weatherdiv.querySelector(".weather-location").innerText = name;

    weatherdiv.querySelector(".weather-main").innerText = mainWeather;
    weatherdiv.querySelector(".weather-temperature").innerText = temperature + "°C";
    weatherdiv.querySelector(".weather-feelslike").innerText = "Feels like " + feelslike + "°C";
    weatherdiv.querySelector(".weather-humidity").innerText = humidity + "%";
    weatherdiv.querySelector(".weather-wind").innerText = windSpeedkmh + "km/h";
    if (difference == 0) {
      weatherdiv.querySelector(".weather-lastupdate").innerText = "Now";
    } else {
      weatherdiv.querySelector(".weather-lastupdate").innerText = difference + " min ago";
    }
    const weatherIcon = weatherdiv.querySelector('.weather-icon');
    set_snow_multiplier(mainWeather == "Snow");

    if (description == "broken clouds") {
      weatherIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-mostlycloudy" class="weather-icon weather-icon-white mostlycloudy" viewBox="0 0 64 64"><style>.st0{fill:#F4A71D;}</style><g id="mostlycloudy"><path class="st0" d="M43.1 13.9c-.7 0-1.2-.6-1.2-1.2V9.2c0-.7.6-1.2 1.2-1.2.7 0 1.2.6 1.2 1.2v3.4c0 .7-.5 1.3-1.2 1.3zM57.6 25h-3.4c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2h3.4c.7 0 1.2.5 1.2 1.2.1.7-.5 1.2-1.2 1.2zM51.3 17.1c-.3 0-.6-.1-.9-.4-.5-.5-.5-1.3 0-1.7l2.4-2.4c.5-.5 1.3-.5 1.7 0 .5.5.5 1.3 0 1.7l-2.4 2.4c-.1.3-.5.4-.8.4zM53.7 35.4c-.3 0-.6-.1-.9-.4l-2.4-2.4c-.5-.5-.5-1.3 0-1.7.5-.5 1.3-.5 1.7 0l2.4 2.4c.5.5.5 1.3 0 1.7-.1.3-.5.4-.8.4zM35.3 17.2c-.3 0-.6-.1-.9-.4L32 14.5c-.5-.5-.5-1.3 0-1.7.5-.5 1.3-.5 1.7 0l2.4 2.4c.5.5.5 1.3 0 1.7-.2.2-.5.3-.8.3z"/><path class="st1" d="M45.6 57.8H16c-5.1 0-9.3-4.2-9.3-9.3 0-4 2.6-7.6 6.3-8.8v-.2c0-4.7 3.8-8.5 8.5-8.5 1.1 0 2.2.2 3.2.7 2.2-3.4 6-5.4 10.1-5.4 6.7 0 12.2 5.5 12.2 12.2 0 .7-.1 1.4-.2 2.1 4.2.6 7.5 4.2 7.5 8.6-.1 4.7-3.9 8.6-8.7 8.6zM21.4 33.7c-3.2 0-5.8 2.6-5.8 5.8 0 .3 0 .6.1 1l.2 1.3-1.3.2c-3.1.6-5.3 3.4-5.3 6.5 0 3.7 3 6.7 6.7 6.7h29.6c3.3 0 6-2.7 6-6s-2.7-6-6-6h-.3l-2 .1.6-1.9c.3-.9.5-1.9.5-2.9 0-5.3-4.3-9.5-9.5-9.5-3.5 0-6.8 2-8.4 5.1l-.7 1.3-1.2-.7c-1-.8-2.1-1-3.2-1z"/><path class="st0" d="M44.6 16c-4.2-.8-8.2 2-8.9 6.2-.1.4-.1.7-.1 1.1-.1.5.3 1 .9 1.1 1.1.1 1-1 1.2-1.7.6-3.1 3.5-5.1 6.6-4.6 3.1.6 5.1 3.5 4.6 6.6-.1.7-.3 1.4-.7 2-.5.7-1.3 1.3-2 1.8-.6.4-.3 1.3.4 1.4.8.2 1.5-.4 2.1-1 .7-.6 1.3-1.5 1.7-2.4.2-.5.4-1 .5-1.5.7-4.3-2.1-8.3-6.3-9z"/></g></svg>`
    }
    else if (description == "few clouds" || description == "scattered clouds") {
      weatherIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-mostlysunny" class="weather-icon weather-icon-white mostlysunny" viewBox="0 0 64 64"><style>.st0{fill:#F4A71D;}</style><g id="mostlysunny"><path class="st0" d="M35.5 15.3c-.7 0-1.3-.6-1.3-1.3V9c0-.7.6-1.3 1.3-1.3.7 0 1.3.6 1.3 1.3v5c0 .7-.6 1.3-1.3 1.3zM19.2 31.6h-5c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3h5c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3zM56.7 31.6h-5c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3h5c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3zM47.5 20c-.3 0-.7-.1-.9-.4-.5-.5-.5-1.4 0-1.9l3.5-3.5c.5-.5 1.4-.5 1.9 0s.5 1.4 0 1.9l-3.5 3.5c-.3.2-.7.4-1 .4zM51 46.8c-.3 0-.7-.1-.9-.4l-3.5-3.5c-.5-.5-.5-1.4 0-1.9s1.3-.5 1.9 0l3.5 3.5c.5.5.5 1.4 0 1.9-.3.2-.7.4-1 .4zM24 20.2c-.3 0-.7-.1-.9-.4l-3.5-3.5c-.5-.5-.5-1.4 0-1.9s1.3-.5 1.9 0l3.5 3.5c.5.5.5 1.4 0 1.9-.3.3-.7.4-1 .4z"/><path class="st1" d="M33.4 58.2h-20c-3.7 0-6.7-3-6.7-6.7 0-2.8 1.7-5.3 4.3-6.3.1-3.3 2.8-6 6.2-6 .7 0 1.4.1 2 .4 1.6-2.2 4.2-3.6 7-3.6 4.8 0 8.7 3.9 8.7 8.7 0 .4 0 .7-.1 1.1 2.8.6 5 3.1 5 6.2-.1 3.4-2.9 6.2-6.4 6.2zM17.1 41.9c-1.9 0-3.5 1.6-3.5 3.5 0 .2 0 .4.1.6l.2 1.3-1.3.3c-1.9.4-3.3 2.1-3.3 4 0 2.2 1.8 4.1 4.1 4.1h20c2 0 3.6-1.6 3.6-3.6s-1.6-3.6-3.6-3.6h-.2l-2 .1.6-1.9c.2-.6.3-1.2.3-1.9 0-3.3-2.7-6-6-6-2.2 0-4.3 1.2-5.3 3.2l-.7 1.3-1.2-.7c-.5-.5-1.2-.7-1.8-.7z"/><path class="st0" d="M47.5 30.3c0-6.6-5.4-12-12-12s-12 5.4-12 12c0 .7.1 1.4.2 2 0 .8.7 1.4 1.4 1.3.4 0 1-.3 1.1-.7.2-.5.1-1 0-1.5-.1-.4-.1-.8-.1-1.1 0-5.2 4.2-9.4 9.4-9.4s9.3 4.2 9.3 9.4c0 .4-.1.8-.1 1.2-.1.4-.1.8-.2 1.2-.2.7-.5 1.5-.8 2.1-.4.7-.8 1.3-1.3 1.9-.5.6-1.1 1.1-1.7 1.4-.7.4-1.4.7-2.1 1-.3.1-.6.1-.9.3-.3.1-.5.4-.6.7-.1.2-.1.3-.1.5 0 .7.6 1.3 1.4 1.4 5.1-1.1 9.1-6.1 9.1-11.7z"/></g></svg>`
    }
    else if (description == "overcast clouds") {
      weatherIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-cloudy" class="weather-icon weather-icon-white cloudy" viewBox="0 0 64 64"><style>.st0{fill:#FFFFFF;}</style><path class="st0" d="M49.7 50.2H16.8c-5.6 0-10.2-4.6-10.2-10.2 0-4.4 2.9-8.3 7-9.7V30c0-5.1 4.2-9.3 9.3-9.3 1.3 0 2.5.3 3.7.8 2.5-3.7 6.6-6 11.2-6 7.4 0 13.4 6 13.4 13.4 0 .8-.1 1.6-.2 2.4 4.7.6 8.3 4.6 8.3 9.4-.1 5.2-4.4 9.5-9.6 9.5zM22.9 23.4c-3.6 0-6.6 3-6.6 6.6 0 .3 0 .7.1 1.1l.2 1.3-1.3.2c-3.5.7-6.1 3.8-6.1 7.4 0 4.2 3.4 7.5 7.5 7.5h32.9c3.8 0 6.8-3.1 6.8-6.8 0-3.8-3.1-6.8-6.8-6.8h-.3l-2 .1.6-1.9c.3-1.1.5-2.2.5-3.3 0-5.9-4.8-10.7-10.7-10.7-4 0-7.6 2.2-9.5 5.7l-.7 1.3-1.2-.7c-1-.7-2.2-1-3.4-1z" id="cloudy"/></svg>`
    }
    else if (mainWeather == "Clouds") {
      weatherIcon.innerHTML = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/cloudy.svg'
    }
    else if (mainWeather == "Clear") {
      weatherIcon.innerHTML = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/clear.svg'
    }
    else if (mainWeather == "Rain") {
      weatherIcon.innerHTML = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/rain.svg'
    }
    else if (mainWeather == "Drizzle") {
      weatherIcon.innerHTML = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/chancerain.svg'
    }
    else if (mainWeather == "Mist" || mainWeather == "Fog" || mainWeather == "Squall" || mainWeather == "Smoke" || mainWeather == "Haze") {
      weatherIcon.innerHTML = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/fog.svg'
    }
    else if (mainWeather == "Snow") {
      weatherIcon.innerHTML = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/snow.svg'
    }
    else if (mainWeather == "Thunderstorm") {
      weatherIcon.innerHTML = 'https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/tstorms.svg'
    }
  }
  catch (e) {
    console.log(e);
  }
  rightContainer.appendChild(weatherdiv);
  snakeGame()
  console.log('Weather information updated.');
}

async function loadOldData() {
  console.log("Loading old data from localstorage")
  //FIXME: when undefined is in local storage this like errors
  let weatherData = JSON.parse(window.localStorage.getItem("weatherdata"));
  updateWeatherDiv(weatherData);
}


async function set_weather_loc(loc) {
  const currentdate = new Date();


  if (!document.getElementById('rightcontainer')) {
    console.log("Not on home page, no weather needed")
    return;
  }
  else if (loc == "") {
    document.getElementById('rightcontainer').innerHTML = "";
    console.log("No location provided, no weather needed")
    return;
  }
  console.log('Fetching weather information for location: ' + loc);
  if (window.localStorage.getItem("lastupdate") == undefined) {
    window.localStorage.setItem("lastupdate", currentdate)
    window.localStorage.setItem("lastlocation", loc)
  }

  let lastupdate_date = new Date(window.localStorage.getItem("lastupdate"));

  let difference = Math.abs(lastupdate_date - currentdate) / 1000; // Difference in seconds

  if (difference > 600 || loc != (window.localStorage.getItem("lastlocation")) || !(window.localStorage.getItem("weatherdata"))) {
    window.localStorage.setItem("lastupdate", currentdate)
    window.localStorage.setItem("lastlocation", loc)
    let weatherData = await getWeatherByCity(loc);
    if (weatherData == undefined) {
      return;
    }

    console.log('Weather data:', weatherData);
    updateWeatherDiv(weatherData);
    console.log("storing new weather data")
    window.localStorage.setItem("weatherdata", JSON.stringify(weatherData))
  } else (
    loadOldData()
  )
  console.log("seconds since last update: ", difference)
}
