var enable_snow_mul = false;
var enable_rain_mul = false;
function set_snow_multiplier(on) {
  enable_snow_mul = on;
}
function set_rain_multiplier(on) {
  enable_rain_mul = on;
}
function set_snow_level(count) {
  let snow = document.getElementById("snowflakes");
  if (count > 3000) {
    count = 3000;
  }
  if (snow != undefined) {
    snow.remove();
  }
  snow = document.createElement("div");
  snow.id = "snowflakes"
  snow.classList = "snowflakes";

  for (let i = 0; i < count; i++) {
    let flake = document.createElement("img");
    flake.classList = "snowflake";
    flake.src = "https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/snowflakeworking.svg";
    flake.style = ` left: ${Math.floor(Math.random() * 100)}%; animation: snowflake_fall_${Math.floor(Math.random() * 3)} ${Math.floor(Math.random() * 7) + 10}s ease-in-out infinite; animation-delay: ${Math.floor(Math.random() * 40) - 40}s; width: ${Math.floor(Math.random() * 20) + 10}px;`;
    snow.appendChild(flake);
  }
  document.documentElement.appendChild(snow);
}
function set_rain_level(count) {
  let rain = document.getElementById("raindrops");
  if (count > 3000) {
    count = 3000;
  }
  if (rain != undefined) {
    rain.remove();
  }
  rain = document.createElement("div");
  rain.id = "raindrops"
  rain.classList = "raindrops";

  for (let i = 0; i < count; i++) {
    let raindrop = document.createElement("img");
    raindrop.classList.add("raindrop");
    raindrop.src = "https://raw.githubusercontent.com/NightFlavor/smpp-images/main/raindrop.svg";
    raindrop.style.left = `${Math.random() * 100}%`;
    raindrop.style.animation = `raindrop_fall ${Math.random() * 2 + 2}s linear infinite`;
    raindrop.style.animationDelay = `${Math.random() * 5}s`;
    raindrop.style.width = `${Math.random() * 7.5 + 7.5}px`;
    rain.appendChild(raindrop);
  }
  document.documentElement.appendChild(rain);
}
function set_overlay_based_on_conditions(count){
  if (enable_rain_mul){
    set_rain_level(count)
  }else if (enable_snow_mul){
    set_snow_level(count)
  }
}