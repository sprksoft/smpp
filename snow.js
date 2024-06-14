var enable_snow_mul = false;
function set_snow_multiplier(on) {
  enable_snow_mul = on;
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
var enable_meteor_mul = false;

function set_meteor_multiplier(on) {
  enable_meteor_mul = on;
}

function set_meteor_level(count) {
  let meteors = document.getElementById("meteors");
  if (count > 3000) {
    count = 3000;
  }
  if (enable_meteor_mul) {
    count += 20;
    count *= 5;
  }
  if (meteors != undefined) {
    meteors.remove();
  }
  meteors = document.createElement("div");
  meteors.id = "meteors";
  meteors.classList = "meteors";

  for (let i = 0; i < count; i++) {
    let meteor = document.createElement("img");
    meteor.classList = "meteor";
    meteor.src = "https://cdn-icons-png.flaticon.com/128/8761/8761608.png";

    // Randomly decide if the meteor starts from the top or the left side
    if (Math.random() < 0.5) {
      // Start from the top
      meteor.style = `
        left: ${Math.floor(Math.random() * 100)}%;
        top: -50px; /* Start above the screen */
        animation: meteor_fall ${Math.floor(Math.random() * 7) + 10}s linear infinite;
        animation-delay: ${Math.floor(Math.random() * 40) - 40}s;
      `;
    } else {
      // Start from the left
      meteor.style = `
        left: -50px; /* Start to the left of the screen */
        top: ${Math.floor(Math.random() * 100)}%;
        animation: meteor_fall ${Math.floor(Math.random() * 7) + 10}s linear infinite;
        animation-delay: ${Math.floor(Math.random() * 40) - 40}s;
      `;
    }
    meteors.appendChild(meteor);
  }
  document.documentElement.appendChild(meteors);
}