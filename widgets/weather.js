class WeatherWidgetBase extends WidgetBase {
  isCompact = null;

  async createContent() {
    this.currentLocation = this.settings.cache.lastLocation;
    console.log(this.currentLocation);
    let newWeatherData = await this.getWeatherData();
    console.log("AAA", newWeatherData);
    return this.createHTML(newWeatherData);
  }

  async getWeatherData() {
    console.log(this.settings);
    console.log(this.settings.cache);
    if (this.settings.cache.lastLocation != this.currentLocation) {
      console.log(this.settings.cache.lastLocation != this.currentLocation);
      await this.updateCache();
      console.log(
        "Last location wasn't good",
        this.settings.cache.lastLocation,
        this.currentLocation
      );
    } else if (
      (new Date() - new Date(this.settings.cache.lastUpdateDate)) / 1000 / 60 >
      10
    ) {
      await this.updateCache();
      console.log("Time wasn't good");
    } else if (this.settings.cache.weatherData == {}) {
      await this.updateCache();
      console.log("Data didnt exist");
    }
    console.log("Settings ", this.settings.cache.weatherData);
    return this.settings.cache.weatherData;
  }

  async updateCache() {
    console.log(this.currentLocation);
    let newWeatherData = await browser.runtime.sendMessage({
      action: "fetchWeatherData",
      location: this.currentLocation,
    });
    if (newWeatherData.name) {
      this.currentLocation = newWeatherData.name;
    }
    let newCache = {
      weatherData: newWeatherData,
      lastUpdateDate: new Date(),
      lastLocation: this.currentLocation,
    };
    this.setSetting("cache", newCache);
    return newCache;
  }

  defaultSettings() {
    this.currentLocation = "Keerbergen";
    let cache = this.updateCache();
    console.log("why");
    cache.lastLocation = this.currentLocation;
    return {
      cache: cache,
    };
  }

  async createPreview() {
    return createWeatherPreview(this.isCompact);
  }

  async updateWeatherLocation(event) {
    let newLocation = event.target.value.trim();
    if (newLocation == "") {
      event.target.value = this.settings.cache.lastLocation;
      return;
    }
    this.currentLocation = newLocation;
    this.updateHTML();
  }

  async updateHTML() {
    this.element.innerHTML = "";
    this.element.appendChild(this.createHTML(await this.getWeatherData()));
  }

  createHTML(weatherData) {
    console.log(weatherData);
    let container = document.createElement("div");
    container.classList.add("weather-div");
    if (this.isCompact) container.classList.add("compact");

    let topContentContainer = document.createElement("div");
    topContentContainer.classList.add("top-weather-content-container");
    let bottomContentContainer = document.createElement("div");
    bottomContentContainer.classList.add("bottom-weather-content-container");

    let locationInput = document.createElement("input");
    locationInput.classList.add("weather-location-input");
    locationInput.value = this.currentLocation;
    locationInput.type = "text";
    locationInput.spellcheck = false;
    locationInput.classList.add("inactive");
    locationInput.addEventListener(
      "change",
      this.updateWeatherLocation.bind(this)
    );

    topContentContainer.appendChild(locationInput);
    if (weatherData.cod != 200) {
      container.appendChild(topContentContainer);
      container.appendChild(this.createNotFoundContent(weatherData.cod));
      return container;
    }

    let description = document.createElement("span");
    description.classList.add("weather-description");
    description.innerText = weatherData.weather[0].main;

    let mainIcon = document.createElement("div");
    mainIcon.classList.add("weather-icon-container");
    mainIcon.innerHTML = getWeatherIcon(
      weatherData.weather[0].main,
      weatherData.weather[0].description
    );

    let temperature = document.createElement("span");
    temperature.classList.add("temperature");
    temperature.innerText = Math.round(weatherData.main.temp) + "°C";

    let conditionsContainer = document.createElement("div");
    conditionsContainer.classList.add("conditions-container");

    let humidityContainer = document.createElement("div");
    humidityContainer.classList.add("humidity-container");
    humidityContainer.classList.add("condition-container");
    let humidityIcon = document.createElement("div");
    humidityIcon.classList.add("humidity-icon");
    humidityIcon.innerHTML = humiditySvg;
    let humidity = document.createElement("span");
    humidity.classList.add("humidity");
    humidity.innerText = weatherData.main.humidity + "%";
    humidityContainer.appendChild(humidityIcon);
    humidityContainer.appendChild(humidity);

    let feelsLikeContainer = document.createElement("div");
    feelsLikeContainer.classList.add("feels-like-container");
    feelsLikeContainer.classList.add("condition-container");
    let feelsLikeIcon = document.createElement("div");
    feelsLikeIcon.classList.add("feels-like-icon");
    feelsLikeIcon.innerHTML = feelsLikeSvg;
    let feelsLike = document.createElement("span");
    feelsLike.classList.add("feels-like");
    feelsLike.innerText = Math.round(weatherData.main.feels_like) + "°C";
    feelsLikeContainer.appendChild(feelsLikeIcon);
    feelsLikeContainer.appendChild(feelsLike);

    let windContainer = document.createElement("div");
    windContainer.classList.add("wind-container");
    windContainer.classList.add("condition-container");
    let windIcon = document.createElement("div");
    windIcon.classList.add("wind-icon");
    windIcon.innerHTML = windSvg;
    let wind = document.createElement("span");
    wind.classList.add("wind");
    wind.innerText = Math.round(Number(weatherData.wind.speed) * 3.6) + "km/h";
    windContainer.appendChild(windIcon);
    windContainer.appendChild(wind);

    topContentContainer.appendChild(description);
    topContentContainer.appendChild(mainIcon);
    if (this.isCompact) {
      let temperatureContainer = document.createElement("div");
      temperatureContainer.classList.add("temperature-container");
      temperatureContainer.classList.add("condition-container");
      let temperatureIcon = document.createElement("div");
      temperatureIcon.classList.add("temperature-icon");
      temperatureIcon.innerHTML = temperatureSvg;
      temperatureContainer.appendChild(temperatureIcon);
      temperatureContainer.appendChild(temperature);

      conditionsContainer.appendChild(humidityContainer);
      conditionsContainer.appendChild(windContainer);
      conditionsContainer.appendChild(temperatureContainer);
    } else {
      bottomContentContainer.appendChild(temperature);
      conditionsContainer.appendChild(humidityContainer);
      conditionsContainer.appendChild(feelsLikeContainer);
      conditionsContainer.appendChild(windContainer);
    }
    bottomContentContainer.appendChild(conditionsContainer);

    container.appendChild(topContentContainer);
    container.appendChild(bottomContentContainer);
    return container;
  }

  createNotFoundContent(code) {
    let notFoundContent = document.createElement("div");
    let notFoundText = document.createElement("span");
    notFoundText.classList.add("not-found-text");
    if (code == 404) {
      let notFoundIcon = document.createElement("div");
      notFoundIcon.classList.add("no-location-icon");
      notFoundIcon.innerHTML = noLocationSvg;
      notFoundContent.appendChild(notFoundIcon);
      notFoundText.innerText = "Location not found";
    } else if (code == 69) {
      notFoundText.innerText = `Unexpected error:\nUnable to fetch`;
    } else {
      notFoundText.innerText = `Unexpected error:\n${code}`;
    }
    notFoundContent.appendChild(notFoundText);
    return notFoundContent;
  }
}

