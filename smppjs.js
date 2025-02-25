//java script komt hier je weet wel
//ok - ldev
//oke logis - andere ldev
//oh ok, ik dacht in general.css - Jdev
const default_theme = {
  color_accent: "#a3a2ec",
  color_base00: "#38313a",
  color_base01: "#826882",
  color_base02: "#ac85b7",
  color_base03: "#c78af0",
  color_text: "#ede3e3"
}

if (browser == undefined) { var browser = chrome };

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

function openFileSelector() {
  document.getElementById('fileInput').click();
}
async function clearsettings() {
  localStorage.clear();
  await browser.runtime.sendMessage({
    action: 'clearLocalStorage'
  });
  console.log("Cleared settings!")
}
function togglePerformanceMode() {
  let config = get_config();
  config.enableanimations = !config.enableanimations
  set_config(config);
  return config.enableanimations
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
}
const anakin = 56789;
const skywalker = 98765;

function changeFont() {
  let fontLinks = document.createElement("div")
  fontLinks.innerHTML = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">`
  document.getElementsByTagName("head")[0].appendChild(fontLinks)
}
function getPfpLink(username) {
  if (username) {
    const parts = username.trim().split(/\s+/);
    const firstInitial = parts[0][0].toUpperCase();
    const secondInitial = parts.length > 1 ? parts[1][0].toUpperCase() : '';
    return `https://userpicture20.smartschool.be/User/Userimage/hashimage/hash/initials_${firstInitial + secondInitial}/plain/1/res/32`;
  }
  return `https://userpicture20.smartschool.be/User/Userimage/hashimage/hash/initials_MU/plain/1/res/32`;
}
async function apply() {
  let style = document.documentElement.style;
  let settingsData = get_config();

  const colorpickers = document.getElementById("colorpickers");
  console.log(settingsData)
  const profileSelect = settingsData.profile
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
  var username_override = settingsData.username_override;
  var show_plant = settingsData.show_plant;
  var enableanimations = settingsData.enableanimations;
  changeFont()
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
  if (enableanimations == undefined) {
    settingsData = get_config()
    settingsData.enableanimations = true
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
    document.getElementsByClassName('login-app__title--separator')[0].innerHTML = `<button type="button" class="white_text_button" id="showmore">More</button>`;
    document.getElementById('showmore').addEventListener('click', showmore)
    function showmore() { style.setProperty('--show-options', 'flex'); document.getElementById("showmore").style.display = "none" }
  }
  window.addEventListener('load', async function () {
    if (show_scores) {
      var currentUrl = window.location.href;
      if (currentUrl.includes("smartschool.be/results")) {
        await show_scoresfunc();
      }
    }
  });
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
    if (rightContainer) {
      rightContainer.innerHTML = ""
      rightContainer.style.display = "none"
    }


    if (leftcontainer) {
      leftcontainer.innerHTML = " "
      leftcontainer.style.display = "none"
    }
    document.getElementById("leftcontainer") ? document.getElementById("leftcontainer").remove() : "pass"
    document.getElementById("rightcontainer") ? document.getElementById("rightcontainer").remove() : "pass"
    document.getElementById("plannercontainer") ? document.getElementById("plannercontainer").remove() : "pass"
    document.getElementById("weathercontainer") ? document.getElementById("weathercontainer").remove() : "pass"
    document.getElementById("delijncontainer") ? document.getElementById("delijncontainer").remove() : "pass"
    document.getElementById("plantcontainer") ? document.getElementById("plantcontainer").remove() : "pass"

    if (halte) {
      var DelijnAppElement = document.createElement("div")
      DelijnAppElement.classList.add("homepage__left")
      DelijnAppElement.classList.add("smsc-container--left")
      DelijnAppElement.id = "leftcontainer"
      var DelijnApp = document.createElement("div")
      DelijnApp.setAttribute("id", "delijncontainer")
      DelijnAppElement.appendChild(DelijnApp)
      container.prepend(DelijnAppElement)
      createDelijnApp()
    }
    if (showplanner) {
      var PlannerAppElement = document.createElement("div")
      PlannerAppElement.classList.add("homepage__left")
      PlannerAppElement.classList.add("smsc-container--left")
      PlannerAppElement.setAttribute("id", "plannercontainer")
      container.prepend(PlannerAppElement)
      ShowPlanner(0)
    }
    if (show_plant) {
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
      await createWeatherApp(loc, IsBig);
    }
    if (showsnake) {
      if (!document.getElementById("weathercontainer")) {
        var WeatherAppElement = document.createElement("div")
        WeatherAppElement.classList.add("homepage__right")
        WeatherAppElement.classList.add("smsc-container--right")
        WeatherAppElement.setAttribute("id", "weathercontainer")
        container.append(WeatherAppElement)
      }
      creatSnakeApp()
    }
    if (showflappy) {
      if (!document.getElementById("weathercontainer")) {
        var WeatherAppElement = document.createElement("div")
        WeatherAppElement.classList.add("homepage__right")
        WeatherAppElement.classList.add("smsc-container--right")
        WeatherAppElement.setAttribute("id", "weathercontainer")
        container.append(WeatherAppElement)
      }
      createFlappyApp()
    }
    if (!shownews) {
      centralContainer.innerHTML = ' '
    }
  }

  style.setProperty('--profile-picture', 'url(' + getPfpLink(username_override) + ')');
  style.setProperty('--blur-value-large', 'blur(' + bigblurvalue + 'px)');
  style.setProperty('--blur-value-small', 'blur(' + blurvalue + 'px)');
  applyWeatherEffects(weatherSelector, weatherAmount)
  if (gc_initialized) {
    remove_gcwin()
    make_gcwin(true)
  }
  if (enableanimations) {
    document.body.classList.add("enableAnimations")
    document.querySelector("#performanceModeTooltip")?.remove()
  } else {
    document.body.classList.remove("enableAnimations")
    const topNav = document.querySelector("nav.topnav")
    if (topNav && document.querySelector("#performanceModeTooltip") == undefined) {
      const performanceModeTooltip = document.createElement("button");
      performanceModeTooltip.title = "Performance mode is enabled"
      performanceModeTooltip.id = "performanceModeTooltip"
      performanceModeTooltip.className = "topnav__btn"
      performanceModeTooltip.innerHTML = performanceModeSvg
      topNav.prepend(performanceModeTooltip)
    }
    document.getElementById("background_image") ? document.getElementById("background_image").style.display = "none" : "pass"
    if (overwrite_theme == 2) {
      set_background();
    } else if (overwrite_theme == 1) {
      set_backgroundlink(backgroundLink)
    }
    let link_element = document.querySelector('link[rel="icon"]');
    if (link_element) {
      if (settingsData.smpp_logo) {
        link_element.href = "https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/icon128.png";
      } else {
        link_element.href = "https://static1.smart-school.net/smsc/svg/favicon/favicon.svg";
      }
    }
  }
}
function storeTheme() {
  const themeData = {
    color_base00: document.getElementById("colorPicker1").value,
    color_base01: document.getElementById("colorPicker2").value,
    color_base02: document.getElementById("colorPicker3").value,
    color_base03: document.getElementById("colorPicker4").value,
    color_accent: document.getElementById("colorPicker5").value,
    color_text: document.getElementById("colorPicker6").value
  };
  window.localStorage.setItem("themedata", JSON.stringify(themeData));
}

