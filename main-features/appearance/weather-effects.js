let enable_snow_mul = false;
let enable_rain_mul = false;

function set_snow_multiplier(value) {
  enable_snow_mul = value;
}

function set_rain_multiplier(value) {
  enable_rain_mul = value;
}

function set_snow_level(amount, opacity) {
  document.getElementById("snowflakes")?.remove();
  amount = amount > 3000 ? 3000 : amount;
  let snowDiv = document.createElement("div");
  snowDiv.id = "snowflakes";

  for (let i = 0; i < amount; i++) {
    let flake = document.createElement("img");
    flake.classList = "snowflake";
    console.log(currentThemeName);
    flake.src =
      currentThemeName == "pink"
        ? getExtensionImage("/icons/weather-overlay/blossom.svg")
        : getExtensionImage("/icons/weather-overlay/snowflake.svg");

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

function set_rain_level(amount, opacity) {
  console.log(opacity);
  document.getElementById("raindrops")?.remove();
  amount = amount > 3000 ? 3000 : amount;
  let rainDiv = document.createElement("div");
  rainDiv.id = "raindrops";

  for (let i = 0; i < amount; i++) {
    let raindrop = document.createElement("img");
    raindrop.classList.add("raindrop");
    raindrop.src = getExtensionImage("/icons/weather-overlay/raindrop.svg");
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

function set_overlay_based_on_conditions(count, opacity) {
  if (enable_rain_mul) {
    set_rain_level(count, opacity);
  } else if (enable_snow_mul) {
    set_snow_level(count, opacity);
  }
}

function applyWeatherEffects(weatherOverlay) {
  let rainDiv = document.getElementById("raindrops");
  let snowDiv = document.getElementById("snowflakes");
  switch (weatherOverlay.type) {
    case "snow":
      set_snow_level(weatherOverlay.amount, weatherOverlay.opacity);
      if (rainDiv) rainDiv.remove();
      break;
    case "realtime":
      if (rainDiv) rainDiv.remove();
      if (snowDiv) snowDiv.remove();
      set_overlay_based_on_conditions(
        weatherOverlay.amount,
        weatherOverlay.opacity
      );
      break;
    case "rain":
      set_rain_level(weatherOverlay.amount, weatherOverlay.opacity);
      if (snowDiv) snowDiv.remove();
      break;
    default:
      console.error("No weather selector");
      break;
  }
}