class WeatherWidget extends WeatherWidgetBase {
  isCompact = false;
}

class CompactWeatherWidget extends WeatherWidgetBase {
  isCompact = true;
}

registerWidget(new CompactWeatherWidget());
registerWidget(new WeatherWidget());

function createWeatherPreview(isCompact) {
  console.log(isCompact);
  let container = document.createElement("div");
  container.classList.add("weather-div");
  container.classList.add("preview");
  if (isCompact) container.classList.add("compact");
  let weatherTitle = document.createElement("div");
  weatherTitle.classList.add("weather-preview-title");
  weatherTitle.innerText = isCompact ? "Tiny Weather" : "Weather";
  container.appendChild(weatherTitle);

  let mainIcon = document.createElement("div");
  mainIcon.classList.add("weather-icon-container");

  mainIcon.innerHTML = getWeatherIcon(null, "broken clouds");
  let conditionsContainer = document.createElement("div");
  conditionsContainer.classList.add("conditions-container");

  let humidityContainer = document.createElement("div");
  humidityContainer.classList.add("humidity-container");
  humidityContainer.classList.add("condition-container");
  let humidityIcon = document.createElement("div");
  humidityIcon.classList.add("humidity-icon");
  humidityIcon.innerHTML = humiditySvg;
  humidityContainer.appendChild(humidityIcon);

  let feelsLikeContainer = document.createElement("div");
  feelsLikeContainer.classList.add("feels-like-container");
  feelsLikeContainer.classList.add("condition-container");
  let feelsLikeIcon = document.createElement("div");
  feelsLikeIcon.classList.add("feels-like-icon");
  feelsLikeIcon.innerHTML = feelsLikeSvg;
  feelsLikeContainer.appendChild(feelsLikeIcon);

  let windContainer = document.createElement("div");
  windContainer.classList.add("wind-container");
  windContainer.classList.add("condition-container");
  let windIcon = document.createElement("div");
  windIcon.classList.add("wind-icon");
  windIcon.innerHTML = windSvg;
  windContainer.appendChild(windIcon);

  if (isCompact) {
    let temperatureContainer = document.createElement("div");
    temperatureContainer.classList.add("temperature-container");
    temperatureContainer.classList.add("condition-container");
    let temperatureIcon = document.createElement("div");
    temperatureIcon.classList.add("temperature-icon");
    temperatureIcon.innerHTML = temperatureSvg;
    temperatureContainer.appendChild(temperatureIcon);

    conditionsContainer.appendChild(humidityContainer);
    conditionsContainer.appendChild(windContainer);
    conditionsContainer.appendChild(temperatureContainer);
  } else {
    conditionsContainer.appendChild(humidityContainer);
    conditionsContainer.appendChild(feelsLikeContainer);
    conditionsContainer.appendChild(windContainer);
  }
  let bottomContentContainer = document.createElement("div");
  bottomContentContainer.classList.add("weather-widget-content");

  bottomContentContainer.appendChild(mainIcon);
  bottomContentContainer.appendChild(conditionsContainer);
  container.appendChild(bottomContentContainer);

  return container;
}

