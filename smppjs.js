//java script komt hier je weet wel
//ok - ldev
//oh ok, ik dacht in general.css - Jdev
const default_theme = {
  color_accent: "#a3a2ec",
  color_base00: "#38313a",
  color_base01: "#826882",
  color_base02: "#ac85b7",
  color_base03: "#c78af0",
  color_text: "#ede3e3"
}
let settingsWindowIsHidden = true;

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

  showNews(shownews);

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

  style.setProperty('--profile-picture', 'url(' + getPfpLink(username_override) + ')');
  style.setProperty('--blur-value-large', 'blur(' + bigblurvalue + 'px)');
  style.setProperty('--blur-value-small', 'blur(' + blurvalue + 'px)');
  if (!liteMode) applyWeatherEffects(weatherSelector, weatherAmount)
  if (!liteMode) {
    if (gc_initialized) {
      remove_gcwin()
      make_gcwin(true)
    }
  }
  if (enableanimations) {
    document.body.classList.add("enableAnimations")
  } else {
    document.body.classList.remove("enableAnimations")
  }
  document.getElementById("background_image") ? document.getElementById("background_image").style.display = "none" : "pass"
  if (overwrite_theme == 2) {
    set_background();
  } else if (overwrite_theme == 1) {
    set_backgroundlink(backgroundLink)
  }
  let iconElement = document.querySelector('link[rel="icon"]');
  if (iconElement) {
    if (settingsData.smpp_logo) {
      iconElement.href = liteMode ? "https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/smpp_lite_logo128.png" :
        "https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/icon128.png";
    } else {
      iconElement.href = "https://static1.smart-school.net/smsc/svg/favicon/favicon.svg";
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
  const shownews = document.getElementById("shownewselement").checked;
  const isbig = document.getElementById("isbig").checked;
  const showplanner = document.getElementById("showplanner").checked;
  const smpp_logo = document.getElementById("smpp_logo").checked;
  const enableAnimations = document.getElementById("performanceModeTooltip").checked;
  settingsData.profile = profileSelect;
  settingsData.halte = halte;
  settingsData.overwrite_theme = overwrite_theme;
  settingsData.location = loc.charAt(0).toUpperCase() + loc.slice(1);
  settingsData.backgroundlink = backgroundLink
  settingsData.blur = blur;
  settingsData.shownews = shownews;
  settingsData.isbig = isbig;
  settingsData.showplanner = showplanner;
  settingsData.smpp_logo = smpp_logo;
  settingsData.enableanimations = enableAnimations
  if (!liteMode) {
    const weatherAmount = Number(document.getElementById('weatherSlider').value);
    const showsnake = document.getElementById('showsnakeelement').checked;
    const showflappy = document.getElementById('showflappyelement').checked;
    const weatherSelector = Number(document.getElementById("weatherSelector").value);
    const show_plant = document.getElementById("show_plant").checked;
    settingsData.weatherAmount = weatherAmount;
    settingsData.weatherSelector = weatherSelector;
    settingsData.showsnake = showsnake;
    settingsData.show_plant = show_plant;
    settingsData.showflappy = showflappy
  }
  document.getElementById("performanceModeInfo").innerHTML = settingsData.enableanimations ? `Toggle performance mode (disabled)` : `Toggle performance mode (enabled)`
  console.log(settingsData)
  if (settingsData.show_scores == undefined) {
    settingsData.show_scores = false;
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
  const enableAnimations = document.getElementById("performanceModeTooltip");
  profileSelect.value = settingsData.profile
  halte.checked = settingsData.halte
  overwrite_theme.value = settingsData.overwrite_theme
  backgroundLink.value = settingsData.backgroundlink
  loc.value = settingsData.location
  blur.value = settingsData.blur
  shownews.checked = settingsData.shownews
  isbig.checked = settingsData.isbig
  showplanner.checked = settingsData.showplanner
  smpp_logo.checked = settingsData.smpp_logo;
  enableAnimations.checked = settingsData.enableanimations;
  if (!liteMode) {
    showsnake.checked = settingsData.showsnake
    showflappy.checked = settingsData.showflappy
    weatherSelector.value = settingsData.weatherSelector
    weatherSlider.value = settingsData.weatherAmount
    show_plant.checked = settingsData.show_plant;
  }
  document.getElementById("performanceModeInfo").innerHTML = settingsData.enableanimations ? `Toggle performance mode (disabled)` : `Toggle performance mode (enabled)`
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
    img.style.backgroundColor = "var(--color-base00)"
    img.style.position = 'absolute';
    img.style.top = '0';
    img.style.left = '0';
    img.style.width = '101%';
    img.style.height = '101%';
    img.style.objectFit = 'cover';
    img.style.zIndex = -1;
    img.style.display = "block";
    if (result.backgroundImage) img.src = result.backgroundImage;
    if (!document.getElementById("background_image")) {
      document.body.appendChild(img);
    }
  });
}

