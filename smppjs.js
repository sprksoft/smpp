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
    return "Good Bye! -->"
  }
  return "Logout -->"
}
var logoutButton = document.getElementsByClassName("js-btn-logout")[0]
var notifsText = document.getElementById("notifsToggleLabel")
if (logoutButton) {
  logoutButton.innerHTML = changeLogoutText();
}
if (notifsText) {
  notifsText.innerHTML = "Toon pop-ups";
}

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
  const snow = settingsData.snow;
  const shownews = settingsData.shownews;
  const showsnake = settingsData.showsnake;
  var show_scores = settingsData.show_scores;
  set_theme("default");
  set_theme(profileSelect);

  if (show_scores == undefined) {
    show_scores = false;
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

  const messageButton = document.querySelector('.js-btn-messages');
  if (messageButton) {
    const textSpan = messageButton.querySelector('span');
    messageButton.innerHTML = messageSvg
    messageButton.appendChild(textSpan);
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
  const previousData = get_config();
  const profileSelectPrevious = previousData.profile;

  if (profileSelectPrevious === "custom") {
    storeTheme();
  }

  const settingsData = gatherSettingsData(previousData);

  if (settingsData.shownews && !previousData.shownews) {
    window.location.reload();
  }

  if (settingsData.backgroundFile) {
    handleBackgroundFile(settingsData);
  } else {
    settingsData.backgroundfile = previousData.backgroundfile;
    set_config(settingsData);
    if (settingsData.profile === "custom") {
      loadCustomTheme();
    }
    apply();
  }
}

function gatherSettingsData(previousData) {
  const profileSelect = document.getElementById("profileSelector").value;
  const backgroundFile = document.getElementById("fileInput").files[0];
  const backgroundLink = document.getElementById("backgroundlink").value;
  const halte = document.getElementById("halt").checked;
  const overwrite_theme = document.getElementById("backgroundSlider").value;
  const loc = document.getElementById("location").value;
  const slider = document.getElementById('mySlider').value;
  const snowSlider = document.getElementById('snowSlider').value;
  const shownews = document.getElementById("shownewselement").checked;
  const showsnake = document.getElementById('showsnakeelement').checked;
  return {
    profile: profileSelect,
    halte: halte,
    overwrite_theme: overwrite_theme,
    location: loc.charAt(0).toUpperCase() + loc.slice(1),
    backgroundFile: backgroundFile,
    backgroundlink: backgroundLink,
    blur: slider,
    snow: parseInt(snowSlider),
    shownews: shownews,
    showsnake: showsnake,
    show_scores: previousData.show_scores || false
  };
}

function handleBackgroundFile(settingsData) {
  const backgroundFile = settingsData.backgroundFile;
  fileToBase64(backgroundFile)
    .then(base64Image => {
      settingsData.backgroundfile = base64Image;
      window.localStorage.setItem("settingsdata", JSON.stringify(settingsData));
      if (settingsData.profile === "custom") {
        loadCustomTheme();
      }
      if (base64Image.length < 1500000) {
        document.getElementById("errormessagesmpp").innerHTML = ``;
      }
      apply();
    })
    .catch(error => {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        handleQuotaExceededError();
      } else {
        console.error('An error occurred:', error);
      }
      apply();
    });
}

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
function load() {
  const settingsData = JSON.parse(window.localStorage.getItem("settingsdata"));
  Object.entries(settingsInputElements).forEach(([elementId, dataKey]) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.value = settingsData[dataKey];
      if (elementId === "profileSelector" && element.value === "custom") {
        loadCustomTheme();
      }
    }
  });
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
  let theme = themes[name];
  if (!theme) {
    return;
  }
  let style = document.documentElement.style;
  let keys = Object.keys(theme);
  for (let i = 0; i < keys.length; i++) {
    style.setProperty(keys[i], theme[keys[i]]);
  }
}
apply()