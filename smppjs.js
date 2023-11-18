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

document.addEventListener("keyup", function(e){
  //console.log(e);
  if (e.key == ':'){
    dmenu(["unbloat", "didit", "digitale methode", "planner", "set theme"], function (cmd) {
      switch (cmd) {
        case "unbloat":
          unbloat();
        case "set theme":
          dmenu(theme_names, function (theme) {
            set_theme(theme)
          }, "theme:");

        default:
          break;
      }
    }, "quick:");
  }
});




chrome.storage.local.get('current_profile', function (store) {
  selected_profile = store.current_profile;
  console.log("set profile to " + store.current_profile);
  set_theme(selected_profile);
});

const theme_names = ["ldev", "birb", "bjarn", "comfy", "cream"];
function set_theme(name) {
  switch (name) {
    case 'ldev':
      document.documentElement.style.setProperty('--color-accent', '#ffd5a0');
      document.documentElement.style.setProperty('--color-text', '#C2BAB2');
      document.documentElement.style.setProperty('--color-base00', '#191817');
      document.documentElement.style.setProperty('--color-base01', '#232020');
      document.documentElement.style.setProperty('--color-base02', '#3f3c3b');
      document.documentElement.style.setProperty('--color-base03', '#5b5756');
      break;
    case 'birb':
      document.documentElement.style.setProperty('--color-accent', '#A58AE3');
      document.documentElement.style.setProperty('--color-text', '#cfc8f4');
      document.documentElement.style.setProperty('--color-base00', '#3F3557');
      document.documentElement.style.setProperty('--color-base01', '#5B4C7D');
      document.documentElement.style.setProperty('--color-base02', '#6E5C97');
      document.documentElement.style.setProperty('--color-base03', '##7764A4');
      break;                                                                  
    case 'bjarn':
      document.documentElement.style.setProperty('--color-accent', "#95a4ee");
      document.documentElement.style.setProperty('--color-text', "#80dbbff3");
      document.documentElement.style.setProperty('--color-base00', "#191817");
      document.documentElement.style.setProperty('--color-base01', "#1e1e1ec1");
      document.documentElement.style.setProperty('--color-base02', "#222222");
      document.documentElement.style.setProperty('--color-base03', "#1b1b1bf3");
      break;
    case 'comfy':
      document.documentElement.style.setProperty('--color-accent', '#F2AF5C');
      document.documentElement.style.setProperty('--color-text', '#C2BAB2');
      document.documentElement.style.setProperty('--color-base00', '#261D1D');
      document.documentElement.style.setProperty('--color-base01', '#40312E');
      document.documentElement.style.setProperty('--color-base02', '#BF5B45');
      document.documentElement.style.setProperty('--color-base03', '#D9734E');
      break;
    case 'cream':
      document.documentElement.style.setProperty('--color-accent', '#F0F2F0');
      document.documentElement.style.setProperty('--color-text', '#C2BAB2');
      document.documentElement.style.setProperty('--color-base00', '#402F2D');
      document.documentElement.style.setProperty('--color-base01', '#594645');
      document.documentElement.style.setProperty('--color-base02', '#A68B81');
      document.documentElement.style.setProperty('--color-base03', '#D9C5B4');
      break;
      case 'fall':
        document.documentElement.style.setProperty('--color-accent', '#F2CDAC');
        document.documentElement.style.setProperty('--color-text', '#C2BAB2');
        document.documentElement.style.setProperty('--color-base00', '#0D0D0D');
        document.documentElement.style.setProperty('--color-base01', '#401303');
        document.documentElement.style.setProperty('--color-base02', '#732407');
        document.documentElement.style.setProperty('--color-base03', '#BF3A0A');
        break;
        case 'winter':
          document.documentElement.style.setProperty('--color-accent', '#93B8C2');
          document.documentElement.style.setProperty('--color-text', '#C2BAB2');
          document.documentElement.style.setProperty('--color-base00', '#001D29');
          document.documentElement.style.setProperty('--color-base01', '#013340');
          document.documentElement.style.setProperty('--color-base02', '#236475');
          document.documentElement.style.setProperty('--color-base03', '#DCEFF5');
          break;
      // Add more cases for other profiles as needed
    default:
      // Handle default case or do nothing if no match found
  }
}

console.log("Done");
