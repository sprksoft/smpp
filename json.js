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
    "--color-base01": "#18191d",
    "--color-base02": "#232428",
    "--color-base03": "#3a3c44",
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
    "--color-accent": "#7a1600",
    "--color-text": "bisque",
    "--color-base00": "#411900",
    "--color-base01": "#724021",
    "--color-base02": "#b9815d",
    "--color-base03": "#caa288",
    "--loginpage-image": "url(https://wallpapers.com/images/hd/star-wars-place-ztno3exzqff0m0ci.webp)",
    "--darken-background": "rgba(0,0,0,0.15)"
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
const homeiconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px"class=st1 height="18px" width="18px" viewBox="0 0 256 256" enable-background="new 0 0 256 256" xml:space="preserve">
<metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon</metadata>
<g><g><path  d="M241.4,104.9l-96-89.5c-4.9-5.5-11.9-8.7-19.3-8.7c-7.3,0-14.3,3.1-19,8.4l-92.5,89.8c-4.6,4.7-5.9,11.6-3.4,17.7c2.6,6.1,8.5,9.9,15.1,9.9h8.3v91.3c0,14.2,11.3,25.7,25.5,25.7h39.7c5.2,0,9.7-4.2,9.7-9.3v-60.7c0-2.6,1.7-4.9,4.3-4.9h28c2.6,0,4.6,2.3,4.6,4.9V240c0,5.2,4.3,9.3,9.5,9.3h39.7c14.2,0,25.8-11.5,25.8-25.7v-91.3h8.3c6.6,0,12.5-3.8,15.1-9.9C247.3,116.5,246,109.6,241.4,104.9L241.4,104.9z"/></g></g>
</svg>`
const notfisSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 24 24" class=st1>span.js-badge-msg.topnav__badge
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C9.9695 2 8.34903 2.72578 7.24822 3.98079C6.16397 5.21692 5.66667 6.87057 5.66667 8.6V10.3333C5.66667 10.5774 5.55716 10.8709 5.27166 11.2498C4.99798 11.6129 4.6427 11.9534 4.25022 12.3296L4.18372 12.3934C3.49997 13.0494 3 13.9996 3 15.1333C3 16.67 4.19824 18 5.77778 18H18.2222C19.8018 18 21 16.67 21 15.1333C21 13.9996 20.5 13.0494 19.8163 12.3934L19.7498 12.3296L19.7497 12.3296C19.3573 11.9534 19.002 11.6129 18.7283 11.2498C18.4428 10.8709 18.3333 10.5774 18.3333 10.3333V8.6C18.3333 6.87057 17.836 5.21692 16.7518 3.98079C15.651 2.72578 14.0305 2 12 2Z"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.44303 19.1694C9.90172 18.8618 10.5229 18.9843 10.8305 19.443C10.9299 19.5912 11.0843 19.731 11.2919 19.8345C11.4998 19.938 11.7444 19.9964 12 19.9964C12.2556 19.9964 12.5002 19.938 12.7081 19.8345C12.9157 19.731 13.0701 19.5912 13.1695 19.443C13.4771 18.9843 14.0983 18.8618 14.557 19.1694C15.0157 19.4771 15.1381 20.0983 14.8305 20.557C14.5234 21.0149 14.0944 21.3783 13.6 21.6246C13.1058 21.8708 12.5546 21.9964 12 21.9964C11.4454 21.9964 10.8942 21.8708 10.4 21.6246C9.90564 21.3783 9.47658 21.0149 9.16946 20.557C8.86186 20.0983 8.98434 19.4771 9.44303 19.1694Z"/>
</svg>
`;
const messageSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:svg="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 6.3500002 6.3500002" class=st1 id="svg1976" version="1.1">

<defs id="defs1970"/>

<g id="layer1" style="display:inline">

