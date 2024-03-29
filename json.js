const themes = {
  "default": {
    "--color-accent": "#8f8f95",
    "--color-text": "#C2BAB2",
    "--color-base00": "#191817",
    "--color-base01": "#232020",
    "--color-base02": "#3f3c3b",
    "--color-base03": "#5b5756",
    "--color-popup-border": "var(--color-accent)",
    "--color-hover-border": "var(--color-accent)",
    "--color-settings-bg": "var(--color-base02)",
    "--color-settings-border": "var(--color-base03)",
    "--color-settings-ui-bg": "var(--color-base01)",
    "--color-settings-ui-border": "var(--color-base02)",
    "--color-settings-ui-layer2": "var(--color-base03)",
    "--color-homepage-sidebars-bg": "#02020585",
    "--loginpage-image": "url(https://4kwallpapers.com/images/wallpapers/desert-doom-sand-dunes-dark-background-monochrome-landscape-2560x1080-6409.jpg)"
  },
  "white": {
    "--color-accent": "#3a4f6d",
    "--color-text": "#1a1e28",
    "--color-base00": "#eeebec",
    "--color-base01": "#e0dedf",
    "--color-base02": "#d2cfd0",
    "--color-base03": "#7b93b4",
    "--color-homepage-sidebars-bg": "#02020540",
    "--loginpage-image": "url(https://wallpaperaccess.com/full/1474688.jpg)",
    "--darken-background": "rgba(0,0,0,0.1)"
  },
  "ldev": {
    "--color-accent": "#ffd5a0",
    "--color-popup-border": "var(--color-base02)",
    "--color-hover-border": "var(--color-base03)",
    "--color-homepage-sidebars-bg": "var(--color-base00)",
    "--loginpage-image": "url(https://i.redd.it/yfssdsfosao11.png)",
    "--darken-background": "rgba(0,0,0,0.25)"
  },
  "purple": {
    "--color-accent": "#bd4fb3",
    "--color-text": "#d9cdff",
    "--color-base00": "#0b021d",
    "--color-base01": "#130332",
    "--color-base02": "#250654",
    "--color-base03": "#3f0a74",
    "--loginpage-image": "url(https://www.hdwallpapers.in/download/macos_monterey_shapes_hd_macos-2560x1440.jpg)"
  },
  "stalker": {
    "--color-accent": "#d6574e",
    "--color-text": "#f8a99c",
    "--color-base00": "#1a1311",
    "--color-base01": "#371b19",
    "--color-base02": "#5c1c1a",
    "--color-base03": "#823530",
    "--loginpage-image": "url(https://media.timeout.com/images/102945740/image.jpg)"
  },
  "chocolate": {
    "--color-accent": "#cdbcb4",
    "--color-text": "#dcdad0",
    "--color-base00": "#20181c",
    "--color-base01": "#2c2326",
    "--color-base02": "#3b2e2e",
    "--color-base03": "#4c3e3e",
    "--loginpage-image": "url(https://www.hdwallpapers.in/download/wet_brown_leaves_hd_dark_aesthetic-HD.jpg)",
    "--darken-background": "rgba(0,0,0,0.3)"
  },
  "fall": {
    "--color-accent": "#f8c791",
    "--color-text": "#d3cbc3",
    "--color-base00": "#231717",
    "--color-base01": "#3b1c16",
    "--color-base02": "#7b3f31",
    "--color-base03": "#bf6f51",
    "--loginpage-image": "url(https://wallpapercave.com/wp/wp7464660.jpg)",
    "--darken-background": "rgba(0,0,0,0.3)"
  },
  "winter": {
    "--color-accent": "#8aadb6",
    "--color-text": "#C2BAB2",
    "--color-base00": "#071b2c",
    "--color-base01": "#152f47",
    "--color-base02": "#345f7f",
    "--color-base03": "#5687b6",
    "--loginpage-image": "url(https://th.bing.com/th/id/R.fd4990dbff7b2d998a61b5a60b6b1949?rik=TkC2r3hdP1Ma9g&pid=ImgRaw&r=0)"
  },
  "birb": {
    "--color-accent": "#8590aacc",
    "--color-text": "#a8a9ab",
    "--color-base00": "#0e0e15",
    "--color-base01": "#16171b",
    "--color-base02": "#1c1d21",
    "--color-base03": "#30323a",
    "--loginpage-image": "url(https://wallpapercave.com/wp/wp4673203.jpg)"
  },
  "matcha": {
    "--color-accent": "#d1f8e7",
    "--color-text": "#d1ebd2",
    "--color-base00": "#243926",
    "--color-base01": "#365138",
    "--color-base02": "#456046",
    "--color-base03": "#4f7a51",
    "--loginpage-image": "url(https://wallpapercave.com/wp/wp9313069.jpg)",
    "--darken-background": "rgba(0,0,0,0.15)"
  },
  "mountain": {
    "--color-accent": "#f8f8fa",
    "--color-text": "#f8f8fa",
    "--color-base00": "#121c28",
    "--color-base01": "#23364e",
    "--color-base02": "#52647c",
    "--color-base03": "#8294ac",
    "--loginpage-image": "url(https://hdqwalls.com/download/everest-3840x2160.jpg)",
    "--darken-background": "rgba(0,0,0,0.15)"
  },
  "vax": {
    "--color-accent": "#492f29",
    "--color-text": "#492f29",
    "--color-base00": "#9c6544",
    "--color-base01": "#9c6544",
    "--color-base02": "#9c6544",
    "--color-base03": "#9c6544",
    "--loginpage-image": "url(https://wallpapers.com/images/hd/star-wars-place-ztno3exzqff0m0ci.webp)"
  },
  "sand": {
    "--color-accent": "#8097c5",
    "--color-text": "#c1a49c",
    "--color-base00": "#2e2526",
    "--color-base01": "#3d3434",
    "--color-base02": "#544848",
    "--color-base03": "#634f4e",
    "--loginpage-image": "url(https://hdqwalls.com/wallpapers/macos-mojave-dusk-mode-stock-el.jpg)",
    "--darken-background": "rgba(0,0,0,0.15)"
  },
  "galaxy": {
    "--color-accent": "#daa0ef",
    "--color-text": "#f0f0f0",
    "--color-base00": "#1e222c",
    "--color-base01": "#2e3440",
    "--color-base02": "#474e5f",
    "--color-base03": "#5c667d",
    "--loginpage-image": "url(https://i.redd.it/u80014ygsea51.png)",
    "--darken-background": "rgba(0,0,0,0.3)"
  }
}
const discordSvg = `<div class="bigdiscordbutton" style="position: fixed; bottom: 0; left: 0; width: 40px; height: 40px; border: 2px solid var(--color-base00); border-radius:10px; background-color: var(--color-base01);">
<a target="_blank" href="https://discord.gg/qCHZYepDqZ" class="discordbutton"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30px" height="30px" viewBox="0 -28.5 256 256" version="1.1" preserveAspectRatio="xMidYMid">
<g>
    <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" class="st1" fill-rule="nonzero">

</path>
</g>
</svg></a>
</div>`
const notfisSvg = `
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
const messageSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class=st2 height="18px" width="18px" version="1.1" id="Capa_1" viewBox="0 0 75.294 75.294" xml:space="preserve">
<g>
  <path d="M66.097,12.089h-56.9C4.126,12.089,0,16.215,0,21.286v32.722c0,5.071,4.126,9.197,9.197,9.197h56.9   c5.071,0,9.197-4.126,9.197-9.197V21.287C75.295,16.215,71.169,12.089,66.097,12.089z M61.603,18.089L37.647,33.523L13.691,18.089   H61.603z M66.097,57.206h-56.9C7.434,57.206,6,55.771,6,54.009V21.457l29.796,19.16c0.04,0.025,0.083,0.042,0.124,0.065   c0.043,0.024,0.087,0.047,0.131,0.069c0.231,0.119,0.469,0.215,0.712,0.278c0.025,0.007,0.05,0.01,0.075,0.016   c0.267,0.063,0.537,0.102,0.807,0.102c0.001,0,0.002,0,0.002,0c0.002,0,0.003,0,0.004,0c0.27,0,0.54-0.038,0.807-0.102   c0.025-0.006,0.05-0.009,0.075-0.016c0.243-0.063,0.48-0.159,0.712-0.278c0.044-0.022,0.088-0.045,0.131-0.069   c0.041-0.023,0.084-0.04,0.124-0.065l29.796-19.16v32.551C69.295,55.771,67.86,57.206,66.097,57.206z"/>
</g>
</svg>`
const colorpickersHTML = `
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
const settingsInputElements = {
  "profileSelector": "profile",
  "backgroundlink": "backgroundlink",
  "halt": "halte",
  "backgroundSlider": "overwrite_theme",
  "location": "location",
  "mySlider": "blur",
  "snowSlider": "snow",
  "shownewselement": "shownews",
  "showsnakeelement": "showsnake"
}
const popupsettingHTML = `<head>
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
<div class="textandbutton">
  <div>
    <h3 class="popuptitles">Planner:</h3>
    <label class="switch">
      <input class="popupinput" type="checkbox" id="showplanner">
      <span class="slider round"></span>
      </label>
  </div>
