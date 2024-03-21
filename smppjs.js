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

  var svgMarkup = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class=st1 height="18px" width="18px" version="1.1" id="Layer_1" viewBox="0 0 459.334 459.334" xml:space="preserve">
<g>
	<g>
		<g>
			<path d="M175.216,404.514c-0.001,0.12-0.009,0.239-0.009,0.359c0,30.078,24.383,54.461,54.461,54.461     s54.461-24.383,54.461-54.461c0-0.12-0.008-0.239-0.009-0.359H175.216z"/>
			<path d="M403.549,336.438l-49.015-72.002c0-22.041,0-75.898,0-89.83c0-60.581-43.144-111.079-100.381-122.459V24.485     C254.152,10.963,243.19,0,229.667,0s-24.485,10.963-24.485,24.485v27.663c-57.237,11.381-100.381,61.879-100.381,122.459     c0,23.716,0,76.084,0,89.83l-49.015,72.002c-5.163,7.584-5.709,17.401-1.419,25.511c4.29,8.11,12.712,13.182,21.887,13.182     H383.08c9.175,0,17.597-5.073,21.887-13.182C409.258,353.839,408.711,344.022,403.549,336.438z"/>
		</g>
	</g>
</g>
</svg>
`;
  const notifsButton = document.querySelector('.js-btn-notifs');
  if (notifsButton) {
    const textSpan = notifsButton.querySelector('span');
    notifsButton.innerHTML = svgMarkup
    notifsButton.appendChild(textSpan);
  }
 svgMarkup = `
 <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class=st2 height="18px" width="18px" version="1.1" id="Capa_1" viewBox="0 0 75.294 75.294" xml:space="preserve">
 <g>
   <path d="M66.097,12.089h-56.9C4.126,12.089,0,16.215,0,21.286v32.722c0,5.071,4.126,9.197,9.197,9.197h56.9   c5.071,0,9.197-4.126,9.197-9.197V21.287C75.295,16.215,71.169,12.089,66.097,12.089z M61.603,18.089L37.647,33.523L13.691,18.089   H61.603z M66.097,57.206h-56.9C7.434,57.206,6,55.771,6,54.009V21.457l29.796,19.16c0.04,0.025,0.083,0.042,0.124,0.065   c0.043,0.024,0.087,0.047,0.131,0.069c0.231,0.119,0.469,0.215,0.712,0.278c0.025,0.007,0.05,0.01,0.075,0.016   c0.267,0.063,0.537,0.102,0.807,0.102c0.001,0,0.002,0,0.002,0c0.002,0,0.003,0,0.004,0c0.27,0,0.54-0.038,0.807-0.102   c0.025-0.006,0.05-0.009,0.075-0.016c0.243-0.063,0.48-0.159,0.712-0.278c0.044-0.022,0.088-0.045,0.131-0.069   c0.041-0.023,0.084-0.04,0.124-0.065l29.796-19.16v32.551C69.295,55.771,67.86,57.206,66.097,57.206z"/>
 </g>
 </svg>
  `;
    const messageButton = document.querySelector('.js-btn-messages');
    if (messageButton) {
      const textSpan = messageButton.querySelector('span');
      messageButton.innerHTML = svgMarkup
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
    base0: base0,
    base1: base1,
    base2: base2,
    base3: base3,
    accent: accent,
    text: text
  }
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
  const snowSlider = document.getElementById('snowSlider').value;
  const shownews = document.getElementById("shownewselement").checked;
  const showsnake = document.getElementById('showsnakeelement').checked;

  settingsData.profile = profileSelect;
  settingsData.halte = halte;
  settingsData.overwrite_theme = overwrite_theme;
  settingsData.location = loc.charAt(0).toUpperCase() + loc.slice(1);
  settingsData.backgroundfile = backgroundFile
  settingsData.backgroundlink = backgroundLink
  settingsData.blur = slider;
  settingsData.snow = parseInt(snowSlider);
  settingsData.shownews = shownews;
  settingsData.showsnake = showsnake;
  settingsData.show_scores = previousData.show_scores;
  console.log(settingsData)
  if (settingsData.show_scores == undefined) {
    settingsData.show_scores = false;
  }
  if (shownews && !previousData.shownews) {
    window.location.reload();
  }
  // Check if background file is selected
  if (backgroundFile) {
    // Convert file to base64 string and save in local storage
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
    // If no background file selected, save other settings only
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
  colorpickers.innerHTML = `
    <div class="color-picker-container">
    <input type="color" class="color-pickersmpp" id="colorPicker1">
    <span class="color-label">Base0</span>
