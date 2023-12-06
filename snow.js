var snow=undefined;

function set_snow_level(count) {
  console.log("set snow "+count);
  if (snow != undefined){
    snow.remove();
  }
  snow = document.createElement("div");
  snow.classList="snowflakes";

  for (let i=0; i < count; i++){
    let flake = document.createElement("img");
    flake.classList="snowflake";
    flake.src="/static/img/christmas/snowflake.svg";
    flake.style=`animation-delay: ${Math.floor(Math.random()*40)-40}s; animation-duration: ${Math.floor(Math.random()*7)+10}s; left: ${Math.floor(Math.random()*100)}%; transform:rotate(${Math.floor(Math.random()*360)}deg)`;
    snow.appendChild(flake);
  }

  document.documentElement.appendChild(snow);

}
