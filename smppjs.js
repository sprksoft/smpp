//java script komt hier je weet wel
//ok - ldev
//oke logis - andere ldev

const default_settings = {
  dmenu: {
    centerd: true,
    flip_shift_key: false,
  },
  profile: "default",
  background: "none",
  halte: 302558,
  overwrite_theme: false,
  location: "keerbergen",
  blur: "2",
  snow: "0",
  shownews: true,
  showsnake: false
};

function unbloat() {
  document.body.innerHTML = '';
}

//WARNING: garbage
try {
  document.getElementsByClassName("js-btn-logout")[0].innerHTML = "Logout -->";
  document.getElementById("notifsToggleLabel").innerHTML = "Toon pop-ups"
} catch (e) { }
//END Garbage


let goto_items = get_data("goto_menu", ".js-shortcuts-container > a", function (el, data) {
  const name = el.innerText.toLowerCase().trim();
  data[name] = el.href;
});

let vakken = {};
get_data_bg("vakken", ".course-list > li > a", function (el, data) {
  const name = el.getElementsByClassName("course-link__name")[0].innerText.toLowerCase().trim();
  data[name] = el.href;
}, function (data) {
  vakken = data;
});
function clearsettings() {
  localStorage.clear();
  console.log("cleared settings!")
}
async function apply() {
  let settingsData = JSON.parse(window.localStorage.getItem("settingsdata"))
  if (settingsData == null) {
    settingsData = default_settings;
    window.localStorage.setItem("settingsdata", JSON.stringify(settingsData));
  }

  console.log(settingsData)
  const profileSelect = settingsData.profile
  const background = settingsData.background
  const halte = settingsData.halte
  const overwrite_theme = settingsData.overwrite_theme;
  const loc = settingsData.location;
  const blurvalue = settingsData.blur;
  const snow = settingsData.snow;
  const shownews = settingsData.shownews;
  const showsnake = settingsData.showsnake;
  set_theme(profileSelect);
  if (overwrite_theme == true) {
    set_background(background);
  }
  let style = document.documentElement.style;
  let bigblurvalue = blurvalue * 2;
  const rightContainer = document.getElementById('rightcontainer');
  const centralContainer = document.getElementById('centercontainer')
  if (blurvalue == 0) {
    bigblurvalue += 2;
  };
  //check if on homepage:
  if (centralContainer) {
    rightContainer.innerHTML = ""
    if (loc != "") {
      await set_weather_loc(loc);
    }
    if (showsnake) {
      startSnakeGame()
    }

    if (halte) {
      decodehalte()
      document.getElementById("leftcontainer").style.display = "inline"
    } else {
      document.getElementById("leftcontainer").style.display = "none"
    }
    if (!shownews) {
      centralContainer.innerHTML = ' '
    }
  } else {
    console.log("Not on home page, no Lijn or weather needed")
  }

  style.setProperty('--blur-value-large', 'blur(' + bigblurvalue + 'px)');
  style.setProperty('--blur-value-small', 'blur(' + blurvalue + 'px)');
  set_snow_level(snow);
  const checkedCheckboxes = document.querySelectorAll('label.checkbox input[type="checkbox"]:checked');
}