</div>
<div class="color-picker-container">
    <input type="color" class="color-pickersmpp" id="colorPicker2">
    <span class="color-label">Base1</span>
</div>
<div class="color-picker-container">
    <input type="color" class="color-pickersmpp" id="colorPicker3">
    <span class="color-label">Base2</span>
</div>
<div class="color-picker-container">
    <input type="color" class="color-pickersmpp" id="colorPicker4">
    <span class="color-label">Base3</span>
</div>
<div class="color-picker-container">
    <input type="color" class="color-pickersmpp" id="colorPicker5">
    <span class="color-label">Accent</span>
</div>
<div class="color-picker-container">
    <input type="color" class="color-pickersmpp" id="colorPicker6">
    <span class="color-label">Text</span>
</div>`
  loadCustomThemeData()
}
function load() {
  const settingsData = JSON.parse(window.localStorage.getItem("settingsdata"));
  const elements = {
    "profileSelector": "profile",
    "backgroundlink": "backgroundlink",
    "halt": "halte",
    "backgroundSlider": "overwrite_theme",
    "location": "location",
    "mySlider": "blur",
    "snowSlider": "snow",
    "shownewselement": "shownews",
    "showsnakeelement": "showsnake"
  };
  Object.entries(elements).forEach(([elementId, dataKey]) => {
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
        <option value="custom">Custom Theme</option>
        <option value="ldev">Dark Sands</option>
        <option value="birb">Midnight Sapphire</option>
        <option value="stalker">Ruby Eclipse</option>
        <option value="chocolate">Dark Mocha</option>
        <option value="mountain">Storm Peaks</option>
        <option value="winter">Arctic Azure</option>
        <option value="galaxy">Fluorescent Galaxy</option>
        <option value="sand">Sahara Oasis</option>
        <option value="purple">Neon Violet</option>
        <option value="fall">Autumn Gloom</option>
        <option value="matcha">Matcha Green</option>
  
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
      <div class="verticaltext"><p class="nobottommargp off_text">Off</p><p class="nobottommargp link_text">Link</p><p class="nobottommargp">File</p></div>
      <input type="range" min="0" max="2" value="0" class="sliderblur" id="backgroundSlider">

      <input class="popupinput" id="backgroundlink" type="text"></input>
      <input class="popupinput" class="backgroundfile" id="fileInput" style="display: none;" type="file" accept=".png, .jpg, .jpeg"></input>
      <button class="popupinput" class="backgroundfile" id="backgroundfilebutton"><svg width="30px" height="30px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9 13H15M12.0627 6.06274L11.9373 5.93726C11.5914 5.59135 11.4184 5.4184 11.2166 5.29472C11.0376 5.18506 10.8425 5.10425 10.6385 5.05526C10.4083 5 10.1637 5 9.67452 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V10.2C21 9.0799 21 8.51984 20.782 8.09202C20.5903 7.71569 20.2843 7.40973 19.908 7.21799C19.4802 7 18.9201 7 17.8 7H14.3255C13.8363 7 13.5917 7 13.3615 6.94474C13.1575 6.89575 12.9624 6.81494 12.7834 6.70528C12.5816 6.5816 12.4086 6.40865 12.0627 6.06274Z" class="st4" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g>
      </svg></button>
    </div>
    <div class="textandbutton" id="errormessagesmpp"></div>
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
