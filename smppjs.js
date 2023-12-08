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
  hidenews: false
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
  const hidenews = settingsData.hidenews;
  set_theme(profileSelect);
  if (overwrite_theme == true) {
    set_background(background);
  }
  await set_weather_loc(loc);
  let style = document.documentElement.style;
  let bigblurvalue = blurvalue * 2;
  if (blurvalue == 0){
    bigblurvalue += 2;
  };
  style.setProperty('--blur-value-large', 'blur(' + bigblurvalue + 'px)');
  style.setProperty('--blur-value-small', 'blur(' + blurvalue + 'px)');
  if (halte != undefined) {
    fetchData(halte);
  };
  set_snow_level(snow);

  let cc = document.getElementById("centercontainer")
  if (cc != undefined && hidenews) {
    cc.innerHTML = ' '
  }
}


function store() {
  let settingsData = {}
  const profileSelect = document.getElementById("profileSelector").value;
  const background = document.getElementById("background").value;
  const halte = document.getElementById("halt").value;
  const overwrite_theme = document.getElementById("button").checked;
  const loc = document.getElementById("location").value;
  const slider = document.getElementById('mySlider').value;
  const snowSlider = document.getElementById('snowSlider').value;
  const hidenews = document.getElementById("hidenewselement").checked;
  console.log("started storing...")
  settingsData.profile = profileSelect;
  settingsData.background = background;
  settingsData.halte = halte;
  settingsData.overwrite_theme = overwrite_theme;
  settingsData.location = loc;
  settingsData.blur = slider;
  settingsData.snow = parseInt(snowSlider);
  settingsData.hidenews = hidenews;
  window.localStorage.setItem("settingsdata", JSON.stringify(settingsData));
  apply()
  console.log("settings are stored and applied")
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
  const hidenews = document.getElementById("hidenewselement");
  console.log("started loading settings...")
  if (settingsData == undefined) {
    //TODO: set params to default
    console.log("settings data is undefined")
    return
  }
  profileSelect.value = settingsData.profile
  background.value = settingsData.background
  halte.value = settingsData.halte
  overwrite_theme.checked = settingsData.overwrite_theme
  loc.value = settingsData.location
  blur.value = settingsData.blur
  snowSlider.value = settingsData.snow
  hidenews.checked = settingsData.hidenews
  console.log("loaded all settings")
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
<h3 class="popuptitles">Choose color profile:</h3>

<select id="profileSelector">
    <option value="default">Default</option>
    <option value="ldev">ldev</option>
    <option value="birb">Birb</option>
    <option value="bjarn">Bjarne</option>
    <option value="tan">Tan</option>
    <option value="fall">Fall</option>
    <option value="winter">Winter</option>
    <option value="purple">Purple</option>
    <option value="matcha">Matcha</option>
    <option value="mountain">Mountain</option>
    <option value="vax">vax</option>
</select>

<h3 class="popuptitles">Choose bus halte id:</h3>
<input class="popupinput" id="halt" type="text"></input>
<h3 class="popuptitles">Choose location:</h3>
<input class="popupinput" id="location" type="text"></input>

<h3 class="popuptitles">Background Image(optional):</h3>
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
<h3 class="popuptitles">Hide News:</h3>
<label class="switch">
<input class="popupinput" type="checkbox" id="hidenewselement">
<span class="slider round"></span>
</label>
</body>
`
    load()
  });

}


function set_background(background) {
  let style = document.documentElement.style;
  style.setProperty('--loginpage-image', "url(" + background + ")");
}


const theme_names = ["default", "ldev", "birb", "bjarn", "tan", "winter", "fall", "matcha", "vax"];
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
  style.setProperty('--color-homepage-sidebars-bg', "#02020585");
  style.setProperty('--loginpage-image', "url(https://images.hdqwalls.com/wallpapers/moon-astrophotography-4k-sc.jpg)");

  switch (name) {
    case "default":
      //default changes nothing so keep
      break;
    case 'ldev':
      style.setProperty('--color-accent', '#ffd5a0');
      style.setProperty('--color-popup-border', 'var(--color-base02)');
      style.setProperty('--color-hover-border', 'var(--color-base03)')
      style.setProperty('--color-homepage-sidebars-bg', "var(--color-base00)");
      style.setProperty('--loginpage-image', "url(https://i.redd.it/yfssdsfosao11.png)");
      break;
    case 'purple':
      style.setProperty('--color-accent', '#993691');
      style.setProperty('--color-text', '#a59dbf');
      style.setProperty('--color-base00', '#0b021d');
      style.setProperty('--color-base01', '#130332');
      style.setProperty('--color-base02', '#250654');
      style.setProperty('--color-base03', '#3f0a74');
      style.setProperty('--loginpage-image', "url(https://www.hdwallpapers.in/download/macos_monterey_shapes_hd_macos-2560x1440.jpg)");
      break;
    case 'bjarn':
      style.setProperty('--color-accent', "#95a4ee");
      style.setProperty('--color-text', "#d2e4e9");
      style.setProperty('--color-base00', "#191817");
      style.setProperty('--color-base01', "#232323");
      style.setProperty('--color-base02', "#1e1e1e");
      style.setProperty('--color-base03', "#4a3449");
      style.setProperty('--loginpage-image', "url(https://th.bing.com/th/id/R.4a459b99bdc535e2fdbb4d38bf96e0fe?rik=%2fA2q0w%2fC%2fBQXcQ&pid=ImgRaw&r=0)");
      break;
    case 'tan':
      style.setProperty('--color-accent', '#F0F2F0');
      style.setProperty('--color-text', '#e0dcd3');
      style.setProperty('--color-base00', '#402F2D');
      style.setProperty('--color-base01', '#594645');
      style.setProperty('--color-base02', '#90756b');
      style.setProperty('--color-base03', '#D9C5B4');
      style.setProperty('--loginpage-image', "url(https://4kwallpapers.com/images/wallpapers/gargantua-black-3840x2160-9621.jpg)");
      break;
    case 'fall':
      style.setProperty('--color-accent', '#F2AF5C');
      style.setProperty('--color-text', '#C2BAB2');
      style.setProperty('--color-base00', '#261D1D');
      style.setProperty('--color-base01', '#40312E');
      style.setProperty('--color-base02', '#BF5B45');
      style.setProperty('--color-base03', '#D9734E');
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
      style.setProperty('--color-accent', '#66ac6d');
      style.setProperty('--color-text', '#9bd49f');
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
          // Add more cases for other profiles as needed
    default:
    // Handle default case or do nothing if no match found
  }
}
apply()
