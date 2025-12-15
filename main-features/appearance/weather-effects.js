function setSnowLevel(amount, opacity) {
  document.getElementById("snowflakes")?.remove();
  amount = amount > 3000 ? 3000 : amount;
  let snowDiv = document.createElement("div");
  snowDiv.id = "snowflakes";

  for (let i = 0; i < amount; i++) {
    let flake = document.createElement("img");
    flake.classList = "snowflake";
    flake.src =
      currentThemeName == "pink"
        ? getExtensionImage("icons/weather-overlay/blossom.svg")
        : getExtensionImage("icons/weather-overlay/snowflake.svg");

    flake.style.left = `${Math.floor(Math.random() * 100)}%`;
    flake.style.animation = `snowflake_fall_${Math.floor(Math.random() * 3)} ${
      Math.floor(Math.random() * 7) + 10
    }s ease-in-out infinite`;
    flake.style.animationDelay = `${Math.floor(Math.random() * 40) - 40}s`;
    flake.style.width = `${Math.floor(Math.random() * 20) + 10}px`;
    flake.style.opacity = opacity;
    snowDiv.appendChild(flake);
  }
  document.documentElement.appendChild(snowDiv);
}

function setRainLevel(amount, opacity) {
  document.getElementById("raindrops")?.remove();
  amount = amount > 3000 ? 3000 : amount;
  let rainDiv = document.createElement("div");
  rainDiv.id = "raindrops";

  for (let i = 0; i < amount; i++) {
    let raindrop = document.createElement("img");
    raindrop.classList.add("raindrop");
    raindrop.src = getExtensionImage("icons/weather-overlay/raindrop.svg");
    raindrop.style.left = `${Math.random() * 100}%`;
    raindrop.style.animation = `raindrop_fall ${
      Math.random() * 2 + 2
    }s linear infinite`;
    raindrop.style.animationDelay = `${Math.random() * 5 - 5}s`;
    raindrop.style.width = `${Math.random() * 7.5 + 7.5}px`;
    raindrop.style.opacity = opacity;
    rainDiv.appendChild(raindrop);
  }
  document.documentElement.appendChild(rainDiv);
}

async function setOverlayBasedOnConditions(amount, opacity) {
  async function getWeatherDescription(widget) {
    const weatherData = await getWidgetSetting(widget + ".cache.weatherData");
    if (weatherData == null) return null;
    if (weatherData.cod != 200) return null;
    return weatherData.weather[0].main;
  }

  let weatherWidgets = widgets.filter(
    (item) => item.name.toLowerCase().includes("weather") && item.isActive
  );
  let weathers = await Promise.all(
    weatherWidgets.map(async (widget) => {
      return await getWeatherDescription(widget.name);
    })
  );
  weathers = weathers.filter((description) => description != null);

  if (weathers.includes("Rain") || weathers.includes("Drizzle")) {
    setRainLevel(amount, opacity);
  }
  if (weathers.includes("Snow")) {
    setSnowLevel(amount, opacity);
  }
}

function applyWeatherEffects(weatherOverlay) {
  let rainDiv = document.getElementById("raindrops");
  let snowDiv = document.getElementById("snowflakes");
  switch (weatherOverlay.type) {
    case "snow":
      if (rainDiv) rainDiv.remove();
      setSnowLevel(weatherOverlay.amount, weatherOverlay.opacity);
      break;
    case "realtime":
      if (rainDiv) rainDiv.remove();
      if (snowDiv) snowDiv.remove();
      setOverlayBasedOnConditions(
        weatherOverlay.amount,
        weatherOverlay.opacity
      );
      break;
    case "rain":
      if (snowDiv) snowDiv.remove();
      setRainLevel(weatherOverlay.amount, weatherOverlay.opacity);
      break;
    default:
      console.error("No weather selector");
      break;
  }
}