function store() {
  let previousData = get_config();
  profileSelectPrevious = previousData.profile;
  if (profileSelectPrevious == "custom") {
    storeTheme();
  }

  let settingsData = previousData;
  const profileSelect = document.getElementById("profileSelector").value;
  let backgroundFile = document.getElementById("fileInput").files[0];
  const backgroundLink = document.getElementById("backgroundlink").value
  const halte = document.getElementById("halt").checked;
  const overwrite_theme = Number(document.getElementById("backgroundSlider").value);
  const loc = document.getElementById("location").value;
  const blur = Number(document.getElementById('mySlider').value);
  const weatherAmount = Number(document.getElementById('weatherSlider').value);
  const shownews = document.getElementById("shownewselement").checked;
  const showsnake = document.getElementById('showsnakeelement').checked;
  const showflappy = document.getElementById('showflappyelement').checked;
  const isbig = document.getElementById("isbig").checked;
  const showplanner = document.getElementById("showplanner").checked;
  const weatherSelector = Number(document.getElementById("weatherSelector").value);
  const show_plant = document.getElementById("show_plant").checked;
  const smpp_logo = document.getElementById("smpp_logo").checked;
  settingsData.profile = profileSelect;
  settingsData.halte = halte;
  settingsData.overwrite_theme = overwrite_theme;
  settingsData.location = loc.charAt(0).toUpperCase() + loc.slice(1);
  settingsData.backgroundlink = backgroundLink
  settingsData.blur = blur;
  settingsData.weatherAmount = weatherAmount;
  settingsData.shownews = shownews;
  settingsData.showsnake = showsnake;
  settingsData.showflappy = showflappy
  settingsData.isbig = isbig;
  settingsData.showplanner = showplanner;
  settingsData.weatherSelector = weatherSelector;
  settingsData.show_plant = show_plant;
  settingsData.smpp_logo = smpp_logo;

  console.log(settingsData)
  if (settingsData.show_scores == undefined) {
    settingsData.show_scores = false;
  }
  if (shownews && !previousData.shownews) {
    window.location.reload();
  }

  if (backgroundFile) {
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result;
      browser.runtime.sendMessage({ action: 'saveBackgroundImage', data: imageData });
    };
    reader.readAsDataURL(backgroundFile);
    settingsData.overwrite_theme = 2;
    set_config(settingsData)
    if (profileSelect == "custom") {
      loadCustomTheme();
    }
    window.location.reload()
  }
  else {
    set_config(settingsData)
    if (profileSelect == "custom") {
      loadCustomTheme();
    }
    apply();
  }
};

