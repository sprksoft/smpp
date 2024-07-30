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
  if (enable_snow_mul) {
    count += 20;
    count *= 5;
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
  if (enable_rain_mul) {
    count += 20;
    count *= 5;
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
function set_star_level(count) {
  if (count > 3000) {
    count = 3000;
  }
  count = Math.floor(count / 500 + 1)

  let starsContainer = document.getElementById("stars");

  if (starsContainer) {
    starsContainer.remove();
  }
  
  starsContainer = document.createElement("div");
  starsContainer.id = "stars";
  starsContainer.className = "raindrops"; // Ensure this matches your CSS if required

  for (let i = 0; i < count; i++) {
    let star = document.createElement("img");
    star.classList.add("star");
    star.src = "https://raw.githubusercontent.com/NightFlavor/smpp-images/main/star.svg"; // Use a star image

    // Random start and end positions for the stars
    let startX = Math.random() * 100; 
    let endX = Math.random() * 200 - 100; // More horizontal spread

    star.style.left = `${startX}%`;
    star.style.setProperty('--star-start-x', `${startX}vw`);
    star.style.setProperty('--star-end-x', `${endX}vw`);
    star.style.animation = `star_fall ${Math.random() * 2 + 2}s linear infinite`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    star.style.width = `${Math.random() * 7.5 + 7.5}px`;

    starsContainer.appendChild(star);
  }

  document.body.appendChild(starsContainer);
}


