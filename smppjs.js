//java script komt hier je weet wel
//ok - ldev
//oke logis - andere ldev
const default_theme = {
  base0: "#38313a", base1: "#826882", base2: "#ac85b7", base3: "#c78af0", accent: "#a3a2ec", text: "#ede3e3"
}
function unbloat() {
  document.body.innerHTML = '';
}
function discordpopup() {
  let discordelement = document.createElement("div")
  discordelement.innerHTML = discordSvg
  document.body.appendChild(discordelement)
}
function changeLogoutText() {
  var randomNum = Math.floor(Math.random() * 50) + 1;
  if (randomNum === 1) {
    return "Good Bye! →"
  }
  return "Log out →"
}
let logoutButton = document.getElementsByClassName("js-btn-logout")[0]
let notifsText = document.getElementById("notifsToggleLabel")
if (logoutButton) {
  logoutButton.innerHTML = changeLogoutText();
}
if (notifsText) {
  notifsText.innerHTML = "Toon pop-ups";
}
function openFileSelector() {
  document.getElementById('fileInput').click();
}
function clearsettings() {
  localStorage.clear();
  console.log("cleared settings!")
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
}
async function apply() {
  let style = document.documentElement.style;
  let settingsData = get_config();

  const colorpickers = document.getElementById("colorpickers");
  console.log(settingsData)
  const profileSelect = settingsData.profile
  const backgroundFile = settingsData.backgroundfile
  const backgroundLink = settingsData.backgroundlink
  const halte = settingsData.halte
  const overwrite_theme = settingsData.overwrite_theme;
  const loc = settingsData.location;
  const blurvalue = settingsData.blur;
  const weatherAmount = settingsData.weatherAmount;
  const shownews = settingsData.shownews;
  const showsnake = settingsData.showsnake;
  const showflappy = settingsData.showflappy;
  var show_scores = settingsData.show_scores;
  var showplanner = settingsData.showplanner;
  var IsBig = settingsData.isbig;
  var weatherSelector = settingsData.weatherSelector;
  var show_plant = settingsData.show_plant
  set_theme("default");
  set_theme(profileSelect);

  if (show_scores == undefined) {
    show_scores = false;
  }
  if (showplanner == undefined) {
    settingsData = get_config()
    settingsData.showplanner = true
    showplanner = true
    set_config(settingsData)
  }
  if (IsBig == undefined) {
    settingsData = get_config()
    settingsData.isbig = true
    IsBig = true
    set_config(settingsData)
  }
  if (show_plant == undefined) {
    settingsData = get_config()
    settingsData.show_plant = true
    show_plant = true
    set_config(settingsData)
  }
  if (weatherSelector == undefined) {
    settingsData = get_config()
    settingsData.weatherSelector = 0
    weatherSelector = 0
    set_config(settingsData)
  }
  topnav = document.querySelector('.topnav')
  if (topnav) {
    topnav.insertBefore(document.querySelector('[data-links]'), document.querySelector('[data-courses]'));
  }
  const notifsButton = document.querySelector('.js-btn-notifs');
  if (notifsButton) {
    const textSpan = notifsButton.querySelector('span');
    notifsButton.innerHTML = notfisSvg
    notifsButton.appendChild(textSpan);
  }
  const startButton = document.querySelector('.js-btn-home');
  if (startButton) {
    startButton.innerHTML = homeiconSvg
  }
  const messageButton = document.querySelector('.js-btn-messages');
  if (messageButton) {
    const textSpan = messageButton.querySelector('span');
    messageButton.innerHTML = messageSvg
    messageButton.appendChild(textSpan);
  }
  let login_app_left = document.querySelector('.login-app__left');
  if (login_app_left != undefined) {
    login_app_left.innerHTML = ' ';
    document.getElementsByClassName('login-app__platform-indicator')[0].innerHTML = '<h1 class="logintitle">Smartschool ++</h1>';
    document.getElementsByClassName('login-app__title--separator')[0].innerHTML = `<h4 class="white_text_button" id="showmore">More</h4>`;
    document.getElementsByClassName('login-app__title--separator')[0].innerHTML = `<button type="button" class="white_text_button" id="showmore">More</button>`;
    document.getElementById('showmore').addEventListener('click', showmore)
    function showmore() { style.setProperty('--show-options', 'flex'); document.getElementById("showmore").style.display = "none" }
  }
  window.addEventListener('load', async function () {
    if (show_scores) {
      var currentUrl = window.location.href;
      if (currentUrl.includes("smartschool.be/results")) {
        console.log("Showing scores");
        await show_scoresfunc();
      }
    }
  });
  console.log("added event listener");
  if (overwrite_theme == 2) {
    set_background(backgroundFile);
  } else if (overwrite_theme == 1) {
    set_backgroundlink(backgroundLink)
  }
  if (colorpickers != undefined && profileSelect != "custom") {
    colorpickers.innerHTML = ``
  }
  let bigblurvalue = blurvalue * 2;
  const rightContainer = document.getElementById('rightcontainer');
  const centralContainer = document.getElementById('centercontainer')
  const leftcontainer = document.getElementById('leftcontainer')
  const container = document.getElementById('container')
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
    if(rightContainer){
      rightContainer.innerHTML = ""
      rightContainer.style.display = "none"
    }


    if (leftcontainer) {
      leftcontainer.innerHTML = " "
      leftcontainer.style.display = "none"
    }
document.getElementById("leftcontainer")?document.getElementById("leftcontainer").remove() : "pass"
document.getElementById("rightcontainer")?document.getElementById("rightcontainer").remove() : "pass"
document.getElementById("plannercontainer")?document.getElementById("plannercontainer").remove() : "pass"
document.getElementById("weathercontainer")?document.getElementById("weathercontainer").remove() : "pass"
document.getElementById("delijncontainer")?document.getElementById("delijncontainer").remove() : "pass"
document.getElementById("plantcontainer")?document.getElementById("plantcontainer").remove() : "pass"

    if (halte) {
      var DelijnAppElement = document.createElement("div")
      DelijnAppElement.classList.add("homepage__left")
      DelijnAppElement.classList.add("smsc-container--left")
      DelijnAppElement.setAttribute("id", "delijncontainer")
      container.prepend(DelijnAppElement)
      decodehalte()
    }
    if (showplanner) {
      var PlannerAppElement = document.createElement("div")
      PlannerAppElement.classList.add("homepage__left")
      PlannerAppElement.classList.add("smsc-container--left")
      PlannerAppElement.setAttribute("id", "plannercontainer")
      container.prepend(PlannerAppElement)
      ShowPlanner()
    }
    if (show_plant){
      var PlantAppElement = document.createElement("div")
      PlantAppElement.classList.add("homepage__right")
      PlantAppElement.classList.add("smsc-container--right")
      PlantAppElement.setAttribute("id", "plantcontainer")
      container.append(PlantAppElement)
      start_plant_window()
  }
    if (loc != "") {
      var WeatherAppElement = document.createElement("div")
      WeatherAppElement.classList.add("homepage__right")
      WeatherAppElement.classList.add("smsc-container--right")
      WeatherAppElement.setAttribute("id", "weathercontainer")
      container.append(WeatherAppElement)
      await set_weather_loc(loc, IsBig);
    }
    if (showsnake) {
      if(!document.getElementById("weathercontainer")){
        var WeatherAppElement = document.createElement("div")
        WeatherAppElement.classList.add("homepage__right")
        WeatherAppElement.classList.add("smsc-container--right")
        WeatherAppElement.setAttribute("id", "weathercontainer")
        container.append(WeatherAppElement)
      }
        startSnakeGame()
    }
    if (showflappy) {
      if(!document.getElementById("weathercontainer")){
        var WeatherAppElement = document.createElement("div")
        WeatherAppElement.classList.add("homepage__right")
        WeatherAppElement.classList.add("smsc-container--right")
        WeatherAppElement.setAttribute("id", "weathercontainer")
        container.append(WeatherAppElement)
      }
      startFlappyGame()
    }
    if (!shownews) {
      centralContainer.innerHTML = ' '
    }
  } else {
    console.log("Not on home page, no Lijn or weather needed")
  }

  style.setProperty('--blur-value-large', 'blur(' + bigblurvalue + 'px)');
  style.setProperty('--blur-value-small', 'blur(' + blurvalue + 'px)');
  var rain = document.getElementById('raindrops')
  var snow = document.getElementById('snowflakes')
  var meteor = document.getElementById('star')
  if (weatherSelector == 0){
    set_snow_level(weatherAmount);
    rain != undefined?rain.remove():0
    meteor != undefined?meteor.remove():0

  } else if( weatherSelector == 1){
    rain != undefined?rain.remove():0
    snow != undefined?snow.remove():0
    set_overlay_based_on_conditions(weatherAmount)
  }
  else if (weatherSelector == 2){
    set_rain_level(weatherAmount);
    meteor != undefined?meteor.remove():0
    snow != undefined?snow.remove():0    
  } else {
    console.log("ERROR NO WEATHER SELECTOR")
  }
}