<div>
  <h3 class="popuptitles">Delijn:</h3>
  <label class="switch">
    <input class="popupinput" type="checkbox" id="halt">
    <span class="slider round"></span>
    </label>
</div>
</div>
<h3 class="popuptitles">Location (weather):</h3>
<div class="textandbutton">
<input class="popupinput" id="location" type="text"></input>
<label class="switch">
<input class="popupinput" type="checkbox" id="isbig">
<span class="slider round"></span>
</label>
</div>
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
const weatherHTML = `<div class="weatherdiv">
	<h2 class="weather-location weather-locationBig"></h2>

	<h2 class="weather-main weather-mainBig"></h2>
	<div class="weather">
		<div src="https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/chanceflurries.svg"
			class="weather-icon"></div>
	</div>
	<p class="weather-temperature weather-temperatureBig"></p>
	<div class="weather-humwind weather-humwindBig">
		<svg xmlns="http://www.w3.org/2000/svg" id="layer1" data-name="Laag 2" height="55px" width="55px"
			viewBox="0 0 29.83 24.41">
			<defs>
				<style>
					.cls-1 {
						fill-rule: evenodd;
					}

					.cls-1,
					.cls-2 {
						fill: #1d1d1b;
						stroke-width: 0px;
					}
				</style>
			</defs>
			<g id="Laag_1-2" data-name="Laag 1">
				<g>
					<path class="st1"
						d="M18.99.35c2.5-.54,5.6-.51,9.81.54.73.18,1.17.92.99,1.64s-.92,1.17-1.64.98c-3.92-.98-6.58-.95-8.58-.52-2,.43-3.44,1.29-4.96,2.22l-.11.07c-1.47.9-3.09,1.89-5.24,2.25-2.23.37-4.86.04-8.4-1.37-.7-.28-1.03-1.06-.76-1.76.28-.69,1.07-1.03,1.76-.75,3.24,1.29,5.36,1.47,6.94,1.21,1.61-.27,2.84-1.01,4.39-1.95,1.53-.93,3.31-2.02,5.8-2.56Z" />
					<path class="st1"
						d="M28.81,6.3c-4.22-1.05-7.31-1.08-9.81-.54-2.49.54-4.27,1.63-5.8,2.56-1.55.95-2.78,1.69-4.39,1.95-1.59.26-3.7.08-6.94-1.21-.7-.28-1.48.06-1.76.75-.28.69.06,1.48.76,1.76,3.54,1.41,6.17,1.74,8.4,1.37,2.15-.36,3.77-1.35,5.24-2.25l.11-.07c1.52-.93,2.96-1.79,4.96-2.22,1.99-.43,4.66-.46,8.58.52.73.18,1.46-.26,1.64-.98.18-.72-.26-1.46-.99-1.64Z" />
					<path class="st1 cls-1"
						d="M24.41,9.53c-.47,0-.86.24-1.14.61-.1.13-.32.43-.61.86-.39.57-.92,1.35-1.45,2.23-.53.87-1.07,1.86-1.48,2.83-.4.92-.75,1.93-.75,2.95,0,.29.04.57.08.85.08.47.24,1.12.57,1.78.33.67.86,1.38,1.67,1.92.82.54,1.85.86,3.1.86s2.29-.32,3.1-.86c.81-.54,1.33-1.25,1.67-1.92.33-.66.49-1.31.57-1.78.05-.28.08-.57.08-.86,0-1.02-.35-2.02-.75-2.94-.41-.97-.96-1.95-1.48-2.83-.53-.88-1.05-1.66-1.45-2.23-.3-.43-.52-.73-.61-.86-.27-.37-.67-.61-1.14-.61ZM26.59,17.12c-.35-.81-.82-1.68-1.31-2.5-.3-.5-.6-.97-.87-1.38-.27.41-.57.88-.87,1.38-.49.82-.97,1.69-1.31,2.5l-.02.05c-.24.56-.52,1.22-.51,1.83.02.49.15.99.37,1.42.17.35.41.65.75.87.33.22.82.41,1.6.41s1.27-.19,1.6-.41c.33-.22.57-.53.75-.87.22-.43.35-.94.37-1.42.02-.62-.27-1.27-.51-1.83l-.02-.05Z" />
					<path class="st1"
						d="M17.8,11.57c1.03-.33,1.82.74,1.34,1.71-.22.44-.47.82-.97.99-1.32.47-2.42,1.13-3.57,1.83l-.11.07c-1.47.9-3.09,1.89-5.24,2.25-2.23.37-4.86.04-8.4-1.37-.7-.28-1.03-1.06-.76-1.76.28-.69,1.07-1.03,1.76-.75,3.24,1.29,5.36,1.47,6.94,1.21,1.61-.27,2.84-1.01,4.39-1.95,1.48-.9,2.99-1.69,4.61-2.22Z" />
				</g>
			</g>
		</svg>

		<div class="weather-humwind weather-humwindBig">
			<svg xmlns="http://www.w3.org/2000/svg" id="Laag_2" height="70px" width="70px" data-name="Laag 2"
				viewBox="0 0 39.94 24.5">
				<defs>
					<style>
						.cls-1 {
							fill: #000;
							stroke-width: 0px;
						}
					</style>
				</defs>
				<g id="Laag_1-2" data-name="Laag 1">
					<g>
						<path class="st1"
							d="M38.09,12.21c-.96.78-2.07,1.18-3.33,1.18-1.29-.01-2.57-.01-3.86-.01h-14.61c-.54,0-.97-.29-1.13-.78-.17-.51.01-1.07.43-1.33.21-.13.49-.21.74-.21,4.41-.01,8.83-.01,13.24-.01h5.15c1.44,0,2.56-.91,2.85-2.32.27-1.38-.75-2.89-2.15-3.18-.2-.04-.4-.06-.6-.06-1.51,0-2.73,1.21-2.77,2.76-.02.71-.49,1.18-1.17,1.18h-.14c-.57-.06-1.01-.53-1.02-1.1-.03-1.26.37-2.39,1.17-3.34.99-1.16,2.42-1.83,3.93-1.83,1.95,0,3.72,1.09,4.6,2.86,1.05,2.09.49,4.7-1.33,6.19Z" />
						<path class="st1"
							d="M21.08,24.32c-.43.12-.88.18-1.32.18-2.56,0-4.79-1.97-5.08-4.5-.03-.27-.05-.62.02-.95.11-.5.55-.82,1.11-.82h.14c.54.05.97.49,1,1.03.04.68.18,1.17.45,1.6.49.8,1.4,1.29,2.35,1.29.24,0,.48-.03.71-.09,1.19-.32,2.01-1.34,2.05-2.56.03-.78-.25-1.52-.77-2.06-.53-.55-1.26-.85-2.05-.85H1.17c-.61,0-1.08-.43-1.16-1.04-.06-.55.33-1.11.88-1.25.11-.02.23-.03.32-.03h18.55c2.45.01,4.5,1.68,4.99,4.07.55,2.65-1.07,5.28-3.67,5.98Z" />
						<path class="st1"
							d="M28.49,8.05c-.85,1.23-2.2,2.01-3.71,2.15-.32.03-.67.04-1.1.04-.25,0-.51,0-.76-.01-.25,0-.51-.01-.78-.01H5.76c-.4,0-.75-.17-.97-.47-.22-.29-.28-.67-.17-1.03.14-.47.57-.8,1.04-.81.15-.01.29-.01.43-.01h17.64c.43,0,.84-.01,1.24-.09,1.2-.26,2.09-1.38,2.1-2.66.03-1.43-1.05-2.64-2.49-2.79-.1-.02-.2-.02-.3-.02-1.3,0-2.41.91-2.7,2.21-.04.2-.05.41-.07.62-.03.63-.51,1.09-1.15,1.1-.64,0-1.14-.44-1.17-1.06-.06-1.11.27-2.15.98-3.1C21.21.72,22.6.01,24.3,0h.03c2.28,0,4.29,1.54,4.88,3.76.41,1.49.14,3.06-.72,4.29Z" />
					</g>
				</g>
			</svg>
		</div>
		<div class="weather-humwind weather-humwindBig">
			<svg xmlns="http://www.w3.org/2000/svg" id="Laag_2" height="55px" width="55px" data-name="Laag 2"
				viewBox="0 0 24.28 25.14">
				<defs>
					<style>
						.cls-1 {
							fill: #000;
							stroke-width: 0px;
						}
					</style>
				</defs>
				<g id="Laag_1-2" data-name="Laag 1">
					<g>
						<path class="st1"
							d="M21.57,7.72h-5.24c-1.47.02-2.64,1.24-2.61,2.71v5.14c0,.97.76,1.78,1.71,1.85v5.87c0,1.02.84,1.85,1.86,1.85h3.43c1.02,0,1.85-.83,1.85-1.86v-5.86c.96-.07,1.71-.88,1.71-1.85v-5.24c-.02-1.47-1.25-2.64-2.71-2.61ZM15.71,15.43v-5.09c.01-.18.09-.34.23-.46.13-.12.3-.18.48-.17h5.24c.18.01.34.09.46.23.12.13.18.3.17.49v5h-1.72v7.71h-3.14v-7.71h-1.72Z" />
						<path class="st1"
							d="M19,0c-1.97,0-3.57,1.6-3.57,3.57s1.6,3.57,3.57,3.57,3.57-1.61,3.57-3.57-1.6-3.57-3.57-3.57ZM19,5.14c-.87,0-1.57-.7-1.57-1.57s.7-1.57,1.57-1.57,1.57.71,1.57,1.57-.7,1.57-1.57,1.57Z" />
						<path class="st1"
							d="M10.57,14.75V5.29c0-2.44-1.99-4.43-4.43-4.43S1.72,2.85,1.72,5.29v9.46c-1.11,1.15-1.72,2.66-1.72,4.26.01,3.38,2.76,6.13,6.14,6.13,1.62,0,3.15-.62,4.31-1.75,2.4-2.36,2.45-6.22.12-8.64ZM8.91,22.09c-.83.74-1.9,1.12-3,1.05-1.1-.06-2.12-.55-2.85-1.37-.74-.83-1.12-1.89-1.05-2.99.06-1.11.55-2.13,1.37-2.86l.33-.3V5.29c0-1.34,1.09-2.43,2.43-2.44,1.34.01,2.43,1.1,2.43,2.44v10.33l.33.29c.12.11.23.22.33.33.74.83,1.11,1.9,1.05,3-.06,1.11-.55,2.12-1.37,2.85Z" />
						<path class="st1"
							d="M8.59,20.18c-.31.65-.86,1.15-1.54,1.39-.3.1-.6.15-.9.15-1.12,0-2.17-.69-2.56-1.81-.49-1.37.21-2.89,1.55-3.42v-7.06h2v7.06c.73.29,1.3.87,1.56,1.62.24.68.2,1.42-.11,2.07Z" />
					</g>
				</g>
			</svg>

		</div>

	</div>
	<p class="weather-humidity weather-humidityBig"></p>

	<p class="weather-wind weather-windBig"></p>
	<p class="weather-feelslike weather-feelslikeBig"></p>

	<p class="weather-lastupdate weather-lastupdateBig"></p>
</div>

</div>

</div>
`;
const weatherHTMLTiny = `<div class="weatherdiv">
<h2 class="weather-location weather-locationSmall"></h2>

<h2 class="weather-main weather-mainSmall"></h2>
<div class="weather">
  <div src="https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/chanceflurries.svg"
    class="weather-icon"></div>
</div>
<p class="weather-temperature weather-temperatureSmall"></p>
<div class="weather-humwind weather-humwindSmall">
  <svg xmlns="http://www.w3.org/2000/svg" id="layer1" data-name="Laag 2" height="35px" width="35px"
    viewBox="0 0 29.83 24.41">
    <defs>
      <style>
        .cls-1 {
          fill-rule: evenodd;
        }

        .cls-1,
        .cls-2 {
          fill: #1d1d1b;
          stroke-width: 0px;
        }
      </style>
    </defs>
    <g id="Laag_1-2" data-name="Laag 1">
      <g>
        <path class="st1"
          d="M18.99.35c2.5-.54,5.6-.51,9.81.54.73.18,1.17.92.99,1.64s-.92,1.17-1.64.98c-3.92-.98-6.58-.95-8.58-.52-2,.43-3.44,1.29-4.96,2.22l-.11.07c-1.47.9-3.09,1.89-5.24,2.25-2.23.37-4.86.04-8.4-1.37-.7-.28-1.03-1.06-.76-1.76.28-.69,1.07-1.03,1.76-.75,3.24,1.29,5.36,1.47,6.94,1.21,1.61-.27,2.84-1.01,4.39-1.95,1.53-.93,3.31-2.02,5.8-2.56Z" />
        <path class="st1"
          d="M28.81,6.3c-4.22-1.05-7.31-1.08-9.81-.54-2.49.54-4.27,1.63-5.8,2.56-1.55.95-2.78,1.69-4.39,1.95-1.59.26-3.7.08-6.94-1.21-.7-.28-1.48.06-1.76.75-.28.69.06,1.48.76,1.76,3.54,1.41,6.17,1.74,8.4,1.37,2.15-.36,3.77-1.35,5.24-2.25l.11-.07c1.52-.93,2.96-1.79,4.96-2.22,1.99-.43,4.66-.46,8.58.52.73.18,1.46-.26,1.64-.98.18-.72-.26-1.46-.99-1.64Z" />
        <path class="st1 cls-1"
          d="M24.41,9.53c-.47,0-.86.24-1.14.61-.1.13-.32.43-.61.86-.39.57-.92,1.35-1.45,2.23-.53.87-1.07,1.86-1.48,2.83-.4.92-.75,1.93-.75,2.95,0,.29.04.57.08.85.08.47.24,1.12.57,1.78.33.67.86,1.38,1.67,1.92.82.54,1.85.86,3.1.86s2.29-.32,3.1-.86c.81-.54,1.33-1.25,1.67-1.92.33-.66.49-1.31.57-1.78.05-.28.08-.57.08-.86,0-1.02-.35-2.02-.75-2.94-.41-.97-.96-1.95-1.48-2.83-.53-.88-1.05-1.66-1.45-2.23-.3-.43-.52-.73-.61-.86-.27-.37-.67-.61-1.14-.61ZM26.59,17.12c-.35-.81-.82-1.68-1.31-2.5-.3-.5-.6-.97-.87-1.38-.27.41-.57.88-.87,1.38-.49.82-.97,1.69-1.31,2.5l-.02.05c-.24.56-.52,1.22-.51,1.83.02.49.15.99.37,1.42.17.35.41.65.75.87.33.22.82.41,1.6.41s1.27-.19,1.6-.41c.33-.22.57-.53.75-.87.22-.43.35-.94.37-1.42.02-.62-.27-1.27-.51-1.83l-.02-.05Z" />
        <path class="st1"
          d="M17.8,11.57c1.03-.33,1.82.74,1.34,1.71-.22.44-.47.82-.97.99-1.32.47-2.42,1.13-3.57,1.83l-.11.07c-1.47.9-3.09,1.89-5.24,2.25-2.23.37-4.86.04-8.4-1.37-.7-.28-1.03-1.06-.76-1.76.28-.69,1.07-1.03,1.76-.75,3.24,1.29,5.36,1.47,6.94,1.21,1.61-.27,2.84-1.01,4.39-1.95,1.48-.9,2.99-1.69,4.61-2.22Z" />
      </g>
    </g>
  </svg>

  <div class="weather-humwind weather-humwindSmall">
    <svg xmlns="http://www.w3.org/2000/svg" id="Laag_2" height="45px" width="45px" data-name="Laag 2"
      viewBox="0 0 39.94 24.5">
      <defs>
        <style>
          .cls-1 {
            fill: #000;
            stroke-width: 0px;
          }
        </style>
      </defs>
      <g id="Laag_1-2" data-name="Laag 1">
        <g>
          <path class="st1"
            d="M38.09,12.21c-.96.78-2.07,1.18-3.33,1.18-1.29-.01-2.57-.01-3.86-.01h-14.61c-.54,0-.97-.29-1.13-.78-.17-.51.01-1.07.43-1.33.21-.13.49-.21.74-.21,4.41-.01,8.83-.01,13.24-.01h5.15c1.44,0,2.56-.91,2.85-2.32.27-1.38-.75-2.89-2.15-3.18-.2-.04-.4-.06-.6-.06-1.51,0-2.73,1.21-2.77,2.76-.02.71-.49,1.18-1.17,1.18h-.14c-.57-.06-1.01-.53-1.02-1.1-.03-1.26.37-2.39,1.17-3.34.99-1.16,2.42-1.83,3.93-1.83,1.95,0,3.72,1.09,4.6,2.86,1.05,2.09.49,4.7-1.33,6.19Z" />
          <path class="st1"
            d="M21.08,24.32c-.43.12-.88.18-1.32.18-2.56,0-4.79-1.97-5.08-4.5-.03-.27-.05-.62.02-.95.11-.5.55-.82,1.11-.82h.14c.54.05.97.49,1,1.03.04.68.18,1.17.45,1.6.49.8,1.4,1.29,2.35,1.29.24,0,.48-.03.71-.09,1.19-.32,2.01-1.34,2.05-2.56.03-.78-.25-1.52-.77-2.06-.53-.55-1.26-.85-2.05-.85H1.17c-.61,0-1.08-.43-1.16-1.04-.06-.55.33-1.11.88-1.25.11-.02.23-.03.32-.03h18.55c2.45.01,4.5,1.68,4.99,4.07.55,2.65-1.07,5.28-3.67,5.98Z" />
          <path class="st1"
            d="M28.49,8.05c-.85,1.23-2.2,2.01-3.71,2.15-.32.03-.67.04-1.1.04-.25,0-.51,0-.76-.01-.25,0-.51-.01-.78-.01H5.76c-.4,0-.75-.17-.97-.47-.22-.29-.28-.67-.17-1.03.14-.47.57-.8,1.04-.81.15-.01.29-.01.43-.01h17.64c.43,0,.84-.01,1.24-.09,1.2-.26,2.09-1.38,2.1-2.66.03-1.43-1.05-2.64-2.49-2.79-.1-.02-.2-.02-.3-.02-1.3,0-2.41.91-2.7,2.21-.04.2-.05.41-.07.62-.03.63-.51,1.09-1.15,1.1-.64,0-1.14-.44-1.17-1.06-.06-1.11.27-2.15.98-3.1C21.21.72,22.6.01,24.3,0h.03c2.28,0,4.29,1.54,4.88,3.76.41,1.49.14,3.06-.72,4.29Z" />
        </g>
      </g>
    </svg>
  </div>
  <div class="weather-humwind weather-humwindSmall">
    <svg xmlns="http://www.w3.org/2000/svg" id="Laag_2" height="35px" width="35px" data-name="Laag 2" viewBox="0 0 24.28 25.14">
      <defs>
        <style>
        .cls-1 {
          fill: #000;
          stroke-width: 0px;
        }
        </style>
      </defs>
      <g id="Laag_1-2" data-name="Laag 1">
        <g>
        <path class="st1" d="M10.57,14.75V5.29c0-2.44-1.99-4.43-4.43-4.43S1.72,2.85,1.72,5.29v9.46c-1.11,1.15-1.72,2.66-1.72,4.26.01,3.38,2.76,6.13,6.14,6.13,1.62,0,3.15-.62,4.31-1.75,2.4-2.36,2.45-6.22.12-8.64ZM8.91,22.09c-.83.74-1.9,1.12-3,1.05-1.1-.06-2.12-.55-2.85-1.37-.74-.83-1.12-1.89-1.05-2.99.06-1.11.55-2.13,1.37-2.86l.33-.3V5.29c0-1.34,1.09-2.43,2.43-2.44,1.34.01,2.43,1.1,2.43,2.44v10.33l.33.29c.12.11.23.22.33.33.74.83,1.11,1.9,1.05,3-.06,1.11-.55,2.12-1.37,2.85Z"/>
        <path class="st1" d="M8.59,20.18c-.31.65-.86,1.15-1.54,1.39-.3.1-.6.15-.9.15-1.12,0-2.17-.69-2.56-1.81-.49-1.37.21-2.89,1.55-3.42v-7.06h2v7.06c.73.29,1.3.87,1.56,1.62.24.68.2,1.42-.11,2.07Z"/>
        </g>
      </g>
      </svg>
  </div>

</div>
<p class="weather-humidity weather-humiditySmall"></p>

<p class="weather-wind weather-windSmall"></p>
<p class="weather-feelslike weather-feelslikeSmall"></p>

<p class="weather-lastupdate weather-lastupdateSmall"></p>
</div>

</div>

</div>
`;