<path d="m 0.87513983,0.92604163 c -0.4802584,0 -0.8748817925,0.39462207 -0.8748817925,0.87488207 v 2.7481528 c 0,0.4802611 0.3946233925,0.8748819 0.8748817925,0.8748819 H 5.4748603 c 0.4802585,0 0.8748817,-0.3946208 0.8748817,-0.8748819 V 1.8009237 c 0,-0.48026 -0.3946232,-0.87488207 -0.8748817,-0.87488207 z M 1.2549624,1.984375 a 0.264583,0.264583 0 0 1 0.1829329,0.06873 l 1.2774428,1.1539337 c 0.2490602,0.2251498 0.6728487,0.2251498 0.9219063,0 l 1.2769268,-1.153934 a 0.264583,0.264583 0 0 1 0.1839674,-0.068213 0.264583,0.264583 0 0 1 0.1912012,0.08785 0.264583,0.264583 0 0 1 -0.019632,0.3725873 l -0.7761817,0.7017658 0.1472777,0.1462455 0.6387227,0.63872 a 0.264583,0.264583 0 0 1 0,0.3746527 0.264583,0.264583 0 0 1 -0.3751713,0 L 4.266151,3.6679928 4.1007864,3.5015964 3.9922649,3.5997806 c -0.4586684,0.4146206 -1.173779,0.4146206 -1.632458,0 L 2.251804,3.5021123 2.0864394,3.6679928 1.4477167,4.3067129 a 0.264583,0.264583 0 0 1 -0.3751713,0 0.264583,0.264583 0 0 1 0,-0.3746527 L 1.7112681,3.2933402 1.8585458,3.1470947 1.0823641,2.4453289 A 0.264583,0.264583 0 0 1 1.062732,2.0727416 0.264583,0.264583 0 0 1 1.2549677,1.984375 Z" id="rect868" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;line-height:normal;font-family:sans-serif;font-variant-ligatures:normal;font-variant-position:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-alternates:normal;font-variant-east-asian:normal;font-feature-settings:normal;font-variation-settings:normal;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;writing-mode:lr-tb;direction:ltr;text-orientation:mixed;dominant-baseline:auto;baseline-shift:baseline;text-anchor:start;white-space:normal;shape-padding:0;shape-margin:0;inline-size:0;clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;isolation:auto;mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000000;solid-opacity:1;vector-effect:none;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.529167;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:stroke fill markers;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate;stop-color:#000000"/>

</g>

</svg>`
const colorpickersHTML = `
<div class="color-picker-container">
<input type="color" class="color-pickersmpp" id="colorPicker1">
<span class="color-label">base0</span>
</div>
<div class="color-picker-container">
<input type="color" class="color-pickersmpp" id="colorPicker2">
<span class="color-label">base1</span>
</div>
<div class="color-picker-container">
<input type="color" class="color-pickersmpp" id="colorPicker3">
<span class="color-label">base2</span>
</div>
<div class="color-picker-container">
<input type="color" class="color-pickersmpp" id="colorPicker4">
<span class="color-label">base3</span>
</div>
<div class="color-picker-container">
<input type="color" class="color-pickersmpp" id="colorPicker5">
<span class="color-label">accent</span>
</div>
<div class="color-picker-container">
<input type="color" class="color-pickersmpp" id="colorPicker6">
<span class="color-label">text</span>
</div>`
const popupsettingHTML = `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>popup</title>
</head>
<body>
<h3 class="popuptitles">Theme:</h3>
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
    <option value="vax">Vax Brown</option>
</select>
<div class="textandbutton" id="colorpickers">
</div>
<div class="textandbutton" style="margin-top:0px !important">
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
<div>
  <h3 class="popuptitles">Plant:</h3>
  <label class="switch">
    <input class="popupinput" type="checkbox" id="show_plant">
    <span class="slider round"></span>
    </label>
</div>

