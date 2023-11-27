//java script komt hier je weet wel
//ok - ldev
//oke logis - andere ldev

function unbloat() {
  document.body.innerHTML = '';
}

//WARNING: garbage
try{
  document.getElementsByClassName("js-btn-logout")[0].innerHTML = "Logout -->";
  document.getElementById("notifsToggleLabel").innerHTML = "Toon pop-ups"
}catch(e){}
//END Garbage


let goto_items=get_data("goto_menu", ".js-shortcuts-container > a", function (el, data) {
  const name = el.innerText.toLowerCase().trim();
  data[name] = el.href;
});

let vakken = {};
get_data_bg("vakken", ".course-list > li > a", function (el, data) {
  const name = el.getElementsByClassName("course-link__name")[0].innerText.toLowerCase().trim();
  data[name]=el.href;
}, function (data) {
  vakken = data;
});


document.addEventListener("keyup", function(e){
  if (e.key == ':'){
    let cmd_list = Object.keys(vakken).concat(Object.keys(goto_items).concat(["classroom", "onshape", "set background", "set theme", "lock dmenu", "unbloat"]));
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
          },"bg url:");
          return;
        case "set theme":
          dmenu(theme_names, function (theme) {
            store_profile(theme);
            set_theme(theme)
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
      if (got_url != null){
        open_url(got_url, shift);
        return;
      }
      let vakken_url = vakken[cmd];
      if (vakken_url != null){
        open_url(vakken_url, shift);
        return;
      }
    }, "quick:");
  }
});




chrome.storage.local.get('local_background', function (store) {
  background = store.local_background;
  console.log("set background to " + background);

});

chrome.storage.local.get('current_profile', function (store) {
  selected_profile = store.current_profile;
  console.log("set profile to " + store.current_profile);
  set_theme(selected_profile);

});
chrome.storage.local.get('buttonstate', function (store) {
  let button = store.buttonstate;
  console.log("set buttonstate to " + button);
  if (button==true){
    set_background(background);
  }
});
chrome.storage.local.get('blurvalue', function (store) {
  let blurvalue = store.blurvalue;
  console.log("set blurvalue to " + blurvalue);
  let style = document.documentElement.style;
  style.setProperty('--blur-value-large', 'blur('+blurvalue*2+'px)');
  style.setProperty('--blur-value-small', 'blur('+blurvalue+'px)');
});
function store_profile(profile){
  chrome.storage.local.set({
    current_profile: profile
  });
}
function store_background(background){
  chrome.storage.local.set({
    local_background: background
  });
}

function set_background(background){
  let style = document.documentElement.style;
  style.setProperty('--loginpage-image', "url("+background+")");
}


const theme_names = ["default", "ldev", "birb", "bjarn", "tan", "winter", "fall"];
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
  style.setProperty('--loginpage-image', "url(https://images.hdqwalls.com/wallpapers/moon-astrophotography-4k-sc.jpg)");

  switch (name) {
    case "default":
      //default changes nothing so keep
      break;
    case 'ldev':
      style.setProperty('--color-accent', '#ffd5a0');
      style.setProperty('--color-popup-border', 'var(--color-base02)');
      style.setProperty('--color-hover-border', 'var(--color-base03)')
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
      style.setProperty('--color-base01', "#1e1e1e");
      style.setProperty('--color-base02', "#1e1e1e");
      style.setProperty('--color-base03', "#1b1b1bf3");
      style.setProperty('--loginpage-image', "url(https://th.bing.com/th/id/R.f8e9e3ed500e73dd6617c5aea7f75ef3?rik=6fM7LL0jLlhJhA&pid=ImgRaw&r=0)");
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
        case 'macha':
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

console.log("Done");