function store() {
  let settingsData = {}
  const profileSelect = document.getElementById("profileSelector").value;
  const background = document.getElementById("background").value;
  const halte = document.getElementById("halt").checked;
  const overwrite_theme = document.getElementById("button").checked;
  const loc = document.getElementById("location").value;
  const slider = document.getElementById('mySlider').value;
  const snowSlider = document.getElementById('snowSlider').value;
  const shownews = document.getElementById("shownewselement").checked;
  const showsnake = document.getElementById('showsnakeelement').checked;

  settingsData.profile = profileSelect;
  settingsData.background = background;
  settingsData.halte = halte;
  settingsData.overwrite_theme = overwrite_theme;
  settingsData.location = loc.charAt(0).toUpperCase() + loc.slice(1);
  settingsData.blur = slider;
  settingsData.snow = parseInt(snowSlider);
  settingsData.shownews = shownews;
  settingsData.showsnake = showsnake;
  window.localStorage.setItem("settingsdata", JSON.stringify(settingsData));
  apply()
}
function load() {
  let settingsData = JSON.parse(window.localStorage.getItem("settingsdata"));
  const profileSelect = document.getElementById("profileSelector");
  const background = document.getElementById("background");
  const halte = document.getElementById("halt");
  const overwrite_theme = document.getElementById("button");
  const loc = document.getElementById("location");
  const blur = document.getElementById('mySlider');
  const snowSlider = document.getElementById('snowSlider');
  const shownews = document.getElementById("shownewselement");
  const showsnake = document.getElementById("showsnakeelement");
  if (settingsData == undefined) {
    console.log("settings data is undefined(this cannot happen)")
    return
  }
  profileSelect.value = settingsData.profile
  background.value = settingsData.background
  halte.checked = settingsData.halte
  overwrite_theme.checked = settingsData.overwrite_theme
  loc.value = settingsData.location
  blur.value = settingsData.blur
  snowSlider.value = settingsData.snow
  shownews.checked = settingsData.shownews
  showsnake.checked = settingsData.showsnake
}
popup = document.getElementById("searchMenu");
if (popup != null) {
  popup.addEventListener("change", store)


  search_button = document.querySelector('.js-btn-search')
  search_button.innerText = "Settings"
  search_button.addEventListener("click", function () {
    const popup_settings = document.getElementById("searchMenu");
    popup_settings.innerHTML = `<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>popup</title>
    </head>
    
    <body>
    <h3 class="popuptitles">Color profile:</h3>
    
    <select id="profileSelector" >
        <option value="default">Default Deluxe</option>
        <option value="white">Off White</option>
        <option value="ldev">Dark Sands</option>
        <option value="birb">Midnight Sapphire</option>
        <option value="stalker">Ruby Eclipse</option>
        <option value="chocolate">Dark Mocha</option>
        <option value="mountain">Sharp Peaks</option>
        <option value="winter">Arctic Azure</option>
        <option value="galaxy">Fluorescent Galaxy</option>
        <option value="sand">Sahara Oasis</option>
        <option value="purple">Neon Violet</option>
        <option value="fall">Autumn Gloom</option>
        <option value="matcha">Matcha Green</option>
    </select>
    
    <h3 class="popuptitles">Show DeLijn app:</h3>
    <label class="switch">
    <input class="popupinput" type="checkbox" id="halt">
    <span class="slider round"></span>
    </label>
    
    <h3 class="popuptitles">Location (weather):</h3>
    <input class="popupinput" id="location" type="text"></input>
    
    <h3 class="popuptitles">Custom wallpaper (optional):</h3>
    <div class="textandbutton">
        <input class="popupinput" id="background" type="text"></input>
        <label class="switch">
            <input class="popupinput" type="checkbox" id="button">
            <span class="slider round"></span>
        </label>
    </div>
    <h3 class="popuptitles">Blur:</h3>
    <input type="range" min="0" max="20" value="0" class="sliderblur" id="mySlider">
    <h3 class="popuptitles">Snow:</h3>
    <input type="range" min="0" max="500" value="0" class="sliderblur" id="snowSlider">
  
    <div class="textandbutton">
      <div>
        <h3 class="popuptitles">Snake:</h3>
        <label class="switch">
          <input class="popupinput" type="checkbox" id="showsnakeelement">
          <span class="slider round"></span>
          </label>
      </div>
  <div>
      <h3 class="popuptitles">News:</h3>
      <label class="switch">
        <input class="popupinput" type="checkbox" id="shownewselement">
        <span class="slider round"></span>
        </label>
    </div>
  
    </div>
  
    </body>
    
`
    load()
  });

}


function set_background(background) {
  let style = document.documentElement.style;
  style.setProperty('--loginpage-image', "url(" + background + ")");
}