</div>
<h3 class="popuptitles">Location (Weather):</h3>
<div class="textandbutton">
<input class="popupinput" id="location" type="text"></input>
<label class="switch">
<input class="popupinput" type="checkbox" id="isbig">
<span class="slider round"></span>
</label>
</div>
<h3 class="popuptitles">Custom wallpaper:</h3>
<div class="textandbutton">
  <div class="verticaltext"><p class="nobottommargp off_text">Off</p><p class="nobottommargp link_text">Link</p><p class="nobottommargp">File</p></div>
  <input type="range" min="0" max="2" value="0" class="sliderblur" id="backgroundSlider">
  <input class="popupinput" id="backgroundlink" type="text"></input>
  <input class="popupinput" class="backgroundfile" id="fileInput" style="display: none;" type="file" accept=".png, .jpg, .jpeg"></input>
  <button class="popupinput" class="backgroundfile" id="backgroundfilebutton"><svg width="30px" height="30px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9 13H15M12.0627 6.06274L11.9373 5.93726C11.5914 5.59135 11.4184 5.4184 11.2166 5.29472C11.0376 5.18506 10.8425 5.10425 10.6385 5.05526C10.4083 5 10.1637 5 9.67452 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V10.2C21 9.0799 21 8.51984 20.782 8.09202C20.5903 7.71569 20.2843 7.40973 19.908 7.21799C19.4802 7 18.9201 7 17.8 7H14.3255C13.8363 7 13.5917 7 13.3615 6.94474C13.1575 6.89575 12.9624 6.81494 12.7834 6.70528C12.5816 6.5816 12.4086 6.40865 12.0627 6.06274Z" class="st4" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g>
  </svg></button>
  <div class="color-picker-container">
    <input type="range" min="0" max="10" value="0" class="sliderblur" id="mySlider">
    <span class="color-label" id="blurPlaats">blur</span>
  </div>
</div>
<div class="textandbutton" id="errormessagesmpp"></div>
<h3 class="popuptitles">Weather Overlay:</h3>
<div class="textandbutton" style="margin-top: 20px !important">
  <div class="verticaltext"><p class="nobottommargp off_text">Snow</p><p class="nobottommargp link_text">Meteor</p><p class="nobottommargp">Rain</p></div>
  <input type="range" min="0" max="2" value="0" class="sliderblur" id="weatherSelector">
  <div class="verticaltext-noright" style="width: 110px; margin-top: -10px; margin-right: 10px !important;">
  <h4 style="margin-bottom:1px">Amount:</h4>
  <input style="width: 100%" type="range" min="0" max="500" value="0" class="sliderblur" id="weatherSlider">
  </div>