function set_backgroundlink(background) {
  let style = document.documentElement.style;
  if (!background) {
    style.setProperty('--loginpage-image', 'aaaaa');
    console.log("no background")
    return;
  }
  let img = new Image();
  img.src = background;
  img.onload = () => {
    style.setProperty('--loginpage-image', `url(${background})`);
    console.log("works")
  };
  img.onerror = () => {
    console.log("error")
  };
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
<<<<<<< HEAD
function toggleSettings() {
  let win = document.getElementById("quickSettings");

  if (win && !settingsWindowIsHidden) {
    closeSettings();
  } else {
    openSettings();
  }
}

function openSettings() {
  let win = document.getElementById("quickSettings");
  if (!win) {
    createSettings();
    win = document.getElementById("quickSettings");
  }
  win.classList.remove("qs-hidden");
  load();
  settingsWindowIsHidden = false;
}

function closeSettings() {
  let win = document.getElementById("quickSettings");

  if (win) {
    win.classList.add("qs-hidden");
  }

  settingsWindowIsHidden = true;
}

function createSwitch(id, title) {
  const switchContainer = document.createElement('div');
  const switchHeading = document.createElement('h3');
  switchHeading.className = 'popuptitles';
  switchHeading.textContent = title;

  const switchLabel = document.createElement('label');
  switchLabel.className = 'switch';

  const switchInput = document.createElement('input');
  switchInput.className = 'popupinput';
  switchInput.type = 'checkbox';
  switchInput.id = id;

  const switchSlider = document.createElement('span');
  switchSlider.className = 'slider round';

  switchLabel.appendChild(switchInput);
  switchLabel.appendChild(switchSlider);
  if (title != null) { switchContainer.appendChild(switchHeading); }
  switchContainer.appendChild(switchLabel);

  return switchContainer;
};

function createSettingsHTML(parent) {
  const performanceModeTooltipLabel = document.createElement('label');
  performanceModeTooltipLabel.className = 'performanceModeTooltipLabel';
  performanceModeTooltipLabel.id = 'performanceModeTooltipLabel';

  const performanceModeTooltip = document.createElement('input');
  performanceModeTooltip.type = 'checkbox';
  performanceModeTooltip.id = 'performanceModeTooltip';

  performanceModeTooltipLabel.appendChild(performanceModeTooltip);
  performanceModeTooltipLabel.innerHTML += performanceModeSvg;

  const performanceModeInfo = document.createElement('span');
  performanceModeInfo.id = 'performanceModeInfo';

  const themeHeading = document.createElement('h3');
  themeHeading.className = 'popuptitles';
  themeHeading.textContent = 'Theme:';

  const profileSelector = document.createElement('select');
  profileSelector.id = 'profileSelector';

  const options = [
    { value: 'default', text: 'Default Deluxe' },
    { value: 'white', text: 'Off White' },
    { value: 'custom', text: 'Custom Theme' },
    { value: 'ldev', text: 'Dark Sands' },
    { value: 'birb', text: 'Midnight Sapphire' },
    { value: 'stalker', text: 'Ruby Eclipse' },
    { value: 'chocolate', text: 'Dark Mocha' },
    { value: 'mountain', text: 'Storm Peaks' },
    { value: 'winter', text: 'Arctic Azure' },
    { value: 'galaxy', text: 'Fluorescent Galaxy' },
    { value: 'sand', text: 'Sahara Oasis' },
    { value: 'purple', text: 'Neon Violet' },
    { value: 'fall', text: 'Autumn Gloom' },
    { value: 'matcha', text: 'Matcha Green' },
    { value: 'pink', text: 'Cherry Haze' }
  ];

  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.text;
    profileSelector.appendChild(optionElement);
  });

  const colorPickers = document.createElement('div');
  colorPickers.className = 'textandbutton';
  colorPickers.id = 'colorpickers';

  const switchesContainer = document.createElement('div');
  switchesContainer.className = 'textandbuttonnomarg';

  switchesContainer.appendChild(createSwitch('showplanner', 'Planner:'));
  switchesContainer.appendChild(createSwitch('halt', 'Delijn:'));
  if (!liteMode) {
    switchesContainer.appendChild(createSwitch('show_plant', 'Plant:'));
  } else {
    switchesContainer.appendChild(createSwitch('shownewselement', 'News:'));
    switchesContainer.appendChild(createSwitch('smpp_logo', 'Logo:'));
  }

  const weatherHeading = document.createElement('h3');
  weatherHeading.className = 'popuptitles';
  weatherHeading.textContent = 'Location (Weather):';

  const weatherContainer = document.createElement('div');
  weatherContainer.className = 'textandbutton';

  const locationInput = document.createElement('input');
  locationInput.className = 'popupinput';
  locationInput.id = 'location';
  locationInput.spellcheck = false;
  locationInput.type = 'text';

  const locationSwitch = createSwitch('isbig', null);
  weatherContainer.appendChild(locationInput);
  weatherContainer.appendChild(locationSwitch);

  const wallpaperHeading = document.createElement('h3');
  wallpaperHeading.className = 'popuptitles';
  wallpaperHeading.textContent = 'Custom wallpaper:';

  const wallpaperContainer = document.createElement('div');
  wallpaperContainer.className = 'textandbutton';

  const verticalText = document.createElement('div');
  verticalText.className = 'verticaltext';

  const offText = document.createElement('span');
  offText.className = 'nobottommargp';
  offText.textContent = 'Off';

  const linkText = document.createElement('span');
  linkText.className = 'nobottommargp link_text';
  linkText.textContent = 'Link';

  const fileText = document.createElement('span');
  fileText.className = 'nobottommargp';
  fileText.textContent = 'File';

  verticalText.appendChild(offText);
  verticalText.appendChild(linkText);
  verticalText.appendChild(fileText);

  const backgroundSlider = document.createElement('input');
  backgroundSlider.type = 'range';
  backgroundSlider.min = '0';
  backgroundSlider.max = '2';
  backgroundSlider.value = '0';
  backgroundSlider.className = 'sliderblur';
  backgroundSlider.id = 'backgroundSlider';

  const backgroundLinkInput = document.createElement('input');
  backgroundLinkInput.className = 'popupinput';
  backgroundLinkInput.id = 'backgroundlink';
  backgroundLinkInput.spellcheck = false;
  backgroundLinkInput.type = 'text';

  const fileInput = document.createElement('input');
  fileInput.className = 'backgroundfile';
  fileInput.id = 'fileInput';
  fileInput.style.display = 'none';
  fileInput.type = 'file';
  fileInput.accept = '.png, .jpg, .jpeg';

  const fileInputButton = document.createElement('button');
  fileInputButton.className = 'popupinput backgroundfile';
  fileInputButton.id = 'backgroundfilebutton';
  fileInputButton.innerHTML = fileInputIconSvg;

  const colorPickerContainer = document.createElement('div');
  colorPickerContainer.className = 'color-picker-container';

  const blurSlider = document.createElement('input');
  blurSlider.type = 'range';
  blurSlider.min = '0';
  blurSlider.max = '10';
  blurSlider.value = '0';
  blurSlider.className = 'sliderblur';
  blurSlider.id = 'mySlider';

  const blurLabel = document.createElement('span');
  blurLabel.className = 'color-label';
  blurLabel.id = 'blurPlaats';
  blurLabel.textContent = 'blur';

  colorPickerContainer.appendChild(blurSlider);
  colorPickerContainer.appendChild(blurLabel);

  wallpaperContainer.appendChild(verticalText);
  wallpaperContainer.appendChild(backgroundSlider);
  wallpaperContainer.appendChild(backgroundLinkInput);
  wallpaperContainer.appendChild(fileInput);
  wallpaperContainer.appendChild(fileInputButton);
  wallpaperContainer.appendChild(colorPickerContainer);

  const weatherOverlayHeading = document.createElement('h3');
  weatherOverlayHeading.className = 'popuptitles';
  weatherOverlayHeading.textContent = 'Weather overlay:';

  const weatherOverlayContainer = document.createElement('div');
  weatherOverlayContainer.className = 'textandbutton';
  weatherOverlayContainer.style.marginTop = '20px';

  const weatherVerticalText = document.createElement('div');
  weatherVerticalText.className = 'verticaltext';

  const snowText = document.createElement('p');
  snowText.className = 'nobottommargp';
  snowText.textContent = 'Snow';

  const realtimeText = document.createElement('p');
  realtimeText.className = 'nobottommargp link_text';
  realtimeText.textContent = 'Realtime';

  const rainText = document.createElement('p');
  rainText.className = 'nobottommargp';
  rainText.textContent = 'Rain';

  weatherVerticalText.appendChild(snowText);
  weatherVerticalText.appendChild(realtimeText);
  weatherVerticalText.appendChild(rainText);

  const weatherSelector = document.createElement('input');
  weatherSelector.type = 'range';
  weatherSelector.min = '0';
  weatherSelector.max = '2';
  weatherSelector.value = '0';
  weatherSelector.className = 'sliderblur';
  weatherSelector.id = 'weatherSelector';

  const weatherSliderContainer = document.createElement('div');
  weatherSliderContainer.className = 'verticaltext-noright';
  weatherSliderContainer.style.width = '110px';
  weatherSliderContainer.style.marginTop = '-10px';
  weatherSliderContainer.style.marginRight = '10px';

  const weatherSliderHeading = document.createElement('h4');
  weatherSliderHeading.style.marginBottom = '1px';
  weatherSliderHeading.textContent = 'Amount:';

  const weatherSlider = document.createElement('input');
  weatherSlider.type = 'range';
  weatherSlider.min = '0';
  weatherSlider.max = '500';
  weatherSlider.value = '0';
  weatherSlider.className = 'sliderblur';
  weatherSlider.id = 'weatherSlider';
  weatherSlider.style.width = '100%';

  weatherSliderContainer.appendChild(weatherSliderHeading);
  weatherSliderContainer.appendChild(weatherSlider);

  weatherOverlayContainer.appendChild(weatherVerticalText);
  weatherOverlayContainer.appendChild(weatherSelector);
  weatherOverlayContainer.appendChild(weatherSliderContainer);

  const gameSwitchesContainer = document.createElement('div');
  gameSwitchesContainer.className = 'textandbutton';

  gameSwitchesContainer.appendChild(createSwitch('showsnakeelement', 'Snake:'));
  gameSwitchesContainer.appendChild(createSwitch('showflappyelement', 'Flappy:'));
  gameSwitchesContainer.appendChild(createSwitch('shownewselement', 'News:'));
  gameSwitchesContainer.appendChild(createSwitch('smpp_logo', 'Logo:'));

  parent.appendChild(performanceModeTooltipLabel);
  parent.appendChild(performanceModeInfo);

  parent.appendChild(themeHeading);
  parent.appendChild(profileSelector);
  parent.appendChild(colorPickers);

  parent.appendChild(switchesContainer);

  parent.appendChild(weatherHeading)
  parent.appendChild(weatherContainer);

  parent.appendChild(wallpaperHeading)
  parent.appendChild(wallpaperContainer);

  if (!liteMode) {
    parent.appendChild(weatherOverlayHeading)
    parent.appendChild(weatherOverlayContainer);
    parent.appendChild(gameSwitchesContainer);
  }

  return parent
}

