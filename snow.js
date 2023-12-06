var snow=undefined;

function set_snow_level(count) {
  if (count > 3000){
    count = 3000;
  }
  if (snow != undefined){
    snow.remove();
  }
  snow = document.createElement("div");
  snow.classList="snowflakes";

  for (let i=0; i < count; i++){
    let flake = document.createElement("img");
    flake.classList="snowflake";
    flake.src="https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/snowflakeworking.svg";
    flake.style=` left: ${Math.floor(Math.random()*100)}%; animation: snowflake_fall_${Math.floor(Math.random()*3)} ${Math.floor(Math.random()*7)+10}s ease-in-out infinite; animation-delay: ${Math.floor(Math.random()*40)-40}s; width: ${Math.floor(Math.random()*20)+10}px;`;
    snow.appendChild(flake);
  }

  document.documentElement.appendChild(snow);

}
