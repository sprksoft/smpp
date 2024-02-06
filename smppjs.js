//java script komt hier je weet wel
//ok - ldev
//oke logis - andere ldev

const default_settings = {
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
const default_theme = {
  base0 : "#ff0000",
  base1 : "#00ff00",
  base2 : "#000ff0",
  base3 : "#ff0000",
  accent : "#0f00f0",
  text : "#fff0ff"
}

function unbloat() {
  document.body.innerHTML = '';
}
function discordpopup(){
  let discordelement = document.createElement("div")
  discordelement.innerHTML = `<div class="bigdiscordbutton" style="position: fixed; bottom: 0; left: 0; width: 40px; height: 40px; border: 2px solid var(--color-base00); border-radius:10px; background-color: var(--color-base01);">
  <a target="_blank" href="https://discord.gg/qCHZYepDqZ" class="discordbutton"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30px" height="30px" viewBox="0 -28.5 256 256" version="1.1" preserveAspectRatio="xMidYMid">
  <g>
      <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" class="st1" fill-rule="nonzero">

</path>
  </g>
</svg></a>
</div>`
document.body.appendChild(discordelement)
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
  const colorpickers = document.getElementById("colorpickers");
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
    if (colorpickers != undefined && profileSelect != "custom"){
    colorpickers.innerHTML = ``
  }
  let style = document.documentElement.style;
  let bigblurvalue = blurvalue * 2;
  const rightContainer = document.getElementById('rightcontainer');
  const centralContainer = document.getElementById('centercontainer')
  if (blurvalue == 0) {
    bigblurvalue += 2;
  };
let observer = new MutationObserver((mutations) => {
  let plannericonsactive = document.querySelector('.iconbtn--active');
  if (plannericonsactive) {
    plannericonsactive.style.backgroundColor = "var(--color-base02)";
  }
});
let config = { childList: true, subtree: true };
observer.observe(document.body, config);

  if (centralContainer) {
      
    discordpopup()
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

function storeTheme() {
  const base0 = document.getElementById("colorPicker1").value;
  const base1 = document.getElementById("colorPicker2").value;
  const base2 = document.getElementById("colorPicker3").value;
  const base3 = document.getElementById("colorPicker4").value;
  const accent = document.getElementById("colorPicker5").value;
  const text = document.getElementById("colorPicker6").value;
  let themeData = {
    base0 : base0,
    base1 : base1,
    base2 : base2,
    base3 : base3,
    accent : accent,
    text : text
  }
  window.localStorage.setItem("themedata", JSON.stringify(themeData));
}
function store() {
  let previousData = JSON.parse(window.localStorage.getItem("settingsdata"))
  profileSelectPrevious = previousData.profile
  if (profileSelectPrevious == "custom"){
    storeTheme()
  }
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
  if (profileSelect == "custom"){
loadCustomTheme()
  }
  apply()
}

function loadCustomThemeData(){
  let themeData = JSON.parse(window.localStorage.getItem("themedata"))
  document.getElementById("colorPicker1").value = themeData.base0
  document.getElementById("colorPicker2").value = themeData.base1
  document.getElementById("colorPicker3").value = themeData.base2
  document.getElementById("colorPicker4").value = themeData.base3
  document.getElementById("colorPicker5").value = themeData.accent
  document.getElementById("colorPicker6").value = themeData.text
  
}
function loadCustomTheme() {
  let themeData = JSON.parse(window.localStorage.getItem("themedata"))
  if (themeData == null) {
    themeData = default_theme;
    window.localStorage.setItem("themedata", JSON.stringify(themeData));
  }
  const colorpickers = document.getElementById("colorpickers");
    colorpickers.innerHTML =   `
    <div class="color-picker-container">
    <input type="color" class="color-picker" id="colorPicker1">
    <span class="color-label">Base0</span>
</div>
<div class="color-picker-container">
    <input type="color" class="color-picker" id="colorPicker2">
    <span class="color-label">Base1</span>
</div>
<div class="color-picker-container">
    <input type="color" class="color-picker" id="colorPicker3">
    <span class="color-label">Base2</span>
</div>
<div class="color-picker-container">
    <input type="color" class="color-picker" id="colorPicker4">
    <span class="color-label">Base3</span>
</div>
<div class="color-picker-container">
    <input type="color" class="color-picker" id="colorPicker5">
    <span class="color-label">Accent</span>
</div>
<div class="color-picker-container">
    <input type="color" class="color-picker" id="colorPicker6">
    <span class="color-label">Text</span>
</div>`
loadCustomThemeData()
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
  profileSelect.value = settingsData.profile
  background.value = settingsData.background
  halte.checked = settingsData.halte
  overwrite_theme.checked = settingsData.overwrite_theme
  loc.value = settingsData.location
  blur.value = settingsData.blur
  snowSlider.value = settingsData.snow
  shownews.checked = settingsData.shownews
  showsnake.checked = settingsData.showsnake
  if (profileSelect.value == "custom"){
    loadCustomTheme()
  }
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
        <option value="custom">Custom</option>
    </select>
    <div class="textandbutton" id="colorpickers">
    </div>
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

const theme_names = ["default", "white", "ldev", "birb", "stalker", "chocolate", "winter", "fall", "matcha", "vax", "galaxy", "sand", "custom"];
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
      case 'custom':
        let themeData = JSON.parse(window.localStorage.getItem("themedata"))
        if (themeData == null) {
          themeData = default_theme;
          window.localStorage.setItem("themedata", JSON.stringify(themeData));
        }
        style.setProperty('--color-accent', themeData.accent);
        style.setProperty('--color-text', themeData.text);
        style.setProperty('--color-base00', themeData.base0);
        style.setProperty('--color-base01', themeData.base1);
        style.setProperty('--color-base02', themeData.base2);
        style.setProperty('--color-base03', themeData.base3);
        style.setProperty('--loginpage-image', "url(https://github.com/frickingbird8002/smpp-images/blob/main/smppimageineed2-0.png?raw=true)");
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
      style.setProperty('--color-accent', "#d6574e");
      style.setProperty('--color-text', "#d9564b");
      style.setProperty('--color-base00', "#1a1311");
      style.setProperty('--color-base01', "#371b19");
      style.setProperty('--color-base02', "#5c1c1a");
      style.setProperty('--color-base03', "#823530");
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
      style.setProperty('--color-accent', '#daa0ef');
      style.setProperty('--color-text', '#f0f0f0');
      style.setProperty('--color-base00', '#1e222c');
      style.setProperty('--color-base01', '#2e3440');
      style.setProperty('--color-base02', '#474e5f');
      style.setProperty('--color-base03', '#5c667d');
      style.setProperty('--loginpage-image', "url(https://i.redd.it/u80014ygsea51.png)");
      break;

    // Add more cases for other profiles as needed
    default:
    // Handle default case or do nothing if no match found
  }
}
apply()