function migrate_theme_data(old_themeData) {
  console.log("migrating_data")
  const themeData = {
    color_base00: old_themeData.base0,
    color_base01: old_themeData.base1,
    color_base02: old_themeData.base2,
    color_base03: old_themeData.base3,
    color_accent: old_themeData.accent,
    color_text: old_themeData.text
  };
  window.localStorage.setItem("themedata", JSON.stringify(themeData));
  return themeData
}

function loadCustomThemeData() {
  let themeData = JSON.parse(window.localStorage.getItem("themedata"))
  document.getElementById("colorPicker1").value = themeData.color_base00
  document.getElementById("colorPicker2").value = themeData.color_base01
  document.getElementById("colorPicker3").value = themeData.color_base02
  document.getElementById("colorPicker4").value = themeData.color_base03
  document.getElementById("colorPicker5").value = themeData.color_accent
  document.getElementById("colorPicker6").value = themeData.color_text
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
  const show_plant = document.getElementById("show_plant");
  const smpp_logo = document.getElementById("smpp_logo");
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
  show_plant.checked = settingsData.show_plant;
  smpp_logo.checked = settingsData.smpp_logo;
  if (profileSelect.value == "custom") {
    loadCustomTheme()
  }
}

function set_background() {
  let style = document.documentElement.style;
  browser.storage.local.get('backgroundImage', (result) => {
    style.setProperty('--loginpage-image', `none`);
    style.setProperty('--background-color', `transparent`);
    let img = document.getElementById("background_image") || document.createElement('img');
    img.id = "background_image";
    img.style.position = 'absolute';
    img.style.top = '0';
    img.style.left = '0';
    img.style.width = '100vw';
    img.style.height = '100vh';
    img.style.objectFit = 'cover';
    img.style.zIndex = -1;
    img.style.display = "block";
    img.src = result.backgroundImage;
    if (!document.getElementById("background_image")) {
      document.body.appendChild(img);
    }
  });
}

function set_backgroundlink(background) {
  let style = document.documentElement.style;
  style.setProperty('--loginpage-image', `url(${background})`);
}

function set_theme(name) {
  let style = document.documentElement.style;
  if (name == "custom") {
    let themeData = JSON.parse(window.localStorage.getItem("themedata"))
    if (themeData == null) {
      themeData = default_theme;
      window.localStorage.setItem("themedata", JSON.stringify(themeData));
    }
    if (themeData.base0) {
      themeData = migrate_theme_data(themeData)
      loadCustomThemeData()
    }
    style.setProperty('--color-accent', themeData.color_accent);
    style.setProperty('--color-text', themeData.color_text);
    style.setProperty('--color-base00', themeData.color_base00);
    style.setProperty('--color-base01', themeData.color_base01);
    style.setProperty('--color-base02', themeData.color_base02);
    style.setProperty('--color-base03', themeData.color_base03);
    if (window.self == window.top) {
      style.setProperty('--loginpage-image', "url(https://wallpaperaccess.com/full/23.jpg)");
    }
  } else {
    let theme = get_theme(name);
    if (!theme) {
      return;
    }
    apply_theme(theme, style)
  }
}

function createSettings(){
  let popup = document.getElementById("searchMenu");
  if (!popup){
    return false;
  }
  popup.addEventListener("change", store)

  search_button = document.querySelector('.js-btn-search')
  search_button.innerText = "Settings"
  const popup_settings = document.getElementById("searchMenu");
  popup_settings.innerHTML = popupsettingHTML
  document.getElementById('backgroundfilebutton').addEventListener("click", openFileSelector)
  load()

  return true;
}

function main() {

  createWidgetSystem();

  let logoutButton = document.querySelector(".js-btn-logout");
  if (logoutButton) logoutButton.innerHTML = changeLogoutText();

  if (notifsText) {
    notifsText.innerHTML = "Toon pop-ups";
  }
  if (document.querySelector('[data-go=""]')) {
    document.querySelector('[data-go=""]').remove();
  }

  let onHomePage = document.getElementById("container") !== null;
  if (createSettings()) {

    if (onHomePage){
      createWidgetEditModeButton();
    }
    createGCButton();
    createQuickMenuButton();

    document.querySelector('[data-go=""]')?.remove();
    let notifsLabel = document.getElementById("notifsToggleLabel");
    if (notifsLabel) notifsLabel.innerText = "Toon pop-ups"; // Simplify text. (smartschool by default has a very long explanation that doesn't fit on screen)
  }

  apply()
}
main()