function createSettings() {
  let quickSettingsWindow = document.createElement("div");
  quickSettingsWindow.id = "quickSettings";
  quickSettingsWindow.addEventListener("change", store);
  quickSettingsWindow = createSettingsHTML(quickSettingsWindow)

  quickSettingsWindow.style.left = (-270 / 3) + "px";
  document.getElementById("quickSettingsButton").insertAdjacentElement("afterend", quickSettingsWindow);

  document.getElementById("backgroundfilebutton").addEventListener("click", openFileSelector);
  document.getElementById("performanceModeTooltipLabel").addEventListener("mouseover", () => {
    document.getElementById("performanceModeInfo").style.opacity = "1";
    document.getElementById("performanceModeInfo").style.zIndex = "2";
  });
  document.getElementById("performanceModeTooltipLabel").addEventListener("mouseout", () => {
    document.getElementById("performanceModeInfo").style.opacity = "0";
    document.getElementById("performanceModeInfo").style.zIndex = "-1";
  });

  document.addEventListener("click", (e) => {
    if (settingsWindowIsHidden) return;
    if (
      e.target.id === "quickSettings" ||
      quickSettingsWindow.contains(e.target) ||
      e.target.id === "quickSettingsButton"
    ) {
      return;
    }
    closeSettings();
  });
}