</div>
<div class="textandbutton">
  <div>
    <h3 class="popuptitles">Snake:</h3>
    <label class="switch">
      <input class="popupinput" type="checkbox" id="showsnakeelement">
      <span class="slider round"></span>
      </label>
  </div>
  <div>
    <h3 class="popuptitles">Flappy:</h3>
    <label class="switch">
      <input class="popupinput" type="checkbox" id="showflappyelement">
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
			<g id="Laag_1-2" data-name="Laag 1">
				<g>
					<path class="st1"
						d="M18.99.35c2.5-.54,5.6-.51,9.81.54.73.18,1.17.92.99,1.64s-.92,1.17-1.64.98c-3.92-.98-6.58-.95-8.58-.52-2,.43-3.44,1.29-4.96,2.22l-.11.07c-1.47.9-3.09,1.89-5.24,2.25-2.23.37-4.86.04-8.4-1.37-.7-.28-1.03-1.06-.76-1.76.28-.69,1.07-1.03,1.76-.75,3.24,1.29,5.36,1.47,6.94,1.21,1.61-.27,2.84-1.01,4.39-1.95,1.53-.93,3.31-2.02,5.8-2.56Z" />
					<path class="st1"
						d="M28.81,6.3c-4.22-1.05-7.31-1.08-9.81-.54-2.49.54-4.27,1.63-5.8,2.56-1.55.95-2.78,1.69-4.39,1.95-1.59.26-3.7.08-6.94-1.21-.7-.28-1.48.06-1.76.75-.28.69.06,1.48.76,1.76,3.54,1.41,6.17,1.74,8.4,1.37,2.15-.36,3.77-1.35,5.24-2.25l.11-.07c1.52-.93,2.96-1.79,4.96-2.22,1.99-.43,4.66-.46,8.58.52.73.18,1.46-.26,1.64-.98.18-.72-.26-1.46-.99-1.64Z" />
					<path class="st1" style="fill-rule: evenodd"
						d="M24.41,9.53c-.47,0-.86.24-1.14.61-.1.13-.32.43-.61.86-.39.57-.92,1.35-1.45,2.23-.53.87-1.07,1.86-1.48,2.83-.4.92-.75,1.93-.75,2.95,0,.29.04.57.08.85.08.47.24,1.12.57,1.78.33.67.86,1.38,1.67,1.92.82.54,1.85.86,3.1.86s2.29-.32,3.1-.86c.81-.54,1.33-1.25,1.67-1.92.33-.66.49-1.31.57-1.78.05-.28.08-.57.08-.86,0-1.02-.35-2.02-.75-2.94-.41-.97-.96-1.95-1.48-2.83-.53-.88-1.05-1.66-1.45-2.23-.3-.43-.52-.73-.61-.86-.27-.37-.67-.61-1.14-.61ZM26.59,17.12c-.35-.81-.82-1.68-1.31-2.5-.3-.5-.6-.97-.87-1.38-.27.41-.57.88-.87,1.38-.49.82-.97,1.69-1.31,2.5l-.02.05c-.24.56-.52,1.22-.51,1.83.02.49.15.99.37,1.42.17.35.41.65.75.87.33.22.82.41,1.6.41s1.27-.19,1.6-.41c.33-.22.57-.53.75-.87.22-.43.35-.94.37-1.42.02-.62-.27-1.27-.51-1.83l-.02-.05Z" />
					<path class="st1"
						d="M17.8,11.57c1.03-.33,1.82.74,1.34,1.71-.22.44-.47.82-.97.99-1.32.47-2.42,1.13-3.57,1.83l-.11.07c-1.47.9-3.09,1.89-5.24,2.25-2.23.37-4.86.04-8.4-1.37-.7-.28-1.03-1.06-.76-1.76.28-.69,1.07-1.03,1.76-.75,3.24,1.29,5.36,1.47,6.94,1.21,1.61-.27,2.84-1.01,4.39-1.95,1.48-.9,2.99-1.69,4.61-2.22Z" />
				</g>
			</g>
		</svg>

		<div class="weather-humwind weather-humwindBig">
			<svg xmlns="http://www.w3.org/2000/svg" id="Laag_2" height="70px" width="70px" data-name="Laag 2"
				viewBox="0 0 39.94 24.5">
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





function globalChatTextBalk() {
  alert("Coming Soon!")
  const GlCHatplace = document.getElementById("msgdetail")
  const GlCHatplaceHTML = `
  <form action="action_page.php" class="loginGlobelChat" method="post">
    <div class="imgcontainerGlChat">
      <img src="img_avatar2.png" alt="Smartschool++" class="avatarGlChat">
    </div>

    <div class="containerGlChat">
      <label for="uname"><b>Username</b></label>
      <input id="inputGlChat" type="text" placeholder="Enter Username" name="uname">

      <button class="buttonGlChat">Login</button>
    </div>

  </form>
  `;
  GlCHatplace.innerHTML = GlCHatplaceHTML
}

const chatyHTML = `
  <button class="smscButton lookChat" id="globalChatTextBalk">global chat</button>
`;





