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
/* var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
    script.onload = function(){
        particlesJS("snow", {
            "particles": {
                "number": {
                    "value": 200,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ffffff"
                },
                "opacity": {
                    "value": 0.7,
                    "random": false,
                    "anim": {
                        "enable": false
                    }
                },
                "size": {
                    "value": 5,
                    "random": true,
                    "anim": {
                        "enable": false
                    }
                },
                "line_linked": {
                    "enable": false
                },
                "move": {
                    "enable": true,
                    "speed": 5,
                    "direction": "bottom",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": true,
                        "rotateX": 300,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "events": {
                    "onhover": {
                        "enable": false
                    },
                    "onclick": {
                        "enable": false
                    },
                    "resize": false
                }
            },
            "retina_detect": true
        });
    }
    document.head.append(script); */