function createSettingsButton() {
  let quickSettingsButtonWrapper = document.createElement("div")
  quickSettingsButtonWrapper.id = "quickSettingsButtonWrapper"
  quickSettingsButtonWrapper.classList.add("topnav__btn-wrapper")
  let logoutButton = document.querySelector(".js-btn-logout")
  if (!logoutButton) {
    return false;
  }
  let topNav = document.querySelector("nav.topnav")
  topNav.insertBefore(quickSettingsButtonWrapper, logoutButton);

  let quickSettingsButton = document.createElement("button")
  quickSettingsButton.id = "quickSettingsButton"
  quickSettingsButton.classList.add("topnav__btn")
  quickSettingsButton.innerText = "Settings"
  quickSettingsButton.addEventListener("click", toggleSettings);
  quickSettingsButtonWrapper.appendChild(quickSettingsButton)
  return true;
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

  let onHomePage = document.getElementById("container") !== null;
  if (createSettingsButton()) {

    if (onHomePage) {
      createWidgetEditModeButton();
    }
    if (!liteMode) { createGCButton() };

    createQuickMenuButton();

    document.querySelector('[data-go=""]')?.remove();
    document.querySelector('.topnav__btn--icon--search').parentElement?.remove();
    let notifsLabel = document.getElementById("notifsToggleLabel");
    if (notifsLabel) notifsLabel.innerText = "Toon pop-ups"; // Simplify text. (smartschool by default has a very long explanation that doesn't fit on screen)
  }
}

main()
