async function updateWeatherDiv(weatherData, isBig, timeDifference) {
  const rightContainer = document.getElementById('weathercontainer');
  const weatherDiv = document.createElement("div");
  const { name, main, weather, wind } = weatherData;
  const temperature = Math.round(main.temp);
  const feelsLike = Math.round(main.feels_like);
  const description = weather[0].description;
  const humidity = main.humidity;
  const windSpeed = Number(wind.speed);
  const mainWeather = weather[0].main;
  const windSpeedKMH = Math.round(windSpeed * 3.6);
  const timeDifferenceMins = Math.round(Math.abs(timeDifference) / 60)

  try {
    weatherDiv.innerHTML = isBig ? weatherHTML : weatherHTMLTiny

    weatherDiv.querySelector(".weather-location").innerText = name;
    weatherDiv.querySelector(".weather-main").innerText = mainWeather;
    if (weatherDiv.querySelector(".weather-temperature").innerText = temperature + "°C") {
      weatherDiv.querySelector(".weather-temperature").innerText = temperature + "°C";
    }
    if (weatherDiv.querySelector(".weather-feelslike")) {
      weatherDiv.querySelector(".weather-feelslike").innerText = "Feels like " + feelsLike + "°C";
    }
    weatherDiv.querySelector(".weather-humidity").innerText = humidity + "%";
    weatherDiv.querySelector(".weather-wind").innerText = windSpeedKMH + "km/h";
    if (timeDifferenceMins == 0) {
      weatherDiv.querySelector(".weather-lastupdate").innerText = "Now";
    } else {
      weatherDiv.querySelector(".weather-lastupdate").innerText = timeDifferenceMins + " min ago";
    }
    const weatherIcon = weatherDiv.querySelector('.weather-icon');
    set_snow_multiplier(mainWeather == "Snow");
    set_rain_multiplier(mainWeather == "Rain" || mainWeather == "Drizzle")
    if (description == "broken clouds") {
      weatherIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-mostlycloudy" class="weather-icon weather-icon-white mostlycloudy" viewBox="0 0 64 64"><style>.st0{fill:#F4A71D;}</style><g id="mostlycloudy"><path class="st0" d="M43.1 13.9c-.7 0-1.2-.6-1.2-1.2V9.2c0-.7.6-1.2 1.2-1.2.7 0 1.2.6 1.2 1.2v3.4c0 .7-.5 1.3-1.2 1.3zM57.6 25h-3.4c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2h3.4c.7 0 1.2.5 1.2 1.2.1.7-.5 1.2-1.2 1.2zM51.3 17.1c-.3 0-.6-.1-.9-.4-.5-.5-.5-1.3 0-1.7l2.4-2.4c.5-.5 1.3-.5 1.7 0 .5.5.5 1.3 0 1.7l-2.4 2.4c-.1.3-.5.4-.8.4zM53.7 35.4c-.3 0-.6-.1-.9-.4l-2.4-2.4c-.5-.5-.5-1.3 0-1.7.5-.5 1.3-.5 1.7 0l2.4 2.4c.5.5.5 1.3 0 1.7-.1.3-.5.4-.8.4zM35.3 17.2c-.3 0-.6-.1-.9-.4L32 14.5c-.5-.5-.5-1.3 0-1.7.5-.5 1.3-.5 1.7 0l2.4 2.4c.5.5.5 1.3 0 1.7-.2.2-.5.3-.8.3z"/><path class="st1" d="M45.6 57.8H16c-5.1 0-9.3-4.2-9.3-9.3 0-4 2.6-7.6 6.3-8.8v-.2c0-4.7 3.8-8.5 8.5-8.5 1.1 0 2.2.2 3.2.7 2.2-3.4 6-5.4 10.1-5.4 6.7 0 12.2 5.5 12.2 12.2 0 .7-.1 1.4-.2 2.1 4.2.6 7.5 4.2 7.5 8.6-.1 4.7-3.9 8.6-8.7 8.6zM21.4 33.7c-3.2 0-5.8 2.6-5.8 5.8 0 .3 0 .6.1 1l.2 1.3-1.3.2c-3.1.6-5.3 3.4-5.3 6.5 0 3.7 3 6.7 6.7 6.7h29.6c3.3 0 6-2.7 6-6s-2.7-6-6-6h-.3l-2 .1.6-1.9c.3-.9.5-1.9.5-2.9 0-5.3-4.3-9.5-9.5-9.5-3.5 0-6.8 2-8.4 5.1l-.7 1.3-1.2-.7c-1-.8-2.1-1-3.2-1z"/><path class="st0" d="M44.6 16c-4.2-.8-8.2 2-8.9 6.2-.1.4-.1.7-.1 1.1-.1.5.3 1 .9 1.1 1.1.1 1-1 1.2-1.7.6-3.1 3.5-5.1 6.6-4.6 3.1.6 5.1 3.5 4.6 6.6-.1.7-.3 1.4-.7 2-.5.7-1.3 1.3-2 1.8-.6.4-.3 1.3.4 1.4.8.2 1.5-.4 2.1-1 .7-.6 1.3-1.5 1.7-2.4.2-.5.4-1 .5-1.5.7-4.3-2.1-8.3-6.3-9z"/></g></svg>`
    }
    else if (description == "few clouds" || description == "scattered clouds") {
      weatherIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-mostlysunny" class="weather-icon weather-icon-white mostlysunny" viewBox="0 0 64 64"><style>.st0{fill:#F4A71D;}</style><g id="mostlysunny"><path class="st0" d="M35.5 15.3c-.7 0-1.3-.6-1.3-1.3V9c0-.7.6-1.3 1.3-1.3.7 0 1.3.6 1.3 1.3v5c0 .7-.6 1.3-1.3 1.3zM19.2 31.6h-5c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3h5c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3zM56.7 31.6h-5c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3h5c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3zM47.5 20c-.3 0-.7-.1-.9-.4-.5-.5-.5-1.4 0-1.9l3.5-3.5c.5-.5 1.4-.5 1.9 0s.5 1.4 0 1.9l-3.5 3.5c-.3.2-.7.4-1 .4zM51 46.8c-.3 0-.7-.1-.9-.4l-3.5-3.5c-.5-.5-.5-1.4 0-1.9s1.3-.5 1.9 0l3.5 3.5c.5.5.5 1.4 0 1.9-.3.2-.7.4-1 .4zM24 20.2c-.3 0-.7-.1-.9-.4l-3.5-3.5c-.5-.5-.5-1.4 0-1.9s1.3-.5 1.9 0l3.5 3.5c.5.5.5 1.4 0 1.9-.3.3-.7.4-1 .4z"/><path class="st1" d="M33.4 58.2h-20c-3.7 0-6.7-3-6.7-6.7 0-2.8 1.7-5.3 4.3-6.3.1-3.3 2.8-6 6.2-6 .7 0 1.4.1 2 .4 1.6-2.2 4.2-3.6 7-3.6 4.8 0 8.7 3.9 8.7 8.7 0 .4 0 .7-.1 1.1 2.8.6 5 3.1 5 6.2-.1 3.4-2.9 6.2-6.4 6.2zM17.1 41.9c-1.9 0-3.5 1.6-3.5 3.5 0 .2 0 .4.1.6l.2 1.3-1.3.3c-1.9.4-3.3 2.1-3.3 4 0 2.2 1.8 4.1 4.1 4.1h20c2 0 3.6-1.6 3.6-3.6s-1.6-3.6-3.6-3.6h-.2l-2 .1.6-1.9c.2-.6.3-1.2.3-1.9 0-3.3-2.7-6-6-6-2.2 0-4.3 1.2-5.3 3.2l-.7 1.3-1.2-.7c-.5-.5-1.2-.7-1.8-.7z"/><path class="st0" d="M47.5 30.3c0-6.6-5.4-12-12-12s-12 5.4-12 12c0 .7.1 1.4.2 2 0 .8.7 1.4 1.4 1.3.4 0 1-.3 1.1-.7.2-.5.1-1 0-1.5-.1-.4-.1-.8-.1-1.1 0-5.2 4.2-9.4 9.4-9.4s9.3 4.2 9.3 9.4c0 .4-.1.8-.1 1.2-.1.4-.1.8-.2 1.2-.2.7-.5 1.5-.8 2.1-.4.7-.8 1.3-1.3 1.9-.5.6-1.1 1.1-1.7 1.4-.7.4-1.4.7-2.1 1-.3.1-.6.1-.9.3-.3.1-.5.4-.6.7-.1.2-.1.3-.1.5 0 .7.6 1.3 1.4 1.4 5.1-1.1 9.1-6.1 9.1-11.7z"/></g></svg>`
    }
    else if (description == "overcast clouds") {
      weatherIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-cloudy" class="weather-icon weather-icon-white cloudy" viewBox="0 0 64 64"><style></style><path class="st1" d="M49.7 50.2H16.8c-5.6 0-10.2-4.6-10.2-10.2 0-4.4 2.9-8.3 7-9.7V30c0-5.1 4.2-9.3 9.3-9.3 1.3 0 2.5.3 3.7.8 2.5-3.7 6.6-6 11.2-6 7.4 0 13.4 6 13.4 13.4 0 .8-.1 1.6-.2 2.4 4.7.6 8.3 4.6 8.3 9.4-.1 5.2-4.4 9.5-9.6 9.5zM22.9 23.4c-3.6 0-6.6 3-6.6 6.6 0 .3 0 .7.1 1.1l.2 1.3-1.3.2c-3.5.7-6.1 3.8-6.1 7.4 0 4.2 3.4 7.5 7.5 7.5h32.9c3.8 0 6.8-3.1 6.8-6.8 0-3.8-3.1-6.8-6.8-6.8h-.3l-2 .1.6-1.9c.3-1.1.5-2.2.5-3.3 0-5.9-4.8-10.7-10.7-10.7-4 0-7.6 2.2-9.5 5.7l-.7 1.3-1.2-.7c-1-.7-2.2-1-3.4-1z" id="cloudy"/></svg>`
    }
    else if (mainWeather == "Clouds") {
      weatherIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-cloudy" class="weather-icon weather-icon-white cloudy" viewBox="0 0 64 64"><style></style><path class="st1" d="M49.7 50.2H16.8c-5.6 0-10.2-4.6-10.2-10.2 0-4.4 2.9-8.3 7-9.7V30c0-5.1 4.2-9.3 9.3-9.3 1.3 0 2.5.3 3.7.8 2.5-3.7 6.6-6 11.2-6 7.4 0 13.4 6 13.4 13.4 0 .8-.1 1.6-.2 2.4 4.7.6 8.3 4.6 8.3 9.4-.1 5.2-4.4 9.5-9.6 9.5zM22.9 23.4c-3.6 0-6.6 3-6.6 6.6 0 .3 0 .7.1 1.1l.2 1.3-1.3.2c-3.5.7-6.1 3.8-6.1 7.4 0 4.2 3.4 7.5 7.5 7.5h32.9c3.8 0 6.8-3.1 6.8-6.8 0-3.8-3.1-6.8-6.8-6.8h-.3l-2 .1.6-1.9c.3-1.1.5-2.2.5-3.3 0-5.9-4.8-10.7-10.7-10.7-4 0-7.6 2.2-9.5 5.7l-.7 1.3-1.2-.7c-1-.7-2.2-1-3.4-1z" id="cloudy"/></svg>`
    }
    else if (mainWeather == "Clear") {
      weatherIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-clear" class="weather-icon weather-icon-white clear" viewBox="0 0 64 64"><style>.st0{fill:#F4A71D;}</style><g id="clear"><path class="st0" d="M32.9 19.2c-.7 0-1.3-.6-1.3-1.3v-4.6c0-.7.6-1.3 1.3-1.3.7 0 1.3.6 1.3 1.3v4.6c0 .7-.6 1.3-1.3 1.3zM32.9 53.8c-.7 0-1.3-.6-1.3-1.3v-4.6c0-.7.6-1.3 1.3-1.3.7 0 1.3.6 1.3 1.3v4.6c0 .7-.6 1.3-1.3 1.3zM17.9 34.2h-4.6c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3h4.6c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3zM52.5 34.2h-4.6c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3h4.6c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3zM44 23.5c-.3 0-.7-.1-.9-.4-.5-.5-.5-1.4 0-1.9l3.2-3.2c.5-.5 1.4-.5 1.9 0s.5 1.4 0 1.9L45 23.1c-.3.3-.7.4-1 .4zM19.1 48.4c-.3 0-.7-.1-.9-.4-.5-.5-.5-1.4 0-1.9l3.2-3.2c.5-.5 1.4-.5 1.9 0s.5 1.4 0 1.9L20 48c-.2.3-.6.4-.9.4zM47.2 48.2c-.3 0-.7-.1-.9-.4l-3.2-3.2c-.5-.5-.5-1.4 0-1.9s1.4-.5 1.9 0l3.2 3.2c.5.5.5 1.4 0 1.9-.3.3-.6.4-1 .4zM22.3 23.7c-.3 0-.7-.1-.9-.4l-3.2-3.2c-.5-.5-.5-1.4 0-1.9s1.4-.5 1.9 0l3.2 3.2c.5.5.5 1.4 0 1.9-.3.3-.6.4-1 .4zM32.9 24.5c4.6 0 8.4 3.8 8.4 8.4 0 4.6-3.8 8.4-8.4 8.4-4.6 0-8.4-3.8-8.4-8.4 0-4.6 3.8-8.4 8.4-8.4m0-2.7c-6.1 0-11.1 5-11.1 11.1S26.8 44 32.9 44 44 39 44 32.9s-5-11.1-11.1-11.1z"/></g></svg>`
    }
    else if (mainWeather == "Rain") {
      weatherIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-rain" class="weather-icon weather-icon-white rain" viewBox="0 0 64 64"><style>.st0{fill:#2885C7;}</style><g id="rain"><path class="st0" d="M25.5 59.3c-.2 0-.3 0-.5-.1-.7-.3-1-1.1-.7-1.7l9.3-21.9c.3-.7 1.1-1 1.7-.7.7.3 1 1.1.7 1.7l-9.3 21.9c-.2.5-.7.8-1.2.8zM34 53.5c-.2 0-.3 0-.5-.1-.7-.3-1-1.1-.7-1.7l6.6-16c.3-.7 1.1-1 1.7-.7.7.3 1 1.1.7 1.7l-6.6 16c-.2.5-.7.8-1.2.8zM21.9 53.5c-.2 0-.3 0-.5-.1-.7-.3-1-1.1-.7-1.7l6.6-16c.3-.7 1.1-1 1.7-.7.7.3 1 1.1.7 1.7l-6.6 16c-.2.5-.6.8-1.2.8z"/><path class="st1" d="M50.9 22.4c.1-.8.2-1.6.2-2.4 0-7.4-6-13.4-13.4-13.4-4.5 0-8.7 2.3-11.2 6-1.2-.5-2.4-.8-3.7-.8-5.1 0-9.3 4.2-9.3 9.3v.3c-4.1 1.4-7 5.2-7 9.7 0 5.6 4.6 10.2 10.2 10.2h5c1.6 0 1.5-2.7 0-2.7h-5c-4.2 0-7.5-3.4-7.5-7.5 0-3.6 2.5-6.7 6.1-7.4l1.3-.3-.2-1.3c-.1-.4-.1-.7-.1-1.1 0-3.6 3-6.6 6.6-6.6 1.2 0 2.4.3 3.5 1l1.2.7.7-1.3c1.9-3.5 5.5-5.7 9.5-5.7 5.9 0 10.7 4.8 10.7 10.7 0 1.1-.2 2.2-.5 3.3l-.6 1.9 2.1-.1h.3c3.8 0 6.8 3.1 6.8 6.8 0 3.8-3.1 6.8-6.8 6.8h-5.7c-1.7 0-2 2.7 0 2.7h5.7c5.2 0 9.5-4.3 9.5-9.5-.1-4.7-3.7-8.7-8.4-9.3z"/></g></svg>`
    }
    else if (mainWeather == "Drizzle") {
      weatherIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-chancerain" class="weather-icon weather-icon-white chancerain" viewBox="0 0 64 64"><style>.st0{fill:#2885C7;}</style><g id="chancerain"><path class="st1" d="M50.9 24.1c.1-.8.2-1.6.2-2.4 0-7.4-6-13.4-13.4-13.4-4.5 0-8.7 2.3-11.2 6-1.2-.5-2.4-.8-3.7-.8-5.1 0-9.3 4.1-9.3 9.3v.3c-4.1 1.4-7 5.2-7 9.7 0 5.6 4.6 10.2 10.2 10.2h5c1.6 0 1.5-2.7 0-2.7h-5c-4.2 0-7.5-3.4-7.5-7.5 0-3.6 2.5-6.7 6.1-7.4l1.3-.3-.2-1.3c-.1-.4-.1-.7-.1-1.1 0-3.6 3-6.6 6.6-6.6 1.2 0 2.4.3 3.5 1l1.2.7.7-1.3c1.9-3.5 5.5-5.7 9.5-5.7 5.9 0 10.7 4.8 10.7 10.7 0 1.1-.2 2.2-.5 3.3l-.6 1.9 2.1-.1h.3c3.8 0 6.8 3.1 6.8 6.8 0 3.8-3.1 6.8-6.8 6.8h-5.7c-1.7 0-2 2.7 0 2.7h5.7c5.2 0 9.5-4.3 9.5-9.5-.1-4.7-3.8-8.7-8.4-9.3z"/><path class="st0" d="M24.9 46.5c-.3 0-.5-.1-.8-.2-.6-.4-.7-1.3-.3-1.8l2.4-3.5c.4-.6 1.2-.7 1.8-.3.6.4.7 1.2.3 1.8L25.9 46c-.2.3-.6.5-1 .5zM30.7 46.5c-.3 0-.5-.1-.8-.2-.6-.4-.7-1.3-.3-1.8L32 41c.4-.6 1.3-.7 1.8-.3.6.4.7 1.2.3 1.8L31.7 46c-.2.3-.6.5-1 .5zM36.5 46.5c-.3 0-.5-.1-.8-.2-.6-.4-.7-1.3-.3-1.8l2.4-3.5c.4-.6 1.3-.7 1.8-.3.6.4.7 1.2.3 1.8L37.5 46c-.1.3-.5.5-1 .5zM18.6 56c-.3 0-.5-.1-.8-.2-.6-.4-.7-1.2-.3-1.8l2.4-3.5c.4-.6 1.3-.7 1.9-.3.6.4.7 1.2.3 1.8l-2.4 3.5c-.3.3-.7.5-1.1.5zM24.5 56c-.3 0-.5-.1-.8-.2-.6-.4-.7-1.2-.3-1.8l2.4-3.5c.4-.6 1.2-.7 1.8-.3.6.4.7 1.2.3 1.8l-2.4 3.5c-.2.3-.6.5-1 .5zM30.3 56c-.3 0-.5-.1-.8-.2-.6-.4-.7-1.2-.3-1.8l2.4-3.5c.4-.6 1.2-.7 1.8-.3.6.4.7 1.2.3 1.8l-2.4 3.5c-.2.3-.6.5-1 .5z"/></g></svg>`
    }
    else if (mainWeather == "Mist" || mainWeather == "Fog" || mainWeather == "Squall" || mainWeather == "Smoke" || mainWeather == "Haze") {
      weatherIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-fog" class="weather-icon weather-icon-white fog" viewBox="0 0 64 64"><style></style><g id="fog"><path class="st1" d="M41.7 38.5c-3.2 0-6.1-.9-8.7-2.7-7.2-5.1-13.2-5.3-19.6-.9-.5.3-1.1.2-1.4-.3-.3-.5-.2-1.1.3-1.4 7.1-4.9 14.1-4.6 21.9.9 6.2 4.4 13.3 1.9 18.2-1 .5-.3 1.1-.1 1.4.4.3.5.1 1.1-.4 1.4-4 2.4-8 3.6-11.7 3.6z"/><path class="st1" d="M41.7 46.3c-3.2 0-6.1-.9-8.7-2.7-7.2-5.1-13.2-5.3-19.6-.9-.5.3-1.1.2-1.4-.3-.3-.5-.2-1.1.3-1.4 7.1-4.9 14.1-4.6 21.9.9 6.2 4.3 13.3 1.9 18.2-1 .5-.3 1.1-.1 1.4.4.3.5.1 1.1-.4 1.4-4 2.4-8 3.6-11.7 3.6zM41.7 30.8c-3.2 0-6.1-.9-8.7-2.7-7.2-5.1-13.2-5.3-19.6-.9-.5.3-1.1.2-1.4-.3-.3-.5-.2-1.1.3-1.4 7.1-4.9 14.1-4.6 21.9.9 6.2 4.4 13.3 1.9 18.2-1 .5-.3 1.1-.1 1.4.4.3.5.1 1.1-.4 1.4-4 2.4-8 3.6-11.7 3.6z"/></g></svg>`
    }
    else if (mainWeather == "Snow") {
      weatherIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-snow" class="weather-icon weather-icon-white snow" viewBox="0 0 64 64"><style>.st0{fill:#72B8D4;}</style><path class="st0" d="M51.6 32h-5.2l2.2-2.2c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L43.6 32h-8.3l5.9-5.9h5.1c.5 0 1-.4 1-1 0-.5-.4-1-1-1h-3.1l3.7-3.7c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0l-3.7 3.7v-3.1c0-.5-.4-1-1-1-.5 0-1 .4-1 1v5.1l-5.9 5.9v-8.3l3.6-3.6c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0l-2.2 2.2v-5.2c0-.5-.4-1-1-1-.5 0-1 .4-1 1v5.2l-2.2-2.2c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4l3.6 3.6v8.3L26 24.7v-5.1c0-.5-.4-1-1-1-.5 0-1 .4-1 1v3.1L20.3 19c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4l3.7 3.7h-3.1c-.5 0-1 .4-1 1 0 .5.4 1 1 1h5.1l5.9 5.9h-8.3l-3.6-3.6c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4l2.2 2.2h-5.2c-.5 0-1 .4-1 1 0 .5.4 1 1 1h5.2l-2.2 2.2c-.4.4-.4 1 0 1.4.2.2.4.3.7.3.2 0 .5-.1.7-.3l3.6-3.6h8.3l-5.9 5.9h-5.1c-.5 0-1 .4-1 1 0 .5.4 1 1 1h3.1L19 45.4c-.4.4-.4 1 0 1.4.2.2.4.3.7.3.2 0 .5-.1.7-.3l3.7-3.7v3.1c0 .5.4 1 1 1 .5 0 1-.4 1-1v-5.1l5.9-5.9v8.3l-3.6 3.6c-.4.4-.4 1 0 1.4.2.2.4.3.7.3.3 0 .5-.1.7-.3l2.2-2.2v5.2c0 .5.4 1 1 1 .5 0 1-.4 1-1v-5.2l2.2 2.2c.2.2.4.3.7.3.3 0 .5-.1.7-.3.4-.4.4-1 0-1.4L34 43.5v-8.3l5.9 5.9v5.1c0 .5.4 1 1 1 .5 0 1-.4 1-1v-3.1l3.7 3.7c.2.2.4.3.7.3.3 0 .5-.1.7-.3.4-.4.4-1 0-1.4l-3.7-3.7h3.1c.5 0 1-.4 1-1 0-.5-.4-1-1-1h-5.1l-5.9-5.9h8.3l3.6 3.6c.2.2.4.3.7.3.3 0 .5-.1.7-.3.4-.4.4-1 0-1.4l-2.2-2.2h5.2c.5 0 1-.4 1-1-.2-.4-.6-.8-1.1-.8z" id="snow"/></svg>`
    }
    else if (mainWeather == "Thunderstorm") {
      weatherIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-tstorms" class="weather-icon weather-icon-white tstorms" viewBox="0 0 64 64"><style>.st0{fill:#2885C7;} .st1{fill:#F4A71D;}</style><g id="tstorms"><path class="st0" d="M19.7 53c-.2 0-.4 0-.6-.1-.7-.3-.9-1.1-.6-1.8l2.8-5.8c.3-.7 1.1-.9 1.8-.6.7.3.9 1.1.6 1.8l-2.8 5.8c-.3.4-.7.7-1.2.7zM13.1 53c-.2 0-.4 0-.6-.1-.7-.3-.9-1.1-.6-1.8l2.8-5.8c.3-.7 1.1-.9 1.8-.6.7.3.9 1.1.6 1.8l-2.8 5.8c-.2.4-.7.7-1.2.7zM46.8 53c-.2 0-.4 0-.6-.1-.7-.3-.9-1.1-.6-1.8l2.8-5.8c.3-.7 1.1-.9 1.8-.6.7.3.9 1.1.6 1.8L48 52.3c-.2.4-.7.7-1.2.7zM40.2 53c-.2 0-.4 0-.6-.1-.7-.3-.9-1.1-.6-1.8l2.8-5.8c.3-.7 1.1-.9 1.8-.6.7.3.9 1.1.6 1.8l-2.8 5.8c-.2.4-.7.7-1.2.7z"/><path class="st1" d="M27.7 59.3c-.2 0-.5-.1-.7-.2-.6-.4-.8-1.2-.4-1.8l7.9-13.1h-8.3L35.5 31c.4-.6 1.2-.7 1.8-.3.6.4.7 1.3.3 1.9l-6.4 9.1h7.9L28.8 58.6c-.2.4-.7.7-1.1.7z"/><path class="st2" d="M50.9 22.3c.1-.8.2-1.6.2-2.4 0-7.4-6-13.4-13.4-13.4-4.5 0-8.7 2.3-11.2 6-1.1-.5-2.4-.8-3.6-.8-5.1 0-9.3 4.2-9.3 9.3v.3c-4.1 1.4-7 5.2-7 9.7 0 5.6 4.6 10.2 10.2 10.2h5c1.6 0 1.5-2.6 0-2.6h-5c-4.2 0-7.5-3.4-7.5-7.5 0-3.6 2.5-6.7 6.1-7.4l1.3-.2-.2-1.3c-.1-.4-.1-.8-.1-1.1 0-3.6 3-6.6 6.6-6.6 1.2 0 2.4.3 3.5 1l1.2.7.7-1.3c1.9-3.5 5.5-5.7 9.5-5.7 5.9 0 10.7 4.8 10.7 10.7 0 1.1-.2 2.2-.5 3.3l-.8 1.8 2.1-.1h.3c3.8 0 6.8 3.1 6.8 6.8 0 3.8-3.1 6.8-6.8 6.8H44c-1.7 0-2 2.6 0 2.6h5.7c5.2 0 9.5-4.3 9.5-9.5 0-4.7-3.7-8.7-8.3-9.3z"/></g></svg>`
    }
  }
  catch (e) {
    console.error(e);
  }
  rightContainer.appendChild(weatherDiv);
}

