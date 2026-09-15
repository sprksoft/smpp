import { getExtensionImage } from "../../common/utils.js";
import { getWidgetSetting } from "../../widgets/widgets.js";
import { widgets } from "../../widgets/widgets.js";
import { currentThemeName } from "./themes.js";
import type { Settings } from "../settings/main-settings.js";

export type WeatherOverlay = Settings["appearance"]["weatherOverlay"];
export type WeatherOverlayType = WeatherOverlay["type"];

// Main weather groups from the OpenWeather API, string fallback for any others.
type WeatherCondition =
  | "Rain"
  | "Drizzle"
  | "Snow"
  | "Clear"
  | "Clouds"
  | "Thunderstorm"
  | (string & {});

// Only the fields of the cached weather data used in this file.
type WeatherApiResponse = {
  cod: number | string;
  weather: { main: WeatherCondition; description: string }[];
};

function setSnowLevel(amount: number, opacity: number): void {
  document.getElementById("snowflakes")?.remove();
  amount = amount > 3000 ? 3000 : amount;
  const snowDiv: HTMLDivElement = document.createElement("div");
  snowDiv.id = "snowflakes";

  for (let i = 0; i < amount; i++) {
    const flake: HTMLImageElement = document.createElement("img");
    flake.classList.add("snowflake");
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
    flake.style.opacity = String(opacity);
    snowDiv.appendChild(flake);
  }
  document.documentElement.appendChild(snowDiv);
}

function setRainLevel(amount: number, opacity: number): void {
  document.getElementById("raindrops")?.remove();
  amount = amount > 3000 ? 3000 : amount;
  const rainDiv: HTMLDivElement = document.createElement("div");
  rainDiv.id = "raindrops";

  for (let i = 0; i < amount; i++) {
    const raindrop: HTMLImageElement = document.createElement("img");
    raindrop.classList.add("raindrop");
    raindrop.src = getExtensionImage("icons/weather-overlay/raindrop.svg");
    raindrop.style.left = `${Math.random() * 100}%`;
    raindrop.style.animation = `raindrop_fall ${
      Math.random() * 2 + 2
    }s linear infinite`;
    raindrop.style.animationDelay = `${Math.random() * 5 - 5}s`;
    raindrop.style.width = `${Math.random() * 7.5 + 7.5}px`;
    raindrop.style.opacity = String(opacity);
    rainDiv.appendChild(raindrop);
  }
  document.documentElement.appendChild(rainDiv);
}

async function setOverlayBasedOnConditions(
  amount: number,
  opacity: number
): Promise<void> {
  async function getWeatherDescription(
    widget: string
  ): Promise<WeatherCondition | null> {
    const weatherData = (await getWidgetSetting(
      widget + ".cache.weatherData"
    )) as WeatherApiResponse | null;
    if (weatherData == null) return null;
    if (weatherData.cod != 200) return null;
    return weatherData.weather[0]?.main ?? null;
  }

  // widgets.ts is still untyped, so describe the fields used here.
  const weatherWidgets = (
    widgets as { name: string; isActive: boolean }[]
  ).filter(
    (item) => item.name.toLowerCase().includes("weather") && item.isActive
  );
  const weathers: WeatherCondition[] = (
    await Promise.all(
      weatherWidgets.map((widget) => getWeatherDescription(widget.name))
    )
  ).filter((description): description is WeatherCondition => description != null);

  if (weathers.includes("Rain") || weathers.includes("Drizzle")) {
    setRainLevel(amount, opacity);
  }
  if (weathers.includes("Snow")) {
    setSnowLevel(amount, opacity);
  }
}

export function applyWeatherEffects(weatherOverlay: WeatherOverlay): void {
  const rainDiv = document.getElementById("raindrops");
  const snowDiv = document.getElementById("snowflakes");
  const type: WeatherOverlayType = weatherOverlay.type;
  switch (type) {
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
    default: {
      const unknownType: never = type;
      console.error("No weather selector", unknownType);
      break;
    }
  }
}