function getWeatherIcon(description, cloudDescription) {
  switch (cloudDescription) {
    case "few clouds":
    case "scattered clouds":
      return `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-mostlysunny" class="weather-icon weather-icon-white mostlysunny" viewBox="0 0 64 64"><style>.st0{fill:#F4A71D;}</style><g id="mostlysunny"><path class="st0" d="M35.5 15.3c-.7 0-1.3-.6-1.3-1.3V9c0-.7.6-1.3 1.3-1.3.7 0 1.3.6 1.3 1.3v5c0 .7-.6 1.3-1.3 1.3zM19.2 31.6h-5c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3h5c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3zM56.7 31.6h-5c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3h5c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3zM47.5 20c-.3 0-.7-.1-.9-.4-.5-.5-.5-1.4 0-1.9l3.5-3.5c.5-.5 1.4-.5 1.9 0s.5 1.4 0 1.9l-3.5 3.5c-.3.2-.7.4-1 .4zM51 46.8c-.3 0-.7-.1-.9-.4l-3.5-3.5c-.5-.5-.5-1.4 0-1.9s1.3-.5 1.9 0l3.5 3.5c.5.5.5 1.4 0 1.9-.3.2-.7.4-1 .4zM24 20.2c-.3 0-.7-.1-.9-.4l-3.5-3.5c-.5-.5-.5-1.4 0-1.9s1.3-.5 1.9 0l3.5 3.5c.5.5.5 1.4 0 1.9-.3.3-.7.4-1 .4z"/><path class="st1" d="M33.4 58.2h-20c-3.7 0-6.7-3-6.7-6.7 0-2.8 1.7-5.3 4.3-6.3.1-3.3 2.8-6 6.2-6 .7 0 1.4.1 2 .4 1.6-2.2 4.2-3.6 7-3.6 4.8 0 8.7 3.9 8.7 8.7 0 .4 0 .7-.1 1.1 2.8.6 5 3.1 5 6.2-.1 3.4-2.9 6.2-6.4 6.2zM17.1 41.9c-1.9 0-3.5 1.6-3.5 3.5 0 .2 0 .4.1.6l.2 1.3-1.3.3c-1.9.4-3.3 2.1-3.3 4 0 2.2 1.8 4.1 4.1 4.1h20c2 0 3.6-1.6 3.6-3.6s-1.6-3.6-3.6-3.6h-.2l-2 .1.6-1.9c.2-.6.3-1.2.3-1.9 0-3.3-2.7-6-6-6-2.2 0-4.3 1.2-5.3 3.2l-.7 1.3-1.2-.7c-.5-.5-1.2-.7-1.8-.7z"/><path class="st0" d="M47.5 30.3c0-6.6-5.4-12-12-12s-12 5.4-12 12c0 .7.1 1.4.2 2 0 .8.7 1.4 1.4 1.3.4 0 1-.3 1.1-.7.2-.5.1-1 0-1.5-.1-.4-.1-.8-.1-1.1 0-5.2 4.2-9.4 9.4-9.4s9.3 4.2 9.3 9.4c0 .4-.1.8-.1 1.2-.1.4-.1.8-.2 1.2-.2.7-.5 1.5-.8 2.1-.4.7-.8 1.3-1.3 1.9-.5.6-1.1 1.1-1.7 1.4-.7.4-1.4.7-2.1 1-.3.1-.6.1-.9.3-.3.1-.5.4-.6.7-.1.2-.1.3-.1.5 0 .7.6 1.3 1.4 1.4 5.1-1.1 9.1-6.1 9.1-11.7z"/></g></svg>`;
    case "broken clouds":
      return `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-mostlycloudy" class="weather-icon weather-icon-white mostlycloudy" viewBox="0 0 64 64"><style>.st0{fill:#F4A71D;}</style><g id="mostlycloudy"><path class="st0" d="M43.1 13.9c-.7 0-1.2-.6-1.2-1.2V9.2c0-.7.6-1.2 1.2-1.2.7 0 1.2.6 1.2 1.2v3.4c0 .7-.5 1.3-1.2 1.3zM57.6 25h-3.4c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2h3.4c.7 0 1.2.5 1.2 1.2.1.7-.5 1.2-1.2 1.2zM51.3 17.1c-.3 0-.6-.1-.9-.4-.5-.5-.5-1.3 0-1.7l2.4-2.4c.5-.5 1.3-.5 1.7 0 .5.5.5 1.3 0 1.7l-2.4 2.4c-.1.3-.5.4-.8.4zM53.7 35.4c-.3 0-.6-.1-.9-.4l-2.4-2.4c-.5-.5-.5-1.3 0-1.7.5-.5 1.3-.5 1.7 0l2.4 2.4c.5.5.5 1.3 0 1.7-.1.3-.5.4-.8.4zM35.3 17.2c-.3 0-.6-.1-.9-.4L32 14.5c-.5-.5-.5-1.3 0-1.7.5-.5 1.3-.5 1.7 0l2.4 2.4c.5.5.5 1.3 0 1.7-.2.2-.5.3-.8.3z"/><path class="st1" d="M45.6 57.8H16c-5.1 0-9.3-4.2-9.3-9.3 0-4 2.6-7.6 6.3-8.8v-.2c0-4.7 3.8-8.5 8.5-8.5 1.1 0 2.2.2 3.2.7 2.2-3.4 6-5.4 10.1-5.4 6.7 0 12.2 5.5 12.2 12.2 0 .7-.1 1.4-.2 2.1 4.2.6 7.5 4.2 7.5 8.6-.1 4.7-3.9 8.6-8.7 8.6zM21.4 33.7c-3.2 0-5.8 2.6-5.8 5.8 0 .3 0 .6.1 1l.2 1.3-1.3.2c-3.1.6-5.3 3.4-5.3 6.5 0 3.7 3 6.7 6.7 6.7h29.6c3.3 0 6-2.7 6-6s-2.7-6-6-6h-.3l-2 .1.6-1.9c.3-.9.5-1.9.5-2.9 0-5.3-4.3-9.5-9.5-9.5-3.5 0-6.8 2-8.4 5.1l-.7 1.3-1.2-.7c-1-.8-2.1-1-3.2-1z"/><path class="st0" d="M44.6 16c-4.2-.8-8.2 2-8.9 6.2-.1.4-.1.7-.1 1.1-.1.5.3 1 .9 1.1 1.1.1 1-1 1.2-1.7.6-3.1 3.5-5.1 6.6-4.6 3.1.6 5.1 3.5 4.6 6.6-.1.7-.3 1.4-.7 2-.5.7-1.3 1.3-2 1.8-.6.4-.3 1.3.4 1.4.8.2 1.5-.4 2.1-1 .7-.6 1.3-1.5 1.7-2.4.2-.5.4-1 .5-1.5.7-4.3-2.1-8.3-6.3-9z"/></g></svg>`;
    case "overcast clouds":
      return `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-cloudy" class="weather-icon weather-icon-white cloudy" viewBox="0 0 64 64"><style></style><path class="st1" d="M49.7 50.2H16.8c-5.6 0-10.2-4.6-10.2-10.2 0-4.4 2.9-8.3 7-9.7V30c0-5.1 4.2-9.3 9.3-9.3 1.3 0 2.5.3 3.7.8 2.5-3.7 6.6-6 11.2-6 7.4 0 13.4 6 13.4 13.4 0 .8-.1 1.6-.2 2.4 4.7.6 8.3 4.6 8.3 9.4-.1 5.2-4.4 9.5-9.6 9.5zM22.9 23.4c-3.6 0-6.6 3-6.6 6.6 0 .3 0 .7.1 1.1l.2 1.3-1.3.2c-3.5.7-6.1 3.8-6.1 7.4 0 4.2 3.4 7.5 7.5 7.5h32.9c3.8 0 6.8-3.1 6.8-6.8 0-3.8-3.1-6.8-6.8-6.8h-.3l-2 .1.6-1.9c.3-1.1.5-2.2.5-3.3 0-5.9-4.8-10.7-10.7-10.7-4 0-7.6 2.2-9.5 5.7l-.7 1.3-1.2-.7c-1-.7-2.2-1-3.4-1z" id="cloudy"/></svg>`;
  }
  switch (description) {
    case "Clouds":
      return `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-cloudy" class="weather-icon cloudy" viewBox="0 0 64 64"><style></style><path class="st1" d="M49.7 50.2H16.8c-5.6 0-10.2-4.6-10.2-10.2 0-4.4 2.9-8.3 7-9.7V30c0-5.1 4.2-9.3 9.3-9.3 1.3 0 2.5.3 3.7.8 2.5-3.7 6.6-6 11.2-6 7.4 0 13.4 6 13.4 13.4 0 .8-.1 1.6-.2 2.4 4.7.6 8.3 4.6 8.3 9.4-.1 5.2-4.4 9.5-9.6 9.5zM22.9 23.4c-3.6 0-6.6 3-6.6 6.6 0 .3 0 .7.1 1.1l.2 1.3-1.3.2c-3.5.7-6.1 3.8-6.1 7.4 0 4.2 3.4 7.5 7.5 7.5h32.9c3.8 0 6.8-3.1 6.8-6.8 0-3.8-3.1-6.8-6.8-6.8h-.3l-2 .1.6-1.9c.3-1.1.5-2.2.5-3.3 0-5.9-4.8-10.7-10.7-10.7-4 0-7.6 2.2-9.5 5.7l-.7 1.3-1.2-.7c-1-.7-2.2-1-3.4-1z" id="cloudy"/></svg>`;
    case "Clear":
      return `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-clear" class="weather-icon clear" viewBox="0 0 64 64"><style>.st0{fill:#F4A71D;}</style><g id="clear"><path class="st0" d="M32.9 19.2c-.7 0-1.3-.6-1.3-1.3v-4.6c0-.7.6-1.3 1.3-1.3.7 0 1.3.6 1.3 1.3v4.6c0 .7-.6 1.3-1.3 1.3zM32.9 53.8c-.7 0-1.3-.6-1.3-1.3v-4.6c0-.7.6-1.3 1.3-1.3.7 0 1.3.6 1.3 1.3v4.6c0 .7-.6 1.3-1.3 1.3zM17.9 34.2h-4.6c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3h4.6c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3zM52.5 34.2h-4.6c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3h4.6c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3zM44 23.5c-.3 0-.7-.1-.9-.4-.5-.5-.5-1.4 0-1.9l3.2-3.2c.5-.5 1.4-.5 1.9 0s.5 1.4 0 1.9L45 23.1c-.3.3-.7.4-1 .4zM19.1 48.4c-.3 0-.7-.1-.9-.4-.5-.5-.5-1.4 0-1.9l3.2-3.2c.5-.5 1.4-.5 1.9 0s.5 1.4 0 1.9L20 48c-.2.3-.6.4-.9.4zM47.2 48.2c-.3 0-.7-.1-.9-.4l-3.2-3.2c-.5-.5-.5-1.4 0-1.9s1.4-.5 1.9 0l3.2 3.2c.5.5.5 1.4 0 1.9-.3.3-.6.4-1 .4zM22.3 23.7c-.3 0-.7-.1-.9-.4l-3.2-3.2c-.5-.5-.5-1.4 0-1.9s1.4-.5 1.9 0l3.2 3.2c.5.5.5 1.4 0 1.9-.3.3-.6.4-1 .4zM32.9 24.5c4.6 0 8.4 3.8 8.4 8.4 0 4.6-3.8 8.4-8.4 8.4-4.6 0-8.4-3.8-8.4-8.4 0-4.6 3.8-8.4 8.4-8.4m0-2.7c-6.1 0-11.1 5-11.1 11.1S26.8 44 32.9 44 44 39 44 32.9s-5-11.1-11.1-11.1z"/></g></svg>`;
    case "Rain":
      return `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-rain" class="weather-icon rain" viewBox="0 0 64 64"><style>.st0{fill:#2885C7;}</style><g id="rain"><path class="st0" d="M25.5 59.3c-.2 0-.3 0-.5-.1-.7-.3-1-1.1-.7-1.7l9.3-21.9c.3-.7 1.1-1 1.7-.7.7.3 1 1.1.7 1.7l-9.3 21.9c-.2.5-.7.8-1.2.8zM34 53.5c-.2 0-.3 0-.5-.1-.7-.3-1-1.1-.7-1.7l6.6-16c.3-.7 1.1-1 1.7-.7.7.3 1 1.1.7 1.7l-6.6 16c-.2.5-.7.8-1.2.8zM21.9 53.5c-.2 0-.3 0-.5-.1-.7-.3-1-1.1-.7-1.7l6.6-16c.3-.7 1.1-1 1.7-.7.7.3 1 1.1.7 1.7l-6.6 16c-.2.5-.6.8-1.2.8z"/><path class="st1" d="M50.9 22.4c.1-.8.2-1.6.2-2.4 0-7.4-6-13.4-13.4-13.4-4.5 0-8.7 2.3-11.2 6-1.2-.5-2.4-.8-3.7-.8-5.1 0-9.3 4.2-9.3 9.3v.3c-4.1 1.4-7 5.2-7 9.7 0 5.6 4.6 10.2 10.2 10.2h5c1.6 0 1.5-2.7 0-2.7h-5c-4.2 0-7.5-3.4-7.5-7.5 0-3.6 2.5-6.7 6.1-7.4l1.3-.3-.2-1.3c-.1-.4-.1-.7-.1-1.1 0-3.6 3-6.6 6.6-6.6 1.2 0 2.4.3 3.5 1l1.2.7.7-1.3c1.9-3.5 5.5-5.7 9.5-5.7 5.9 0 10.7 4.8 10.7 10.7 0 1.1-.2 2.2-.5 3.3l-.6 1.9 2.1-.1h.3c3.8 0 6.8 3.1 6.8 6.8 0 3.8-3.1 6.8-6.8 6.8h-5.7c-1.7 0-2 2.7 0 2.7h5.7c5.2 0 9.5-4.3 9.5-9.5-.1-4.7-3.7-8.7-8.4-9.3z"/></g></svg>`;
    case "Drizzle":
      return `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-chancerain" class="weather-icon chancerain" viewBox="0 0 64 64"><style>.st0{fill:#2885C7;}</style><g id="chancerain"><path class="st1" d="M50.9 24.1c.1-.8.2-1.6.2-2.4 0-7.4-6-13.4-13.4-13.4-4.5 0-8.7 2.3-11.2 6-1.2-.5-2.4-.8-3.7-.8-5.1 0-9.3 4.1-9.3 9.3v.3c-4.1 1.4-7 5.2-7 9.7 0 5.6 4.6 10.2 10.2 10.2h5c1.6 0 1.5-2.7 0-2.7h-5c-4.2 0-7.5-3.4-7.5-7.5 0-3.6 2.5-6.7 6.1-7.4l1.3-.3-.2-1.3c-.1-.4-.1-.7-.1-1.1 0-3.6 3-6.6 6.6-6.6 1.2 0 2.4.3 3.5 1l1.2.7.7-1.3c1.9-3.5 5.5-5.7 9.5-5.7 5.9 0 10.7 4.8 10.7 10.7 0 1.1-.2 2.2-.5 3.3l-.6 1.9 2.1-.1h.3c3.8 0 6.8 3.1 6.8 6.8 0 3.8-3.1 6.8-6.8 6.8h-5.7c-1.7 0-2 2.7 0 2.7h5.7c5.2 0 9.5-4.3 9.5-9.5-.1-4.7-3.8-8.7-8.4-9.3z"/><path class="st0" d="M24.9 46.5c-.3 0-.5-.1-.8-.2-.6-.4-.7-1.3-.3-1.8l2.4-3.5c.4-.6 1.2-.7 1.8-.3.6.4.7 1.2.3 1.8L25.9 46c-.2.3-.6.5-1 .5zM30.7 46.5c-.3 0-.5-.1-.8-.2-.6-.4-.7-1.3-.3-1.8L32 41c.4-.6 1.3-.7 1.8-.3.6.4.7 1.2.3 1.8L31.7 46c-.2.3-.6.5-1 .5zM36.5 46.5c-.3 0-.5-.1-.8-.2-.6-.4-.7-1.3-.3-1.8l2.4-3.5c.4-.6 1.3-.7 1.8-.3.6.4.7 1.2.3 1.8L37.5 46c-.1.3-.5.5-1 .5zM18.6 56c-.3 0-.5-.1-.8-.2-.6-.4-.7-1.2-.3-1.8l2.4-3.5c.4-.6 1.3-.7 1.9-.3.6.4.7 1.2.3 1.8l-2.4 3.5c-.3.3-.7.5-1.1.5zM24.5 56c-.3 0-.5-.1-.8-.2-.6-.4-.7-1.2-.3-1.8l2.4-3.5c.4-.6 1.2-.7 1.8-.3.6.4.7 1.2.3 1.8l-2.4 3.5c-.2.3-.6.5-1 .5zM30.3 56c-.3 0-.5-.1-.8-.2-.6-.4-.7-1.2-.3-1.8l2.4-3.5c.4-.6 1.2-.7 1.8-.3.6.4.7 1.2.3 1.8l-2.4 3.5c-.2.3-.6.5-1 .5z"/></g></svg>`;
    case "Mist":
    case "Fog":
    case "Squall":
    case "Smoke":
    case "Haze":
      return `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-fog" class="weather-icon fog" viewBox="0 0 64 64"><style></style><g id="fog"><path class="st1" d="M41.7 38.5c-3.2 0-6.1-.9-8.7-2.7-7.2-5.1-13.2-5.3-19.6-.9-.5.3-1.1.2-1.4-.3-.3-.5-.2-1.1.3-1.4 7.1-4.9 14.1-4.6 21.9.9 6.2 4.4 13.3 1.9 18.2-1 .5-.3 1.1-.1 1.4.4.3.5.1 1.1-.4 1.4-4 2.4-8 3.6-11.7 3.6z"/><path class="st1" d="M41.7 46.3c-3.2 0-6.1-.9-8.7-2.7-7.2-5.1-13.2-5.3-19.6-.9-.5.3-1.1.2-1.4-.3-.3-.5-.2-1.1.3-1.4 7.1-4.9 14.1-4.6 21.9.9 6.2 4.3 13.3 1.9 18.2-1 .5-.3 1.1-.1 1.4.4.3.5.1 1.1-.4 1.4-4 2.4-8 3.6-11.7 3.6zM41.7 30.8c-3.2 0-6.1-.9-8.7-2.7-7.2-5.1-13.2-5.3-19.6-.9-.5.3-1.1.2-1.4-.3-.3-.5-.2-1.1.3-1.4 7.1-4.9 14.1-4.6 21.9.9 6.2 4.4 13.3 1.9 18.2-1 .5-.3 1.1-.1 1.4.4.3.5.1 1.1-.4 1.4-4 2.4-8 3.6-11.7 3.6z"/></g></svg>`;
    case "Snow":
      return `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-snow" class="weather-icon snow" viewBox="0 0 64 64"><style>.st0{fill:#72B8D4;}</style><path class="st0" d="M51.6 32h-5.2l2.2-2.2c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L43.6 32h-8.3l5.9-5.9h5.1c.5 0 1-.4 1-1 0-.5-.4-1-1-1h-3.1l3.7-3.7c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0l-3.7 3.7v-3.1c0-.5-.4-1-1-1-.5 0-1 .4-1 1v5.1l-5.9 5.9v-8.3l3.6-3.6c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0l-2.2 2.2v-5.2c0-.5-.4-1-1-1-.5 0-1 .4-1 1v5.2l-2.2-2.2c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4l3.6 3.6v8.3L26 24.7v-5.1c0-.5-.4-1-1-1-.5 0-1 .4-1 1v3.1L20.3 19c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4l3.7 3.7h-3.1c-.5 0-1 .4-1 1 0 .5.4 1 1 1h5.1l5.9 5.9h-8.3l-3.6-3.6c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4l2.2 2.2h-5.2c-.5 0-1 .4-1 1 0 .5.4 1 1 1h5.2l-2.2 2.2c-.4.4-.4 1 0 1.4.2.2.4.3.7.3.2 0 .5-.1.7-.3l3.6-3.6h8.3l-5.9 5.9h-5.1c-.5 0-1 .4-1 1 0 .5.4 1 1 1h3.1L19 45.4c-.4.4-.4 1 0 1.4.2.2.4.3.7.3.2 0 .5-.1.7-.3l3.7-3.7v3.1c0 .5.4 1 1 1 .5 0 1-.4 1-1v-5.1l5.9-5.9v8.3l-3.6 3.6c-.4.4-.4 1 0 1.4.2.2.4.3.7.3.3 0 .5-.1.7-.3l2.2-2.2v5.2c0 .5.4 1 1 1 .5 0 1-.4 1-1v-5.2l2.2 2.2c.2.2.4.3.7.3.3 0 .5-.1.7-.3.4-.4.4-1 0-1.4L34 43.5v-8.3l5.9 5.9v5.1c0 .5.4 1 1 1 .5 0 1-.4 1-1v-3.1l3.7 3.7c.2.2.4.3.7.3.3 0 .5-.1.7-.3.4-.4.4-1 0-1.4l-3.7-3.7h3.1c.5 0 1-.4 1-1 0-.5-.4-1-1-1h-5.1l-5.9-5.9h8.3l3.6 3.6c.2.2.4.3.7.3.3 0 .5-.1.7-.3.4-.4.4-1 0-1.4l-2.2-2.2h5.2c.5 0 1-.4 1-1-.2-.4-.6-.8-1.1-.8z" id="snow"/></svg>`;
    case "Thunderstorm":
      return `<svg xmlns="http://www.w3.org/2000/svg" id="weather-icon-tstorms" class="weather-icon tstorms" viewBox="0 0 64 64"><style>.st0{fill:#2885C7;} .st1{fill:#F4A71D;}</style><g id="tstorms"><path class="st0" d="M19.7 53c-.2 0-.4 0-.6-.1-.7-.3-.9-1.1-.6-1.8l2.8-5.8c.3-.7 1.1-.9 1.8-.6.7.3.9 1.1.6 1.8l-2.8 5.8c-.3.4-.7.7-1.2.7zM13.1 53c-.2 0-.4 0-.6-.1-.7-.3-.9-1.1-.6-1.8l2.8-5.8c.3-.7 1.1-.9 1.8-.6.7.3.9 1.1.6 1.8l-2.8 5.8c-.2.4-.7.7-1.2.7zM46.8 53c-.2 0-.4 0-.6-.1-.7-.3-.9-1.1-.6-1.8l2.8-5.8c.3-.7 1.1-.9 1.8-.6.7.3.9 1.1.6 1.8L48 52.3c-.2.4-.7.7-1.2.7zM40.2 53c-.2 0-.4 0-.6-.1-.7-.3-.9-1.1-.6-1.8l2.8-5.8c.3-.7 1.1-.9 1.8-.6.7.3.9 1.1.6 1.8l-2.8 5.8c-.2.4-.7.7-1.2.7z"/><path class="st1" d="M27.7 59.3c-.2 0-.5-.1-.7-.2-.6-.4-.8-1.2-.4-1.8l7.9-13.1h-8.3L35.5 31c.4-.6 1.2-.7 1.8-.3.6.4.7 1.3.3 1.9l-6.4 9.1h7.9L28.8 58.6c-.2.4-.7.7-1.1.7z"/><path class="st2" d="M50.9 22.3c.1-.8.2-1.6.2-2.4 0-7.4-6-13.4-13.4-13.4-4.5 0-8.7 2.3-11.2 6-1.1-.5-2.4-.8-3.6-.8-5.1 0-9.3 4.2-9.3 9.3v.3c-4.1 1.4-7 5.2-7 9.7 0 5.6 4.6 10.2 10.2 10.2h5c1.6 0 1.5-2.6 0-2.6h-5c-4.2 0-7.5-3.4-7.5-7.5 0-3.6 2.5-6.7 6.1-7.4l1.3-.2-.2-1.3c-.1-.4-.1-.8-.1-1.1 0-3.6 3-6.6 6.6-6.6 1.2 0 2.4.3 3.5 1l1.2.7.7-1.3c1.9-3.5 5.5-5.7 9.5-5.7 5.9 0 10.7 4.8 10.7 10.7 0 1.1-.2 2.2-.5 3.3l-.8 1.8 2.1-.1h.3c3.8 0 6.8 3.1 6.8 6.8 0 3.8-3.1 6.8-6.8 6.8H44c-1.7 0-2 2.6 0 2.6h5.7c5.2 0 9.5-4.3 9.5-9.5 0-4.7-3.7-8.7-8.3-9.3z"/></g></svg>`;
    default:
      console.error("Main weather not recognized:", description);
      return "Main weather not recognized:" + description;
  }
}