const theme_names = ["default", "white", "ldev", "birb", "stalker", "chocolate", "winter", "fall", "matcha", "vax", "galaxy", "sand"];
function set_theme(name) {
  let style = document.documentElement.style;
  style.setProperty('--color-accent', '#8f8f95');
  style.setProperty('--color-text', '#C2BAB2');
  style.setProperty('--color-base00', '#191817');
  style.setProperty('--color-base01', '#232020');
  style.setProperty('--color-base02', '#3f3c3b');
  style.setProperty('--color-base03', '#5b5756');
  style.setProperty('--color-popup-border', 'var(--color-accent)');
  style.setProperty('--color-hover-border', 'var(--color-accent)');
  style.setProperty('--color-settings-bg', 'var(--color-base02)');
  style.setProperty('--color-settings-border', 'var(--color-base03)');
  style.setProperty('--color-settings-ui-bg', 'var(--color-base01)');
  style.setProperty('--color-settings-ui-border', 'var(--color-base02)');
  style.setProperty('--color-settings-ui-layer2', 'var(--color-base03)');
  style.setProperty('--color-homepage-sidebars-bg', "#02020585");
  style.setProperty('--loginpage-image', "url(https://4kwallpapers.com/images/wallpapers/desert-doom-sand-dunes-dark-background-monochrome-landscape-2560x1080-6409.jpg)");

  switch (name) {
    case "default":
      //default changes nothing so keep
      break;
    case 'white':
      style.setProperty('--color-accent', '#4b5a6f');
      style.setProperty('--color-text', '#1e222c'); /*off zwart :)*/
      style.setProperty('--color-base00', '#f6f6f6');
      style.setProperty('--color-base01', '#efeeec');
      style.setProperty('--color-base02', '#e3e2e0');
      style.setProperty('--color-homepage-sidebars-bg', "#02020540");
      style.setProperty('--color-base03', '#cdd8ee');
      style.setProperty('--loginpage-image', "url(https://wallpaperaccess.com/full/1474688.jpg)");
      break;
    case 'ldev':
      style.setProperty('--color-accent', '#ffd5a0');
      style.setProperty('--color-popup-border', 'var(--color-base02)');
      style.setProperty('--color-hover-border', 'var(--color-base03)')
      style.setProperty('--color-homepage-sidebars-bg', "var(--color-base00)");
      /*style.setProperty('--color-settings-bg', 'var(--color-base01)');
      style.setProperty('--color-settings-border', 'var(--color-base02)');
      style.setProperty('--color-settings-ui-bg', 'var(--color-base02)');
      style.setProperty('--color-settings-ui-border', 'var(--color-base03)');
      style.setProperty('--color-settings-ui-layer2', 'var(--color-base00)'); */
      style.setProperty('--loginpage-image', "url(https://i.redd.it/yfssdsfosao11.png)");
      break;
    case 'purple':
      style.setProperty('--color-accent', '#bd4fb3');
      style.setProperty('--color-text', '#d9cdff');
      style.setProperty('--color-base00', '#0b021d');
      style.setProperty('--color-base01', '#130332');
      style.setProperty('--color-base02', '#250654');
      style.setProperty('--color-base03', '#3f0a74');
      style.setProperty('--loginpage-image', "url(https://www.hdwallpapers.in/download/macos_monterey_shapes_hd_macos-2560x1440.jpg)");
      break;
    case 'stalker':
      style.setProperty('--color-accent', "#f51a26");
      style.setProperty('--color-text', "#f87065");
      style.setProperty('--color-base00', "#191817");
      style.setProperty('--color-base01', "#481b18");
      style.setProperty('--color-base02', "#940a12");
      style.setProperty('--color-base03', "#680e0f");
      style.setProperty('--loginpage-image', "url(https://media.timeout.com/images/102945740/image.jpg)");
      break;
    case 'chocolate':
      style.setProperty('--color-accent', '#cdbcb4');
      style.setProperty('--color-text', '#dcdad0');
      style.setProperty('--color-base00', '#20181c');
      style.setProperty('--color-base01', '#2c2326');
      style.setProperty('--color-base02', '#3b2e2e');
      style.setProperty('--color-base03', '#4c3e3e');
      style.setProperty('--loginpage-image', "url(https://www.hdwallpapers.in/download/wet_brown_leaves_hd_dark_aesthetic-HD.jpg)");
      break;
    case 'fall':
      style.setProperty('--color-accent', '#f8c791');
      style.setProperty('--color-text', '#d3cbc3');
      style.setProperty('--color-base00', '#231717');
      style.setProperty('--color-base01', '#3b1c16');
      style.setProperty('--color-base02', '#7b3f31');
      style.setProperty('--color-base03', '#bf6f51');
      style.setProperty('--loginpage-image', "url(https://wallpapercave.com/wp/wp7464660.jpg)");
      break;
    case 'winter':
      style.setProperty('--color-accent', '#8aadb6');
      style.setProperty('--color-text', '#C2BAB2');
      style.setProperty('--color-base00', '#071b2c');
      style.setProperty('--color-base01', '#152f47');
      style.setProperty('--color-base02', '#345f7f');
      style.setProperty('--color-base03', '#b9d4f4');
      style.setProperty('--loginpage-image', "url(https://th.bing.com/th/id/R.fd4990dbff7b2d998a61b5a60b6b1949?rik=TkC2r3hdP1Ma9g&pid=ImgRaw&r=0)");
      break;
    case 'birb':
      style.setProperty('--color-accent', '#8590aacc');
      style.setProperty('--color-text', '#a8a9ab');
      style.setProperty('--color-base00', '#0c0c13');
      style.setProperty('--color-base01', '#141519');
      style.setProperty('--color-base02', '#1a1b1f');
      style.setProperty('--color-base03', '#1f2024');
      style.setProperty('--loginpage-image', "url(https://wallpapercave.com/wp/wp4673203.jpg)");
      break;
    case 'matcha':
      style.setProperty('--color-accent', '#d1f8e7');
      style.setProperty('--color-text', '#d1ebd2');
      style.setProperty('--color-base00', '#243926');
      style.setProperty('--color-base01', '#365138');
      style.setProperty('--color-base02', '#456046');
      style.setProperty('--color-base03', '#4f7a51');
      style.setProperty('--loginpage-image', "url(https://wallpapercave.com/wp/wp9313069.jpg)");
      break;
    case 'mountain':
      style.setProperty('--color-accent', '#f8f8fa');
      style.setProperty('--color-text', '#f8f8fa');
      style.setProperty('--color-base00', '#121c28');
      style.setProperty('--color-base01', '#23364e');
      style.setProperty('--color-base02', '#52647c');
      style.setProperty('--color-base03', '#8294ac');
      style.setProperty('--loginpage-image', "url(https://hdqwalls.com/download/everest-3840x2160.jpg)");
      break;
    case 'vax':
      style.setProperty('--color-accent', '#492f29');
      style.setProperty('--color-text', '#492f29');
      style.setProperty('--color-base00', '#9c6544');
      style.setProperty('--color-base01', '#9c6544');
      style.setProperty('--color-base02', '#9c6544');
      style.setProperty('--color-base03', '#9c6544');
      style.setProperty('--loginpage-image', "url(https://wallpapers.com/images/hd/star-wars-place-ztno3exzqff0m0ci.webp)");
      break;
    case 'sand':
      style.setProperty('--color-accent', '#8097c5');
      style.setProperty('--color-text', '#c1a49c');
      style.setProperty('--color-base00', '#2e2526');
      style.setProperty('--color-base01', '#3d3434');
      style.setProperty('--color-base02', '#544848');
      style.setProperty('--color-base03', '#634f4e');
      style.setProperty('--loginpage-image', "url(https://hdqwalls.com/wallpapers/macos-mojave-dusk-mode-stock-el.jpg)");
      break;
    case 'galaxy':
      style.setProperty('--color-accent', '#bd92cd');
      style.setProperty('--color-text', '#f0f0f0');
      style.setProperty('--color-base00', '#1e222c');
      style.setProperty('--color-base01', '#2e3440');
      style.setProperty('--color-base02', '#3b4252');
      style.setProperty('--color-base03', '#434c5e');
      style.setProperty('--loginpage-image', "url(https://i.redd.it/u80014ygsea51.png)");
      break;

    // Add more cases for other profiles as needed
    default:
    // Handle default case or do nothing if no match found
  }
}
apply()
