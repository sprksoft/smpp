let enable_snow_mul = false;
let enable_rain_mul = false;
function set_snow_multiplier(on) {
  enable_snow_mul = on;
}
function set_rain_multiplier(on) {
  enable_rain_mul = on;
}
function set_snow_level(count) {
  document.getElementById("snowflakes")?.remove()
  count = count > 3000 ? 3000 : count
  let snowDiv = document.createElement("div");
  snowDiv.id = "snowflakes"

  for (let i = 0; i < count; i++) {
    let flake = document.createElement("img");
    flake.classList = "snowflake";
    flake.src = "https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/snowflakeworking.svg";
    flake.style = ` left: ${Math.floor(Math.random() * 100)}%; animation: snowflake_fall_${Math.floor(Math.random() * 3)} ${Math.floor(Math.random() * 7) + 10}s ease-in-out infinite; animation-delay: ${Math.floor(Math.random() * 40) - 40}s; width: ${Math.floor(Math.random() * 20) + 10}px;`;
    snowDiv.appendChild(flake);
  }
  document.documentElement.appendChild(snowDiv);
}
function set_rain_level(count) {
  document.getElementById("raindrops")?.remove()
  count = count > 3000 ? 3000 : count
  let rainDiv = document.createElement("div");
  rainDiv.id = "raindrops"

  for (let i = 0; i < count; i++) {
    let raindrop = document.createElement("img");
    raindrop.classList.add("raindrop");
    raindrop.src = "https://raw.githubusercontent.com/NightFlavor/smpp-images/main/raindrop.svg";
    raindrop.style.left = `${Math.random() * 100}%`;
    raindrop.style.animation = `raindrop_fall ${Math.random() * 2 + 2}s linear infinite`;
    raindrop.style.animationDelay = `${Math.random() * 5}s`;
    raindrop.style.width = `${Math.random() * 7.5 + 7.5}px`;
    rainDiv.appendChild(raindrop);
  }
  document.documentElement.appendChild(rainDiv);
}
function set_overlay_based_on_conditions(count) {
  if (enable_rain_mul) {
    set_rain_level(count)
  } else if (enable_snow_mul) {
    set_snow_level(count)
  }
}