const weatherHTMLTiny = `<div class="weatherdiv">
<div class="colSmall">
<div class="veticalstackweather" style="width:70% !important;">
<h2 class="weather-location weather-locationSmall"></h2>

<h2 class="weather-main weather-mainSmall"></h2>
<div class="weather">
  <div src="https://raw.githubusercontent.com/frickingbird8002/smpp-images/main/chanceflurries.svg"
  class="weather-iconSmall weather-icon"></div>
</div>
</div>
<div class="veticalstackweather">
<div class="weather-humwind weather-humwindSmall">
  <svg xmlns="http://www.w3.org/2000/svg" id="layer1" data-name="Laag 2" height="45px" width="45px"
  viewBox="0 0 29.83 24.41">
  <g id="Laag_1-2" data-name="Laag 1">
    <g>
    <path class="st1"
      d="M18.99.35c2.5-.54,5.6-.51,9.81.54.73.18,1.17.92.99,1.64s-.92,1.17-1.64.98c-3.92-.98-6.58-.95-8.58-.52-2,.43-3.44,1.29-4.96,2.22l-.11.07c-1.47.9-3.09,1.89-5.24,2.25-2.23.37-4.86.04-8.4-1.37-.7-.28-1.03-1.06-.76-1.76.28-.69,1.07-1.03,1.76-.75,3.24,1.29,5.36,1.47,6.94,1.21,1.61-.27,2.84-1.01,4.39-1.95,1.53-.93,3.31-2.02,5.8-2.56Z" />
    <path class="st1"
      d="M28.81,6.3c-4.22-1.05-7.31-1.08-9.81-.54-2.49.54-4.27,1.63-5.8,2.56-1.55.95-2.78,1.69-4.39,1.95-1.59.26-3.7.08-6.94-1.21-.7-.28-1.48.06-1.76.75-.28.69.06,1.48.76,1.76,3.54,1.41,6.17,1.74,8.4,1.37,2.15-.36,3.77-1.35,5.24-2.25l.11-.07c1.52-.93,2.96-1.79,4.96-2.22,1.99-.43,4.66-.46,8.58.52.73.18,1.46-.26,1.64-.98.18-.72-.26-1.46-.99-1.64Z" />
    <path class="st1" style="fill-rule: evenodd"
      d="M24.41,9.53c-.47,0-.86.24-1.14.61-.1.13-.32.43-.61.86-.39.57-.92,1.35-1.45,2.23-.53.87-1.07,1.86-1.48,2.83-.4.92-.75,1.93-.75,2.95,0,.29.04.57.08.85.08.47.24,1.12.57,1.78.33.67.86,1.38,1.67,1.92.82.54,1.85.86,3.1.86s2.29-.32,3.1-.86c.81-.54,1.33-1.25,1.67-1.92.33-.66.49-1.31.57-1.78.05-.28.08-.57.08-.86,0-1.02-.35-2.02-.75-2.94-.41-.97-.96-1.95-1.48-2.83-.53-.88-1.05-1.66-1.45-2.23-.3-.43-.52-.73-.61-.86-.27-.37-.67-.61-1.14-.61ZM26.59,17.12c-.35-.81-.82-1.68-1.31-2.5-.3-.5-.6-.97-.87-1.38-.27.41-.57.88-.87,1.38-.49.82-.97,1.69-1.31,2.5l-.02.05c-.24.56-.52,1.22-.51,1.83.02.49.15.99.37,1.42.17.35.41.65.75.87.33.22.82.41,1.6.41s1.27-.19,1.6-.41c.33-.22.57-.53.75-.87.22-.43.35-.94.37-1.42.02-.62-.27-1.27-.51-1.83l-.02-.05Z" />
    <path class="st1"
      d="M17.8,11.57c1.03-.33,1.82.74,1.34,1.71-.22.44-.47.82-.97.99-1.32.47-2.42,1.13-3.57,1.83l-.11.07c-1.47.9-3.09,1.89-5.24,2.25-2.23.37-4.86.04-8.4-1.37-.7-.28-1.03-1.06-.76-1.76.28-.69,1.07-1.03,1.76-.75,3.24,1.29,5.36,1.47,6.94,1.21,1.61-.27,2.84-1.01,4.39-1.95,1.48-.9,2.99-1.69,4.61-2.22Z" />
    </g>
  </g>
  </svg>

  <p class="weather-humidity weather-humiditySmall"></p>
</div>
  <div class="weather-humwind weather-humwindSmall">
  <svg xmlns="http://www.w3.org/2000/svg" id="Laag_2" height="55px" width="55px" data-name="Laag 2"
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

  <p class="weather-wind weather-windSmall"></p>
  </div>
  <div class="weather-humwind weather-humwindSmall">
  <svg xmlns="http://www.w3.org/2000/svg" id="Laag_2" height="45px" width="45px" data-name="Laag 2" viewBox="0 0 13 26">
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
    <path class="st1" d="M10.57,14.75V5.29c0-2.44-1.99-4.43-4.43-4.43S1.72,2.85,1.72,5.29v9.46c-1.11,1.15-1.72,2.66-1.72,4.26.01,3.38,2.76,6.13,6.14,6.13,1.62,0,3.15-.62,4.31-1.75,2.4-2.36,2.45-6.22.12-8.64ZM8.91,22.09c-.83.74-1.9,1.12-3,1.05-1.1-.06-2.12-.55-2.85-1.37-.74-.83-1.12-1.89-1.05-2.99.06-1.11.55-2.13,1.37-2.86l.33-.3V5.29c0-1.34,1.09-2.43,2.43-2.44,1.34.01,2.43,1.1,2.43,2.44v10.33l.33.29c.12.11.23.22.33.33.74.83,1.11,1.9,1.05,3-.06,1.11-.55,2.12-1.37,2.85Z"></path>
    <path class="st1" d="M8.59,20.18c-.31.65-.86,1.15-1.54,1.39-.3.1-.6.15-.9.15-1.12,0-2.17-.69-2.56-1.81-.49-1.37.21-2.89,1.55-3.42v-7.06h2v7.06c.73.29,1.3.87,1.56,1.62.24.68.2,1.42-.11,2.07Z"></path>
    </g>
  </g>
  </svg>
  <p class="weather-temperature weather-temperatureSmall"></p>
  </div>
</div></div>
  <p class="weather-lastupdate weather-lastupdateSmall" style="display:none;"></p>
</div>


</div>


</div>
`;
const plant_buttonsHTML = `
    <div id=watering_button class=watering_button> <svg xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" height=40px viewBox="0 0 34.74 41.95">
    <g id="Laag_1-2" data-name="Laag 1">
      <path class="st1" d="M21.83,3.45c-.81,3.5-2.37,6.69-4.13,9.62l-.62-.98c-2.16-3.41-4.6-7.26-5.56-11.35-.08-.36-.36-.63-.71-.71-.52-.12-1.03.2-1.15.71-.95,4.12-3.39,7.96-5.56,11.37-.56.89-1.11,1.77-1.71,2.77C.81,17.52-.2,20.35.03,23.06c.2,2.34,1.3,4.55,3.72,6.42,1.04.8,2.23,1.4,3.5,1.76.6.18,1.23.3,1.85.38,2.22,14.49,25.64,13.73,25.64-2.27,0-6.6-10.3-14.73-12.91-25.91ZM8.94,29.36v.31h0c-.39-.05-.77-.14-1.15-.25-1.03-.3-2-.78-2.85-1.43-1.95-1.5-2.83-3.24-2.99-5.07-.19-2.27.71-4.73,2.08-7.05.46-.77,1.07-1.73,1.71-2.73,1.72-2.72,3.62-5.7,4.88-8.96,1.25,3.24,3.14,6.22,4.87,8.94.39.61.77,1.21,1.11,1.77-3.64,5.66-7.64,10.35-7.64,14.48ZM21.45,37.15c-.37.54-1.07.72-1.65.44-1.82-1.03-3.3-2.56-4.27-4.4-.89-1.78-1.42-3.72-1.56-5.71-.03-.72.53-1.33,1.26-1.37.67-.03,1.26.46,1.35,1.13.11,1.64.54,3.25,1.27,4.73.74,1.41,1.87,2.58,3.26,3.37.6.41.75,1.22.34,1.82Z"/>
    </g>
  </svg> </div>
`