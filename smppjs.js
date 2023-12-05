//java script komt hier je weet wel
//ok - ldev
//oke logis - andere ldev

const default_settings={
  profile : "default",
background : "none",
halte : 303980,
overwrite_theme : false,
location : "keerbergen",
  slider : "2",
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


document.addEventListener("keyup", function (e) {
  if (e.key == ':') {
    let cmd_list = Object.keys(vakken).concat(Object.keys(goto_items).concat(["classroom", "onshape", "set background", "set theme", "set theme v2", "lock dmenu", "unbloat"]));
    dmenu(cmd_list, function (cmd, shift) {
      switch (cmd) {
        case "lock dmenu":
          lock_dmenu = !lock_dmenu;
          return;
        case "unbloat":
          unbloat();
          return;
        case "set background":
          dmenu([], function (url) {
            set_background(url);
            store_background(url);
          }, "bg url:");
          return;
        case "set theme":
          dmenu(theme_names, function (theme) {
            store_profile(theme);
            set_theme(theme)
          }, "theme:");
          return;
        case "set theme v2":
          dmenu(get_all_themes_v2(), function (theme) {
            store_profile(theme);
            set_theme_v2(theme);
          }, "theme:");
          return;
        case "classroom":
          open_url("https://classroom.google.com", shift);
          return;
        case "onshape":
          open_url("https://onshape.com", shift);
          return;
        default:
          break;
      }
      let got_url = goto_items[cmd]
      if (got_url != null) {
        open_url(got_url, shift);
        return;
      }
      let vakken_url = vakken[cmd];
      if (vakken_url != null) {
        open_url(vakken_url, shift);
        return;
      }
    }, "quick:");
  }
});
async function apply(){
  let settingsData = JSON.parse(window.localStorage.getItem("settingsdata"))
  console.log(settingsData)
  if (settingsData == null){
    console.log(default_settings)
    settingsData = default_settings;
    window.localStorage.setItem("settingsdata", JSON.stringify(settingsData));
    console.log(settingsData)
  }
  const profileSelect =  settingsData.profile
  const background = settingsData.background
  const halte = settingsData.halte
  const overwrite_theme = settingsData.overwrite_theme;
  const loc = settingsData.location;
  const blurvalue = settingsData.slider;
  console.log(profileSelect)
    set_theme(profileSelect);
    if (overwrite_theme == true) {
      set_background(background);
    }
  await set_weather_loc(loc);
  let style = document.documentElement.style;
  style.setProperty('--blur-value-large', 'blur(' + blurvalue * 2 + 'px)');
  style.setProperty('--blur-value-small', 'blur(' + blurvalue + 'px)');
  if (halte != undefined) {
    fetchData(halte);
  }
}


function store(){
  let settingsData = {}
  const profileSelect = document.getElementById("profileSelector").value;
  const background = document.getElementById("background").value;
  const halte = document.getElementById("halt").value;
  const overwrite_theme = document.getElementById("button").checked;
  const loc = document.getElementById("location").value;
  const slider = document.getElementById('mySlider').value;

  console.log("started storing...")
  console.log("set profile to " + profileSelect);
  console.log("set busid to " + halte);
  settingsData.profile = profileSelect;
  settingsData.background = background; 
  settingsData.halte = halte;
  settingsData.overwrite_theme = overwrite_theme;
  settingsData.location = loc;
  settingsData.slider = slider;  
  window.localStorage.setItem("settingsdata", JSON.stringify(settingsData));
  apply()

}
function load(){
  let settingsData = JSON.parse(window.localStorage.getItem("settingsdata"));
  const profileSelect = document.getElementById("profileSelector");
  const background = document.getElementById("background");
  const halte = document.getElementById("halt");
  const overwrite_theme = document.getElementById("button");
  const loc = document.getElementById("location");
  const slider = document.getElementById('mySlider');
  console.log("started loading...")
  if (settingsData == undefined){
    //TODO: set params to default
    console.log("settings data is undefined")
    return
  }
  profileSelect.value = settingsData.profile
  background.value = settingsData.background
  halte.value = settingsData.halte
  overwrite_theme.checked = settingsData.overwrite_theme
  loc.value = settingsData.location
  slider.value = settingsData.slider
  console.log(settingsData)
}
popup = document.getElementById("searchMenu");
console.log(popup)
if (popup != null){
  popup.addEventListener("change",store)
  
search_button = document.querySelector('.js-btn-search')
console.log(search_button)
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


<script src="popup.js"></script>
</body>
`
load()
console.log("popup loaded");
});

}


function set_background(background) {
  let style = document.documentElement.style;
  style.setProperty('--loginpage-image', "url(" + background + ")");
}


const theme_names = ["default", "ldev", "birb", "bjarn", "tan", "winter", "fall", "matcha"];
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
      style.setProperty('--loginpage-image', "url(https://hdqwalls.com/download/everest-3840x2160.jpg)");
      break;
    case 'birb':
      style.setProperty('--color-accent', '#8590aacc');
      style.setProperty('--color-text', '#626365');
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
    // Add more cases for other profiles as needed
    default:
    // Handle default case or do nothing if no match found
  }
}
apply()
console.log("Done");