if (document.querySelector('[data-go=""]')) {
  document.querySelector('[data-go=""]').remove();
}

function storeTheme() {
  const themeData = {
    base0: document.getElementById("colorPicker1").value,
    base1: document.getElementById("colorPicker2").value,
    base2: document.getElementById("colorPicker3").value,
    base3: document.getElementById("colorPicker4").value,
    accent: document.getElementById("colorPicker5").value,
    text: document.getElementById("colorPicker6").value
  };
  window.localStorage.setItem("themedata", JSON.stringify(themeData));
}

function store() {
  let previousData = get_config();
  profileSelectPrevious = previousData.profile;
  if (profileSelectPrevious == "custom") {
    storeTheme();
  }

  let settingsData = {};
  const profileSelect = document.getElementById("profileSelector").value;
  let backgroundFile = document.getElementById("fileInput").files[0];
  const backgroundLink = document.getElementById("backgroundlink").value
  const halte = document.getElementById("halt").checked;
  const overwrite_theme = document.getElementById("backgroundSlider").value;
  const loc = document.getElementById("location").value;
  const slider = document.getElementById('mySlider').value;
  const weatherSlider = document.getElementById('weatherSlider').value;
  const shownews = document.getElementById("shownewselement").checked;
  const showsnake = document.getElementById('showsnakeelement').checked;
  const showflappy = document.getElementById('showflappyelement').checked;
  const isbig = document.getElementById("isbig").checked;
  const showplanner = document.getElementById("showplanner").checked;
  const weatherSelector = document.getElementById("weatherSelector").value;
  const show_plant = document.getElementById("show_plant").checked
  settingsData.profile = profileSelect;
  settingsData.halte = halte;
  settingsData.overwrite_theme = overwrite_theme;
  settingsData.location = loc.charAt(0).toUpperCase() + loc.slice(1);
  settingsData.backgroundfile = backgroundFile
  settingsData.backgroundlink = backgroundLink
  settingsData.blur = slider;
  settingsData.weatherAmount = parseInt(weatherSlider);
  settingsData.shownews = shownews;
  settingsData.showsnake = showsnake;
  settingsData.showflappy = showflappy
  settingsData.show_scores = previousData.show_scores;
  settingsData.isbig = isbig;
  settingsData.showplanner = showplanner;
  settingsData.weatherSelector = weatherSelector;
  settingsData.show_plant = show_plant

  console.log(settingsData)
  if (settingsData.show_scores == undefined) {
    settingsData.show_scores = false;
  }
  if (shownews && !previousData.shownews) {
    window.location.reload();
  }
  if (backgroundFile) {
    fileToBase64(backgroundFile)
      .then(base64Image => {
        settingsData.backgroundfile = base64Image;
        window.localStorage.setItem("settingsdata", JSON.stringify(settingsData));
        if (profileSelect == "custom") {
          loadCustomTheme();
        }
        if (base64Image.length < 1500000) {
          document.getElementById("errormessagesmpp").innerHTML = ``

        }
        apply();
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          handleQuotaExceededError();
        } else {
          console.error('An error occurred:', error);
        }
        apply()
      });
  } else {
    settingsData.backgroundfile = previousData.backgroundfile
    set_config(settingsData)
    if (profileSelect == "custom") {
      loadCustomTheme();
    }
    apply();
  }
};


