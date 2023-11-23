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

const goto_items=["didit", "digitale methode", "planner", "resultaten", "classroom", "onshape"];
function get_goto_url(name) {
  let platform_name = window.location.host.split('.')[0];
  switch (name) {
    case "didit":
      return "https://www.diddit.be/login?smartschoolPlatform="+platform_name;
    case "digitale methode":
      return "https://digitalemethode.be/nl-be/sso?subdomain="+platform_name+"&smpp=true";
    case "planner":
      return "/planner";
      
    case "resultaten":
      return "/results";
    case "classroom":
      return "https://classroom.google.com";
    case "onshape":
      return "https://onshape.com" ;

    default:
      return null;
  }
}

function open_url(url) {
  let a = document.createElement("a");
  a.href = url;
  a.rel = 'noopener noreferrer';
  a.target= '_blank';
  a.click();
}

document.addEventListener("keyup", function(e){
  if (e.key == ':'){
    let cmd_list = goto_items.concat(["set background", "set theme", "lock dmenu", "unbloat"]);
    dmenu(cmd_list, function (cmd) {
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
        default:
          break;
      }
      let got_url = get_goto_url(cmd);
      if (got_url !== null){
        open_url(got_url);
        return;
      }
    }, "quick:");
  }
});




chrome.storage.local.get('current_profile', function (store) {
  selected_profile = store.current_profile;
  console.log("set profile to " + store.current_profile);
  set_theme(selected_profile);
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

chrome.storage.local.get('local_background', function (store) {
  background = store.local_background;
  console.log("set background to " + background);
  set_background(background);
});

const theme_names = ["default", "ldev", "birb", "bjarn", "comfy", "tan", "winter", "fall", "OLED"];
function set_theme(name) {
  let style = document.documentElement.style;
  style.setProperty('--color-accent', '#ffd5a0');
  style.setProperty('--color-text', '#C2BAB2');
  style.setProperty('--color-base00', '#191817');
  style.setProperty('--color-base01', '#232020');
  style.setProperty('--color-base02', '#3f3c3b');
  style.setProperty('--color-base03', '#5b5756');
  style.setProperty('--color-startpage-bg','#0202058f');
  style.setProperty('--color-popup-border', 'var(--color-accent)');
  style.setProperty('--color-hover-border', 'var(--color-accent)');


  switch (name) {
    case "default":
      //default changes nothing so keep
      break;
    case 'ldev':
      style.setProperty('--color-popup-border', 'var(--color-base02)');
      style.setProperty('--color-hover-border', 'var(--color-base03)')
      break;
    case 'birb':
      style.setProperty('--color-accent', '#A58AE3');
      style.setProperty('--color-text', '#cfc8f4');
      style.setProperty('--color-base00', '#3F3557');
      style.setProperty('--color-base01', '#5B4C7D');
      style.setProperty('--color-base02', '#6E5C97');
      style.setProperty('--color-base03', '##7764A4');
      break;                                                                  
    case 'bjarn':
      style.setProperty('--color-accent', "#95a4ee");
      style.setProperty('--color-text', "#d2e4e9");
      style.setProperty('--color-base00', "#191817");
      style.setProperty('--color-base01', "#1e1e1e81");
      style.setProperty('--color-base02', "#1e1e1e");
      style.setProperty('--color-base03', "#1b1b1bf3");
      style.setProperty('--color-startpage-bg','#0202058f');
      break;
    case 'comfy':
      style.setProperty('--color-accent', "#95a4ee");
      style.setProperty('--color-text', "#80dbbff3");
      style.setProperty('--color-base00', "#191817");
      style.setProperty('--color-base01', "#1e1e1ec1");
      style.setProperty('--color-base02', "#222222");
      style.setProperty('--color-base03', "#1b1b1bf3");
      break;
    case 'tan':
      style.setProperty('--color-accent', '#F0F2F0');
      style.setProperty('--color-text', '#C2BAB2');
      style.setProperty('--color-base00', '#402F2D');
      style.setProperty('--color-base01', '#594645');
      style.setProperty('--color-base02', '#A68B81');
      style.setProperty('--color-base03', '#D9C5B4');
      break;
    case 'fall':
      style.setProperty('--color-accent', '#F2AF5C');
      style.setProperty('--color-text', '#C2BAB2');
      style.setProperty('--color-base00', '#261D1D');
      style.setProperty('--color-base01', '#40312E');
      style.setProperty('--color-base02', '#BF5B45');
      style.setProperty('--color-base03', '#D9734E');
      break;
    case 'winter':
      style.setProperty('--color-accent', '#93B8C2');
      style.setProperty('--color-text', '#C2BAB2');
      style.setProperty('--color-base00', '#001D29');
      style.setProperty('--color-base01', '#013340');
      style.setProperty('--color-base02', '#236475');
      style.setProperty('--color-base03', '#DCEFF5');
      break;
      case 'oled':
        style.setProperty('--color-accent', '#8590aacc');
        style.setProperty('--color-text', '#626365');
        style.setProperty('--color-base00', '#000');
        style.setProperty('--color-base01', '#020205');
        style.setProperty('--color-base02', '#05080f');
        style.setProperty('--color-base03', '#0c0e15');
        break;
      // Add more cases for other profiles as needed
    default:
      // Handle default case or do nothing if no match found
  }
}

console.log("Done");