async function migrateWeaterData() {
  console.log("migrating")
  await browser.runtime.sendMessage({
    action: 'setWeatherAppData',
    data: {
      weatherData: localStorage.getItem("weatherdata"),
      lastUpdateDate: localStorage.getItem("lastupdate"),
      lastLocation: localStorage.getItem("lastlocation")
    }
  });
  localStorage.removeItem("weatherdata")
  localStorage.removeItem("lastupdate")
  localStorage.removeItem("lastlocation")
}

async function getWeatherBasedOnLocation(location, isBig) {
  let wasMigrated = false;
  if (window.localStorage.getItem("lastlocation")) {
    await migrateWeaterData();
    wasMigrated = true;
  }

  const currentDate = new Date();
  let weatherAppData = await browser.runtime.sendMessage({ action: 'getWeatherAppData', location: location });
  let lastUpdateDate = new Date(weatherAppData.lastUpdateDate);
  let timeDifference = Math.abs(lastUpdateDate - currentDate) / 1000;
  let weatherData;
  if (timeDifference > 600 || location !== weatherAppData.lastLocation || wasMigrated) {
    weatherData = await browser.runtime.sendMessage({ action: 'fetchWeatherData', location: location });;
    await browser.runtime.sendMessage({
      action: 'setWeatherAppData',
      data: {
        weatherData: weatherData,
        lastUpdateDate: currentDate.toISOString(),
        lastLocation: location
      }
    });
    updateWeatherDiv(weatherData, isBig, 0);
  } else {
    weatherData = weatherAppData.weatherData
    updateWeatherDiv(weatherData, isBig, timeDifference);
  }
}