function handleQuotaExceededError() {
  document.getElementById("errormessagesmpp").innerHTML = `
  <a href="https://www.freeconvert.com/image-compressor" id="errormessagesmpp" target="_blank">File too large must be +/- 1MB</p>
  `
};
function loadCustomThemeData() {
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
  colorpickers.innerHTML = colorpickersHTML
  loadCustomThemeData()
}
// Select the element
const msghead = document.querySelector("#msgcell > .msgcell__head");
console.log(msghead)
// Insert adjacent HTML (beforebegin, afterbegin, beforeend, afterend)
if(msghead){
  let chaty = document.createElement("div")
  chaty.classList.add("chatie")
  chaty.innerHTML=chatyHTML
msghead.insertBefore( chaty, msghead.querySelector(".msgcell__head__sort"))
document.getElementById("globalChatTextBalk").addEventListener("click",globalChatTextBalk)
}

function load() {
  let settingsData = JSON.parse(window.localStorage.getItem("settingsdata"));
  const profileSelect = document.getElementById("profileSelector");
  const backgroundLink = document.getElementById("backgroundlink");
  const halte = document.getElementById("halt");
  const overwrite_theme = document.getElementById("backgroundSlider");
  const loc = document.getElementById("location");
  const blur = document.getElementById('mySlider');
  const weatherSlider = document.getElementById('weatherSlider');
  const shownews = document.getElementById("shownewselement");
  const showsnake = document.getElementById("showsnakeelement");
  const showflappy = document.getElementById("showflappyelement");
  const isbig = document.getElementById("isbig");
  const showplanner = document.getElementById("showplanner");
  const weatherSelector = document.getElementById("weatherSelector");
  const show_plant = document.getElementById("show_plant")
  profileSelect.value = settingsData.profile
  halte.checked = settingsData.halte
  overwrite_theme.value = settingsData.overwrite_theme
  backgroundLink.value = settingsData.backgroundlink
  loc.value = settingsData.location
  blur.value = settingsData.blur
  weatherSlider.value = settingsData.weatherAmount
  shownews.checked = settingsData.shownews
  showsnake.checked = settingsData.showsnake
  showflappy.checked = settingsData.showflappy
  isbig.checked = settingsData.isbig
  showplanner.checked = settingsData.showplanner
  weatherSelector.value = settingsData.weatherSelector
  show_plant.checked = settingsData.show_plant
  if (profileSelect.value == "custom") {
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
    popup_settings.innerHTML = popupsettingHTML
    document.getElementById('backgroundfilebutton').addEventListener("click", openFileSelector)
    load()
  });
}
async function set_background(background) {
  let style = document.documentElement.style;
  if (background.length > 1500000) {
    if (document.getElementById("errormessagesmpp")) {
      handleQuotaExceededError()
    }
  }
  style.setProperty('--loginpage-image', 'url(data:image/png;base64,' + background + ')');
}

async function set_backgroundlink(background) {
  let style = document.documentElement.style;
  if (!background) {
    console.error("Background URL is empty or undefined.");
    style.setProperty('--loginpage-image', 'none');
    return;
  }
  try {
    new URL(background);
  } catch (error) {
    console.error("Invalid URL format for background:", background);
    style.setProperty('--loginpage-image', 'none');
    return;
  }
  style.setProperty('--loginpage-image', 'url(' + background + ')');
}

function set_theme(name) {
  let style = document.documentElement.style;
  if (name == "custom") {
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
    style.setProperty('--loginpage-image', "url(https://wallpaperaccess.com/full/23.jpg)");
  } else {
    let theme = themes[name];
    if (!theme) {
      return;
    }
    let keys = Object.keys(theme);
    for (let i = 0; i < keys.length; i++) {
      style.setProperty(keys[i], theme[keys[i]]);
    }
  }
}
apply()